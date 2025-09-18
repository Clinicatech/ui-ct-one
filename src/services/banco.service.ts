import { apiRequest } from "../config/api";

export interface Banco {
  bancoId: number;
  nome: string;
  codigo?: string;
  ativo?: boolean;
}

export class BancoService {
  /**
   * Busca todos os bancos
   */
  static async findAll(): Promise<Banco[]> {
    try {
      const response = await apiRequest<{ data: Banco[] }>("/banco", {
        method: "GET",
      });

      // A API agora retorna { data: [...] }
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar bancos:", error);
      // Em caso de erro, retornar array vazio em vez de lançar erro
      return [];
    }
  }

  /**
   * Busca um banco por ID
   */
  static async findById(id: number): Promise<Banco> {
    try {
      const response = await apiRequest<Banco>(`/banco/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error(`Erro ao buscar banco ${id}:`, error);
      throw error;
    }
  }
}

export const bancoService = new BancoService();
