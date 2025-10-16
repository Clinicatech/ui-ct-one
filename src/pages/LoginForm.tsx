import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
  const [entidadeId, setEntidadeId] = useState<number | undefined>(undefined);
  const [entidades, setEntidades] = useState<
    { entidadeId: number; nome: string }[]
  >([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  // Carregar entidades ao montar o componente
  useEffect(() => {
    const loadEntidades = async () => {
      try {
        const entidadesData = await AuthService.getEntidades();
        setEntidades(entidadesData);

        // Se há apenas uma entidade, selecionar automaticamente
        if (entidadesData.length === 1) {
          setEntidadeId(entidadesData[0].entidadeId);
        }
      } catch (error) {
        console.error("Erro ao carregar entidades:", error);
        setError("Erro ao carregar entidades. Tente novamente.");
      }
    };

    loadEntidades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validações básicas
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, insira um email válido");
      return;
    }

    if (entidades.length > 1 && !entidadeId) {
      setError("Por favor, selecione uma entidade");
      return;
    }

    setIsLoading(true);

    try {
      // Limpa storage antes de fazer novo login
      localStorage.clear();
      sessionStorage.clear();

      // Faz a chamada à API de autenticação
      const response = await AuthService.login({
        email,
        password,
        entidadeId: entidadeId || undefined,
      });

      // Verificar se precisa trocar a senha
      if (response.user?.trocaSenha) {
        setNeedsPasswordChange(true);
        return;
      }

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validações
    if (!newPassword || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setIsChangingPassword(true);

    try {
      // Obter o ID do usuário do token ou do contexto
      const user = AuthService.getUser();
      if (!user) {
        setError("Usuário não encontrado. Faça login novamente.");
        return;
      }

      // Chamar API para trocar senha
      await AuthService.changePassword(user.codigo, {
        newPassword,
        confirmPassword,
      });

      setError("");
      setNeedsPasswordChange(false);
      setNewPassword("");
      setConfirmPassword("");

      // Limpar campos de login e mostrar mensagem de sucesso
      setEmail("");
      setPassword("");
      setEntidadeId(undefined);
      setSuccessMessage(
        "Senha alterada com sucesso! Faça login com sua nova senha."
      );
    } catch (error) {
      console.error("Erro ao trocar senha:", error);
      setError("Erro ao trocar senha. Tente novamente.");
    } finally {
      setIsChangingPassword(false);
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
          {!needsPasswordChange ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {entidades.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="entidade">Entidade</Label>
                  <Select
                    value={entidadeId?.toString() || ""}
                    onValueChange={(value) => setEntidadeId(parseInt(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma entidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {entidades.map((entidade) => (
                        <SelectItem
                          key={entidade.entidadeId}
                          value={entidade.entidadeId.toString()}
                        >
                          {entidade.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  autoComplete="email"
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
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  Troca de Senha Obrigatória
                </h3>
                <p className="text-sm text-gray-600">
                  Por segurança, você deve trocar sua senha antes de continuar.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Trocando senha..." : "Trocar Senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
