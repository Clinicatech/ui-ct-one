import { Outlet } from "react-router-dom";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../contexts/AuthContext";
import { httpInterceptor } from "../services/httpInterceptor.service";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function AppContent() {
  const { logout } = useAuth();

  useEffect(() => {
    // Configurar o callback de logout no interceptor HTTP
    httpInterceptor.setLogoutCallback(logout);
  }, [logout]);

  return (
    <div className="size-full">
      <Outlet />
      <Toaster />
    </div>
  );
}

export function AppLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
