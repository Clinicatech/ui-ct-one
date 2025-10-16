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
        inscricaoEstadual: formData.pessoa.inscricaoEstadual || undefined,
        inscricaoMunicipal: formData.pessoa.inscricaoMunicipal || undefined,
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
        (formData.dadosBancarios.dadosBancariosId ||
          formData.dadosBancarios.bancoId ||
          formData.dadosBancarios.agencia ||
          formData.dadosBancarios.conta ||
          formData.dadosBancarios.contaTipo ||
          formData.dadosBancarios.chavePix ||
          formData.dadosBancarios.contaDigito ||
          formData.dadosBancarios.agenciaDigito)
          ? {
              dadosBancariosId:
                formData.dadosBancarios.dadosBancariosId || undefined,
              ...(formData.dadosBancarios.bancoId && {
                bancoId: Number(formData.dadosBancarios.bancoId),
              }),
              agencia: formData.dadosBancarios.agencia || undefined,
              conta: formData.dadosBancarios.conta || undefined,
              contaTipo: formData.dadosBancarios.contaTipo || undefined,
              chavePix: formData.dadosBancarios.chavePix || undefined,
              contaDigito: formData.dadosBancarios.contaDigito || undefined,
              agenciaDigito: formData.dadosBancarios.agenciaDigito || undefined,
            }
          : undefined,
      socioInfo: formData.socioInfo
        ? {
            percRateio: Number(formData.socioInfo.percRateio) || 0,
          }
        : undefined,
    };
  }

  convertCreateUpdateToFrontendFormat(apiResponse: { socio: Socio }): Socio {
    return apiResponse.socio;
  }
}

export const socioService = new SocioService();
