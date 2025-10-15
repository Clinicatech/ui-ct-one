import { apiRequest } from "../config/api";

export interface CaixaEntidadeItem {
  tipo: number;
  entidadeId: number;
  id: number;
  dataMov: string;
  nome: string;
  descricao: string | null;
  valor: number;
}

export interface DividendosItem {
  tipo: number;
  entidadeId: number;
  id: number;
  dataMov: string;
  nome: string;
  descricao: string | null;
  valor: number;
}

export interface CaixaEntidadeResponse {
  data: CaixaEntidadeItem[];
  total: number;
}

export interface DividendosResponse {
  data: DividendosItem[];
  total: number;
}

export interface CreateDividendoRequest {
  destino: string;
  id: number;
  mes: number;
  ano: number;
  valor: number;
  entidadeId?: number;
  descricao?: string;
}

export interface CreateDividendoResponse {
  dividendosId: number;
  destino: string;
  id: number;
  mes: number;
  ano: number;
  valor: number;
  entidadeId: number | null;
  descricao: string | null;
  message: string;
}

export interface TotalResponse {
  total: number;
}

export interface DividendoPagoResponse {
  existeDividendoPago: boolean;
}

export class FinanceiroService {
  static async getCaixaEntidade(
    entidadeId: number
  ): Promise<CaixaEntidadeResponse> {
    try {
      const response = await apiRequest<CaixaEntidadeResponse>(
        `/financeiro/caixa-entidade/${entidadeId}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar caixa da entidade:", error);
      throw error;
    }
  }

  static async getDividendos(entidadeId: number): Promise<DividendosResponse> {
    try {
      const response = await apiRequest<DividendosResponse>(
        `/financeiro/dividendos/${entidadeId}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar dividendos:", error);
      throw error;
    }
  }

  static async getTotal(id: number, destino: string): Promise<TotalResponse> {
    try {
      const response = await apiRequest<TotalResponse>(
        `/financeiro/total/${id}/${destino}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar total:", error);
      throw error;
    }
  }

  static async createDividendo(
    data: CreateDividendoRequest
  ): Promise<CreateDividendoResponse> {
    try {
      const response = await apiRequest<CreateDividendoResponse>(
        `/financeiro/dividendos`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao criar dividendo:", error);
      throw error;
    }
  }

  static async verificarDividendoPago(
    entidadeId: number,
    mes: number,
    ano: number
  ): Promise<DividendoPagoResponse> {
    try {
      const response = await apiRequest<DividendoPagoResponse>(
        `/financeiro/dividendo-pago/${entidadeId}/${mes}/${ano}`
      );
      return response;
    } catch (error) {
      console.error("Erro ao verificar dividendo pago:", error);
      throw error;
    }
  }
}
