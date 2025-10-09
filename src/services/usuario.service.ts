import { apiRequest } from "../config/api";
import { Usuario, UsuarioFormData } from "../types/usuario";
import { AuthService } from "./auth.service";

export class UsuarioService {
  static async findAll(): Promise<Usuario[]> {
    try {
      const response = await apiRequest<{ data: Usuario[] }>("/usuario");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  }

  static async findByEntidade(entidadeId: number): Promise<Usuario[]> {
    try {
      const response = await apiRequest<{ data: Usuario[] }>(
        `/usuario/entidade/${entidadeId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuários da entidade:", error);
      throw error;
    }
  }

  static async findOne(id: number): Promise<Usuario> {
    try {
      const response = await apiRequest<Usuario>(`/usuario/${id}`);
      return response;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw error;
    }
  }

  static async create(formData: UsuarioFormData): Promise<Usuario> {
    try {
      const response = await apiRequest<{ usuario: Usuario }>("/usuario", {
        method: "POST",
        body: JSON.stringify(this.convertToApiFormat(formData)),
      });
      return response.usuario;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }

  static async update(id: number, formData: UsuarioFormData): Promise<Usuario> {
    try {
      const response = await apiRequest<{ usuario: Usuario }>(
        `/usuario/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(this.convertToApiFormat(formData)),
        }
      );
      return response.usuario;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await apiRequest(`/usuario/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw error;
    }
  }

  static async findByEmailInOtherEntities(
    email: string,
    currentEntidadeId: number
  ): Promise<Usuario[]> {
    try {
      const response = await apiRequest<Usuario[]>(
        `/usuario/email/${email}/other-entities`,
        {
          method: "GET",
          body: JSON.stringify({ currentEntidadeId }),
        }
      );
      return response;
    } catch (error) {
      console.error("Erro ao buscar usuários em outras entidades:", error);
      throw error;
    }
  }

  static async replicateUserToEntity(
    usuarioId: number,
    targetEntidadeId: number
  ): Promise<Usuario> {
    try {
      const response = await apiRequest<{ usuario: Usuario }>(
        `/usuario/${usuarioId}/replicate`,
        {
          method: "POST",
          body: JSON.stringify({ targetEntidadeId }),
        }
      );
      return response.usuario;
    } catch (error) {
      console.error("Erro ao replicar usuário:", error);
      throw error;
    }
  }

  private static convertToApiFormat(formData: UsuarioFormData): any {
    const apiData: any = {
      email: formData.email,
      ativo: formData.ativo,
      adm: formData.adm,
    };

    // Adicionar entidadeId do usuário logado
    const entidadeId = AuthService.getEntidadeId();
    console.log("🔍 convertToApiFormat - entidadeId:", entidadeId);

    if (entidadeId) {
      apiData.entidadeId = entidadeId;
    }

    // Se tem dados da pessoa (para criar nova ou atualizar), incluir pessoa
    if (formData.pessoa) {
      apiData.pessoa = formData.pessoa;
    } else if (formData.pessoaId) {
      // Se tem pessoaId mas não tem dados da pessoa, usar pessoaId
      apiData.pessoaId = formData.pessoaId;
    }

    console.log("🔍 convertToApiFormat - apiData final:", apiData);
    return apiData;
  }
}
