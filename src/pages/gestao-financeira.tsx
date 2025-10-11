import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { DataTable, Column } from "../components/ui/data-table";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Edit,
  Download,
  Eye,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MovimentoFiltersComponent } from "../components/MovimentoFilters";
import { MovimentoForm } from "../components/MovimentoForm";
import { MovimentoDetailsModal } from "../components/MovimentoDetailsModal";
import {
  movimentoService,
  MovimentoReceita,
  MovimentoDespesa,
  MovimentoFilters,
} from "../services/movimento.service";
import {
  MovimentoFormData,
  DEFAULT_MOVIMENTO_FORM_DATA,
} from "../types/movimento";
import { AuthService } from "../services/auth.service";

interface GestaoFinanceiraProps {
  title?: string;
}

export function GestaoFinanceira({
  title = "Gestão Financeira",
}: GestaoFinanceiraProps) {
  const [activeTab, setActiveTab] = useState<"receitas" | "despesas">(
    "receitas"
  );
  const [receitas, setReceitas] = useState<MovimentoReceita[]>([]);
  const [despesas, setDespesas] = useState<MovimentoDespesa[]>([]);
  const [receitasTotalizadores, setReceitasTotalizadores] = useState<any>(null);
  const [despesasTotalizadores, setDespesasTotalizadores] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<MovimentoFilters>({
    page: 1,
    limit: 15,
  });
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMovimento, setEditingMovimento] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedMovimento, setSelectedMovimento] = useState<any>(null);
  const [formData, setFormData] = useState<MovimentoFormData>(
    DEFAULT_MOVIMENTO_FORM_DATA
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para gerar movimento
  const [isGerarMovimentoDialogOpen, setIsGerarMovimentoDialogOpen] =
    useState(false);
  const [isGerandoMovimento, setIsGerandoMovimento] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<string>("");
  const [anoSelecionado, setAnoSelecionado] = useState<string>("");
  const [entidadeId, setEntidadeId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    loadStatusOptions();

    // Obter entidadeId do usuário logado usando AuthService
    const entidadeId = AuthService.getEntidadeId();
    console.log("=== ENTIDADE ID ===");
    console.log("entidadeId obtido:", entidadeId);
    console.log("Token disponível:", !!AuthService.getToken());
    setEntidadeId(entidadeId);
  }, [activeTab, filters]);

  // useEffect separado para garantir que entidadeId seja obtido na montagem do componente
  useEffect(() => {
    const loadEntidadeId = () => {
      const entidadeId = AuthService.getEntidadeId();
      console.log("=== CARREGANDO ENTIDADE ID ===");
      console.log("entidadeId obtido:", entidadeId);
      console.log("Token disponível:", !!AuthService.getToken());
      setEntidadeId(entidadeId);
    };

    // Carregar imediatamente
    loadEntidadeId();

    // Se não conseguiu obter, tentar novamente após um pequeno delay
    if (!entidadeId) {
      const timeoutId = setTimeout(loadEntidadeId, 100);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  // Definir valores padrão quando o modal abrir
  useEffect(() => {
    if (isGerarMovimentoDialogOpen) {
      console.log("=== USEEFFECT MODAL ABERTO ===");
      console.log("entidadeId atual no useEffect:", entidadeId);

      const now = new Date();
      const mesAtual = (now.getMonth() + 1).toString();
      const anoAtual = now.getFullYear().toString();

      console.log(
        "Definindo valores no useEffect - mes:",
        mesAtual,
        "ano:",
        anoAtual
      );
      setMesSelecionado(mesAtual);
      setAnoSelecionado(anoAtual);
    }
  }, [isGerarMovimentoDialogOpen, entidadeId]);

  const getOrderBy = (filters: MovimentoFilters) => {
    // Se não há filtros ou apenas status, ordenar por data de vencimento
    const hasOnlyStatus = Object.keys(filters).length === 1 && filters.status;
    const hasNoFilters =
      Object.keys(filters).length === 0 ||
      (Object.keys(filters).length === 1 && filters.status === "all");

    if (hasNoFilters || hasOnlyStatus) {
      return { orderBy: "data_vencimento", orderDirection: "DESC" as const };
    }

    // Se há filtros de data, ordenar pelo primeiro preenchido
    if (filters.dataVencimentoInicio || filters.dataVencimentoFim) {
      return { orderBy: "data_vencimento", orderDirection: "DESC" as const };
    }

    if (filters.dataPagamentoInicio || filters.dataPagamentoFim) {
      return { orderBy: "data_pagamento", orderDirection: "DESC" as const };
    }

    if (filters.dataLancamentoInicio || filters.dataLancamentoFim) {
      return { orderBy: "data_lancamento", orderDirection: "DESC" as const };
    }

    // Default: ordenar por data de vencimento
    return { orderBy: "data_vencimento", orderDirection: "DESC" as const };
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const orderConfig = getOrderBy(filters);
      const filtersWithOrder = { ...filters, ...orderConfig };

      if (activeTab === "receitas") {
        const response = await movimentoService.findReceitas(filtersWithOrder);
        setReceitas(response.data);
        setReceitasTotalizadores(response.totalizadores);

        // Atualizar estados de paginação
        setTotalPages(
          Math.ceil(
            response.totalizadores.totalRegistros / (filters.limit || 15)
          )
        );
        setCurrentPage(filters.page || 1);
      } else {
        const response = await movimentoService.findDespesas(filtersWithOrder);
        setDespesas(response.data);
        setDespesasTotalizadores(response.totalizadores);

        // Atualizar estados de paginação
        setTotalPages(
          Math.ceil(
            response.totalizadores.totalRegistros / (filters.limit || 15)
          )
        );
        setCurrentPage(filters.page || 1);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatusOptions = async () => {
    try {
      if (activeTab === "receitas") {
        const response = await movimentoService.getReceitasStatus();
        setStatusOptions(response.status);
      } else {
        const response = await movimentoService.getDespesasStatus();
        setStatusOptions(response.status);
      }
    } catch (error) {
      console.error("Erro ao carregar status:", error);
    }
  };

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 15 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleGerarMovimento = () => {
    console.log("=== INÍCIO handleGerarMovimento ===");

    // Abrir modal primeiro
    setIsGerarMovimentoDialogOpen(true);

    console.log("Modal aberto - isGerarMovimentoDialogOpen: true");
    console.log("=== FIM handleGerarMovimento ===");
  };

  const handleConfirmarGerarMovimento = async () => {
    console.log("=== INÍCIO handleConfirmarGerarMovimento ===");
    console.log("mesSelecionado:", mesSelecionado);
    console.log("anoSelecionado:", anoSelecionado);
    console.log("entidadeId do estado:", entidadeId);

    // Obter entidadeId diretamente do AuthService
    const currentEntidadeId = AuthService.getEntidadeId();
    console.log("entidadeId obtido do AuthService:", currentEntidadeId);

    if (!mesSelecionado || !anoSelecionado || !currentEntidadeId) {
      console.log(
        "ERRO: Valores faltando - mesSelecionado:",
        mesSelecionado,
        "anoSelecionado:",
        anoSelecionado,
        "entidadeId:",
        currentEntidadeId
      );
      toast.error("Por favor, selecione mês e ano e verifique se está logado");
      return;
    }

    const mes = parseInt(mesSelecionado);
    const ano = parseInt(anoSelecionado);
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();

    // Verificar se não é data futura
    if (ano > anoAtual || (ano === anoAtual && mes > mesAtual)) {
      toast.error("Não é possível gerar movimentos para datas futuras");
      return;
    }

    try {
      setIsGerandoMovimento(true);

      // Verificar se já existe movimento
      const { existe } = await movimentoService.verificarExistenciaMovimento(
        currentEntidadeId,
        mes,
        ano
      );

      if (existe) {
        const confirmar = window.confirm(
          `Já existem movimentos para ${mes}/${ano}. Deseja refazer os movimentos?`
        );
        if (!confirmar) {
          setIsGerandoMovimento(false);
          return;
        }
      }

      // Gerar movimento
      await movimentoService.gerarMovimento({
        entidadeId: currentEntidadeId,
        mes,
        ano,
      });

      toast.success(`Movimentos gerados com sucesso para ${mes}/${ano}`);
      setIsGerarMovimentoDialogOpen(false);

      // Recarregar dados
      loadData();
    } catch (error) {
      console.error("Erro ao gerar movimento:", error);
      toast.error("Erro ao gerar movimento");
    } finally {
      setIsGerandoMovimento(false);
    }
  };

  const handleEdit = (movimento: any) => {
    setEditingMovimento(movimento);
    setFormData({
      pago: movimento.pago,
      dataPagamento: movimento.dataPagamento || "",
      valorEfetivo: movimento.valorEfetivo || movimento.valor,
      comprovante: undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDownloadComprovante = async (urlComprovante: string) => {
    try {
      const uuid = urlComprovante.split("/").pop()?.split(".")[0];
      if (!uuid) {
        toast.error("UUID do comprovante não encontrado");
        return;
      }

      const blob = await movimentoService.downloadComprovante(uuid);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = urlComprovante.split("/").pop() || "comprovante";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Comprovante baixado com sucesso");
    } catch (error) {
      console.error("Erro ao baixar comprovante:", error);
      toast.error("Erro ao baixar comprovante");
    }
  };

  const handleViewDetails = (movimento: any) => {
    setSelectedMovimento(movimento);
    setIsDetailsDialogOpen(true);
  };

  const handleSubmitForm = async (data: MovimentoFormData) => {
    if (!editingMovimento) return;

    setIsSubmitting(true);
    try {
      await movimentoService.updatePagamento(editingMovimento.movimentoId, {
        pago: data.pago,
        dataPagamento: data.dataPagamento || undefined,
        valorEfetivo: data.valorEfetivo || undefined,
      });

      if (data.comprovante) {
        const base64 = await fileToBase64(data.comprovante);
        const extensao = data.comprovante.name.split(".").pop()?.toLowerCase();

        await movimentoService.uploadComprovante(editingMovimento.movimentoId, {
          arquivo: base64,
          nomeArquivo: data.comprovante.name,
          tipoArquivo: extensao as any,
        });
      }

      toast.success("Movimento atualizado com sucesso");
      setIsEditDialogOpen(false);
      setEditingMovimento(null);
      setFormData(DEFAULT_MOVIMENTO_FORM_DATA);
      await loadData();
    } catch (error) {
      console.error("Erro ao atualizar movimento:", error);
      toast.error("Erro ao atualizar movimento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const getStatusBadge = (status: string) => {
    const colorClass = movimentoService.getStatusColor(status);
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const receitasColumns: Column<MovimentoReceita>[] = [
    {
      key: "status",
      header: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "dataVencimento",
      header: "Vencimento",
      render: (item) => movimentoService.formatDate(item.dataVencimento),
    },
    {
      key: "valor",
      header: "Valor",
      render: (item) => movimentoService.formatCurrency(item.valor),
    },
    {
      key: "valorTotalComCorrecoes",
      header: "Vr. Atualizado",
      render: (item) =>
        movimentoService.formatCurrency(item.valorTotalComCorrecoes),
    },
    {
      key: "nome",
      header: "Nome",
    },
    {
      key: "numeroContrato",
      header: "Contrato",
    },
    {
      key: "descricao",
      header: "Descrição",
    },
    {
      key: "actions",
      header: "Ações",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          {item.urlComprovante && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadComprovante(item.urlComprovante!)}
              title="Baixar comprovante"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const despesasColumns: Column<MovimentoDespesa>[] = [
    {
      key: "status",
      header: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "dataVencimento",
      header: "Vencimento",
      render: (item) => movimentoService.formatDate(item.dataVencimento),
    },
    {
      key: "valor",
      header: "Valor",
      render: (item) => movimentoService.formatCurrency(item.valor),
    },
    {
      key: "valorTotalComCorrecoes",
      header: "Vr. Atualizado",
      render: (item) =>
        movimentoService.formatCurrency(item.valorTotalComCorrecoes),
    },
    {
      key: "nome",
      header: "Fornecedor",
    },
    {
      key: "numeroContrato",
      header: "Contrato",
    },
    {
      key: "descricao",
      header: "Descrição",
    },
    {
      key: "actions",
      header: "Ações",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          {item.urlComprovante && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadComprovante(item.urlComprovante!)}
              title="Baixar comprovante"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const currentData = activeTab === "receitas" ? receitas : despesas;
  const currentColumns =
    activeTab === "receitas" ? receitasColumns : despesasColumns;
  const currentTotalizadores =
    activeTab === "receitas" ? receitasTotalizadores : despesasTotalizadores;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>

      <MovimentoFiltersComponent
        filters={filters}
        setFilters={setFilters}
        statusOptions={statusOptions}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        onGerarMovimento={handleGerarMovimento}
        isLoading={isLoading}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receitas" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="space-y-4">
          {currentTotalizadores && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorTotal
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentTotalizadores.totalRegistros} registros
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {activeTab === "receitas" ? "Recebido" : "Pago"}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorRecebido ||
                        currentTotalizadores.valorPago ||
                        0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Em Aberto
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorEmAberto
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Com Correções
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorTotalComCorrecoes
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Juros:{" "}
                    {movimentoService.formatCurrency(
                      currentTotalizadores.totalJuros
                    )}{" "}
                    | Mora:{" "}
                    {movimentoService.formatCurrency(
                      currentTotalizadores.totalMora
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Lista de {activeTab === "receitas" ? "Receitas" : "Despesas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <DataTable
                  title=""
                  data={currentData}
                  columns={currentColumns}
                  keyExtractor={(item) => item.movimentoId}
                />
              )}
            </CardContent>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="despesas" className="space-y-4">
          {currentTotalizadores && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorTotal
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentTotalizadores.totalRegistros} registros
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pago</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorPago || 0
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Em Aberto
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorEmAberto
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Com Correções
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {movimentoService.formatCurrency(
                      currentTotalizadores.valorTotalComCorrecoes
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Juros:{" "}
                    {movimentoService.formatCurrency(
                      currentTotalizadores.totalJuros
                    )}{" "}
                    | Mora:{" "}
                    {movimentoService.formatCurrency(
                      currentTotalizadores.totalMora
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <DataTable
                  title=""
                  data={currentData}
                  columns={currentColumns}
                  keyExtractor={(item) => item.movimentoId}
                />
              )}
            </CardContent>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Movimento</DialogTitle>
            <DialogDescription>
              Atualize as informações de pagamento e comprovante do movimento.
            </DialogDescription>
          </DialogHeader>
          <MovimentoForm
            formData={formData}
            setFormData={setFormData}
            isLoading={isSubmitting}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingMovimento(null);
              setFormData(DEFAULT_MOVIMENTO_FORM_DATA);
            }}
            movimento={editingMovimento}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Gerar Movimento */}
      <Dialog
        open={isGerarMovimentoDialogOpen}
        onOpenChange={setIsGerarMovimentoDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar Movimento</DialogTitle>
            <DialogDescription>
              Selecione o mês e ano para gerar os movimentos financeiros.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            console.log("=== RENDERIZANDO MODAL ===");
            console.log("mesSelecionado no modal:", mesSelecionado);
            console.log("anoSelecionado no modal:", anoSelecionado);
            console.log(
              "isGerarMovimentoDialogOpen:",
              isGerarMovimentoDialogOpen
            );
            return null;
          })()}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((mes) => (
                    <SelectItem key={mes} value={mes.toString()}>
                      {mes.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input
                type="number"
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                placeholder="Ex: 2024"
                min="2020"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGerarMovimentoDialogOpen(false)}
              disabled={isGerandoMovimento}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarGerarMovimento}
              disabled={
                isGerandoMovimento || !mesSelecionado || !anoSelecionado
              }
            >
              {isGerandoMovimento ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Movimento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MovimentoDetailsModal
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedMovimento(null);
        }}
        movimento={selectedMovimento}
        tipo={activeTab === "receitas" ? "receita" : "despesa"}
      />
    </div>
  );
}
