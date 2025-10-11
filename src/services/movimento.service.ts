import { apiRequest } from "../config/api";

export interface MovimentoFilters {
  status?: string;
  dataLancamentoInicio?: string;
  dataLancamentoFim?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  dataPagamentoInicio?: string;
  dataPagamentoFim?: string;
  numeroContrato?: string;
  nome?: string;
  documento?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "ASC" | "DESC";
}

export interface MovimentoReceita {
  status: string;
  movimentoId: number;
  contratoItemId: number;
  dataVencimento: string;
  dataPagamento?: string;
  valor: number;
  valorEfetivo?: number;
  pago: boolean;
  urlComprovante?: string;
  descricao: string;
  contratoId: number;
  numeroContrato: string;
  contrato: string;
  urlContrato?: string;
  juros?: number;
  mora?: number;
  gerarBoleto?: boolean;
  diasAtraso: number;
  vrMora: number;
  vrJuros: number;
  valorTotalComCorrecoes: number;
  nome: string;
  documento: string;
  tipo: string;
  dataLancamento: string;
  tipoContrato: string;
  valorContrato: number;
  contratoAtivo: boolean;
}

export interface MovimentoDespesa {
  status: string;
  movimentoId: number;
  contratoItemId: number;
  dataVencimento: string;
  dataPagamento?: string;
  valor: number;
  valorEfetivo?: number;
  pago: boolean;
  urlComprovante?: string;
  descricao: string;
  contratoId: number;
  numeroContrato: string;
  contrato: string;
  urlContrato?: string;
  juros?: number;
  mora?: number;
  gerarBoleto?: boolean;
  diasAtraso: number;
  vrMora: number;
  vrJuros: number;
  valorTotalComCorrecoes: number;
  nome: string;
  documento: string;
  tipo: string;
  dataLancamento: string;
  tipoContrato: string;
  valorContrato: number;
  contratoAtivo: boolean;
}

export interface Totalizadores {
  totalRegistros: number;
  valorTotal: number;
  valorRecebido?: number;
  valorPago?: number;
  valorEmAberto: number;
  totalMora: number;
  totalJuros: number;
  valorTotalComCorrecoes: number;
}

export interface MovimentoReceitasResponse {
  data: MovimentoReceita[];
  totalizadores: Totalizadores;
}

export interface MovimentoDespesasResponse {
  data: MovimentoDespesa[];
  totalizadores: Totalizadores;
}

export interface UpdateMovimentoPagamentoData {
  pago: boolean;
  dataPagamento?: string;
  valorEfetivo?: number;
}

export interface UploadComprovanteData {
  arquivo: string;
  nomeArquivo: string;
  tipoArquivo: "pdf" | "jpg" | "jpeg" | "png";
}

class MovimentoService {
  async findReceitas(
    filters: MovimentoFilters = {}
  ): Promise<MovimentoReceitasResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return await apiRequest<MovimentoReceitasResponse>(
      `/movimento/receitas?${params.toString()}`
    );
  }

  async findDespesas(
    filters: MovimentoFilters = {}
  ): Promise<MovimentoDespesasResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    return await apiRequest<MovimentoDespesasResponse>(
      `/movimento/despesas?${params.toString()}`
    );
  }

  async getReceitasStatus(): Promise<{ status: string[] }> {
    return await apiRequest<{ status: string[] }>("/movimento/receitas/status");
  }

  async getDespesasStatus(): Promise<{ status: string[] }> {
    return await apiRequest<{ status: string[] }>("/movimento/despesas/status");
  }

  async updatePagamento(
    id: number,
    data: UpdateMovimentoPagamentoData
  ): Promise<{ movimento: any }> {
    return await apiRequest<{ movimento: any }>(`/movimento/${id}/pagamento`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async uploadComprovante(
    id: number,
    data: UploadComprovanteData
  ): Promise<{ urlComprovante: string }> {
    return await apiRequest<{ urlComprovante: string }>(
      `/movimento/${id}/comprovante`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async downloadComprovante(uuid: string): Promise<Blob> {
    const token = localStorage.getItem("ct_one_token");
    const response = await fetch(`/api/movimento/comprovante/${uuid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  formatDate(dateString: string): string {
    if (!dateString) return "";

    // Se a data já está no formato YYYY-MM-DD, usar diretamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("pt-BR");
    }

    // Para outros formatos, usar a conversão normal
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "RECEBIDO":
      case "PAGO":
        return "bg-green-100 text-green-800";
      case "EM ABERTO":
        return "bg-blue-100 text-blue-800";
      case "EM ATRASO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  async verificarExistenciaMovimento(
    entidadeId: number,
    mes: number,
    ano: number
  ): Promise<{ existe: boolean }> {
    const response = await apiRequest<{ existe: boolean }>(
      `/movimento/verificar-existencia/${entidadeId}/${mes}/${ano}`
    );
    return response;
  }

  async gerarMovimento(dto: {
    entidadeId: number;
    mes: number;
    ano: number;
  }): Promise<any> {
    const response = await apiRequest<any>("/movimento/gerar", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    return response;
  }
}

export const movimentoService = new MovimentoService();
