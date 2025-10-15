import { apiRequest } from "../config/api";

export interface FluxoCaixaItem {
  descricao: string;
  dtMovimento: string;
  entrada: number;
  saida: number;
  saldoDia: number;
  saldoAcumulado: number;
}

export interface FluxoCaixaResponse {
  data: FluxoCaixaItem[];
}

export interface GerarDividendosRequest {
  mes: number;
  ano: number;
}

export interface GerarDividendosResponse {
  mensagem: string;
  sucesso: boolean;
}

export interface DeletarDividendosRequest {
  mes: number;
  ano: number;
}

export interface DeletarDividendosResponse {
  mensagem: string;
  sucesso: boolean;
}

export interface VerificarDividendosRequest {
  mes: number;
  ano: number;
}

export interface VerificarDividendosResponse {
  existe: boolean;
}

export class FluxoCaixaService {
  static async getFluxoCaixa(
    mes: number,
    ano: number
  ): Promise<FluxoCaixaResponse> {
    try {
      const response = await apiRequest<FluxoCaixaResponse>(
        `/fluxo-caixa/${mes}/${ano}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error);
      throw error;
    }
  }

  static async gerarDividendos(
    mes: number,
    ano: number
  ): Promise<GerarDividendosResponse> {
    try {
      const response = await apiRequest<GerarDividendosResponse>(
        "/fluxo-caixa/gerar-dividendos",
        {
          method: "POST",
          body: JSON.stringify({ mes, ano }),
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao gerar dividendos:", error);
      throw error;
    }
  }

  static async deletarDividendos(
    mes: number,
    ano: number
  ): Promise<DeletarDividendosResponse> {
    try {
      const response = await apiRequest<DeletarDividendosResponse>(
        "/fluxo-caixa/deletar-dividendos",
        {
          method: "POST",
          body: JSON.stringify({ mes, ano }),
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao deletar dividendos:", error);
      throw error;
    }
  }

  static async verificarDividendos(
    mes: number,
    ano: number
  ): Promise<VerificarDividendosResponse> {
    try {
      const response = await apiRequest<VerificarDividendosResponse>(
        "/fluxo-caixa/verificar-dividendos",
        {
          method: "POST",
          body: JSON.stringify({ mes, ano }),
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao verificar dividendos:", error);
      throw error;
    }
  }
}
