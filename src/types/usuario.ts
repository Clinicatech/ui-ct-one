export interface Usuario {
  usuarioId: number;
  email: string;
  ativo: boolean;
  trocarSenha: boolean;
  entidadeId?: number;
  pessoaId?: number;
  adm: boolean;
  entidade?: {
    entidadeId: number;
    nome: string;
    cnpj: string;
  };
  pessoa?: {
    pessoaId: number;
    nome: string;
    documento: string;
  };
}

export interface UsuarioFormData {
  email: string;
  ativo: boolean;
  adm: boolean;
  pessoaId?: number;
  pessoa?: {
    tipo: "PF" | "PJ";
    nome: string;
    razao?: string;
    documento: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    entidadeId: number;
  };
}

export const DEFAULT_USUARIO_FORM_DATA: UsuarioFormData = {
  email: "",
  ativo: true,
  adm: false,
  pessoaId: undefined,
  pessoa: undefined,
};
