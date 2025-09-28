/**
 * Tipos e interfaces para entidades
 *
 * Centraliza todas as definições de tipos relacionados a entidades
 * para evitar duplicação e garantir consistência.
 */

import { EnderecoApi, ContaBancariaApi } from "../services/entidade.service";

// Interface unificada para entidade (usada tanto para exibição quanto para formulário)
export interface Entity {
  // Dados básicos da entidade
  entidadeId: number;
  nome: string;
  cnpj: string;
  urlSite?: string;
  urlLogo?: string;

  // Arrays da API (para exibição)
  enderecos: EnderecoApi[];
  entidadeContaBancaria: ContaBancariaApi[];

  // Campos individuais do formulário (para edição)
  bancoId?: number;
  bancoNome?: string;
  bancoCodigo?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cidadeCodigo?: string;
  ufCodigo?: string;
  contatoComercialNome?: string;
  contatoComercialEmail?: string;
  contatoComercialTelefone1?: string;
  contatoComercialTelefone2?: string;
  contatoComercialTelefone3?: string;
  contatoTecnicoNome?: string;
  contatoTecnicoEmail?: string;
  contatoTecnicoTelefone1?: string;
  contatoTecnicoTelefone2?: string;
  contatoTecnicoTelefone3?: string;
  contatoFinanceiroNome?: string;
  contatoFinanceiroEmail?: string;
  contatoFinanceiroTelefone1?: string;
  contatoFinanceiroTelefone2?: string;
  contatoFinanceiroTelefone3?: string;
  carteira?: string;
  agencia?: string;
  agenciaDigito?: string;
  conta?: string;
  contaDigito?: string;
  cedenteCodigo?: string;
  cedenteNome?: string;
  chavePix?: string;
}

// Alias para compatibilidade
export type EntityFormData = Entity;

export interface EntityTableRow {
  entidadeId: number;
  nome: string;
  cnpj: string;
  urlSite: string;
  urlLogo: string;
  //createAt: string;
  //updateAt: string;
}

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
