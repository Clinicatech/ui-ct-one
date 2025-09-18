/**
 * Tipos e interfaces para entidades
 *
 * Centraliza todas as definições de tipos relacionados a entidades
 * para evitar duplicação e garantir consistência.
 */

export interface Entity {
  id: string;
  codigo: string;
  razaoSocial: string;
  cnpj: string;
  status: "ativo" | "inativo";
  endereco: string;
  telefone: string;
  email: string;
  observacoes: string;
  urlSite: string;
  urlLogo: string;

  // Dados do endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  cidadeCodigo: string;
  uf: string;
  ufCodigo: string;

  // Contatos comerciais
  contatoComercialNome: string;
  contatoComercialTelefone1: string;
  contatoComercialTelefone2: string;
  contatoComercialTelefone3: string;
  contatoComercialEmail: string;

  // Contatos técnicos
  contatoTecnicoNome: string;
  contatoTecnicoTelefone1: string;
  contatoTecnicoTelefone2: string;
  contatoTecnicoTelefone3: string;
  contatoTecnicoEmail: string;

  // Contatos financeiros
  contatoFinanceiroNome: string;
  contatoFinanceiroTelefone1: string;
  contatoFinanceiroTelefone2: string;
  contatoFinanceiroTelefone3: string;
  contatoFinanceiroEmail: string;

  // Dados bancários
  bancoId?: number;
  agencia: string;
  agenciaDigito: string;
  conta: string;
  contaDigito: string;
  carteira: string;
  cedenteCodigo: string;
  cedenteNome: string;
  chavePix: string;
}

export interface EntityFormData extends Partial<Entity> {}

export interface EntityTableRow {
  id: string;
  codigo: string;
  razaoSocial: string;
  cnpj: string;
  status: "ativo" | "inativo";
  endereco: string;
  telefone: string;
  email: string;
  urlSite: string;
  urlLogo: string;
}

export type EntityStatus = "ativo" | "inativo";

export interface EntitySearchParams {
  search?: string;
  searchIn?: string;
  page?: number;
  perPage?: number;
  order?: Record<string, string>;
  filters?: Array<{
    field: string;
    operator: string;
    content: string;
  }>;
}
