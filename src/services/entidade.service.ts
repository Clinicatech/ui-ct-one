/**
 * Serviço de Entidades
 *
 * Este serviço gerencia todas as operações relacionadas a entidades,
 * incluindo comunicação com a API backend.
 *
 * Funcionalidades:
 * - CRUD completo (Create, Read, Update, Delete)
 * - Conversão entre formatos da API e frontend
 * - Tratamento de erros
 * - Filtros e paginação
 *
 * Para desenvolvedores júnior:
 * - Cada método representa uma operação específica
 * - As interfaces TypeScript garantem type safety
 * - Os métodos de conversão mantêm compatibilidade entre API e UI
 * - O tratamento de erros é centralizado e consistente
 */

import { apiRequest } from "../config/api";

// Interface para representar uma entidade conforme retornada pela API
export interface EntidadeApi {
  entidade_id: number;
  entidade_nome: string;
  cnpj?: string;
  url_site?: string;
  url_logo?: string;
  entidade_create_at: string;
  entidade_update_at: string;
  enderecos?: EnderecoApi[];
  contas_bancarias?: ContaBancariaApi[];
  usuarios?: any[];
}

// Interface para endereço
export interface EnderecoApi {
  endereco_id: number;
  contato_comercial_nome?: string;
  contato_comercial_telefone1?: string;
  contato_comercial_email?: string;
  contato_tecnico_nome?: string;
  contato_tecnico_telefone1?: string;
  contato_tecnico_email?: string;
  contato_financeiro_nome?: string;
  contato_financeiro_telefone1?: string;
  contato_financeiro_email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

// Interface para conta bancária
export interface ContaBancariaApi {
  entidade_conta_bancaria_id: number;
  banco_id?: number;
  agencia: string;
  agencia_digito?: string;
  conta: string;
  conta_digito?: string;
  carteira?: string;
  cedente_codigo?: string;
  cedente_nome?: string;
  chave_pix?: string;
}

// Interface para criar entidade
export interface CreateEntidadeRequest {
  entidade: {
    nome: string;
    cnpj?: string;
    urlSite?: string;
    urlLogo?: string;
  };
  endereco?: Partial<EnderecoApi>;
  entidadeContaBancaria?: Partial<ContaBancariaApi>;
}

// Interface para atualizar entidade
export interface UpdateEntidadeRequest {
  entidade?: Partial<CreateEntidadeRequest["entidade"]>;
  endereco?: Partial<EnderecoApi>;
  entidadeContaBancaria?: Partial<ContaBancariaApi>;
}

// Interface para filtros de pesquisa
export interface EntidadeFilters {
  search?: string;
  status?: "ativo" | "inativo" | "todos";
  page?: number;
  limit?: number;
}

// Interface para resposta paginada
export interface EntidadeListResponse {
  data: EntidadeApi[];
  totalItems: number;
  totalPages: number;
  page: number;
  perPage: number;
  duration?: string;
}

class EntidadeService {
  private readonly baseEndpoint = "/entidade";

  // Buscar todas as entidades
  async findAll(): Promise<EntidadeApi[]> {
    try {
      const result = await apiRequest<EntidadeApi[]>(this.baseEndpoint);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error("Erro ao buscar entidades:", error);
      throw new Error("Erro ao carregar entidades");
    }
  }

  // Buscar entidades com filtros e paginação
  async findAllView(
    filters: EntidadeFilters = {}
  ): Promise<EntidadeListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.search) {
        queryParams.append("search", filters.search);
        // Adicionar searchIn obrigatório quando search é enviado
        queryParams.append("searchIn", "entidade_nome,cnpj");
      }
      if (filters.page) {
        queryParams.append("page", filters.page.toString());
      }
      if (filters.limit) {
        queryParams.append("perPage", filters.limit.toString()); // API usa perPage, não limit
      }

      const endpoint = `${this.baseEndpoint}/view?${queryParams.toString()}`;
      const result = await apiRequest<EntidadeListResponse>(endpoint);

      // Garantir que o resultado tenha a estrutura esperada
      // A API retorna 'data' em vez de 'items'
      const response: EntidadeListResponse = {
        data: Array.isArray(result?.data) ? result.data : [],
        totalItems: result?.totalItems || 0,
        totalPages: result?.totalPages || 0,
        page: result?.page || 1,
        perPage: result?.perPage || 25,
        duration: result?.duration,
      };

      return response;
    } catch (error) {
      console.error("Erro ao buscar entidades com filtros:", error);
      throw new Error("Erro ao carregar entidades");
    }
  }

  // Buscar entidade por ID
  async findById(id: number): Promise<EntidadeApi> {
    try {
      return await apiRequest<EntidadeApi>(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      console.error("Erro ao buscar entidade:", error);
      throw new Error("Erro ao carregar entidade");
    }
  }

  // Criar nova entidade
  async create(data: CreateEntidadeRequest): Promise<EntidadeApi> {
    try {
      return await apiRequest<EntidadeApi>(this.baseEndpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Erro ao criar entidade:", error);
      // Preservar a mensagem de erro original da API
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao criar entidade");
    }
  }

  // Atualizar entidade
  async update(id: number, data: UpdateEntidadeRequest): Promise<EntidadeApi> {
    try {
      return await apiRequest<EntidadeApi>(`${this.baseEndpoint}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Erro ao atualizar entidade:", error);
      // Preservar a mensagem de erro original da API
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao atualizar entidade");
    }
  }

  // Excluir entidade
  async delete(id: number): Promise<void> {
    try {
      await apiRequest<void>(`${this.baseEndpoint}/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao excluir entidade:", error);
      // Preservar a mensagem de erro original da API
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro ao excluir entidade");
    }
  }

  // Converter entidade da API para formato do frontend
  convertToFrontendFormat(entidadeApi: EntidadeApi): any {
    const endereco = entidadeApi.enderecos?.[0];

    return {
      id: entidadeApi.entidade_id?.toString() || "",
      codigo: entidadeApi.entidade_id?.toString() || "",
      razaoSocial: entidadeApi.entidade_nome || "",
      cnpj: entidadeApi.cnpj || "",
      status: "ativo" as const, // A API não tem campo status, assumindo ativo
      endereco: endereco
        ? `${endereco.cidade || ""} - ${endereco.uf || ""}`.trim()
        : "",
      telefone:
        endereco?.contato_comercial_telefone1 ||
        endereco?.contato_tecnico_telefone1 ||
        "",
      email:
        endereco?.contato_comercial_email ||
        endereco?.contato_tecnico_email ||
        "",
      observacoes: "",
      // Dados adicionais da API
      urlSite: entidadeApi.url_site,
      urlLogo: entidadeApi.url_logo,
      createAt: entidadeApi.entidade_create_at,
      updateAt: entidadeApi.entidade_update_at,
      enderecos: entidadeApi.enderecos || [],
      contasBancarias: entidadeApi.contas_bancarias || [],
    };
  }

  // Converter dados do frontend para formato da API
  convertToApiFormat(frontendData: any): CreateEntidadeRequest {
    return {
      entidade: {
        nome: frontendData.razaoSocial,
        cnpj: frontendData.cnpj,
        urlSite: frontendData.urlSite,
        urlLogo: frontendData.urlLogo,
      },
      endereco: {
        contato_comercial_nome: frontendData.contatoComercialNome,
        contato_comercial_telefone1: frontendData.telefone,
        contato_comercial_email: frontendData.email,
        cep: frontendData.cep,
        logradouro: frontendData.logradouro,
        numero: frontendData.numero,
        complemento: frontendData.complemento,
        bairro: frontendData.bairro,
        cidade: frontendData.cidade,
        uf: frontendData.uf,
      },
      entidadeContaBancaria: frontendData.bancoId
        ? {
            banco_id: frontendData.bancoId,
            agencia: frontendData.agencia,
            agencia_digito: frontendData.agenciaDigito,
            conta: frontendData.conta,
            conta_digito: frontendData.contaDigito,
            carteira: frontendData.carteira,
            cedente_codigo: frontendData.cedenteCodigo,
            cedente_nome: frontendData.cedenteNome,
            chave_pix: frontendData.chavePix,
          }
        : undefined,
    };
  }
}

export const entidadeService = new EntidadeService();
