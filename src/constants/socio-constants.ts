import { SocioFormData } from "../types/socio";

export const DEFAULT_SOCIO_FORM_DATA: SocioFormData = {
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
  },
  dadosBancarios: {
    bancoId: undefined,
    agencia: "",
    conta: "",
    contaTipo: 1,
    chavePix: "",
    contaDigito: "",
    agenciaDigito: "",
  },
  socioInfo: {
    percRateio: 0,
  },
};

export const CONTA_TIPO_OPTIONS = [
  { value: 1, label: "Conta Corrente" },
  { value: 2, label: "Conta Poupança" },
];

export const TIPO_PESSOA_OPTIONS = [
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];
