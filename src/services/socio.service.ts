import { Socio, SocioFormData, Banco } from "../types/socio";
import { apiRequest } from "../config/api";

export class SocioService {
  async findAll(): Promise<{
    data: Socio[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiRequest("/socios");
  }

  async findOne(id: number): Promise<Socio> {
    return apiRequest(`/socios/${id}`);
  }

  async create(data: any): Promise<{ socio: Socio }> {
    return apiRequest("/socios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: any): Promise<{ socio: Socio }> {
    return apiRequest(`/socios/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async remove(id: number): Promise<void> {
    return apiRequest(`/socios/${id}`, {
      method: "DELETE",
    });
  }

  async getBancos(): Promise<Banco[]> {
    return apiRequest("/socios/bancos");
  }

  convertToApiFormat(formData: SocioFormData): any {
    return {
      pessoa: {
        pessoaId: formData.pessoa.pessoaId || undefined, // Incluir pessoaId se existir
        nome: formData.pessoa.nome,
        razao: formData.pessoa.razao || undefined,
        documento: formData.pessoa.documento,
        tipo: formData.pessoa.tipo,
        inscricao_estadual: formData.pessoa.inscricao_estadual || undefined,
        inscricao_municipal: formData.pessoa.inscricao_municipal || undefined,
      },
      endereco:
        formData.endereco &&
        (formData.endereco.cep ||
          formData.endereco.endereco ||
          formData.endereco.numero ||
          formData.endereco.bairro ||
          formData.endereco.cidade ||
          formData.endereco.uf)
          ? {
              cep: formData.endereco.cep || undefined,
              logradouro: formData.endereco.endereco || undefined,
              numero: formData.endereco.numero || undefined,
              complemento: formData.endereco.complemento || undefined,
              bairro: formData.endereco.bairro || undefined,
              cidade: formData.endereco.cidade || undefined,
              cidadeCodigo: formData.endereco.cidade_codigo
                ? parseInt(formData.endereco.cidade_codigo)
                : undefined,
              uf: formData.endereco.uf || undefined,
              ufCodigo: formData.endereco.uf_codigo
                ? parseInt(formData.endereco.uf_codigo)
                : undefined,
            }
          : undefined,
      dadosBancarios:
        formData.dadosBancarios &&
        (formData.dadosBancarios.banco_id ||
          formData.dadosBancarios.agencia ||
          formData.dadosBancarios.conta ||
          formData.dadosBancarios.conta_tipo ||
          formData.dadosBancarios.chave_pix ||
          formData.dadosBancarios.conta_digito ||
          formData.dadosBancarios.agencia_digito)
          ? {
              dadosBancariosId: formData.dadosBancarios.dadosBancariosId || undefined,
              banco_id: formData.dadosBancarios.banco_id
                ? Number(formData.dadosBancarios.banco_id)
                : undefined,
              agencia: formData.dadosBancarios.agencia || undefined,
              conta: formData.dadosBancarios.conta || undefined,
              conta_tipo: formData.dadosBancarios.conta_tipo || undefined,
              chave_pix: formData.dadosBancarios.chave_pix || undefined,
              conta_digito: formData.dadosBancarios.conta_digito || undefined,
              agencia_digito:
                formData.dadosBancarios.agencia_digito || undefined,
            }
          : undefined,
      socioInfo: formData.socioInfo
        ? {
            perc_rateio: Number(formData.socioInfo.perc_rateio) || 0,
          }
        : undefined,
    };
  }

  convertCreateUpdateToFrontendFormat(apiResponse: { socio: Socio }): Socio {
    return apiResponse.socio;
  }
}

export const socioService = new SocioService();
