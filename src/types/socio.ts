export interface Socio {
  socio_info_id: number;
  pessoa: {
    pessoa_id: number;
    nome: string;
    razao: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    entidade_id: number;
    inscricao_estadual: string | null;
    inscricao_municipal: string | null;
  };
  endereco: {
    endereco_id: number;
    cep: string;
    endereco: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    cidade_codigo?: string | null;
    uf_codigo?: string | null;
  } | null;
  dadosBancarios: {
    dados_bancarios_id: number;
    banco_id: number;
    agencia: string;
    conta: string;
    conta_tipo: number;
    chave_pix: string | null;
    conta_digito: string | null;
    agencia_digito: string | null;
    banco: {
      banco_id: number;
      codigo: string;
      nome: string;
      ativo: boolean;
    };
  } | null;
  perc_rateio: number;
}

export interface SocioFormData {
  pessoa: {
    nome: string;
    razao?: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    inscricao_estadual?: string | null;
    inscricao_municipal?: string | null;
  };
  endereco?: {
    cep?: string;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cidade_codigo?: string | null;
    uf_codigo?: string | null;
  };
  dadosBancarios?: {
    banco_id?: number;
    agencia?: string;
    conta?: string;
    conta_tipo?: 1 | 2;
    chave_pix?: string | null;
    conta_digito?: string | null;
    agencia_digito?: string | null;
  };
  socioInfo?: {
    perc_rateio?: number;
  };
}

export interface Banco {
  banco_id: number;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export interface Entidade {
  entidade_id: number;
  nome: string;
  cnpj: string;
  url_site?: string;
  url_logo?: string;
}
