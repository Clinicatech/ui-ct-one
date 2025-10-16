export interface Cliente {
  clienteInfoId: number;
  pessoa: {
    pessoaId: number;
    nome: string;
    razao: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    entidadeId: number;
    inscricaoEstadual: string | null;
    inscricaoMunicipal: string | null;
  };
  endereco: {
    enderecoId: number;
    cep: string;
    endereco: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    cidadeCodigo?: string | null;
    ufCodigo?: string | null;
  } | null;
  responsavel: {
    pessoaId: number;
    nome: string;
    razao: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    entidadeId: number;
    inscricaoEstadual: string | null;
    inscricaoMunicipal: string | null;
    endereco: {
      enderecoId: number;
      cep: string;
      endereco: string | null;
      numero: string | null;
      complemento: string | null;
      bairro: string | null;
      cidade: string | null;
      uf: string | null;
      cidadeCodigo?: string | null;
      ufCodigo?: string | null;
    } | null;
  } | null;
}

export interface ClienteFormData {
  pessoa: {
    nome: string;
    razao?: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    inscricaoEstadual?: string | null;
    inscricaoMunicipal?: string | null;
  };
  endereco?: {
    cep?: string;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cidadeCodigo?: string | null;
    ufCodigo?: string | null;
    contatoComercialTelefone1?: string | null;
    contatoComercialTelefone2?: string | null;
    contatoComercialEmail?: string | null;
  } | null;
  responsavel?: {
    nome: string;
    razao?: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    inscricaoEstadual?: string | null;
    inscricaoMunicipal?: string | null;
  } | null;
  enderecoResponsavel?: {
    cep?: string;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cidadeCodigo?: string | null;
    ufCodigo?: string | null;
    contatoComercialTelefone1?: string | null;
    contatoComercialTelefone2?: string | null;
    contatoComercialEmail?: string | null;
  } | null;
  clienteInfo?: {
    clienteInfoId?: number;
    pessoaId?: number;
    pessoaResponsavelId?: number;
  };
}
