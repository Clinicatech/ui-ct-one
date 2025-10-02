import { apiRequest } from "../config/api";

// Tipos
export interface Contrato {
  contratoId: number;
  numeroContrato?: string;
  descricao?: string;
  valor: number;
  ativo?: boolean;
  tipoContrato?: string;
  cliente?: any;
  parceiro?: any;
  socio?: any;
  tipo?: any;
  itens?: any[];
  contratoCreateAt?: string;
  contratoUpdateAt?: string;
  saldoLiquidoRecebido?: number;
  saldoLiquidoAReceber?: number;
  totalRateado?: number;
  detalhamentoFinanceiro?: any;
}

export interface ContratoTipo {
  contratoTipoId: number;
  descricao: string;
  recorrente: boolean;
  tipo: string;
}

export interface ContratoItem {
  descricao: string;
  valor: number;
  dataIni: string;
  dataFim?: string;
  diaVencimento: number;
  ativo: boolean;
  gerarBoleto: boolean;
  juros: number;
  mora: number;
  instrucoesBanco?: string;
  operacao?: string;
  entidadeContaBancariaId?: number;
  mesVencimento: number;
  anoVencimento: number;
}

export interface ContratoFormData {
  numeroContrato?: string;
  clienteInfoId?: number;
  parceiroInfoId?: number;
  socioInfoId?: number;
  contratoTipoId: number;
  descricao: string;
  valor: number;
  ativo: boolean;
  urlContrato?: string;
  itens: ContratoItem[];
}

export interface ContratoListResponse {
  data: Contrato[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ContratoListAllResponse {
  data: Contrato[];
}

export interface ContratoCreateResponse {
  contrato: Contrato;
}

export interface ContratoUpdateResponse {
  contrato: Contrato;
}

export interface FindAllContratoParams {
  page?: number;
  perPage?: number;
  search?: string;
  searchIn?: string;
  filters?: Array<{
    field: string;
    operator: string;
    content: string;
  }>;
  order?: Record<string, "ASC" | "DESC">;
  jsonCollections?: string[];
}

export class ContratoService {
  private baseUrl = "/contrato";

  /**
   * Lista todos os contratos (sem paginação)
   */
  async listAll(): Promise<ContratoListAllResponse> {
    return await apiRequest<ContratoListAllResponse>(
      `${this.baseUrl}/list-all`
    );
  }

  /**
   * Busca contratos com filtros e paginação
   */
  async findAll(
    params: FindAllContratoParams = {}
  ): Promise<ContratoListResponse> {
    const queryParams = new URLSearchParams();

    // Adiciona parâmetros básicos
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.perPage) {
      const perPage = params.perPage > 200 ? 200 : params.perPage;
      queryParams.append("perPage", perPage.toString());
    }

    // Adiciona search se válido
    if (params.search && params.search.length >= 2) {
      queryParams.append("search", params.search);
      if (params.searchIn) {
        queryParams.append("searchIn", params.searchIn);
      }
    }

    // Adiciona filtros se existirem
    if (params.filters && params.filters.length > 0) {
      params.filters.forEach((filter, index) => {
        queryParams.append(`filters[${index}][field]`, filter.field);
        queryParams.append(`filters[${index}][operator]`, filter.operator);
        if (filter.content) {
          queryParams.append(`filters[${index}][content]`, filter.content);
        }
      });
    }

    // Adiciona order se existir
    if (params.order) {
      Object.entries(params.order).forEach(([field, direction]) => {
        queryParams.append(`order[${field}]`, direction);
      });
    }

    // Adiciona jsonCollections se existir
    if (params.jsonCollections && params.jsonCollections.length > 0) {
      queryParams.append("jsonCollections", params.jsonCollections.join(","));
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    return await apiRequest<ContratoListResponse>(url);
  }

  /**
   * Busca um contrato por ID
   */
  async findOne(id: number): Promise<Contrato> {
    return await apiRequest<Contrato>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cria um novo contrato
   */
  async create(data: ContratoFormData): Promise<ContratoCreateResponse> {
    return await apiRequest<ContratoCreateResponse>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualiza um contrato existente
   */
  async update(
    id: number,
    data: ContratoFormData
  ): Promise<ContratoUpdateResponse> {
    return await apiRequest<ContratoUpdateResponse>(`${this.baseUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Remove um contrato
   */
  async remove(id: number): Promise<void> {
    await apiRequest<void>(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
  }
}

export const contratoService = new ContratoService();
