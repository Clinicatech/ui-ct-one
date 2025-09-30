export interface Cliente {
  cliente_info_id: number;
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
  responsavel: {
    pessoa_id: number;
    nome: string;
    razao: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    entidade_id: number;
    inscricao_estadual: string | null;
    inscricao_municipal: string | null;
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
  } | null;
}

export interface ClienteFormData {
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
    contato_comercial_telefone1?: string | null;
    contato_comercial_telefone2?: string | null;
    contato_comercial_email?: string | null;
  } | null;
  responsavel?: {
    nome: string;
    razao?: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    inscricao_estadual?: string | null;
    inscricao_municipal?: string | null;
  } | null;
  enderecoResponsavel?: {
    cep?: string;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cidade_codigo?: string | null;
    uf_codigo?: string | null;
    contato_comercial_telefone1?: string | null;
    contato_comercial_telefone2?: string | null;
    contato_comercial_email?: string | null;
  } | null;
  clienteInfo?: {
    clienteInfoId?: number;
    pessoaId?: number;
    pessoaResponsavelId?: number;
  };
}
