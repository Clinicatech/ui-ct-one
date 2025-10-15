# Documentação das Regras de Negócio - Sistema de Gestão de Contratos

## Visão Geral do Sistema

O **Sistema de Gestão de Contratos** é uma aplicação desenvolvida para gerenciar todos os contratos, pagamentos e recebimentos de uma organização. O sistema permite o controle completo do ciclo de vida dos contratos, desde sua criação até o processamento de pagamentos e recebimentos.

## Entidades Principais

### 1. Pessoa

- **Descrição**: Entidade base que representa pessoas físicas ou jurídicas
- **Campos principais**:
  - `pessoa_id`: Identificador único
  - `tipo`: Tipo da pessoa (PF/PJ)
  - `nome`: Nome da pessoa física ou razão social
  - `documento`: CPF ou CNPJ
  - `ativo`: Status ativo/inativo

### usuario
    Registro dos usuários do sistema
    - `usuario_id`: Identificador único
    - `entidade_id`: Identificador de entidade vinculada ao usuário
    - `pessoa_id`: Referência à pessoa
    - `email`: para login
    - `senha_hash`: para login

### 2. Cliente

- **Descrição**: Representa os clientes da organização
- **Relacionamentos**:
  - Vinculado a uma `pessoa` (dados pessoais/juridicos)
  - Possui um `pessoa_responsavel` (Pessoa fidica, responsável pelo cliente)
- **Campos principais**:
  - `cliente_info_id`: Identificador único
  - `pessoa_id`: Referência à pessoa
  - `pessoa_responsavel_id`: Responsável pelo cliente

### 3. Parceiro

- **Descrição**: Representa parceiros comerciais da organização
- **Relacionamentos**:
  - Vinculado a uma `pessoa`
  - Possui um `pessoa_responsavel`
  - Vinculado a uma `atividade_parceiro`
- **Campos principais**:
  - `parceiro_info_id`: Identificador único
  - `pessoa_id`: Referência à pessoa
  - `pessoa_responsavel_id`: Responsável pelo parceiro
  - `atividade_parceiro_id`: Tipo de atividade do parceiro
  - `perc_indicacao`: Percentual de indicação
  - `perc_mensalidade`: Percentual de mensalidade

### 4. Sócio

- **Descrição**: Representa os sócios da organização
- **Relacionamentos**:
  - Vinculado a uma `pessoa`
- **Campos principais**:
  - `socio_info_id`: Identificador único
  - `pessoa_id`: Referência à pessoa
  - `perc_rateio`: Percentual de rateio

## Sistema de Contratos

### 1. Tipos de Contrato

- **Descrição**: Define os tipos de contratos disponíveis no sistema
- **Campos principais**:
  - `contrato_tipo_id`: Identificador único
  - `descricao`: Descrição do tipo de contrato
  - `recorrente`: Indica se o contrato é recorrente - gera receitas/despesas periódicas
  - `tipo`: Tipo do contrato (R = Receita, D = Despesa)

### 2. Contrato

- **Descrição**: Representa um contrato entre a organização e clientes/parceiros
- **Relacionamentos**:
  - Vinculado a um `cliente_info` ou
  - Vinculado a um `parceiro_info` (opcional) ou
  - Vinculado a um `socio_info` (opcional)
  - Vinculado a um `contrato_tipo`
- **Campos principais**:
  - `contrato_id`: Identificador único
  - `cliente_info_id`: Cliente do contrato ou
  - `parceiro_info_id`: Parceiro envolvido (opcional) ou
  - `socio_info_id`: Sócio envolvido (opcional)
  - `contrato_tipo_id`: Tipo do contrato
  - `descricao`: Descrição do contrato
  - `valor`: Valor total do contrato
  - `url_contrato`: URL do documento do contrato
  - `ativo`: Status ativo/inativo

### 3. Itens do Contrato

- **Descrição**: Representa os itens/parcelas de um contrato
- **Relacionamentos**:
  - Vinculado a um `contrato`
  - Vinculado a uma `entidade_conta_bancaria` (para geração de boletos)
- **Campos principais**:
  - `contrato_item_id`: Identificador único
  - `contrato_id`: Contrato ao qual pertence
  - `descricao`: Descrição do item
  - `valor`: Valor do item
  - `data_ini`: Data de início
  - `data_fim`: Data de fim (opcional)
  - `dia_vencimento`: (1-31) obrigatório para contratos de vencimento unico ou com recorrencia mensal * validar dias 29,30 e 31 para o mes informado
  - `mes_vencimento`: obrigatório para contratos de vencimento unico ou com recorrencia anual
  - `ano_vencimento`: obrigatório para contratos de vencimento unico ou com recorrencia anual  
  
  - `gerar_boleto`: Indica se deve gerar boleto
  - `juros`: Percentual de juros
  - `mora`: Percentual de multa
  - `instrucoes_banco`: Instruções para o banco
  - `operacao`: Tipo de operação (C = Crédito, D = Débito, null = não movimenta)
  - `entidade_conta_bancaria_id`: Conta bancária para cobrança

## Sistema de Contas Bancárias

### Entidade Conta Bancária

- **Descrição**: Representa as contas bancárias das entidades
- **Relacionamentos**:
  - Vinculado a uma `entidade`
  - Vinculado a um `banco`
- **Campos principais**:
  - `entidade_conta_bancaria_id`: Identificador único
  - `entidade_id`: Entidade proprietária da conta
  - `banco_id`: Banco da conta
  - `agencia`: Número da agência
  - `agencia_digito`: Dígito da agência
  - `conta`: Número da conta
  - `conta_digito`: Dígito da conta
  - `carteira`: Carteira bancária
  - `cedente_codigo`: Código do cedente
  - `cedente_nome`: Nome do cedente
  - `chave_pix`: Chave PIX da conta

## Regras de Negócio

### 1. Contratos

- **Criação**: Um contrato deve estar vinculado a pelo menos um cliente/parceiro/socio
- **Tipos**: Contratos podem ser de receita (R) ou despesa (D)
- **Recorrência**: Contratos podem ser marcados como recorrentes
- **Valor**: O valor do contrato é obrigatório e deve ser maior que zero
- **Status**: Contratos podem ser ativados/desativados

### 2. Itens de Contrato

- **Vencimento**: O dia de vencimento deve estar entre 1 e 28
- **Valor**: O valor do item é obrigatório
- **Período**: Data de início é obrigatória, data de fim é opcional
- **Gerar Boletos**: Itens podem ser configurados para gerar boletos automaticamente
- **Juros e Multa**: Podem ser configurados percentuais de juros e multa
- **Operação**: Define se o item gera crédito, débito ou não movimenta

### 3. Parceiros

- **Percentuais**: Parceiros podem ter percentuais de indicação e mensalidade
- **Atividade**: Cada parceiro deve ter uma atividade definida
- **Responsável**: Cada parceiro (se PJ) deve ter um responsável (PF)

### 4. Sócios

- **Rateio**: Sócios possuem percentual de rateio
- **Participação**: Sócios podem estar vinculados a contratos

### 5. Contas Bancárias

- **PIX**: Contas podem ter chave PIX configurada
- **Cedente**: Informações do cedente são obrigatórias para geração de boletos
- **Carteira**: Carteira bancária deve ser configurada

## Fluxos Principais

## Criação do cliente

1 - Criar o cliente
2 - informar o responsavel (a mesma tela cria ambas pessoas se nao existem)
//exemplo
cliente
pessoa 1
responsavel pessoa 2

### 1. Criação de Contrato

1. Selecionar cliente
2. Definir tipo de contrato
3. Configurar valor e descrição
4. Adicionar itens do contrato
5. Configurar datas e valores dos itens
6. Definir conta bancária para cobrança (se aplicável)
7. armazenamento do contrato (com opção para update do contrato quando assinado digitalmente)
   8 - impressão do contrato

### 2. Geração de Boletos

1. Sistema identifica itens com `gerar_boleto = true`
2. Verifica data de vencimento
3. Utiliza dados da conta bancária vinculada
4. Gera boleto com instruções configuradas
5. Aplica juros e multa se configurados

### 3. Processamento de Pagamentos

1. Recebimento de confirmação de pagamento
2. Identificação do item de contrato
3. Atualização do status do pagamento
4. Geração de movimentação financeira (se configurado)

## Considerações para Desenvolvimento

### 1. Validações Obrigatórias

- Todos os campos obrigatórios devem ser validados
- Valores monetários devem ser positivos
- Datas devem seguir lógica temporal
- Percentuais devem estar entre 0 e 100

### 2. Segurança

- Implementar autenticação e autorização
- Validar permissões para operações sensíveis
- Log de todas as operações importantes

### 3. Performance

- Implementar paginação para listagens
- Otimizar consultas com relacionamentos
- Considerar cache para dados frequentemente acessados

### 4. Integração

- Sistema deve permitir integração com bancos para consulta de boletos
- Implementar webhooks para notificações de pagamento
- Considerar integração com sistemas de assinatura digital

### 4. Visões

    - Sistema deve disponibilizar:
     lista de contratos ativos e inativos
     lista de contratos (analítica)
     Lista de pagamentos e recebimentos (fluxo de caixa) vinculando aos respectivos contratos
     Quadros (dashboards) com contratos quitados, quitados vencidos, nao quitados(nao vencidos), não quitados (vencidos)
     tela de consulta do sócio, com acesso restrito a cada sócio, para consulta de valores recebidos e a receber (sintético e analitico)
     lista de a receber gerados a cada mês com contrato, pessoa, valor, data vencimento data pagamento
     lista de a pagar gerados a cada mês com contrato, pessoa, valor, data vencimento data pagamento

## 5 - Contratos

## Próximos Passos para Desenvolvimento

1. **Análise Técnica**: Estudar a estrutura atual do banco de dados
2. **Arquitetura**: Definir arquitetura da aplicação (backend/frontend)
    nestJs + sequelize + PostgreSql
    vite + React + Tailwind + Radix UI 
3. **APIs**: Implementar endpoints para CRUD das entidades
4. **Interface**: Desenvolver interface para gerenciamento
5. **Testes**: Implementar testes unitários e de integração
6. **Documentação**: Documentar APIs e funcionalidades
7. **Deploy**: Configurar ambiente de produção


