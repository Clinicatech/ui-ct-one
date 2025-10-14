import { TOKEN_STORAGE, USER_STORAGE } from "../config/api";
import { toast } from "sonner";

class HttpInterceptorService {
  private static instance: HttpInterceptorService;
  private logoutCallback: (() => void) | null = null;

  private constructor() {}

  static getInstance(): HttpInterceptorService {
    if (!HttpInterceptorService.instance) {
      HttpInterceptorService.instance = new HttpInterceptorService();
    }
    return HttpInterceptorService.instance;
  }

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  handleUnauthorized() {
    TOKEN_STORAGE.removeToken();
    USER_STORAGE.removeUser();

    toast.error("Sua sessão expirou. Faça login novamente.");

    if (this.logoutCallback) {
      this.logoutCallback();
    } else {
      // Fallback: redirecionar diretamente
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  }

  isUnauthorizedError(status: number): boolean {
    return status === 401;
  }
}

export const httpInterceptor = HttpInterceptorService.getInstance();
