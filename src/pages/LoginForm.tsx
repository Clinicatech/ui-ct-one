import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validações básicas
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    setIsLoading(true);

    try {
      // Limpa storage antes de fazer novo login
      localStorage.clear();
      sessionStorage.clear();

      // Faz a chamada à API de autenticação
      const response = await AuthService.login({ email, password });

      // Verifica se veio o token e dados do usuário
      if (response.auth?.accessToken && response.user) {
        // Chama a função de login do contexto de autenticação
        login(email, password);
        // Redireciona para o main
        navigate("/main");
      } else {
        throw new Error("Dados de autenticação incompletos");
      }
    } catch (error) {
      // Limpa storage em caso de erro
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userData");

      if (error instanceof Error) {
        setError(error.message);
        console.error("Erro no login:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">ClinicaTech</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-sm text-muted-foreground text-center mt-4">
              <p>ClinicaTech Sistemas</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
