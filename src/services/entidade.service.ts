/**
 * Serviço para gerenciar entidades
 *
 * Este serviço centraliza todas as operações relacionadas a entidades,
 * incluindo CRUD completo e conversões de dados entre API e frontend.
 *
 * Funcionalidades:
 * - Buscar todas as entidades (findAll)
 * - Buscar entidades com filtros/paginação (findAllView)
 * - Buscar entidade por ID (findOne)
 * - Criar nova entidade (create)
 * - Atualizar entidade existente (update)
 * - Excluir entidade (delete)
 * - Conversões de dados entre formatos da API e frontend
 *
 * Arquitetura:
 * - As interfaces TypeScript garantem type safety
 * - Os métodos de conversão mantêm compatibilidade entre API e UI
 * - O tratamento de erros é centralizado e consistente
 */

import { apiRequest } from "../config/api";
import { Entity } from "../types/entity";

// Interface para representar uma entidade conforme retornada pela API
export interface EntidadeApi {
  entidadeId: number;
  nome: string; // Campo da view
  cnpj: string;
  urlSite?: string | null;
  urlLogo?: string | null;
  bancoId?: number; // Campo da view
  enderecos: EnderecoApi[];
  contasBancarias: ContaBancariaApi[];
}

// Interface para endereço da API
export interface EnderecoApi {
  enderecoId: number;
  pessoaId: number | null;
  contatoComercialNome?: string;
  contatoComercialTelefone1?: string;
  contatoComercialTelefone2?: string;
  contatoComercialTelefone3?: string;
  contatoComercialEmail?: string;
  contatoTecnicoNome?: string;
  contatoTecnicoTelefone1?: string;
  contatoTecnicoTelefone2?: string;
  contatoTecnicoTelefone3?: string;
  contatoTecnicoEmail?: string;
  contatoFinanceiroNome?: string;
  contatoFinanceiroTelefone1?: string;
  contatoFinanceiroTelefone2?: string;
  contatoFinanceiroTelefone3?: string;
  contatoFinanceiroEmail?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cidadeCodigo?: number | null;
  uf?: string;
  ufCodigo?: number | null;
}

// Interface para conta bancária da API
export interface ContaBancariaApi {
  entidadeContaBancariaId: number;
  bancoId?: number; // Pode não vir da view atual
  banco_nome?: string; // Nome do banco se disponível
  agencia: string;
  agenciaDigito?: string;
  conta: string;
  contaDigito?: string;
  carteira?: string;
  cedenteCodigo?: string;
  cedenteNome?: string;
  chavePix?: string;
  banco?: {
    bancoId: number;
    codigo: string;
    nome: string;
    ativo: boolean;
  };
}

// Interface para requisição de criação
export interface CreateEntidadeRequest {
  entidade: {
    nome: string;
    cnpj: string;
    urlSite?: string;
    urlLogo?: string;
  };
  endereco?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    cidadeCodigo?: number;
    uf?: string;
    ufCodigo?: number;
    contatoComercialNome?: string;
    contatoComercialTelefone1?: string;
    contatoComercialTelefone2?: string;
    contatoComercialTelefone3?: string;
    contatoComercialEmail?: string;
    contatoTecnicoNome?: string;
    contatoTecnicoTelefone1?: string;
    contatoTecnicoTelefone2?: string;
    contatoTecnicoTelefone3?: string;
    contatoTecnicoEmail?: string;
    contatoFinanceiroNome?: string;
    contatoFinanceiroTelefone1?: string;
    contatoFinanceiroTelefone2?: string;
    contatoFinanceiroTelefone3?: string;
    contatoFinanceiroEmail?: string;
  };
  entidadeContaBancaria?: {
    bancoId: number;
    agencia: string;
    agenciaDigito?: string;
    conta: string;
    contaDigito?: string;
    carteira?: string;
    cedenteCodigo?: string;
    cedenteNome?: string;
    chavePix?: string;
  };
}

// Interface para requisição de atualização
export interface UpdateEntidadeRequest extends CreateEntidadeRequest {}

// Interface para resposta de criação/atualização
export interface EntidadeCreateUpdateResponse {
  entidade: {
    entidadeId: number;
    nome: string;
    cnpj: string;
    urlSite: string | null;
    urlLogo: string | null;
  };
  endereco: EnderecoApi | null;
  entidadeContaBancaria: ContaBancariaApi | null;
}

// Interface para parâmetros de busca
export interface FindAllViewParams {
  search?: string;
  page: number;
  limit: number;
}

// Interface para resposta paginada
export interface PaginatedResponse {
  data: EntidadeApi[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  page: number;
  duration?: string;
}

export class EntidadeService {
  private readonly baseEndpoint = "/entidade";

  // Buscar todas as entidades
  async findAll(): Promise<EntidadeApi[]> {
    try {
      const result = await apiRequest<{ data: EntidadeApi[] }>(
        this.baseEndpoint
      );
      return Array.isArray(result?.data) ? result.data : [];
    } catch (error) {
      console.error("Erro ao buscar entidades:", error);
      throw new Error("Erro ao carregar entidades");
    }
  }

  // Buscar entidades com filtros e paginação
  async findAllView(params: FindAllViewParams): Promise<PaginatedResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) {
        queryParams.append("search", params.search);
        // Quando há busca, especificar em quais campos buscar
        queryParams.append("searchIn", "nome,cnpj");
      }
      queryParams.append("page", params.page.toString());
      queryParams.append("limit", params.limit.toString());

      const response = await apiRequest<PaginatedResponse>(
        `${this.baseEndpoint}/view?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar entidades com filtros:", error);
      throw new Error("Erro ao carregar entidades");
    }
  }

  // Buscar entidade por ID
  async findOne(id: number): Promise<EntidadeApi> {
    try {
      return await apiRequest<EntidadeApi>(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error("Erro ao buscar entidade:", error);
      throw new Error("Erro ao carregar entidade");
    }
  }

  // Criar nova entidade
  async create(
    data: CreateEntidadeRequest
  ): Promise<EntidadeCreateUpdateResponse> {
    try {
      return await apiRequest<EntidadeCreateUpdateResponse>(this.baseEndpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Erro ao criar entidade:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao criar entidade");
    }
  }

  // Atualizar entidade
  async update(
    id: number,
    data: UpdateEntidadeRequest
  ): Promise<EntidadeCreateUpdateResponse> {
    try {
      const url = `${this.baseEndpoint}/${id}`;
      return await apiRequest<EntidadeCreateUpdateResponse>(url, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Erro ao atualizar entidade:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao atualizar entidade");
    }
  }

  // Excluir entidade
  async delete(id: number): Promise<void> {
    try {
      await apiRequest(`${this.baseEndpoint}/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao excluir entidade:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao excluir entidade");
    }
  }

  // Converter Entity da API para Entity do frontend (com campos do formulário preenchidos)
  convertToFrontendFormat(entidadeApi: EntidadeApi): Entity {
    const endereco = entidadeApi.enderecos?.[0];
    const contaBancaria = entidadeApi.contasBancarias?.[0];

    const result = {
      // Dados básicos da entidade
      entidadeId: entidadeApi.entidadeId,
      nome: entidadeApi.nome || "",
      cnpj: entidadeApi.cnpj || "",
      urlSite: entidadeApi.urlSite || undefined,
      urlLogo: entidadeApi.urlLogo || undefined,

      // Arrays da API
      enderecos: entidadeApi.enderecos || [],
      entidadeContaBancaria: entidadeApi.contasBancarias || [],

      // Campos individuais do formulário (preenchidos dos arrays)
      cep: endereco?.cep || "",
      logradouro: endereco?.logradouro || "",
      numero: endereco?.numero || "",
      complemento: endereco?.complemento || "",
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      uf: endereco?.uf || "",
      cidadeCodigo: endereco?.cidadeCodigo?.toString() || "",
      ufCodigo: endereco?.ufCodigo?.toString() || "",

      // Contatos comerciais
      contatoComercialNome: endereco?.contatoComercialNome || "",
      contatoComercialEmail: endereco?.contatoComercialEmail || "",
      contatoComercialTelefone1: endereco?.contatoComercialTelefone1 || "",
      contatoComercialTelefone2: endereco?.contatoComercialTelefone2 || "",
      contatoComercialTelefone3: endereco?.contatoComercialTelefone3 || "",

      // Contatos técnicos
      contatoTecnicoNome: endereco?.contatoTecnicoNome || "",
      contatoTecnicoEmail: endereco?.contatoTecnicoEmail || "",
      contatoTecnicoTelefone1: endereco?.contatoTecnicoTelefone1 || "",
      contatoTecnicoTelefone2: endereco?.contatoTecnicoTelefone2 || "",
      contatoTecnicoTelefone3: endereco?.contatoTecnicoTelefone3 || "",

      // Contatos financeiros
      contatoFinanceiroNome: endereco?.contatoFinanceiroNome || "",
      contatoFinanceiroEmail: endereco?.contatoFinanceiroEmail || "",
      contatoFinanceiroTelefone1: endereco?.contatoFinanceiroTelefone1 || "",
      contatoFinanceiroTelefone2: endereco?.contatoFinanceiroTelefone2 || "",
      contatoFinanceiroTelefone3: endereco?.contatoFinanceiroTelefone3 || "",

      // Dados bancários
      bancoId: contaBancaria?.bancoId || contaBancaria?.banco?.bancoId,
      bancoNome: contaBancaria?.banco?.nome || contaBancaria?.banco_nome || "",
      bancoCodigo: contaBancaria?.banco?.codigo || "",
      agencia: contaBancaria?.agencia || "",
      agenciaDigito: contaBancaria?.agenciaDigito || "",
      conta: contaBancaria?.conta || "",
      contaDigito: contaBancaria?.contaDigito || "",
      carteira: contaBancaria?.carteira || "",
      cedenteCodigo: contaBancaria?.cedenteCodigo || "",
      cedenteNome: contaBancaria?.cedenteNome || "",
      chavePix: contaBancaria?.chavePix || "",
    };

    return result;
  }

  // Converter dados do frontend para formato da API
  convertToApiFormat(frontendData: Entity): CreateEntidadeRequest {
    const result = {
      entidade: {
        nome: frontendData.nome,
        cnpj: frontendData.cnpj,
        urlSite: frontendData.urlSite,
        urlLogo: frontendData.urlLogo,
      },
      endereco: {
        cep: frontendData.cep,
        logradouro: frontendData.logradouro,
        numero: frontendData.numero,
        complemento: frontendData.complemento,
        bairro: frontendData.bairro,
        cidade: frontendData.cidade,
        cidadeCodigo: frontendData.cidadeCodigo
          ? parseInt(frontendData.cidadeCodigo)
          : undefined,
        uf: frontendData.uf,
        ufCodigo: frontendData.ufCodigo
          ? parseInt(frontendData.ufCodigo)
          : undefined,
        contatoComercialNome: frontendData.contatoComercialNome,
        contatoComercialTelefone1: frontendData.contatoComercialTelefone1,
        contatoComercialTelefone2: frontendData.contatoComercialTelefone2,
        contatoComercialTelefone3: frontendData.contatoComercialTelefone3,
        contatoComercialEmail: frontendData.contatoComercialEmail,
        contatoTecnicoNome: frontendData.contatoTecnicoNome,
        contatoTecnicoTelefone1: frontendData.contatoTecnicoTelefone1,
        contatoTecnicoTelefone2: frontendData.contatoTecnicoTelefone2,
        contatoTecnicoTelefone3: frontendData.contatoTecnicoTelefone3,
        contatoTecnicoEmail: frontendData.contatoTecnicoEmail,
        contatoFinanceiroNome: frontendData.contatoFinanceiroNome,
        contatoFinanceiroTelefone1: frontendData.contatoFinanceiroTelefone1,
        contatoFinanceiroTelefone2: frontendData.contatoFinanceiroTelefone2,
        contatoFinanceiroTelefone3: frontendData.contatoFinanceiroTelefone3,
        contatoFinanceiroEmail: frontendData.contatoFinanceiroEmail,
      },
      entidadeContaBancaria: frontendData.bancoId
        ? {
            bancoId: frontendData.bancoId,
            agencia: frontendData.agencia,
            agenciaDigito: frontendData.agenciaDigito,
            conta: frontendData.conta,
            contaDigito: frontendData.contaDigito,
            carteira: frontendData.carteira,
            cedenteCodigo: frontendData.cedenteCodigo,
            cedenteNome: frontendData.cedenteNome,
            chavePix: frontendData.chavePix,
          }
        : undefined,
    };

    return result;
  }

  // Converter resposta de criação/atualização para formato do frontend
  convertCreateUpdateToFrontendFormat(
    response: EntidadeCreateUpdateResponse
  ): Entity {
    const { entidade, endereco, entidadeContaBancaria } = response;

    return {
      // Dados básicos da entidade
      entidadeId: entidade.entidadeId,
      nome: entidade.nome,
      cnpj: entidade.cnpj,
      urlSite: entidade.urlSite || "",
      urlLogo: entidade.urlLogo || "",

      // Arrays da API
      enderecos: endereco ? [endereco] : [],
      entidadeContaBancaria: entidadeContaBancaria
        ? [entidadeContaBancaria]
        : [],

      // Campos individuais do formulário
      cep: endereco?.cep || "",
      logradouro: endereco?.logradouro || "",
      numero: endereco?.numero || "",
      complemento: endereco?.complemento || "",
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      uf: endereco?.uf || "",
      cidadeCodigo: endereco?.cidadeCodigo?.toString() || "",
      ufCodigo: endereco?.ufCodigo?.toString() || "",

      // Contatos comerciais
      contatoComercialNome: endereco?.contatoComercialNome || "",
      contatoComercialEmail: endereco?.contatoComercialEmail || "",
      contatoComercialTelefone1: endereco?.contatoComercialTelefone1 || "",
      contatoComercialTelefone2: endereco?.contatoComercialTelefone2 || "",
      contatoComercialTelefone3: endereco?.contatoComercialTelefone3 || "",

      // Contatos técnicos
      contatoTecnicoNome: endereco?.contatoTecnicoNome || "",
      contatoTecnicoEmail: endereco?.contatoTecnicoEmail || "",
      contatoTecnicoTelefone1: endereco?.contatoTecnicoTelefone1 || "",
      contatoTecnicoTelefone2: endereco?.contatoTecnicoTelefone2 || "",
      contatoTecnicoTelefone3: endereco?.contatoTecnicoTelefone3 || "",

      // Contatos financeiros
      contatoFinanceiroNome: endereco?.contatoFinanceiroNome || "",
      contatoFinanceiroEmail: endereco?.contatoFinanceiroEmail || "",
      contatoFinanceiroTelefone1: endereco?.contatoFinanceiroTelefone1 || "",
      contatoFinanceiroTelefone2: endereco?.contatoFinanceiroTelefone2 || "",
      contatoFinanceiroTelefone3: endereco?.contatoFinanceiroTelefone3 || "",

      // Dados bancários
      bancoId: entidadeContaBancaria?.bancoId,
      agencia: entidadeContaBancaria?.agencia || "",
      agenciaDigito: entidadeContaBancaria?.agenciaDigito || "",
      conta: entidadeContaBancaria?.conta || "",
      contaDigito: entidadeContaBancaria?.contaDigito || "",
      carteira: entidadeContaBancaria?.carteira || "",
      cedenteCodigo: entidadeContaBancaria?.cedenteCodigo || "",
      cedenteNome: entidadeContaBancaria?.cedenteNome || "",
      chavePix: entidadeContaBancaria?.chavePix || "",
    };
  }
}

export const entidadeService = new EntidadeService();
