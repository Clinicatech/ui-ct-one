export interface Parceiro {
  parceiroInfoId: number;
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
  dadosBancarios: {
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
  pessoaResponsavelId: number;
  atividadeParceiroId: number | null;
  percIndicacao: number;
  percMensalidade: number;
}

export interface ParceiroFormData {
  pessoa: {
    pessoaId?: number; // ID da pessoa quando já existe
    nome: string;
    razao?: string | null;
    documento: string;
    tipo: "PF" | "PJ";
    inscricaoEstadual?: string | null;
    inscricaoMunicipal?: string | null;
  };
  endereco?: {
    enderecoId?: number; // ID do endereço quando já existe
    cep?: string;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cidadeCodigo?: string | null;
    ufCodigo?: string | null;
  };
  dadosBancarios?: {
    dadosBancariosId?: number; // ID dos dados bancários quando já existem
    bancoId?: number;
    agencia?: string;
    conta?: string;
    contaTipo?: 1 | 2;
    chavePix?: string | null;
    contaDigito?: string | null;
    agenciaDigito?: string | null;
  };
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
  parceiroInfo?: {
    pessoaResponsavelId?: number;
    atividadeParceiroId?: number | null;
    percIndicacao?: number;
    percMensalidade?: number;
  };
}

export interface AtividadeParceiro {
  atividadeParceiroId: number;
  descricao: string;
  ativo: boolean;
}

export interface Banco {
  bancoId: number;
  codigo: string;
  nome: string;
  ativo: boolean;
}

export interface Entidade {
  entidadeId: number;
  nome: string;
  cnpj: string;
  urlSite?: string;
  urlLogo?: string;
}
