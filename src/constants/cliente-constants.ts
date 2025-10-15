import { ClienteFormData } from "../types/cliente";

export const DEFAULT_CLIENTE_FORM_DATA: ClienteFormData = {
  pessoa: {
    nome: "",
    razao: "",
    documento: "",
    tipo: "PF",
    inscricao_estadual: "",
    inscricao_municipal: "",
  },
  endereco: {
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    contato_comercial_telefone1: "",
    contato_comercial_telefone2: "",
    contato_comercial_email: "",
  },
  responsavel: {
    nome: "",
    razao: "",
    documento: "",
    tipo: "PF",
    inscricao_estadual: "",
    inscricao_municipal: "",
  },
  enderecoResponsavel: {
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
  },
  clienteInfo: {},
};

export const TIPO_PESSOA_OPTIONS = [
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];
