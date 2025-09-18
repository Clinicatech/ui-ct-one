/**
 * Utilitários de CEP
 *
 * Re-exporta funções do cepService.ts para manter compatibilidade
 * com código existente.
 */

// Re-exportar funções do novo serviço
export {
  buscarCEPViaCEP,
  converterViaCEPParaFormulario as convertViaCEPToFormData,
  validarFormatoCEP as isValidCEP,
  formatarCEP as formatCEP,
  limparCEP as cleanCEP,
  type ViaCEPResponse,
  type EnderecoData as EnderecoFormData,
} from "./cepService";
