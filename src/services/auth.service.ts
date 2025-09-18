import {
  API_CONFIG,
  TOKEN_STORAGE,
  USER_STORAGE,
  apiRequest,
} from "../config/api";
import { getEmailFromToken, isTokenExpired } from "../utils/jwt";

const API_TIMEOUT = 10000;
// Tipos para a resposta de login
export interface LoginResponse {
  auth: {
    accessToken: string;
    refreshToken: string | null;
  };
  user: {
    codigo: number;
    nome: string;
    email: string;
  };
  duration: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Serviço de autenticação
export class AuthService {
  // Fazer login
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    try {
      const response = await apiRequest<LoginResponse>(
        API_CONFIG.ENDPOINTS.LOGIN,
        {
          method: "POST",
          body: JSON.stringify(credentials),
        }
      );

      if (response.auth && response.auth.accessToken) {
        TOKEN_STORAGE.setToken(response.auth.accessToken);
      }

      if (response.user) {
        USER_STORAGE.setUser(response.user);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Verificação de tipo segura
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tempo de conexão esgotado. Verifique sua internet e tente novamente.');
        }
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Servidor indisponível. Por favor, tente novamente mais tarde.'); 
        }
        if (error.message.includes('HTTP error!')) {
          throw new Error('Servidor indisponível. Por favor, tente novamente mais tarde.'); 
        }        
        throw error; 
      }      
      
      throw new Error('Ocorreu um erro desconhecido durante o login');
    }
  }

  // Fazer logout
  static logout(): void {
    TOKEN_STORAGE.removeToken();
    USER_STORAGE.removeUser();
  }

  // Verificar se está autenticado
  static isAuthenticated(): boolean {
    const token = TOKEN_STORAGE.getToken();
    //console.log('isAuthenticated', token);
    if (!token) return false;

    // Verificar se o token não está expirado
    return !isTokenExpired(token);
  }

  // Obter token atual
  static getToken(): string | null {
    return TOKEN_STORAGE.getToken();
  }

  // Obter email do usuário atual
  static getUserEmail(): string | null {
    // Primeiro tentar obter do localStorage
    const user = USER_STORAGE.getUser();
    if (user) {
      return user.email;
    }

    // Fallback: tentar extrair do token JWT
    const token = TOKEN_STORAGE.getToken();
    if (!token) return null;

    return getEmailFromToken(token);
  }

  // Obter dados completos do usuário
  static getUser(): { codigo: number; nome: string; email: string } | null {
    const user = USER_STORAGE.getUser();
    return user;
  }
}
