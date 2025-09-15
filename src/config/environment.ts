// Configuração de ambiente
export const ENV_CONFIG = {
  // URLs da API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",

  // Ambiente
  NODE_ENV: import.meta.env.NODE_ENV || "development",
  IS_DEVELOPMENT: import.meta.env.NODE_ENV === "development",
  IS_PRODUCTION: import.meta.env.NODE_ENV === "production",

  // Configurações de debug
  DEBUG: import.meta.env.VITE_DEBUG === "true",
} as const;

// Função para obter URL completa da API
export const getApiUrl = (endpoint: string): string => {
  return `${ENV_CONFIG.API_BASE_URL}${endpoint}`;
};

// Função para log de debug
export const debugLog = (message: string, data?: any): void => {
  if (ENV_CONFIG.DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};
