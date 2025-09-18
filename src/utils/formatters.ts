/**
 * Utilitários de Formatação
 *
 * Funções para formatação e transformação de dados,
 * garantindo apresentação consistente na interface.
 */

/**
 * Capitaliza a primeira letra de cada palavra
 * @param text - Texto a ser capitalizado
 * @returns String com primeira letra de cada palavra maiúscula
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Formata uma string para uppercase
 * @param text - Texto a ser formatado
 * @returns String em maiúsculas
 */
export const toUpperCase = (text: string): string => {
  return text.toUpperCase();
};

/**
 * Formata uma string para lowercase
 * @param text - Texto a ser formatado
 * @returns String em minúsculas
 */
export const toLowerCase = (text: string): string => {
  return text.toLowerCase();
};

/**
 * Remove espaços extras de uma string
 * @param text - Texto a ser limpo
 * @returns String sem espaços extras
 */
export const cleanSpaces = (text: string): string => {
  return text.replace(/\s+/g, " ").trim();
};

/**
 * Formata data para exibição no formato brasileiro
 * @param date - Data a ser formatada (string ISO ou Date)
 * @returns String formatada como DD/MM/AAAA
 */
export const formatDateBR = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("pt-BR");
};

/**
 * Formata data e hora para exibição no formato brasileiro
 * @param date - Data a ser formatada (string ISO ou Date)
 * @returns String formatada como DD/MM/AAAA HH:mm
 */
export const formatDateTimeBR = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return (
    dateObj.toLocaleDateString("pt-BR") +
    " " +
    dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
};

/**
 * Trunca um texto para um comprimento máximo
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo
 * @param ellipsis - Se deve adicionar "..." ao final
 * @returns String truncada
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: boolean = true
): string => {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  return ellipsis ? truncated + "..." : truncated;
};

/**
 * Formata um número como moeda brasileira
 * @param value - Valor a ser formatado
 * @returns String formatada como moeda (R$ 1.234,56)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata um número com separadores de milhares
 * @param value - Valor a ser formatado
 * @returns String formatada (1.234.567)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value);
};

/**
 * Formata status para exibição
 * @param status - Status a ser formatado
 * @returns String formatada para exibição
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ativo: "Ativo",
    inativo: "Inativo",
    pendente: "Pendente",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
  };

  return statusMap[status.toLowerCase()] || capitalizeWords(status);
};

/**
 * Formata um array de strings como lista separada por vírgulas
 * @param items - Array de itens
 * @param separator - Separador a ser usado
 * @returns String com itens separados
 */
export const formatList = (
  items: string[],
  separator: string = ", "
): string => {
  return items.filter(Boolean).join(separator);
};

/**
 * Remove acentos de uma string
 * @param text - Texto com acentos
 * @returns String sem acentos
 */
export const removeAccents = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/**
 * Gera um slug a partir de um texto
 * @param text - Texto a ser convertido
 * @returns String no formato slug
 */
export const generateSlug = (text: string): string => {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};
