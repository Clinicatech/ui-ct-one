import { ENV_CONFIG, getApiUrl, debugLog } from "./environment";
import { httpInterceptor } from "../services/httpInterceptor.service";

// Configuração da API
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  ENDPOINTS: {
    LOGIN: "/auth/login-front/",
  },
} as const;

// Funções para gerenciar token no localStorage
export const TOKEN_STORAGE = {
  KEY: "ct_one_token",

  // Salvar token
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_STORAGE.KEY, token);
  },

  // Obter token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE.KEY);
  },

  // Remover token
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_STORAGE.KEY);
  },

  // Verificar se tem token
  hasToken: (): boolean => {
    return !!TOKEN_STORAGE.getToken();
  },
} as const;

// Funções para gerenciar dados do usuário no localStorage
export const USER_STORAGE = {
  KEY: "ct_one_user",

  // Salvar dados do usuário
  setUser: (user: {
    codigo: number;
    nome: string;
    email: string;
    entidade: string;
  }): void => {
    localStorage.setItem(USER_STORAGE.KEY, JSON.stringify(user));
  },

  // Obter dados do usuário
  getUser: (): {
    codigo: number;
    nome: string;
    email: string;
    entidade: string;
  } | null => {
    const user = localStorage.getItem(USER_STORAGE.KEY);
    const parsed = user ? JSON.parse(user) : null;
    return parsed;
  },

  // Remover dados do usuário
  removeUser: (): void => {
    localStorage.removeItem(USER_STORAGE.KEY);
  },
} as const;

// Função para fazer requisições à API
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = TOKEN_STORAGE.getToken();

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const url = getApiUrl(endpoint);
  debugLog(`API Request: ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    debugLog(`API Error: ${response.status}`, errorData);

    // Tratar erro 401 (Unauthorized) - token expirado
    if (httpInterceptor.isUnauthorizedError(response.status)) {
      httpInterceptor.handleUnauthorized();
      throw new Error("Sessão expirada. Redirecionando para login...");
    }

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();
  debugLog(`API Response: ${options.method || "GET"} ${endpoint}`, data);

  return data;
};
