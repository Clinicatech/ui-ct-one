import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ContratosAtivosService,
  ContratosAtivosItem,
} from "../services/contratos-ativos.service";
import { DashboardService, DashboardItem } from "../services/dashboard.service";
import {
  ReceitasDespesasAnualService,
  ReceitasDespesasAnualItem,
} from "../services/receitas-despesas-anual.service";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../hooks/useAuth";
import {
  Building2,
  FileText,
  LogOut,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { EntityManagement } from "./entities";
import { NotExists } from "./notExists";
import { SocioManagement } from "./socios";
import { ClienteManagement } from "./clientes";
import { ParceiroManagement } from "./parceiros";
import { ContratoManagement } from "./contratos";
import { UsuarioManagement } from "./usuarios";
import { GestaoFinanceira } from "./gestao-financeira";

interface MainPageProps {
  activeTab?: string;
}

export function MainPage({ activeTab: propActiveTab }: MainPageProps) {
  const { userName, userEntidade, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(propActiveTab || "overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [contratosAtivos, setContratosAtivos] = useState<ContratosAtivosItem[]>(
    []
  );
  const [isLoadingContratos, setIsLoadingContratos] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [receitasDespesasData, setReceitasDespesasData] = useState<
    ReceitasDespesasAnualItem[]
  >([]);
  const [isLoadingReceitasDespesas, setIsLoadingReceitasDespesas] =
    useState(false);

  useEffect(() => {
    // Verificar se usuário é ADM (simulação - em produção viria da API)
    // Por enquanto, vamos simular que todos os usuários são ADM para teste
    setIsAdmin(true);
  }, []);

  const loadContratosAtivos = async () => {
    setIsLoadingContratos(true);
    try {
      const response = await ContratosAtivosService.getContratosAtivos();
      setContratosAtivos(response.data);
    } catch (error) {
      console.error("Erro ao carregar contratos ativos:", error);
    } finally {
      setIsLoadingContratos(false);
    }
  };

  const loadDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const response = await DashboardService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadReceitasDespesasData = async () => {
    setIsLoadingReceitasDespesas(true);
    try {
      const response =
        await ReceitasDespesasAnualService.getReceitasDespesasAnual();
      setReceitasDespesasData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados de receitas e despesas:", error);
    } finally {
      setIsLoadingReceitasDespesas(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      loadContratosAtivos();
      loadDashboardData();
      loadReceitasDespesasData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
      return;
    }

    // Determinar tab ativa baseada na URL
    const path = location.pathname;
    if (path.includes("/customers")) {
      setActiveTab("customers");
      return;
    }
    if (path === "/business-partners") {
      setActiveTab("business-partners");
      return;
    }
    if (path.includes("/reports")) {
      setActiveTab("reports");
      return;
    }
    if (path.includes("/users")) {
      setActiveTab("users");
      return;
    }
    if (path === "/partners") {
      setActiveTab("Sócios");
      return;
    }
    if (path.includes("/management")) {
      setActiveTab("Gestão Financeira");
      return;
    }
    if (path.includes("/entity")) {
      setActiveTab("Entidades");
      return;
    }
    if (path.includes("/contratos")) {
      setActiveTab("contratos");
      return;
    }
    setActiveTab("overview");
  }, [propActiveTab, location.pathname]);

  const totalContratos = contratosAtivos.reduce(
    (sum, item) => sum + item.contratos,
    0
  );

  // Funções auxiliares para processar dados do dashboard
  const getRecebimentosAbertos = () => {
    const item = dashboardData.find((d) => d.tipo === "R" && d.status === "A");
    return item
      ? {
          valor: item.valorMesAtual,
          diferenca: item.diferencaPercentual,
          cont: item.cont,
        }
      : { valor: 0, diferenca: 0, cont: 0 };
  };

  const getRecebimentosEfetivados = () => {
    const item = dashboardData.find((d) => d.tipo === "R" && d.status === "P");
    return item
      ? {
          valor: item.valorMesAtual,
          diferenca: item.diferencaPercentual,
          cont: item.cont,
        }
      : { valor: 0, diferenca: 0, cont: 0 };
  };

  const getPagamentosAbertos = () => {
    const item = dashboardData.find((d) => d.tipo === "D" && d.status === "A");
    return item
      ? {
          valor: item.valorMesAtual,
          diferenca: item.diferencaPercentual,
          cont: item.cont,
        }
      : { valor: 0, diferenca: 0, cont: 0 };
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toFixed(2)}`;
  };

  const formatPercentual = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  // Processar dados para o gráfico
  const processChartData = () => {
    const monthlyData: {
      [key: string]: { mes: string; receitas: number; despesas: number };
    } = {};

    receitasDespesasData.forEach((item) => {
      if (!monthlyData[item.mesAno]) {
        monthlyData[item.mesAno] = {
          mes: item.nomeMes,
          receitas: 0,
          despesas: 0,
        };
      }

      if (item.tipo === "R") {
        monthlyData[item.mesAno].receitas += item.valor;
      } else if (item.tipo === "D") {
        monthlyData[item.mesAno].despesas += item.valor;
      }
    });

    return Object.values(monthlyData).sort((a, b) => {
      const monthOrder = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];
      return monthOrder.indexOf(a.mes) - monthOrder.indexOf(b.mes);
    });
  };

  const chartData = processChartData();

  const recebimentosAbertos = getRecebimentosAbertos();
  const recebimentosEfetivados = getRecebimentosEfetivados();
  const pagamentosAbertos = getPagamentosAbertos();

  const stats = [
    {
      title: "Contratos Ativos",
      value: isLoadingContratos ? "..." : totalContratos.toString(),
      description: isLoadingContratos
        ? "Carregando..."
        : contratosAtivos
            .map((item) => `${item.tipo} ${item.contratos}`)
            .join(", "),
      icon: FileText,
      trend: "up",
      color:
        "bg-blue-100 border-blue-200 dark:bg-blue-400 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Recebimentos em aberto",
      value: isLoadingDashboard
        ? "..."
        : formatCurrency(recebimentosAbertos.valor),
      description: isLoadingDashboard
        ? "Carregando..."
        : `${formatPercentual(
            recebimentosAbertos.diferenca
          )} em relação ao mês anterior`,
      icon: DollarSign,
      trend: recebimentosAbertos.diferenca >= 0 ? "up" : "down",
      color:
        "bg-orange-100 border-orange-200 dark:bg-orange-400 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Recebimentos efetivados",
      value: isLoadingDashboard
        ? "..."
        : formatCurrency(recebimentosEfetivados.valor),
      description: isLoadingDashboard
        ? "Carregando..."
        : `${formatPercentual(
            recebimentosEfetivados.diferenca
          )} em relação ao mês anterior`,
      icon: DollarSign,
      trend: recebimentosEfetivados.diferenca >= 0 ? "up" : "down",
      color:
        "bg-green-100 border-green-200 dark:bg-green-300 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Pagamentos em aberto",
      value: isLoadingDashboard
        ? "..."
        : `${formatCurrency(pagamentosAbertos.valor)} (${
            pagamentosAbertos.cont
          } ${pagamentosAbertos.cont === 1 ? "fatura" : "faturas"})`,
      description: isLoadingDashboard
        ? "Carregando..."
        : `${formatPercentual(
            pagamentosAbertos.diferenca
          )} em relação ao mês anterior`,
      icon: Building2,
      trend: pagamentosAbertos.diferenca >= 0 ? "up" : "down",
      color: "bg-red-100 border-red-200 dark:bg-red-300 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="min-h-screen bg-blue-500">
      {/* Header */}
      <header className="bg-blue-100 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold font-nexa-bold">
                CT One - Gestão ClinicaTech
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {userName} - {userEntidade}
              </span>
              <Button variant="default" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-blue-900 mt-5">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            navigate(`/main/${value}`);
          }}
        >
          <TabsList
            className={`grid w-full h-18 ${
              isAdmin ? "grid-cols-6" : "grid-cols-5"
            }`}
          >
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="business-partners">Parceiros</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
            <TabsTrigger value="partners">Sócios</TabsTrigger>
            <TabsTrigger value="entity">Entidades</TabsTrigger>
            <TabsTrigger value="management">Gestão Financeira</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6 font-montserrat-medium text-white">
                Visão Geral
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.title} className={stat.color}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {stat.trend === "up" && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        <span>{stat.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Gráfico Receitas vs Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle>Receitas vs Despesas</CardTitle>
                  <CardDescription>
                    Evolução mensal dos valores financeiros
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingReceitasDespesas ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          Carregando dados...
                        </p>
                      </div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={chartData}
                        style={{
                          backgroundColor: "#2f404f",
                          borderRadius: "8px",
                          border: "2px solid #030b1a",
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="mes"
                          tick={{ fontSize: 12, fill: "#d1d5db" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          axisLine={{ stroke: "#6b7280" }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#d1d5db" }}
                          tickFormatter={(value) =>
                            `R$ ${(value / 1000).toFixed(0)}k`
                          }
                          axisLine={{ stroke: "#6b7280" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#374151",
                            border: "1px solid #6b7280",
                            borderRadius: "6px",
                            color: "#f9fafb",
                          }}
                          formatter={(value: number) => [
                            `R$ ${value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`,
                            "",
                          ]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Legend wrapperStyle={{ color: "#d1d5db" }} />
                        <Line
                          type="monotone"
                          dataKey="receitas"
                          stroke="#22c55e"
                          strokeWidth={2}
                          name="Receitas"
                          dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="despesas"
                          stroke="#ef4444"
                          strokeWidth={2}
                          name="Despesas"
                          dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum dado disponível
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <ClienteManagement title="Cadastro de Clientes" />
          </TabsContent>

          <TabsContent value="business-partners" className="space-y-6">
            <ParceiroManagement title="Cadastro de Parceiros" />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <NotExists title="Relatórios" />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <SocioManagement title="Cadastro de Sócios" />
          </TabsContent>

          <TabsContent value="entity" className="space-y-6">
            <EntityManagement title="Cadastro de Entidades" />
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <GestaoFinanceira title="Gestão Financeira" />
          </TabsContent>

          <TabsContent value="contratos" className="space-y-6">
            <ContratoManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {isAdmin ? (
              <UsuarioManagement title="Cadastro de Usuários" />
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Acesso Negado
                </h3>
                <p className="text-gray-600">
                  Apenas administradores podem acessar esta funcionalidade.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
