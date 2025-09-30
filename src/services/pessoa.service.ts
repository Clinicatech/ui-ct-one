import { apiRequest } from "../config/api";

export interface Pessoa {
  pessoaId: number;
  nome: string;
  razao: string | null;
  documento: string;
  tipo: "PF" | "PJ";
  entidadeId: number;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  enderecos?: Array<{
    enderecoId: number;
    cep: string;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    cidadeCodigo?: string | null;
    ufCodigo?: string | null;
  }>;
  dadosBancarios?: Array<{
    dadosBancariosId: number;
    bancoId: number;
    agencia: string;
    conta: string;
    contaTipo: number;
    chavePix: string | null;
    contaDigito: string | null;
    agenciaDigito: string | null;
    banco: {
      bancoId: number;
      codigo: string;
      nome: string;
      ativo: boolean;
    };
  }>;
}

export interface PessoaSearchParams {
  documento?: string;
  nome?: string;
  tipo?: "PF" | "PJ";
  limit?: number;
  offset?: number;
}

export interface PessoaSearchResponse {
  data: Pessoa[];
  total: number;
  page: number;
  limit: number;
}

export class PessoaService {
  async search(params: PessoaSearchParams): Promise<PessoaSearchResponse> {
    const queryParams = new URLSearchParams();

    if (params.documento) {
      queryParams.append("documento", params.documento);
    }
    if (params.nome) {
      queryParams.append("nome", params.nome);
    }
    if (params.tipo) {
      queryParams.append("tipo", params.tipo);
    }
    if (params.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params.offset) {
      queryParams.append("offset", params.offset.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/pessoa/search?${queryString}`
      : "/pessoa/search";

    return apiRequest(url);
  }

  async findOne(id: number): Promise<Pessoa> {
    return apiRequest(`/pessoa/${id}`);
  }
}

export const pessoaService = new PessoaService();
