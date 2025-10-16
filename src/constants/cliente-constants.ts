import { ClienteFormData } from "../types/cliente";

export const DEFAULT_CLIENTE_FORM_DATA: ClienteFormData = {
  pessoa: {
    nome: "",
    razao: "",
    documento: "",
    tipo: "PF",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
  },
  endereco: {
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    contatoComercialTelefone1: "",
    contatoComercialTelefone2: "",
    contatoComercialEmail: "",
  },
  responsavel: {
    nome: "",
    razao: "",
    documento: "",
    tipo: "PF",
    inscricaoEstadual: "",
    inscricaoMunicipal: "",
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
