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
      const response = await apiRequest<{ cliente: Cliente }>(
        `/cliente/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(this.convertToApiFormat(formData)),
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
      responsavel:
        formData.responsavel &&
        (formData.responsavel.nome ||
          formData.responsavel.documento ||
          formData.responsavel.tipo)
          ? {
              nome: formData.responsavel.nome,
              razao: formData.responsavel.razao || undefined,
              documento: formData.responsavel.documento,
              tipo: formData.responsavel.tipo,
              inscricao_estadual:
                formData.responsavel.inscricao_estadual || undefined,
              inscricao_municipal:
                formData.responsavel.inscricao_municipal || undefined,
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
                    cidadeCodigo: formData.enderecoResponsavel.cidade_codigo
                      ? parseInt(formData.enderecoResponsavel.cidade_codigo)
                      : undefined,
                    uf: formData.enderecoResponsavel.uf || undefined,
                    ufCodigo: formData.enderecoResponsavel.uf_codigo
                      ? parseInt(formData.enderecoResponsavel.uf_codigo)
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      clienteInfo: undefined,
    };

    return apiData;
  }
}
