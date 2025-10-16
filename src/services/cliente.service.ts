import { apiRequest } from "../config/api";
import { Cliente, ClienteFormData } from "../types/cliente";

export class ClienteService {
  static async findAll(): Promise<Cliente[]> {
    try {
      const response = await apiRequest<{ data: Cliente[] }>("/cliente", {
        method: "GET",
      });
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
  }

  static async findOne(id: number): Promise<Cliente> {
    try {
      const response = await apiRequest<Cliente>(`/cliente/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  }

  static async create(formData: ClienteFormData): Promise<Cliente> {
    try {
      const response = await apiRequest<{ cliente: Cliente }>("/cliente", {
        method: "POST",
        body: JSON.stringify(this.convertToApiFormat(formData)),
      });
      return response.cliente;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  }

  static async update(id: number, formData: ClienteFormData): Promise<Cliente> {
    try {
      const apiData = this.convertToApiFormat(formData);

      const response = await apiRequest<{ cliente: Cliente }>(
        `/cliente/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(apiData),
        }
      );
      return response.cliente;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  }

  static async remove(id: number): Promise<void> {
    try {
      await apiRequest(`/cliente/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Erro ao remover cliente ${id}:`, error);
      throw error;
    }
  }

  private static convertToApiFormat(formData: ClienteFormData): any {
    const apiData = {
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
      responsavel: formData.responsavel?.documento
        ? {
            nome: formData.responsavel.nome,
            razao: formData.responsavel.razao || undefined,
            documento: formData.responsavel.documento,
            tipo: formData.responsavel.tipo,
            inscricaoEstadual:
              formData.responsavel.inscricaoEstadual || undefined,
            inscricaoMunicipal:
              formData.responsavel.inscricaoMunicipal || undefined,
            endereco: formData.enderecoResponsavel
              ? {
                  cep: formData.enderecoResponsavel.cep || undefined,
                  logradouro:
                    formData.enderecoResponsavel.endereco || undefined,
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
                }
              : undefined,
          }
        : undefined,
      clienteInfo: {
        clienteInfoId: formData.clienteInfo?.clienteInfoId
          ? Number(formData.clienteInfo.clienteInfoId)
          : undefined,
        pessoaId: formData.clienteInfo?.pessoaId
          ? Number(formData.clienteInfo.pessoaId)
          : undefined,
        pessoaResponsavelId: formData.clienteInfo?.pessoaResponsavelId
          ? Number(formData.clienteInfo.pessoaResponsavelId)
          : null,
      },
    };

    return apiData;
  }
}
