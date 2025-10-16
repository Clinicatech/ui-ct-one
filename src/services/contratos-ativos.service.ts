import { apiRequest } from "../config/api";

export interface ContratosAtivosItem {
  contratos: number;
  tipo: string;
  entidadeId: number;
}

export interface ContratosAtivosResponse {
  data: ContratosAtivosItem[];
}

export class ContratosAtivosService {
  static async getContratosAtivos(): Promise<ContratosAtivosResponse> {
    try {
      const response = await apiRequest<ContratosAtivosResponse>(
        "/contratos-ativos",
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar contratos ativos:", error);
      throw error;
    }
  }
}



