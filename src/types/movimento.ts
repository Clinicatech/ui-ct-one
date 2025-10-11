export interface MovimentoBase {
  status: string;
  movimentoId: number;
  contratoItemId: number;
  dataVencimento: string;
  dataPagamento?: string;
  valor: number;
  valorEfetivo?: number;
  pago: boolean;
  urlComprovante?: string;
  descricao: string;
  contratoId: number;
  numeroContrato: string;
  contrato: string;
  urlContrato?: string;
  juros?: number;
  mora?: number;
  gerarBoleto?: boolean;
  diasAtraso: number;
  vrMora: number;
  vrJuros: number;
  valorTotalComCorrecoes: number;
  nome: string;
  documento: string;
  tipo: string;
  dataLancamento: string;
  tipoContrato: string;
  valorContrato: number;
  contratoAtivo: boolean;
}

export interface MovimentoReceita extends MovimentoBase {}

export interface MovimentoDespesa extends MovimentoBase {}

export interface Totalizadores {
  totalRegistros: number;
  valorTotal: number;
  valorRecebido?: number;
  valorPago?: number;
  valorEmAberto: number;
  totalMora: number;
  totalJuros: number;
  valorTotalComCorrecoes: number;
}

export interface MovimentoFilters {
  status?: string;
  dataLancamentoInicio?: string;
  dataLancamentoFim?: string;
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  dataPagamentoInicio?: string;
  dataPagamentoFim?: string;
  numeroContrato?: string;
  nome?: string;
  documento?: string;
  page?: number;
  limit?: number;
}

export interface UpdateMovimentoPagamentoData {
  pago: boolean;
  dataPagamento?: string;
  valorEfetivo?: number;
}

export interface UploadComprovanteData {
  arquivo: string;
  nomeArquivo: string;
  tipoArquivo: "pdf" | "jpg" | "jpeg" | "png";
}

export interface MovimentoFormData {
  pago: boolean;
  dataPagamento: string;
  valorEfetivo: number;
  comprovante?: File;
}

export const DEFAULT_MOVIMENTO_FORM_DATA: MovimentoFormData = {
  pago: false,
  dataPagamento: "",
  valorEfetivo: 0,
  comprovante: undefined,
};
