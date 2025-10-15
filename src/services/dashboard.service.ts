import { apiRequest } from "../config/api";

export interface DashboardItem {
  entidadeId: number;
  tipo: string;
  status: string;
  cont: number;
  valorMesAtual: number;
  valorMesAnterior: number;
  diferencaPercentual: number;
}

export interface DashboardResponse {
  data: DashboardItem[];
}

export class DashboardService {
  static async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await apiRequest<DashboardResponse>("/dashboard", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      throw error;
    }
  }
}
