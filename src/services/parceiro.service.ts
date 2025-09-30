import {
  Parceiro,
  ParceiroFormData,
  AtividadeParceiro,
  Banco,
} from "../types/parceiro";
import { apiRequest } from "../config/api";

export class ParceiroService {
  async findAll(): Promise<{
    data: Parceiro[];
    total: number;
    page: number;
    limit: number;
  }> {
    return apiRequest("/parceiro");
  }

  async findOne(id: number): Promise<Parceiro> {
    return apiRequest(`/parceiro/${id}`);
  }

  async create(data: any): Promise<{ parceiro: Parceiro }> {
    return apiRequest("/parceiro", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: any): Promise<{ parceiro: Parceiro }> {
    return apiRequest(`/parceiro/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async remove(id: number): Promise<void> {
    return apiRequest(`/parceiro/${id}`, {
      method: "DELETE",
    });
  }

  async getBancos(): Promise<Banco[]> {
    return apiRequest("/banco");
  }

  async getAtividadesParceiro(): Promise<AtividadeParceiro[]> {
    return apiRequest("/atividade-parceiro");
  }

  convertToApiFormat(formData: ParceiroFormData): any {
    return {
      pessoa: {
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
              cidadeCodigo: formData.endereco.cidadeCodigo
                ? parseInt(formData.endereco.cidadeCodigo)
                : undefined,
              uf: formData.endereco.uf || undefined,
              ufCodigo: formData.endereco.ufCodigo
                ? parseInt(formData.endereco.ufCodigo)
                : undefined,
            }
          : undefined,
      dadosBancarios:
        formData.dadosBancarios &&
        (formData.dadosBancarios.bancoId ||
          formData.dadosBancarios.agencia ||
          formData.dadosBancarios.conta ||
          formData.dadosBancarios.contaTipo ||
          formData.dadosBancarios.chavePix ||
          formData.dadosBancarios.contaDigito ||
          formData.dadosBancarios.agenciaDigito)
          ? {
              bancoId: formData.dadosBancarios.bancoId
                ? Number(formData.dadosBancarios.bancoId)
                : undefined,
              agencia: formData.dadosBancarios.agencia || undefined,
              conta: formData.dadosBancarios.conta || undefined,
              contaTipo: formData.dadosBancarios.contaTipo || undefined,
              chavePix: formData.dadosBancarios.chavePix || undefined,
              contaDigito: formData.dadosBancarios.contaDigito || undefined,
              agenciaDigito: formData.dadosBancarios.agenciaDigito || undefined,
            }
          : undefined,
      responsavel: formData.responsavel
        ? {
            nome: formData.responsavel.nome,
            razao: formData.responsavel.razao || undefined,
            documento: formData.responsavel.documento,
            tipo: formData.responsavel.tipo,
            inscricaoEstadual:
              formData.responsavel.inscricaoEstadual || undefined,
            inscricaoMunicipal:
              formData.responsavel.inscricaoMunicipal || undefined,
          }
        : undefined,
      enderecoResponsavel:
        formData.enderecoResponsavel &&
        (formData.enderecoResponsavel.cep ||
          formData.enderecoResponsavel.endereco ||
          formData.enderecoResponsavel.numero ||
          formData.enderecoResponsavel.bairro ||
          formData.enderecoResponsavel.cidade ||
          formData.enderecoResponsavel.uf)
          ? {
              cep: formData.enderecoResponsavel.cep || undefined,
              logradouro: formData.enderecoResponsavel.endereco || undefined,
              numero: formData.enderecoResponsavel.numero || undefined,
              complemento:
                formData.enderecoResponsavel.complemento || undefined,
              bairro: formData.enderecoResponsavel.bairro || undefined,
              cidade: formData.enderecoResponsavel.cidade || undefined,
              cidadeCodigo: formData.enderecoResponsavel.cidadeCodigo
                ? parseInt(formData.enderecoResponsavel.cidadeCodigo)
                : undefined,
              uf: formData.enderecoResponsavel.uf || undefined,
              ufCodigo: formData.enderecoResponsavel.ufCodigo
                ? parseInt(formData.enderecoResponsavel.ufCodigo)
                : undefined,
              contatoComercialTelefone1:
                formData.enderecoResponsavel.contatoComercialTelefone1 ||
                undefined,
              contatoComercialTelefone2:
                formData.enderecoResponsavel.contatoComercialTelefone2 ||
                undefined,
              contatoComercialEmail:
                formData.enderecoResponsavel.contatoComercialEmail || undefined,
            }
          : undefined,
      parceiroInfo: formData.parceiroInfo
        ? {
            pessoaResponsavelId: formData.parceiroInfo.pessoaResponsavelId
              ? Number(formData.parceiroInfo.pessoaResponsavelId)
              : null,
            atividadeParceiroId: formData.parceiroInfo.atividadeParceiroId
              ? Number(formData.parceiroInfo.atividadeParceiroId)
              : undefined,
            percIndicacao: Number(formData.parceiroInfo.percIndicacao) || 0,
            percMensalidade: Number(formData.parceiroInfo.percMensalidade) || 0,
          }
        : undefined,
    };
  }

  convertCreateUpdateToFrontendFormat(apiResponse: {
    parceiro: Parceiro;
  }): Parceiro {
    return apiResponse.parceiro;
  }
}

export const parceiroService = new ParceiroService();
