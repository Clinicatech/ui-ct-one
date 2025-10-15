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
  Calendar,
  Minus,
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
import {
  FluxoCaixaService,
  FluxoCaixaItem,
} from "../services/fluxo-caixa.service";
import {
  FinanceiroService,
  CaixaEntidadeItem,
  DividendosItem,
  CreateDividendoRequest,
} from "../services/financeiro.service";

interface GestaoFinanceiraProps {
  title?: string;
}

export function GestaoFinanceira({
  title = "Gestão Financeira",
}: GestaoFinanceiraProps) {
  const [activeTab, setActiveTab] = useState<
    "receitas" | "despesas" | "fluxo-caixa" | "caixa-dividendos"
  >("receitas");
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

  // Estados para fluxo de caixa
  const [fluxoCaixaData, setFluxoCaixaData] = useState<FluxoCaixaItem[]>([]);
  const [isLoadingFluxoCaixa, setIsLoadingFluxoCaixa] = useState(false);
  const [mesFluxoCaixa, setMesFluxoCaixa] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [anoFluxoCaixa, setAnoFluxoCaixa] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [saldoInicial, setSaldoInicial] = useState<number>(0);
  const [saldoFinal, setSaldoFinal] = useState<number>(0);
  const [isGerandoDividendos, setIsGerandoDividendos] = useState(false);
  const [isDeletandoDividendos, setIsDeletandoDividendos] = useState(false);

  // Estados para caixa/dividendos
  const [caixaEntidadeData, setCaixaEntidadeData] = useState<
    CaixaEntidadeItem[]
  >([]);
  const [dividendosData, setDividendosData] = useState<DividendosItem[]>([]);
  const [isLoadingCaixaDividendos, setIsLoadingCaixaDividendos] =
    useState(false);

  // Estados para modal de retirada
  const [isRetiradaModalOpen, setIsRetiradaModalOpen] = useState(false);
  const [retiradaData, setRetiradaData] = useState({
    mes: "",
    ano: "",
    justificativa: "",
    valor: "",
  });
  const [isSubmittingRetirada, setIsSubmittingRetirada] = useState(false);
  const [retiradaType, setRetiradaType] = useState<"caixa" | "dividendo">(
    "caixa"
  );
  const [retiradaId, setRetiradaId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    loadStatusOptions();

    // Obter entidadeId do usuário logado usando AuthService
    const entidadeId = AuthService.getEntidadeId();
    setEntidadeId(entidadeId);
  }, [activeTab, filters]);

  // useEffect separado para garantir que entidadeId seja obtido na montagem do componente
  useEffect(() => {
    const loadEntidadeId = () => {
      const entidadeId = AuthService.getEntidadeId();
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
      const now = new Date();
      const mesAtual = (now.getMonth() + 1).toString();
      const anoAtual = now.getFullYear().toString();
      setMesSelecionado(mesAtual);
      setAnoSelecionado(anoAtual);
    }
  }, [isGerarMovimentoDialogOpen, entidadeId]);

  // Carregar dados quando a aba caixa-dividendos for selecionada
  useEffect(() => {
    if (activeTab === "caixa-dividendos") {
      loadCaixaDividendos();
    }
  }, [activeTab]);

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
    setIsGerarMovimentoDialogOpen(true);
  };

  const handleConsultarFluxoCaixa = async () => {
    if (!mesFluxoCaixa || !anoFluxoCaixa) {
      toast.error("Por favor, selecione o mês e ano");
      return;
    }

    setIsLoadingFluxoCaixa(true);
    try {
      const response = await FluxoCaixaService.getFluxoCaixa(
        parseInt(mesFluxoCaixa),
        parseInt(anoFluxoCaixa)
      );
      setFluxoCaixaData(response.data);

      // Calcular saldos inicial e final
      if (response.data.length > 0) {
        const saldoAnterior = response.data.find((item) =>
          item.descricao.toLowerCase().includes("saldo anterior")
        );
        const ultimoItem = response.data[response.data.length - 1];

        setSaldoInicial(saldoAnterior?.saldoAcumulado || 0);
        setSaldoFinal(ultimoItem?.saldoAcumulado || 0);
      } else {
        setSaldoInicial(0);
        setSaldoFinal(0);
      }

      toast.success("Fluxo de caixa carregado com sucesso");
    } catch (error) {
      console.error("Erro ao carregar fluxo de caixa:", error);
      toast.error("Erro ao carregar fluxo de caixa");
    } finally {
      setIsLoadingFluxoCaixa(false);
    }
  };

  const handleGerarDividendos = async () => {
    if (!mesFluxoCaixa || !anoFluxoCaixa) {
      toast.error("Por favor, selecione o mês e ano");
      return;
    }

    const currentEntidadeId = AuthService.getEntidadeId();
    if (!currentEntidadeId) {
      toast.error("Entidade não encontrada");
      return;
    }

    // Confirmar com o usuário antes de prosseguir
    const confirmar = window.confirm(
      "Gerar dividendos para este período impedirá a geração de movimento. Deseja prosseguir?"
    );

    if (!confirmar) {
      return;
    }

    setIsGerandoDividendos(true);
    try {
      // Verificar se existe dividendo pago para o período
      const dividendoPagoResponse =
        await FinanceiroService.verificarDividendoPago(
          currentEntidadeId,
          parseInt(mesFluxoCaixa),
          parseInt(anoFluxoCaixa)
        );

      if (dividendoPagoResponse.existeDividendoPago) {
        toast.error("Existe dividendo pago para este período ou futuro");
        return;
      }

      const response = await FluxoCaixaService.gerarDividendos(
        parseInt(mesFluxoCaixa),
        parseInt(anoFluxoCaixa)
      );

      if (response.sucesso) {
        toast.success(response.mensagem);
        // Atualizar o fluxo de caixa após gerar dividendos
        await handleConsultarFluxoCaixa();
      } else {
        toast.error(response.mensagem);
      }
    } catch (error) {
      console.error("Erro ao gerar dividendos:", error);
      toast.error("Erro ao gerar dividendos");
    } finally {
      setIsGerandoDividendos(false);
    }
  };

  const handleDeletarDividendos = async () => {
    if (!mesFluxoCaixa || !anoFluxoCaixa) {
      toast.error("Por favor, selecione o mês e ano");
      return;
    }

    const currentEntidadeId = AuthService.getEntidadeId();
    if (!currentEntidadeId) {
      toast.error("Entidade não encontrada");
      return;
    }

    setIsDeletandoDividendos(true);
    try {
      // Verificar se existe dividendo pago para o período
      const dividendoPagoResponse =
        await FinanceiroService.verificarDividendoPago(
          currentEntidadeId,
          parseInt(mesFluxoCaixa),
          parseInt(anoFluxoCaixa)
        );

      if (dividendoPagoResponse.existeDividendoPago) {
        toast.error("Existe dividendo pago para este período ou futuro");
        return;
      }

      const response = await FluxoCaixaService.deletarDividendos(
        parseInt(mesFluxoCaixa),
        parseInt(anoFluxoCaixa)
      );

      if (response.sucesso) {
        toast.success(response.mensagem);
        // Atualizar o fluxo de caixa após deletar dividendos
        await handleConsultarFluxoCaixa();
      } else {
        toast.error(response.mensagem);
      }
    } catch (error) {
      console.error("Erro ao deletar dividendos:", error);
      toast.error("Erro ao deletar dividendos");
    } finally {
      setIsDeletandoDividendos(false);
    }
  };

  const loadCaixaDividendos = async () => {
    const currentEntidadeId = AuthService.getEntidadeId();
    if (!currentEntidadeId) {
      toast.error("Entidade não encontrada");
      return;
    }

    setIsLoadingCaixaDividendos(true);
    try {
      const [caixaResponse, dividendosResponse] = await Promise.all([
        FinanceiroService.getCaixaEntidade(currentEntidadeId),
        FinanceiroService.getDividendos(currentEntidadeId),
      ]);

      setCaixaEntidadeData(caixaResponse.data);
      setDividendosData(dividendosResponse.data);
    } catch (error) {
      console.error("Erro ao carregar dados de caixa/dividendos:", error);
      toast.error("Erro ao carregar dados de caixa/dividendos");
    } finally {
      setIsLoadingCaixaDividendos(false);
    }
  };

  const handleAbrirRetirada = (type: "caixa" | "dividendo", id: number) => {
    setRetiradaType(type);
    setRetiradaId(id);
    setRetiradaData({
      mes: "",
      ano: "",
      justificativa: "",
      valor: "",
    });
    setIsRetiradaModalOpen(true);
  };

  const handleConfirmarRetirada = async () => {
    if (
      !retiradaData.mes ||
      !retiradaData.ano ||
      !retiradaData.justificativa ||
      !retiradaData.valor
    ) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    const currentEntidadeId = AuthService.getEntidadeId();
    if (!currentEntidadeId || !retiradaId) {
      toast.error("Erro ao obter dados da entidade");
      return;
    }

    setIsSubmittingRetirada(true);
    try {
      const valor = parseFloat(retiradaData.valor);
      const mes = parseInt(retiradaData.mes);
      const ano = parseInt(retiradaData.ano);

      // Verificar se o valor não excede o disponível
      const idParaConsulta =
        retiradaType === "caixa" ? currentEntidadeId : retiradaId;
      const destinoParaConsulta = retiradaType === "caixa" ? "E" : "S";

      const totalResponse = await FinanceiroService.getTotal(
        idParaConsulta,
        destinoParaConsulta
      );

      if (valor > totalResponse.total) {
        toast.error("Valor acima do disponível");
        return;
      }

      // Verificar se existe dividendo pago para o período
      const dividendoPagoResponse =
        await FinanceiroService.verificarDividendoPago(
          currentEntidadeId,
          mes,
          ano
        );

      if (dividendoPagoResponse.existeDividendoPago) {
        toast.error("Existe dividendo pago para este período ou futuro");
        return;
      }

      // Criar o registro de retirada
      const dividendoData: CreateDividendoRequest = {
        destino: retiradaType === "caixa" ? "E" : "S",
        id: retiradaType === "caixa" ? currentEntidadeId : retiradaId,
        mes,
        ano,
        valor: -valor, // Valor negativo
        entidadeId: currentEntidadeId,
        descricao:
          retiradaType === "caixa"
            ? `Retirada de caixa: ${retiradaData.justificativa}`
            : `Pagamento de dividendo: ${retiradaData.justificativa}`,
      };

      await FinanceiroService.createDividendo(dividendoData);

      toast.success("Retirada realizada com sucesso");
      setIsRetiradaModalOpen(false);

      // Recarregar os dados
      loadCaixaDividendos();
    } catch (error) {
      console.error("Erro ao realizar retirada:", error);
      toast.error("Erro ao realizar retirada");
    } finally {
      setIsSubmittingRetirada(false);
    }
  };

  const handleConfirmarGerarMovimento = async () => {
    const currentEntidadeId = AuthService.getEntidadeId();

    if (!mesSelecionado || !anoSelecionado || !currentEntidadeId) {
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

      // Verificar se existem dividendos a partir deste mês/ano
      const { existe: temDividendos } =
        await FluxoCaixaService.verificarDividendos(mes, ano);

      if (temDividendos) {
        toast.error(
          "Não é possível gerar movimentos. Existem dividendos a partir deste mês/ano."
        );
        setIsGerandoMovimento(false);
        return;
      }

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
      dataPagamento: movimento.pago ? movimento.dataPagamento || "" : "",
      valorEfetivo: movimento.pago
        ? movimento.valorEfetivo || movimento.valor || 0
        : 0,
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
        dataPagamento: data.pago ? data.dataPagamento || undefined : undefined,
        valorEfetivo: data.pago ? data.valorEfetivo || 0 : 0,
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
      header: "Venc./Quitação",
      render: (item) => {
        const data =
          item.status === "PAGO" ? item.dataPagamento : item.dataVencimento;
        return movimentoService.formatDate(data || "");
      },
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
      header: "Venc./Quitação",
      render: (item) => {
        const data =
          item.status === "PAGO" ? item.dataPagamento : item.dataVencimento;
        return movimentoService.formatDate(data || "");
      },
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

      {activeTab !== "fluxo-caixa" && activeTab !== "caixa-dividendos" && (
        <MovimentoFiltersComponent
          filters={filters}
          setFilters={setFilters}
          statusOptions={statusOptions}
          onSearch={handleSearch}
          onClear={handleClearFilters}
          onGerarMovimento={handleGerarMovimento}
          isLoading={isLoading}
        />
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receitas" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value="fluxo-caixa" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fluxo de Caixa
          </TabsTrigger>
          <TabsTrigger
            value="caixa-dividendos"
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Caixa/Dividendos
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

        <TabsContent value="fluxo-caixa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consulta de Fluxo de Caixa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cards de Saldos */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mes-fluxo">Mês</Label>
                  <Select
                    value={mesFluxoCaixa}
                    onValueChange={setMesFluxoCaixa}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Janeiro</SelectItem>
                      <SelectItem value="2">Fevereiro</SelectItem>
                      <SelectItem value="3">Março</SelectItem>
                      <SelectItem value="4">Abril</SelectItem>
                      <SelectItem value="5">Maio</SelectItem>
                      <SelectItem value="6">Junho</SelectItem>
                      <SelectItem value="7">Julho</SelectItem>
                      <SelectItem value="8">Agosto</SelectItem>
                      <SelectItem value="9">Setembro</SelectItem>
                      <SelectItem value="10">Outubro</SelectItem>
                      <SelectItem value="11">Novembro</SelectItem>
                      <SelectItem value="12">Dezembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano-fluxo">Ano</Label>
                  <Input
                    id="ano-fluxo"
                    type="number"
                    value={anoFluxoCaixa}
                    onChange={(e) => setAnoFluxoCaixa(e.target.value)}
                    min="2020"
                    max="2030"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleConsultarFluxoCaixa}
                    disabled={
                      isLoadingFluxoCaixa || !mesFluxoCaixa || !anoFluxoCaixa
                    }
                    className="w-full"
                  >
                    {isLoadingFluxoCaixa ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Consultar
                      </>
                    )}
                  </Button>
                </div>
                <Card className="bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                  <CardHeader className="pb-1 pt-1">
                    <CardTitle className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Dividendos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-1 space-y-2">
                    <Button
                      onClick={handleGerarDividendos}
                      disabled={
                        isGerandoDividendos || !mesFluxoCaixa || !anoFluxoCaixa
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
                    >
                      {isGerandoDividendos ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-3 w-3 mr-1" />
                          Gerar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDeletarDividendos}
                      disabled={
                        isDeletandoDividendos ||
                        !mesFluxoCaixa ||
                        !anoFluxoCaixa
                      }
                      className="w-full bg-red-600 hover:bg-red-700 text-xs h-8"
                    >
                      {isDeletandoDividendos ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Removendo...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Remover
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <CardHeader className="pb-1 pt-1">
                    <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Saldo Inicial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-1">
                    <div
                      className={`text-lg font-bold ${
                        saldoInicial >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      R${" "}
                      {saldoInicial.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                  <CardHeader className="pb-1 pt-1">
                    <CardTitle className="text-xs font-medium text-green-700 dark:text-green-300">
                      Saldo Final
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-1">
                    <div
                      className={`text-lg font-bold ${
                        saldoFinal >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      R${" "}
                      {saldoFinal.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {fluxoCaixaData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Fluxo de Caixa - {mesFluxoCaixa}/{anoFluxoCaixa}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fluxoCaixaData.map((item, index) => {
                    const isSaldoAnterior = item.descricao
                      .toLowerCase()
                      .includes("saldo anterior");
                    const isSaldoAtual = index === fluxoCaixaData.length - 1;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isSaldoAnterior || isSaldoAtual
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {item.descricao}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(item.dtMovimento).toLocaleDateString(
                                "pt-BR"
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">
                              R${" "}
                              {item.entrada.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-gray-500">Entrada</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-red-600">
                              R${" "}
                              {item.saida.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-gray-500">Saída</div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm font-medium ${
                                item.saldoDia >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              R${" "}
                              {item.saldoDia.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              Saldo Dia
                            </div>
                          </div>
                          <div className="text-center">
                            <div
                              className={`text-sm font-bold ${
                                item.saldoAcumulado >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              R${" "}
                              {item.saldoAcumulado.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              Saldo Acumulado
                            </div>
                          </div>
                        </div>
                        {(isSaldoAnterior || isSaldoAtual) && (
                          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {isSaldoAnterior ? "Saldo Anterior" : "Saldo Atual"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="caixa-dividendos" className="space-y-4">
          <Card className="bg-gray-50 border-gray-200 dark:bg-gray-500 dark:border-gray-700">
            <CardContent className="bg-graye">
              {isLoadingCaixaDividendos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Carregando dados...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Caixa da Entidade */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Caixa da Entidade
                    </h3>
                    {caixaEntidadeData.length > 0 ? (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full min-h-[80px]">
                          <thead className="bg-gray-400">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-900">
                                Data
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-gray-900">
                                Descrição
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-gray-900">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {caixaEntidadeData.map((item, index) => {
                              const isLastItem =
                                index === caixaEntidadeData.length - 1;
                              const isTotal = item.dataMov === "Total";
                              const showRetiradaButton =
                                isLastItem && isTotal && item.valor > 0;

                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.dataMov}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap max-w-xs">
                                    {item.descricao || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium text-green-900">
                                    <div className="flex items-center justify-end gap-2">
                                      <span>
                                        R${" "}
                                        {item.valor.toLocaleString("pt-BR", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                      {showRetiradaButton && (
                                        <Button
                                          size="sm"
                                          className="h-6 w-6 p-0 bg-red-500"
                                          onClick={() =>
                                            handleAbrirRetirada(
                                              "caixa",
                                              item.entidadeId
                                            )
                                          }
                                          title="Retirada de caixa"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-white border rounded-lg">
                        Nenhum dado de caixa encontrado
                      </div>
                    )}
                  </div>

                  {/* Dividendos por Sócios */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-white">
                      Dividendos por Sócios
                    </h3>
                    {dividendosData.length > 0 ? (
                      <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full min-h-[80px]">
                          <thead className="bg-gray-400">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-900">
                                Nome
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-gray-900">
                                Data
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-gray-900">
                                Descrição
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-gray-900">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dividendosData.map((item, index) => {
                              const isTotal = item.dataMov === "Total";
                              const showRetiradaButton =
                                isTotal && item.valor > 0;

                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.nome}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {item.dataMov}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap max-w-xs">
                                    {item.descricao || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right font-medium text-green-900">
                                    <div className="flex items-center justify-end gap-2">
                                      <span>
                                        R${" "}
                                        {item.valor.toLocaleString("pt-BR", {
                                          minimumFractionDigits: 2,
                                        })}
                                      </span>
                                      {showRetiradaButton && (
                                        <Button
                                          size="sm"
                                          className="h-6 w-6 p-0 bg-red-500"
                                          onClick={() =>
                                            handleAbrirRetirada(
                                              "dividendo",
                                              item.id
                                            )
                                          }
                                          title="Retirada de dividendo"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 bg-white border rounded-lg">
                        Nenhum dado de dividendos encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

      <Dialog open={isRetiradaModalOpen} onOpenChange={setIsRetiradaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {retiradaType === "caixa"
                ? "Retirada de Caixa"
                : "Retirada de Dividendo"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para realizar a retirada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mes-retirada">Mês</Label>
                <Select
                  value={retiradaData.mes}
                  onValueChange={(value) =>
                    setRetiradaData((prev) => ({ ...prev, mes: value }))
                  }
                >
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
                <Label htmlFor="ano-retirada">Ano</Label>
                <Input
                  id="ano-retirada"
                  type="number"
                  value={retiradaData.ano}
                  onChange={(e) =>
                    setRetiradaData((prev) => ({
                      ...prev,
                      ano: e.target.value,
                    }))
                  }
                  placeholder="Ex: 2024"
                  min="2020"
                  max="2030"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor-retirada">Valor</Label>
              <Input
                id="valor-retirada"
                type="number"
                step="0.01"
                value={retiradaData.valor}
                onChange={(e) =>
                  setRetiradaData((prev) => ({
                    ...prev,
                    valor: e.target.value,
                  }))
                }
                placeholder="0,00"
                min="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa-retirada">Justificativa</Label>
              <Input
                id="justificativa-retirada"
                value={retiradaData.justificativa}
                onChange={(e) =>
                  setRetiradaData((prev) => ({
                    ...prev,
                    justificativa: e.target.value,
                  }))
                }
                placeholder="Descreva o motivo da retirada"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRetiradaModalOpen(false)}
              disabled={isSubmittingRetirada}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarRetirada}
              disabled={isSubmittingRetirada}
            >
              {isSubmittingRetirada ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                "Confirmar Retirada"
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
