/**
 * Utilitários de Validação
 *
 * Funções para validação de dados de entrada,
 * garantindo consistência e qualidade dos dados.
 */

/**
 * Valida se um email tem formato válido
 * @param email - Email a ser validado
 * @returns Boolean indicando se é válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida se uma URL tem formato válido
 * @param url - URL a ser validada
 * @returns Boolean indicando se é válida
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida se uma string não está vazia (após trim)
 * @param value - Valor a ser validado
 * @returns Boolean indicando se não está vazio
 */
export const isNotEmpty = (value: string): boolean => {
  return value?.trim().length > 0;
};

/**
 * Valida se uma string tem o comprimento mínimo
 * @param value - Valor a ser validado
 * @param minLength - Comprimento mínimo
 * @returns Boolean indicando se atende o critério
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value?.trim().length >= minLength;
};

/**
 * Valida se uma string tem o comprimento máximo
 * @param value - Valor a ser validado
 * @param maxLength - Comprimento máximo
 * @returns Boolean indicando se atende o critério
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value?.trim().length <= maxLength;
};

/**
 * Valida se um valor é um número válido
 * @param value - Valor a ser validado
 * @returns Boolean indicando se é um número válido
 */
export const isValidNumber = (value: string | number): boolean => {
  const num = typeof value === "string" ? Number(value) : value;
  return !isNaN(num) && isFinite(num);
};

/**
 * Valida se um número está dentro de um intervalo
 * @param value - Valor a ser validado
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Boolean indicando se está no intervalo
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida campos obrigatórios de uma entidade
 * @param data - Dados da entidade
 * @returns Objeto com resultado da validação e mensagens de erro
 */
export const validateRequiredEntityFields = (
  data: any
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!isNotEmpty(data.razaoSocial)) {
    errors.push("Razão Social é obrigatória");
  }

  if (!isNotEmpty(data.cnpj)) {
    errors.push("CNPJ é obrigatório");
  }

  if (!isNotEmpty(data.cep)) {
    errors.push("CEP é obrigatório");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida formato de campos específicos
 * @param data - Dados da entidade
 * @returns Objeto com resultado da validação e mensagens de erro
 */
export const validateEntityFieldFormats = (
  data: any
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validar CNPJ
  if (data.cnpj) {
    const cleanCNPJ = data.cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length !== 14) {
      errors.push("CNPJ deve ter 14 dígitos");
    }
  }

  // Validar CEP
  if (data.cep) {
    const cleanCEP = data.cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      errors.push("CEP deve ter 8 dígitos");
    }
  }

  // Validar emails
  if (data.contatoComercialEmail && !isValidEmail(data.contatoComercialEmail)) {
    errors.push("Email do contato comercial é inválido");
  }

  if (data.contatoTecnicoEmail && !isValidEmail(data.contatoTecnicoEmail)) {
    errors.push("Email do contato técnico é inválido");
  }

  if (
    data.contatoFinanceiroEmail &&
    !isValidEmail(data.contatoFinanceiroEmail)
  ) {
    errors.push("Email do contato financeiro é inválido");
  }

  // Validar URLs
  if (data.urlSite && !isValidURL(data.urlSite)) {
    errors.push("URL do site é inválida");
  }

  if (data.urlLogo && !isValidURL(data.urlLogo)) {
    errors.push("URL do logo é inválida");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
