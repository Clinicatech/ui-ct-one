/**
 * Serviço de CEP
 *
 * Funções reutilizáveis para busca e validação de CEP,
 * incluindo integração com a API ViaCEP.
 */

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface EnderecoData {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cidadeCodigo?: string;
  uf?: string;
  ufCodigo?: string;
}

/**
 * Busca dados de endereço via CEP na API ViaCEP
 * @param cep - CEP a ser consultado (com ou sem formatação)
 * @returns Promise com dados do endereço ou null se não encontrado
 */
export const buscarCEPViaCEP = async (
  cep: string
): Promise<ViaCEPResponse | null> => {
  try {
    // Limpar CEP (remover formatação)
    const cepLimpo = cep.replace(/\D/g, "");

    // Validar se tem 8 dígitos
    if (cepLimpo.length !== 8) {
      throw new Error("CEP deve ter 8 dígitos");
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data: ViaCEPResponse = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado");
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP na ViaCEP:", error);
    return null;
  }
};

/**
 * Converte dados da ViaCEP para formato do formulário
 * @param viaCEPData - Dados retornados pela ViaCEP
 * @returns Objeto com dados formatados para o formulário
 */
export const converterViaCEPParaFormulario = (
  viaCEPData: ViaCEPResponse
): Partial<EnderecoData> => {
  return {
    cep: viaCEPData.cep,
    logradouro: viaCEPData.logradouro,
    complemento: viaCEPData.complemento,
    bairro: viaCEPData.bairro,
    cidade: viaCEPData.localidade,
    cidadeCodigo: viaCEPData.ibge,
    uf: viaCEPData.uf,
    ufCodigo: viaCEPData.ibge ? viaCEPData.ibge.substring(0, 2) : undefined,
  };
};

/**
 * Função completa para buscar CEP e preencher formulário
 * @param cep - CEP a ser consultado
 * @param setFormData - Função para atualizar os dados do formulário
 * @param onSuccess - Callback executado em caso de sucesso
 * @param onError - Callback executado em caso de erro
 * @returns Promise<boolean> - true se sucesso, false se erro
 */
export const buscarCEPCompleto = async (
  cep: string,
  setFormData: (updater: (prev: any) => any) => void,
  onSuccess?: (data: ViaCEPResponse) => void,
  onError?: (error: string) => void
): Promise<boolean> => {
  if (!cep || cep.length < 8) {
    const errorMsg = "CEP deve ter pelo menos 8 dígitos";
    onError?.(errorMsg);
    return false;
  }

  try {
    const viaCEPData = await buscarCEPViaCEP(cep);

    if (!viaCEPData) {
      const errorMsg = "CEP não encontrado";
      onError?.(errorMsg);
      return false;
    }

    // Converter e atualizar formulário
    const enderecoData = converterViaCEPParaFormulario(viaCEPData);

    setFormData((prev: any) => ({
      ...prev,
      ...enderecoData,
    }));

    // Executar callback de sucesso
    onSuccess?.(viaCEPData);

    return true;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Erro ao buscar CEP";
    onError?.(errorMsg);
    return false;
  }
};

/**
 * Valida se um CEP tem formato válido
 * @param cep - CEP a ser validado
 * @returns boolean - true se válido, false se inválido
 */
export const validarFormatoCEP = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, "");
  return cepLimpo.length === 8;
};

/**
 * Formata CEP para exibição (00000-000)
 * @param cep - CEP a ser formatado
 * @returns CEP formatado
 */
export const formatarCEP = (cep: string): string => {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length > 5) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`;
  }
  return cepLimpo;
};

/**
 * Remove formatação do CEP
 * @param cep - CEP formatado
 * @returns CEP apenas com números
 */
export const limparCEP = (cep: string): string => {
  return cep.replace(/\D/g, "");
};
