import { apiRequest } from "../config/api";

export interface ReceitasDespesasAnualItem {
  tipo: string;
  valor: number;
  mesAno: string;
  nomeMes: string;
  ano: number;
  numeroMes: number;
}

export interface ReceitasDespesasAnualResponse {
  data: ReceitasDespesasAnualItem[];
}

export class ReceitasDespesasAnualService {
  static async getReceitasDespesasAnual(): Promise<ReceitasDespesasAnualResponse> {
    try {
      const response = await apiRequest<ReceitasDespesasAnualResponse>(
        "/receitas-despesas-anual",
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar receitas e despesas anuais:", error);
      throw error;
    }
  }
}



