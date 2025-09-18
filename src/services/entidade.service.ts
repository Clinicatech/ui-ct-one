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
  entidadeId: number;
  nome: string;
  cnpj?: string;
  urlSite?: string;
  urlLogo?: string;
  createAt: string;
  updateAt: string;
  enderecos?: EnderecoApi[];
  entidadeContaBancaria?: ContaBancariaApi[];
  usuarios?: any[];
}

// Interface para endereço
export interface EnderecoApi {
  enderecoId: number;
  pessoaId?: number;

  // Contatos comerciais (API retorna em camelCase)
  contatoComercialNome?: string;
  contatoComercialTelefone1?: string;
  contatoComercialTelefone2?: string;
  contatoComercialTelefone3?: string;
  contatoComercialEmail?: string;

  // Contatos técnicos (API retorna em camelCase)
  contatoTecnicoNome?: string;
  contatoTecnicoTelefone1?: string;
  contatoTecnicoTelefone2?: string;
  contatoTecnicoTelefone3?: string;
  contatoTecnicoEmail?: string;

  // Contatos financeiros (API retorna em camelCase)
  contatoFinanceiroNome?: string;
  contatoFinanceiroTelefone1?: string;
  contatoFinanceiroTelefone2?: string;
  contatoFinanceiroTelefone3?: string;
  contatoFinanceiroEmail?: string;

  // Dados do endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cidadeCodigo?: number;
  uf?: string;
  ufCodigo?: number;

  // Timestamps
  createAt?: string;
  updateAt?: string;
}

// Interface para conta bancária
export interface ContaBancariaApi {
  entidadeContaBancariaId: number;
  bancoId?: number;
  agencia: string;
  agenciaDigito?: string;
  conta: string;
  contaDigito?: string;
  carteira?: string;
  cedenteCodigo?: string;
  cedenteNome?: string;
  chavePix?: string;
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
      const url = `${this.baseEndpoint}/${id}`;
      console.log("=== DEBUG UPDATE ===");
      console.log("URL:", url);
      console.log("Method: PATCH");
      console.log("Data:", data);
      console.log("Data.endereco:", data.endereco);
      console.log(
        "Data.endereco.contato_comercial_nome:",
        data.endereco?.contato_comercial_nome
      );

      return await apiRequest<EntidadeApi>(url, {
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
    console.log("=== DEBUG convertToFrontendFormat ===");
    console.log("entidadeApi:", entidadeApi);
    console.log("entidadeApi.entidade:", entidadeApi.entidade);
    console.log("entidadeApi.entidade?.nome:", entidadeApi.entidade?.nome);
    console.log("entidadeApi.nome:", entidadeApi.nome);
    console.log("enderecos:", entidadeApi.enderecos);

    // A API de update retorna 'endereco' (singular), não 'enderecos' (plural)
    const endereco = entidadeApi.endereco || entidadeApi.enderecos?.[0];
    console.log("endereco:", endereco);

    // A API de update retorna a estrutura { entidade: {...}, endereco: {...} }
    // Mas a API de findAll retorna a estrutura direta { entidadeId, nome, ... }
    const nome = entidadeApi.entidade?.nome || entidadeApi.nome || "";
    const entidadeId =
      entidadeApi.entidade?.entidadeId || entidadeApi.entidadeId;

    console.log("nome final:", nome);
    console.log("entidadeId final:", entidadeId);

    return {
      id: entidadeId?.toString() || "",
      codigo: entidadeId?.toString() || "",
      razaoSocial: nome,
      cnpj: entidadeApi.entidade?.cnpj || entidadeApi.cnpj || "",
      status: "ativo" as const, // A API não tem campo status, assumindo ativo
      endereco: endereco
        ? `${endereco.cidade || ""} - ${endereco.uf || ""}`.trim()
        : "",
      telefone:
        endereco?.contatoComercialTelefone1 ||
        endereco?.contatoTecnicoTelefone1 ||
        "",
      email:
        endereco?.contatoComercialEmail || endereco?.contatoTecnicoEmail || "",
      observacoes: "",
      // Dados adicionais da API
      urlSite: entidadeApi.urlSite,
      urlLogo: entidadeApi.urlLogo,
      createAt: entidadeApi.createAt,
      updateAt: entidadeApi.updateAt,

      // Dados do endereço
      cep: endereco?.cep || "",
      logradouro: endereco?.logradouro || "",
      numero: endereco?.numero || "",
      complemento: endereco?.complemento || "",
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      cidadeCodigo: endereco?.cidadeCodigo
        ? endereco.cidadeCodigo.toString()
        : "",
      uf: endereco?.uf || "",
      ufCodigo: endereco?.ufCodigo ? endereco.ufCodigo.toString() : "",

      // Contatos comerciais
      contatoComercialNome: endereco?.contatoComercialNome || "",
      contatoComercialTelefone1: endereco?.contatoComercialTelefone1 || "",
      contatoComercialTelefone2: endereco?.contatoComercialTelefone2 || "",
      contatoComercialTelefone3: endereco?.contatoComercialTelefone3 || "",
      contatoComercialEmail: endereco?.contatoComercialEmail || "",

      // Contatos técnicos
      contatoTecnicoNome: endereco?.contatoTecnicoNome || "",
      contatoTecnicoTelefone1: endereco?.contatoTecnicoTelefone1 || "",
      contatoTecnicoTelefone2: endereco?.contatoTecnicoTelefone2 || "",
      contatoTecnicoTelefone3: endereco?.contatoTecnicoTelefone3 || "",
      contatoTecnicoEmail: endereco?.contatoTecnicoEmail || "",

      // Contatos financeiros
      contatoFinanceiroNome: endereco?.contatoFinanceiroNome || "",
      contatoFinanceiroTelefone1: endereco?.contatoFinanceiroTelefone1 || "",
      contatoFinanceiroTelefone2: endereco?.contatoFinanceiroTelefone2 || "",
      contatoFinanceiroTelefone3: endereco?.contatoFinanceiroTelefone3 || "",
      contatoFinanceiroEmail: endereco?.contatoFinanceiroEmail || "",

      enderecos:
        entidadeApi.enderecos ||
        (entidadeApi.endereco ? [entidadeApi.endereco] : []),
      contasBancarias: entidadeApi.entidadeContaBancaria || [],
    };
  }

  // Converter dados do frontend para formato da API
  convertToApiFormat(frontendData: any): CreateEntidadeRequest {
    // Debug: verificar dados de contato
    console.log("=== DEBUG convertToApiFormat ===");
    console.log("contatoComercialNome:", frontendData.contatoComercialNome);
    console.log(
      "contatoComercialTelefone1:",
      frontendData.contatoComercialTelefone1
    );
    console.log("contatoComercialEmail:", frontendData.contatoComercialEmail);

    const apiData = {
      entidade: {
        nome: frontendData.razaoSocial,
        cnpj: frontendData.cnpj,
        urlSite: frontendData.urlSite,
        urlLogo: frontendData.urlLogo,
      },
      endereco: {
        // Dados do endereço
        cep: frontendData.cep,
        logradouro: frontendData.logradouro,
        numero: frontendData.numero,
        complemento: frontendData.complemento,
        bairro: frontendData.bairro,
        cidade: frontendData.cidade,
        cidade_codigo: frontendData.cidadeCodigo
          ? parseInt(frontendData.cidadeCodigo)
          : undefined,
        uf: frontendData.uf,
        uf_codigo: frontendData.ufCodigo
          ? parseInt(frontendData.ufCodigo)
          : undefined,

        // Contatos comerciais
        contatoComercialNome: frontendData.contatoComercialNome,
        contatoComercialTelefone1: frontendData.contatoComercialTelefone1,
        contatoComercialTelefone2: frontendData.contatoComercialTelefone2,
        contatoComercialTelefone3: frontendData.contatoComercialTelefone3,
        contatoComercialEmail: frontendData.contatoComercialEmail,

        // Contatos técnicos
        contatoTecnicoNome: frontendData.contatoTecnicoNome,
        contatoTecnicoTelefone1: frontendData.contatoTecnicoTelefone1,
        contatoTecnicoTelefone2: frontendData.contatoTecnicoTelefone2,
        contatoTecnicoTelefone3: frontendData.contatoTecnicoTelefone3,
        contatoTecnicoEmail: frontendData.contatoTecnicoEmail,

        // Contatos financeiros
        contatoFinanceiroNome: frontendData.contatoFinanceiroNome,
        contatoFinanceiroTelefone1: frontendData.contatoFinanceiroTelefone1,
        contatoFinanceiroTelefone2: frontendData.contatoFinanceiroTelefone2,
        contatoFinanceiroTelefone3: frontendData.contatoFinanceiroTelefone3,
        contatoFinanceiroEmail: frontendData.contatoFinanceiroEmail,
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

    console.log("Dados finais para API:", apiData);
    return apiData;
  }

  // Converter dados do frontend para formato de atualização da API
  convertToUpdateFormat(frontendData: any): UpdateEntidadeRequest {
    // Debug: verificar dados de contato
    console.log("=== DEBUG convertToUpdateFormat ===");
    console.log("contatoComercialNome:", frontendData.contatoComercialNome);
    console.log(
      "contatoComercialTelefone1:",
      frontendData.contatoComercialTelefone1
    );
    console.log("contatoComercialEmail:", frontendData.contatoComercialEmail);

    const updateData: UpdateEntidadeRequest = {
      entidade: {
        nome: frontendData.razaoSocial,
        cnpj: frontendData.cnpj,
        urlSite: frontendData.urlSite,
        urlLogo: frontendData.urlLogo,
      },
      endereco: {
        // Dados do endereço
        cep: frontendData.cep,
        logradouro: frontendData.logradouro,
        numero: frontendData.numero,
        complemento: frontendData.complemento,
        bairro: frontendData.bairro,
        cidade: frontendData.cidade,
        cidade_codigo: frontendData.cidadeCodigo
          ? parseInt(frontendData.cidadeCodigo)
          : undefined,
        uf: frontendData.uf,
        uf_codigo: frontendData.ufCodigo
          ? parseInt(frontendData.ufCodigo)
          : undefined,

        // Contatos comerciais
        contatoComercialNome: frontendData.contatoComercialNome,
        contatoComercialTelefone1: frontendData.contatoComercialTelefone1,
        contatoComercialTelefone2: frontendData.contatoComercialTelefone2,
        contatoComercialTelefone3: frontendData.contatoComercialTelefone3,
        contatoComercialEmail: frontendData.contatoComercialEmail,

        // Contatos técnicos
        contatoTecnicoNome: frontendData.contatoTecnicoNome,
        contatoTecnicoTelefone1: frontendData.contatoTecnicoTelefone1,
        contatoTecnicoTelefone2: frontendData.contatoTecnicoTelefone2,
        contatoTecnicoTelefone3: frontendData.contatoTecnicoTelefone3,
        contatoTecnicoEmail: frontendData.contatoTecnicoEmail,

        // Contatos financeiros
        contatoFinanceiroNome: frontendData.contatoFinanceiroNome,
        contatoFinanceiroTelefone1: frontendData.contatoFinanceiroTelefone1,
        contatoFinanceiroTelefone2: frontendData.contatoFinanceiroTelefone2,
        contatoFinanceiroTelefone3: frontendData.contatoFinanceiroTelefone3,
        contatoFinanceiroEmail: frontendData.contatoFinanceiroEmail,
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

    console.log("Dados finais para UPDATE:", updateData);
    return updateData;
  }
}

export const entidadeService = new EntidadeService();
