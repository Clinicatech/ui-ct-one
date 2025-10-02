import { apiRequest } from "../config/api";

// Tipos
export interface EntidadeContaBancaria {
  entidadeContaBancariaId: number;
  banco?: {
    bancoId: number;
    nome: string;
    codigo: string;
  };
  bancoNome?: string;
  agencia: string;
  conta: string;
  tipoConta?: string;
  ativo?: boolean;
}

export interface BancoListResponseDto {
  data: EntidadeContaBancaria[];
}

export interface BancoSearchParams {
  search?: string;
  tipoConta?: string;
  ativo?: boolean;
}

class BancoService {
  async findAll(params?: BancoSearchParams): Promise<BancoListResponseDto> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.tipoConta) {
        queryParams.append("tipoConta", params.tipoConta);
      }
      if (params?.ativo !== undefined) {
        queryParams.append("ativo", params.ativo.toString());
      }

      const response = await apiRequest<BancoListResponseDto>(
        `/entidade-conta-bancaria?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar contas bancárias:", error);
      throw error;
    }
  }

  async findById(id: number): Promise<EntidadeContaBancaria> {
    try {
      const response = await apiRequest<EntidadeContaBancaria>(
        `/entidade-conta-bancaria/${id}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar conta bancária:", error);
      throw error;
    }
  }

  async findByEntidade(entidadeId: number): Promise<BancoListResponseDto> {
    try {
      const response = await apiRequest<BancoListResponseDto>(
        `/entidade-conta-bancaria/entidade/${entidadeId}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar contas bancárias da entidade:", error);
      throw error;
    }
  }
}

export const bancoService = new BancoService();
