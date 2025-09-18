/**
 * Utilitários de Máscaras
 *
 * Funções para aplicar máscaras em campos de entrada de dados,
 * garantindo formatação consistente em toda a aplicação.
 */

/**
 * Aplica máscara de CNPJ no formato XX.XXX.XXX/XXXX-XX
 * @param value - Valor a ser mascarado
 * @returns String formatada como CNPJ
 */
export const maskCNPJ = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
};

/**
 * Aplica máscara de CEP no formato XXXXX-XXX
 * @param value - Valor a ser mascarado
 * @returns String formatada como CEP
 */
export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

/**
 * Aplica máscara de telefone no formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 * @param value - Valor a ser mascarado
 * @returns String formatada como telefone
 */
export const maskTelefone = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2")
    .slice(0, 15);
};

/**
 * Aplica máscara de CPF no formato XXX.XXX.XXX-XX
 * @param value - Valor a ser mascarado
 * @returns String formatada como CPF
 */
export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14);
};

/**
 * Remove todos os caracteres não numéricos de uma string
 * @param value - Valor a ser limpo
 * @returns String apenas com números
 */
export const removeNonNumbers = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Valida se um CNPJ tem o formato correto (apenas números e tamanho)
 * @param cnpj - CNPJ a ser validado
 * @returns Boolean indicando se é válido
 */
export const isValidCNPJFormat = (cnpj: string): boolean => {
  const cleanCNPJ = removeNonNumbers(cnpj);
  return cleanCNPJ.length === 14;
};

/**
 * Valida se um CEP tem o formato correto (apenas números e tamanho)
 * @param cep - CEP a ser validado
 * @returns Boolean indicando se é válido
 */
export const isValidCEPFormat = (cep: string): boolean => {
  const cleanCEP = removeNonNumbers(cep);
  return cleanCEP.length === 8;
};

/**
 * Valida se um telefone tem o formato correto (10 ou 11 dígitos)
 * @param telefone - Telefone a ser validado
 * @returns Boolean indicando se é válido
 */
export const isValidTelefoneFormat = (telefone: string): boolean => {
  const cleanTelefone = removeNonNumbers(telefone);
  return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
};
