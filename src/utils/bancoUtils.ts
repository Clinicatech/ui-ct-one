/**
 * Utilitários de Banco
 *
 * Funções auxiliares para operações relacionadas a bancos,
 * incluindo validação, busca e manipulação de dados bancários.
 */

import { bancoService, Banco } from "../services/banco.service";
import { EntidadeContaBancaria } from "../services/contas-bancarias-entidades.service";

/**
 * Busca um banco por ID, primeiro na lista fornecida, depois na API
 * @param id - ID do banco a ser buscado
 * @param bancosList - Lista de bancos já carregados
 * @returns Banco encontrado ou null
 */
export const findBancoById = async (
  id: number,
  bancosList: Banco[] = []
): Promise<Banco | null> => {
  try {
    // Primeiro, tentar encontrar na lista de bancos já carregados
    const bancoExistente = bancosList.find((b) => b.bancoId === id);
    if (bancoExistente) {
      return bancoExistente;
    }

    // Se não encontrou na lista, buscar na API
    const banco = await bancoService.findById(id);
    return banco;
  } catch (error) {
    console.error("Banco não encontrado:", error);
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
 * Formata o nome do banco para exibição no select
 * @param banco - Objeto banco
 * @returns String formatada para exibição
 */
export const formatBancoDisplay = (banco: Banco): string => {
  return `${banco.nome}`;
};

/**
 * Filtra bancos por nome (busca parcial, case-insensitive)
 * @param bancos - Lista de bancos
 * @param searchTerm - Termo de busca
 * @returns Lista filtrada de bancos
 */
export const filterBancosByName = (
  bancos: Banco[],
  searchTerm: string
): Banco[] => {
  if (!searchTerm.trim()) return bancos;

  const term = searchTerm.toLowerCase().trim();
  return bancos.filter((banco) => banco.nome.toLowerCase().includes(term));
};

/**
 * Ordena bancos por nome alfabeticamente
 * @param bancos - Lista de bancos
 * @returns Lista ordenada de bancos
 */
export const sortBancosByName = (bancos: Banco[]): Banco[] => {
  return [...bancos].sort((a, b) => a.nome.localeCompare(b.nome));
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
