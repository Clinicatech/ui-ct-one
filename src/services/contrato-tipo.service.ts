import { apiRequest } from "../config/api";

// Tipos
export interface ContratoTipo {
  contratoTipoId: number;
  descricao: string;
  recorrente: boolean;
  tipo: string;
}

export interface ContratoTipoFormData {
  descricao: string;
  recorrente: boolean;
  tipo: string;
}

export interface ContratoTipoListResponse {
  data: ContratoTipo[];
}

export interface ContratoTipoCreateResponse {
  contratoTipo: ContratoTipo;
}

export interface ContratoTipoUpdateResponse {
  contratoTipo: ContratoTipo;
}

export class ContratoTipoService {
  private baseUrl = "/contrato-tipo";

  /**
   * Lista todos os tipos de contrato
   */
  async findAll(): Promise<ContratoTipoListResponse> {
    return await apiRequest<ContratoTipoListResponse>(this.baseUrl);
  }

  /**
   * Busca um tipo de contrato por ID
   */
  async findOne(id: number): Promise<ContratoTipo> {
    return await apiRequest<ContratoTipo>(`${this.baseUrl}/${id}`);
  }

  /**
   * Cria um novo tipo de contrato
   */
  async create(
    data: ContratoTipoFormData
  ): Promise<ContratoTipoCreateResponse> {
    return await apiRequest<ContratoTipoCreateResponse>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Atualiza um tipo de contrato existente
   */
  async update(
    id: number,
    data: ContratoTipoFormData
  ): Promise<ContratoTipoUpdateResponse> {
    return await apiRequest<ContratoTipoUpdateResponse>(
      `${this.baseUrl}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Remove um tipo de contrato
   */
  async remove(id: number): Promise<void> {
    await apiRequest<void>(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
  }
}

export const contratoTipoService = new ContratoTipoService();
