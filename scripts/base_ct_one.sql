CREATE OR REPLACE FUNCTION public.gerar_movimento_mes(p_entidade_id integer, p_mes integer, p_ano integer)
 RETURNS TABLE(ret_movimento_id integer, ret_contrato_item_id integer, ret_data_vencimento date, ret_valor numeric, ret_descricao text, ret_tipo character varying, ret_operacao character varying, ret_acao text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec_record RECORD;
    v_novo_movimento_id INTEGER;
    v_data_vencimento_calculada DATE;
    v_dia_semana INTEGER;
    v_data_inicio_mes DATE;
    v_data_fim_mes DATE;
    v_count INTEGER;
    v_data_vencimento_original DATE;
BEGIN
    -- Validar parâmetros
    IF p_mes < 1 OR p_mes > 12 THEN
        RAISE EXCEPTION 'Mês inválido: %. Deve estar entre 1 e 12', p_mes;
    END IF;
    
    IF p_ano < 1900 OR p_ano > 2100 THEN
        RAISE EXCEPTION 'Ano inválido: %', p_ano;
    END IF;

    -- Calcular datas do período
    v_data_inicio_mes := MAKE_DATE(p_ano, p_mes, 1);
    v_data_fim_mes := (v_data_inicio_mes + INTERVAL '1 month - 1 day');

    -- Inicializar contador
    v_count := 0;

    -- FASE 1: EXCLUIR APENAS CONTRATOS INATIVOS E NÃO PAGOS
    -- REGRA 1: Movimentos pagos são preservados - não são excluídos nem regerados
    FOR rec_record IN 
        SELECT m.movimento_id, m.contrato_item_id
        FROM movimento m
        INNER JOIN contrato_item ci ON m.contrato_item_id = ci.contrato_item_id
        INNER JOIN contrato c ON ci.contrato_id = c.contrato_id
        WHERE 
            EXTRACT(MONTH FROM m.data_vencimento) = p_mes 
            AND EXTRACT(YEAR FROM m.data_vencimento) = p_ano
            AND m.pago = false  -- REGRA 1: Só exclui não pagos
            AND (ci.ativo = false OR c.ativo = false)  -- Só exclui se contrato/item inativo
    LOOP
        DELETE FROM movimento WHERE movimento_id = rec_record.movimento_id;
        
        ret_movimento_id := rec_record.movimento_id;
        ret_contrato_item_id := rec_record.contrato_item_id;
        ret_data_vencimento := NULL;
        ret_valor := NULL;
        ret_descricao := NULL;
        ret_tipo := NULL;
        ret_operacao := NULL;
        ret_acao := 'EXCLUIDO - CONTRATO INATIVO';
        RETURN NEXT;
        v_count := v_count + 1;
    END LOOP;

    -- FASE 2: ATUALIZAR MOVIMENTOS EXISTENTES COM DADOS ALTERADOS (APENAS NÃO PAGOS)
    -- REGRA 1: Não atualiza movimentos pagos
    FOR rec_record IN 
        SELECT 
            m.movimento_id,
            m.contrato_item_id,
            ci.valor as novo_valor,
            ci.descricao as nova_descricao,
            ct.tipo as novo_tipo,
            coalesce(ci.dia_vencimento,0) as dia_vencimento,
            coalesce(ci.mes_vencimento, 0) as mes_vencimento,
            coalesce(ci.ano_vencimento,0) as ano_vencimento,
            ct.recorrente
        FROM movimento m
        INNER JOIN contrato_item ci ON m.contrato_item_id = ci.contrato_item_id
        INNER JOIN contrato c ON ci.contrato_id = c.contrato_id
        INNER JOIN contrato_tipo ct ON c.contrato_tipo_id = ct.contrato_tipo_id
        LEFT JOIN cliente_info cli ON c.cliente_info_id = cli.cliente_info_id
        LEFT JOIN pessoa p_cli ON cli.pessoa_id = p_cli.pessoa_id
        LEFT JOIN parceiro_info par ON c.parceiro_info_id = par.parceiro_info_id
        LEFT JOIN pessoa p_par ON par.pessoa_id = p_par.pessoa_id
        WHERE 
            EXTRACT(MONTH FROM m.data_vencimento) = p_mes 
            AND EXTRACT(YEAR FROM m.data_vencimento) = p_ano
            AND m.pago = false  -- REGRA 1: Só atualiza não pagos
            AND ci.ativo = true
            AND c.ativo = true
            AND (p_cli.entidade_id = p_entidade_id OR p_par.entidade_id = p_entidade_id)
            AND (
                m.valor != ci.valor
                OR m.descricao != ci.descricao
                OR m.tipo != ct.tipo
                OR (
                    ct.recorrente = true 
                    AND EXTRACT(DAY FROM m.data_vencimento) != ci.dia_vencimento
                )
                OR (
                    ct.recorrente = false 
                    AND m.data_vencimento != MAKE_DATE(ci.ano_vencimento, ci.mes_vencimento, ci.dia_vencimento)
                )
            )
    LOOP
        -- Calcular data_vencimento_original baseado nas regras
        IF rec_record.recorrente = true THEN
            -- REGRA 2: Contratos recorrentes
            IF coalesce(rec_record.dia_vencimento,0) > 0 AND 
               coalesce(rec_record.mes_vencimento,0) = 0 AND 
               coalesce(rec_record.ano_vencimento,0) = 0 THEN
                -- Mensais: apenas dia preenchido
                v_data_vencimento_original := MAKE_DATE(p_ano, p_mes, rec_record.dia_vencimento);
            ELSIF coalesce(rec_record.dia_vencimento,0) > 0 AND 
                  coalesce(rec_record.mes_vencimento,0) > 0 AND 
                  coalesce(rec_record.ano_vencimento,0) = 0 THEN
                -- Anuais: dia e mês preenchidos (mês = mes_vencimento)
                v_data_vencimento_original := MAKE_DATE(p_ano, rec_record.mes_vencimento, rec_record.dia_vencimento);
            ELSE
                -- Ignorar demais que não obedeçam aos critérios
                CONTINUE;
            END IF;
        ELSE
            -- REGRA 3: Não recorrentes - apenas se data_fim = pMes/pAno
            IF rec_record.mes_vencimento = p_mes AND 
               rec_record.ano_vencimento = p_ano THEN
                v_data_vencimento_original := MAKE_DATE(rec_record.ano_vencimento, rec_record.mes_vencimento, rec_record.dia_vencimento);
            ELSE
                -- Ignorar demais que não obedeçam aos critérios
                CONTINUE;
            END IF;
        END IF;

        -- Calcular data de vencimento ajustada para fim de semana
        v_data_vencimento_calculada := v_data_vencimento_original;
        v_dia_semana := EXTRACT(DOW FROM v_data_vencimento_original);
        
        -- Ajustar para dias úteis
        IF v_dia_semana = 6 THEN -- Sábado
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '2 days';
        ELSIF v_dia_semana = 0 THEN -- Domingo
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '1 day';
        END IF;

        UPDATE movimento 
        SET 
            data_vencimento = v_data_vencimento_calculada,
            valor = rec_record.novo_valor,
            descricao = rec_record.nova_descricao,
            tipo = rec_record.novo_tipo,
            update_at = NOW()
        WHERE movimento_id = rec_record.movimento_id;
        
        ret_movimento_id := rec_record.movimento_id;
        ret_contrato_item_id := rec_record.contrato_item_id;
        ret_data_vencimento := v_data_vencimento_calculada;
        ret_valor := rec_record.novo_valor;
        ret_descricao := rec_record.nova_descricao;
        ret_tipo := rec_record.novo_tipo;
        ret_operacao := CASE WHEN rec_record.novo_tipo = 'R' THEN 'C' ELSE 'D' END;
        ret_acao := 'ATUALIZADO - DADOS ALTERADOS';
        RETURN NEXT;
        v_count := v_count + 1;
    END LOOP;

    -- FASE 3: INSERIR NOVOS MOVIMENTOS PARA CONTRATOS RECORRENTES
    -- REGRA 2: Contratos recorrentes
    FOR rec_record IN 
        SELECT 
            ci.contrato_item_id,
            ci.valor,
            ci.descricao,
            ct.tipo,
            coalesce(ci.dia_vencimento,0) as dia_vencimento,
            coalesce(ci.mes_vencimento,0) as mes_vencimento,
            coalesce(ci.ano_vencimento,0) as ano_vencimento
        FROM contrato_item ci
        INNER JOIN contrato c ON ci.contrato_id = c.contrato_id
        INNER JOIN contrato_tipo ct ON c.contrato_tipo_id = ct.contrato_tipo_id
        LEFT JOIN cliente_info cli ON c.cliente_info_id = cli.cliente_info_id
        LEFT JOIN pessoa p_cli ON cli.pessoa_id = p_cli.pessoa_id
        LEFT JOIN parceiro_info par ON c.parceiro_info_id = par.parceiro_info_id
        LEFT JOIN pessoa p_par ON par.pessoa_id = p_par.pessoa_id
        WHERE 
            ci.ativo = true
            AND c.ativo = true
            AND ct.recorrente = true
            AND (p_cli.entidade_id = p_entidade_id OR p_par.entidade_id = p_entidade_id)
            AND ci.data_ini <= v_data_fim_mes
            AND (ci.data_fim IS NULL OR ci.data_fim >= v_data_inicio_mes)
            AND NOT EXISTS (
                SELECT 1 FROM movimento m 
                WHERE m.contrato_item_id = ci.contrato_item_id 
                AND EXTRACT(MONTH FROM m.data_vencimento) = p_mes 
                AND EXTRACT(YEAR FROM m.data_vencimento) = p_ano
            )
    LOOP
        -- Calcular data_vencimento_original baseado nas regras de recorrentes
        -- REGRA 2: Contratos recorrentes
        IF coalesce(rec_record.dia_vencimento,0) > 0 AND 
           coalesce(rec_record.mes_vencimento,0) = 0 AND 
           coalesce(rec_record.ano_vencimento,0) = 0 THEN
            -- Mensais: apenas dia preenchido
            v_data_vencimento_original := MAKE_DATE(p_ano, p_mes, rec_record.dia_vencimento);
        ELSIF coalesce(rec_record.dia_vencimento,0) > 0 AND 
              coalesce(rec_record.mes_vencimento,0) > 0 AND 
              coalesce(rec_record.ano_vencimento,0) = 0 THEN
            -- Anuais: dia e mês preenchidos (mês = mes_vencimento)
            v_data_vencimento_original := MAKE_DATE(p_ano, rec_record.mes_vencimento, rec_record.dia_vencimento);
        ELSE
            -- Ignorar demais que não obedeçam aos critérios
            CONTINUE;
        END IF;

        -- Calcular data de vencimento ajustada
        v_data_vencimento_calculada := v_data_vencimento_original;
        v_dia_semana := EXTRACT(DOW FROM v_data_vencimento_original);
        
        IF v_dia_semana = 6 THEN
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '2 days';
        ELSIF v_dia_semana = 0 THEN
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '1 day';
        END IF;

        INSERT INTO movimento (
            contrato_item_id,
            data_vencimento,
            valor,
            pago,
            descricao,
            tipo,
            create_at
        ) VALUES (
            rec_record.contrato_item_id,
            v_data_vencimento_calculada,
            rec_record.valor,
            false,
            rec_record.descricao,
            rec_record.tipo,
            NOW()
        ) RETURNING movimento_id INTO v_novo_movimento_id;
        
        ret_movimento_id := v_novo_movimento_id;
        ret_contrato_item_id := rec_record.contrato_item_id;
        ret_data_vencimento := v_data_vencimento_calculada;
        ret_valor := rec_record.valor;
        ret_descricao := rec_record.descricao;
        ret_tipo := rec_record.tipo;
        ret_operacao := CASE WHEN rec_record.tipo = 'R' THEN 'C' ELSE 'D' END;
        ret_acao := 'CRIADO - RECORRENTE';
        RETURN NEXT;
        v_count := v_count + 1;
    END LOOP;

    -- FASE 4: INSERIR NOVOS MOVIMENTOS PARA CONTRATOS NÃO RECORRENTES
    -- REGRA 3: Não recorrentes - apenas se data_fim = pMes/pAno
    FOR rec_record IN 
        SELECT 
            ci.contrato_item_id,
            ci.valor,
            ci.descricao,
            ct.tipo,
            coalesce(ci.dia_vencimento,0) as dia_vencimento,
            coalesce(ci.mes_vencimento,0) as mes_vencimento,
            coalesce(ci.ano_vencimento,0) as ano_vencimento
        FROM contrato_item ci
        INNER JOIN contrato c ON ci.contrato_id = c.contrato_id
        INNER JOIN contrato_tipo ct ON c.contrato_tipo_id = ct.contrato_tipo_id
        LEFT JOIN cliente_info cli ON c.cliente_info_id = cli.cliente_info_id
        LEFT JOIN pessoa p_cli ON cli.pessoa_id = p_cli.pessoa_id
        LEFT JOIN parceiro_info par ON c.parceiro_info_id = par.parceiro_info_id
        LEFT JOIN pessoa p_par ON par.pessoa_id = p_par.pessoa_id
        WHERE 
            ci.ativo = true
            AND c.ativo = true
            AND ct.recorrente = false
            AND (p_cli.entidade_id = p_entidade_id OR p_par.entidade_id = p_entidade_id)
            AND coalesce(ci.mes_vencimento, 0) = p_mes  -- REGRA 3: Apenas se mês = pMes
            AND coalesce(ci.ano_vencimento, 0) = p_ano  -- REGRA 3: Apenas se ano = pAno
            AND coalesce(ci.dia_vencimento, 0) > 0
            AND ci.data_ini <= MAKE_DATE(ci.ano_vencimento, ci.mes_vencimento, ci.dia_vencimento)
            AND (ci.data_fim IS NULL OR ci.data_fim >= MAKE_DATE(ci.ano_vencimento, ci.mes_vencimento, ci.dia_vencimento))
            AND NOT EXISTS (
                SELECT 1 FROM movimento m 
                WHERE m.contrato_item_id = ci.contrato_item_id 
                AND EXTRACT(MONTH FROM m.data_vencimento) = p_mes 
                AND EXTRACT(YEAR FROM m.data_vencimento) = p_ano
            )
    LOOP
        -- Calcular data de vencimento original para não recorrentes
        v_data_vencimento_original := MAKE_DATE(rec_record.ano_vencimento, rec_record.mes_vencimento, rec_record.dia_vencimento);
        
        -- Calcular data de vencimento ajustada
        v_data_vencimento_calculada := v_data_vencimento_original;
        v_dia_semana := EXTRACT(DOW FROM v_data_vencimento_original);
        
        IF v_dia_semana = 6 THEN
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '2 days';
        ELSIF v_dia_semana = 0 THEN
            v_data_vencimento_calculada := v_data_vencimento_original + INTERVAL '1 day';
        END IF;

        INSERT INTO movimento (
            contrato_item_id,
            data_vencimento,
            valor,
            pago,
            descricao,
            tipo,
            create_at
        ) VALUES (
            rec_record.contrato_item_id,
            v_data_vencimento_calculada,
            rec_record.valor,
            false,
            rec_record.descricao,
            rec_record.tipo,
            NOW()
        ) RETURNING movimento_id INTO v_novo_movimento_id;
        
        ret_movimento_id := v_novo_movimento_id;
        ret_contrato_item_id := rec_record.contrato_item_id;
        ret_data_vencimento := v_data_vencimento_calculada;
        ret_valor := rec_record.valor;
        ret_descricao := rec_record.descricao;
        ret_tipo := rec_record.tipo;
        ret_operacao := CASE WHEN rec_record.tipo = 'R' THEN 'C' ELSE 'D' END;
        ret_acao := 'CRIADO - NÃO RECORRENTE';
        RETURN NEXT;
        v_count := v_count + 1;
    END LOOP;

    -- Se nenhum registro foi processado, retornar uma linha indicando isso
    IF v_count = 0 THEN
        ret_movimento_id := NULL;
        ret_contrato_item_id := NULL;
        ret_data_vencimento := NULL;
        ret_valor := NULL;
        ret_descricao := 'Nenhum movimento processado para o período';
        ret_tipo := NULL;
        ret_operacao := NULL;
        ret_acao := 'INFO';
        RETURN NEXT;
    END IF;

END;
$function$;