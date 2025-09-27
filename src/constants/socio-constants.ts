import { SocioFormData } from "../types/socio";

export const DEFAULT_SOCIO_FORM_DATA: SocioFormData = {
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
  },
  dadosBancarios: {
    banco_id: undefined,
    agencia: "",
    conta: "",
    conta_tipo: 1,
    chave_pix: "",
    conta_digito: "",
    agencia_digito: "",
  },
  socioInfo: {
    perc_rateio: 0,
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
