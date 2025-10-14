import { apiRequest } from "../config/api";

// Tipos para Banco (entidade real)
export interface Banco {
  bancoId: number;
  nome: string;
}

export interface BancoListResponseDto {
  data: Banco[];
}

export interface BancoSearchParams {
  search?: string;
  ativo?: boolean;
}

class BancoService {
  async findAll(params?: BancoSearchParams): Promise<BancoListResponseDto> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.ativo !== undefined) {
        queryParams.append("ativo", params.ativo.toString());
      }

      const response = await apiRequest<BancoListResponseDto>(
        `/banco?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar bancos:", error);
      throw error;
    }
  }

  async findById(id: number): Promise<Banco> {
    try {
      const response = await apiRequest<Banco>(`/banco/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Erro ao buscar banco:", error);
      throw error;
    }
  }
}

export const bancoService = new BancoService();
