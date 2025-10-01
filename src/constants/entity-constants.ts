/**
 * Constantes para entidades
 *
 * Centraliza valores padrão e constantes relacionadas a entidades
 * para evitar duplicação e facilitar manutenção.
 */

import { EntityFormData } from "../types/entity";

/**
 * Estrutura padrão de dados para nova entidade
 * Todos os campos são inicializados com valores vazios ou padrão
 */
export const DEFAULT_ENTITY_FORM_DATA: EntityFormData = {
  // Campos obrigatórios da Entity
  entidadeId: 0,
  nome: "",
  cnpj: "",
  urlSite: "",
  urlLogo: "",
  enderecos: [],
  entidadeContaBancaria: [],

  // Dados do endereço
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  cidadeCodigo: "",
  uf: "",
  ufCodigo: "",

  // Contatos comerciais
  contatoComercialNome: "",
  contatoComercialTelefone1: "",
  contatoComercialTelefone2: "",
  contatoComercialTelefone3: "",
  contatoComercialEmail: "",

  // Contatos técnicos
  contatoTecnicoNome: "",
  contatoTecnicoTelefone1: "",
  contatoTecnicoTelefone2: "",
  contatoTecnicoTelefone3: "",
  contatoTecnicoEmail: "",

  // Contatos financeiros
  contatoFinanceiroNome: "",
  contatoFinanceiroTelefone1: "",
  contatoFinanceiroTelefone2: "",
  contatoFinanceiroTelefone3: "",
  contatoFinanceiroEmail: "",

  // Dados bancários
  bancoId: undefined,
  agencia: "",
  agenciaDigito: "",
  conta: "",
  contaDigito: "",
  carteira: "",
  cedenteCodigo: "",
  cedenteNome: "",
  chavePix: "",
};

/**
 * Configurações padrão para paginação
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 25,
  totalItems: 0,
  totalPages: 0,
};

/**
 * Configurações padrão para busca
 */
export const DEFAULT_SEARCH_CONFIG = {
  minSearchLength: 2,
  searchIn: "nome,cnpj",
  debounceDelay: 500,
};

/**
 * Opções de carteira bancária
 */
export const CARTEIRA_OPTIONS = [
  { value: "COBRANCA", label: "Cobrança" },
  { value: "VENDAS", label: "Vendas" },
  { value: "OUTROS", label: "Outros" },
] as const;

/**
 * Configurações de validação
 */
export const VALIDATION_RULES = {
  cnpj: {
    required: true,
    minLength: 14,
    pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  cep: {
    required: true,
    minLength: 8,
    pattern: /^\d{5}-?\d{3}$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  telefone: {
    required: false,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  },
} as const;
