import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SupplierManagement } from './SupplierManagement';
import { useAuth } from '../hooks/useAuth';
import { 
  Building2, 
  Package, 
  FileText, 
  LogOut,
  BarChart3,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface MainPageProps {
  activeTab?: string;
}

export function MainPage({ activeTab: propActiveTab }: MainPageProps) {
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(propActiveTab || 'overview');

  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    } else {
      // Determinar tab ativa baseada na URL
      const path = location.pathname;
      if (path.includes('/suppliers')) setActiveTab('suppliers');
      else if (path.includes('/products')) setActiveTab('products');
      else if (path.includes('/reports')) setActiveTab('reports');
      else if (path.includes('/users')) setActiveTab('users');
      else setActiveTab('overview');
    }
  }, [propActiveTab, location.pathname]);

  const stats = [
    {
      title: 'Contratos Ativos',
      value: '189',
      description: '89% dos clientes cadastrados',
      icon: FileText,
      trend: 'up'
    },
    {
      title: 'Recebimentos em aberto',
      value: 'R$ 2.4M',
      description: '+18% em relação ao mês anterior',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Recebimentos efetivados',
      value: 'R$ 15.4M',
      description: '+28% em relação ao mês anterior',
      icon: DollarSign,
      trend: 'up'
    },
    {
      title: 'Pagamentos em aberto',
      value: 'R$ 300.4k (56 faturas)',
      description: '-32% em relação ao mês anterior',
      icon: Building2,
      trend: 'up'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-300 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">CT One - Gestão ClinicaTech</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-400 mt-5">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          navigate(`/main/${value}`);
        }}>
          <TabsList className="grid w-full grid-cols-5">  {/* grid-cols-5 - aqui determina o numero de colunas que vai ter no header */}
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="suppliers">Clientes</TabsTrigger>
            <TabsTrigger value="products">Parceiros</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Visão Geral</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                        <span>{stat.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>Últimas movimentações no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Novo fornecedor cadastrado: EVOLARIS PRODUTOS FARMACÊUTICOS LTDA</p>
                        <p className="text-xs text-muted-foreground">Há 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Contrato atualizado: ABBVIE FARMACÊUTICA LTDA</p>
                        <p className="text-xs text-muted-foreground">Há 4 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">Produto descontinuado removido do catálogo</p>
                        <p className="text-xs text-muted-foreground">Há 6 horas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="suppliers">
            <SupplierManagement />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Gestão de Produtos</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Cadastro de Produtos</h3>
                    <p className="text-muted-foreground">
                      Esta funcionalidade será implementada em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Relatórios</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Módulo de Relatórios</h3>
                    <p className="text-muted-foreground">
                      Esta funcionalidade será implementada em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Relatórios</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Cadastro de Usuários</h3>
                    <p className="text-muted-foreground">
                      Esta funcionalidade será implementada em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
        </Tabs>
      </main>
    </div>
  );
}