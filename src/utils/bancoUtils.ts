/**
 * Utilitários de Banco
 *
 * Funções auxiliares para operações relacionadas a bancos,
 * incluindo validação, busca e manipulação de dados bancários.
 */

import { bancoService, EntidadeContaBancaria } from "../services/banco.service";

/**
 * Busca uma conta bancária por ID, primeiro na lista fornecida, depois na API
 * @param id - ID da conta bancária a ser buscada
 * @param bancosList - Lista de contas bancárias já carregadas
 * @returns Conta bancária encontrada ou null
 */
export const findBancoById = async (
  id: number,
  bancosList: EntidadeContaBancaria[] = []
): Promise<EntidadeContaBancaria | null> => {
  try {
    // Primeiro, tentar encontrar na lista de contas bancárias já carregadas
    const bancoExistente = bancosList.find(
      (b) => b.entidadeContaBancariaId === id
    );
    if (bancoExistente) {
      return bancoExistente;
    }

    // Se não encontrou na lista, buscar na API
    const banco = await bancoService.findById(id);
    return banco;
  } catch (error) {
    console.error("Conta bancária não encontrada:", error);
    return null;
  }
};

/**
 * Valida se um ID de banco é válido (número positivo)
 * @param id - ID a ser validado
 * @returns Boolean indicando se é válido
 */
export const isValidBancoId = (id: string | number): boolean => {
  const numericId = typeof id === "string" ? Number(id) : id;
  return !isNaN(numericId) && numericId > 0;
};

/**
 * Formata o nome da conta bancária para exibição no select
 * @param banco - Objeto conta bancária
 * @returns String formatada para exibição
 */
export const formatBancoDisplay = (banco: EntidadeContaBancaria): string => {
  return `${banco.banco.nome} - ${banco.agencia}/${banco.conta}`;
};

/**
 * Filtra contas bancárias por nome (busca parcial, case-insensitive)
 * @param bancos - Lista de contas bancárias
 * @param searchTerm - Termo de busca
 * @returns Lista filtrada de contas bancárias
 */
export const filterBancosByName = (
  bancos: EntidadeContaBancaria[],
  searchTerm: string
): EntidadeContaBancaria[] => {
  if (!searchTerm.trim()) return bancos;

  const term = searchTerm.toLowerCase().trim();
  return bancos.filter(
    (banco) =>
      banco.banco.nome.toLowerCase().includes(term) ||
      banco.banco.codigo.toLowerCase().includes(term) ||
      banco.agencia.toLowerCase().includes(term) ||
      banco.conta.toLowerCase().includes(term)
  );
};

/**
 * Ordena contas bancárias por nome do banco alfabeticamente
 * @param bancos - Lista de contas bancárias
 * @returns Lista ordenada de contas bancárias
 */
export const sortBancosByName = (
  bancos: EntidadeContaBancaria[]
): EntidadeContaBancaria[] => {
  return [...bancos].sort((a, b) => a.banco.nome.localeCompare(b.banco.nome));
};

/**
 * Ordena contas bancárias por ID
 * @param bancos - Lista de contas bancárias
 * @returns Lista ordenada de contas bancárias
 */
export const sortBancosById = (
  bancos: EntidadeContaBancaria[]
): EntidadeContaBancaria[] => {
  return [...bancos].sort(
    (a, b) => a.entidadeContaBancariaId - b.entidadeContaBancariaId
  );
};

/**
 * Valida se um objeto tem a estrutura de EntidadeContaBancaria
 * @param obj - Objeto a ser validado
 * @returns Boolean indicando se é uma conta bancária válida
 */
export const isValidBanco = (obj: any): obj is EntidadeContaBancaria => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "entidadeContaBancariaId" in obj &&
    "banco" in obj &&
    "agencia" in obj &&
    "conta" in obj &&
    typeof obj.entidadeContaBancariaId === "number" &&
    typeof obj.agencia === "string" &&
    typeof obj.conta === "string" &&
    obj.banco &&
    typeof obj.banco.nome === "string"
  );
};

/**
 * Converte resposta da API de contas bancárias para array válido
 * @param response - Resposta da API
 * @returns Array de contas bancárias válidas
 * @deprecated Esta função não é mais necessária pois a API agora retorna { data: [...] }
 */
export const convertBancoApiResponse = (
  response: any
): EntidadeContaBancaria[] => {
  // A API agora retorna { data: [...] }, então esta função é mantida apenas para compatibilidade
  // mas não deve ser mais usada
  console.warn(
    "convertBancoApiResponse está deprecated. A API agora retorna { data: [...] }"
  );

  // Se a resposta é um array, retornar diretamente
  if (Array.isArray(response)) {
    return response.filter(isValidBanco);
  }

  // Se a resposta é um objeto com índices numéricos, converter para array
  if (response && typeof response === "object") {
    const bancosArray = Object.values(response);
    if (Array.isArray(bancosArray)) {
      return bancosArray.filter(isValidBanco);
    }
  }

  return [];
};
