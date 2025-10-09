// Utilitário para trabalhar com JWT tokens
export interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  entidadeId?: number;
  exp: number;
  iat: number;
}

// Decodificar token JWT (sem verificar assinatura)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

// Verificar se token está expirado
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

// Extrair email do token
export function getEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.email || null;
}

// Extrair entidadeId do token
export function getEntidadeIdFromToken(token: string): number | null {
  const payload = decodeJWT(token);
  console.log("🔍 getEntidadeIdFromToken - payload completo:", payload);
  console.log(
    "🔍 getEntidadeIdFromToken - entidadeId do payload:",
    payload?.entidadeId
  );
  return payload?.entidadeId || null;
}
