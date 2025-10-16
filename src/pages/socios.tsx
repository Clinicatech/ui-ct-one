import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { DataTable, Column } from "../components/ui/data-table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { socioService } from "../services/socio.service";
import { SocioForm } from "../components/SocioForm";
import { Socio, SocioFormData } from "../types/socio";
import { DEFAULT_SOCIO_FORM_DATA } from "../constants/socio-constants";

interface SocioManagementProps {
  title?: string;
}

//esta função cria a pagina de gestão de sócios
export function SocioManagement({
  title = "Gestão de Sócios",
}: SocioManagementProps) {
  // Definição das colunas da tabela
  const columns: Column<Socio>[] = [
    {
      key: "pessoa.nome",
      header: "Nome",
      render: (socio) => (
        <span className="font-medium">{socio.pessoa.nome}</span>
      ),
    },
    {
      key: "pessoa.documento",
      header: "Documento",
      render: (socio) => socio.pessoa.documento,
    },
    {
      key: "pessoa.tipo",
      header: "Tipo",
      render: (socio) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            socio.pessoa.tipo === "PF"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {socio.pessoa.tipo}
        </span>
      ),
    },
    {
      key: "percRateio",
      header: "% Rateio",
      render: (socio) => `${socio.percRateio}%`,
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (socio) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(socio)}>
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover o sócio "{socio.pessoa.nome}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(socio)}
                  disabled={isDeleting}
                >
                  {isDeleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];
  // O useState é um Hook do React que permite adicionar estado a componentes funcionais.
  // Ele retorna um array com dois elementos: o valor atual do estado e uma função para atualizá-lo.
  const [socios, setSocios] = useState<Socio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("pessoa");

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(25);

  //   O useRef é um Hook do React que retorna um objeto mutável cuja propriedade .current é inicializada com o valor passado como argumento. Ele é útil para:
  // Acessar elementos DOM diretamente
  // Armazenar valores que persistem entre renderizações
  // Manter valores que não causam rerender quando alterados
  // exemplo:
  // function Component() {
  //   const renderCount = useRef(0);

  //   renderCount.current += 1; // Não causa rerender!

  //   return <div>Renderizou {renderCount.current} vezes</div>;
  // }

  // useState	useRef
  // Causa rerender quando alterado	Não causa rerender
  // Valor imutável (usa setter)	Valor mutável (diretamente em .current)
  // Ideal para estado da UI	Ideal para valores "internos"

  const searchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // O useEffect é um Hook do React que permite executar efeitos colaterais em componentes funcionais
  // Ele é útil para:
  // Executar efeitos colaterais
  // Limpar efeitos
  // Executar efeitos quando o componente é montado
  // Executar efeitos quando o componente é atualizado
  // Executar efeitos quando o componente é desmontado

  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      setActiveTab("pessoa");
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  useEffect(() => {
    if (isCreateDialogOpen) {
      setFormData(DEFAULT_SOCIO_FORM_DATA);
      setHasUnsavedChanges(false);
    }
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (editingSocio) {
      setFormData({
        pessoa: {
          nome: editingSocio.pessoa.nome,
          razao: editingSocio.pessoa.razao,
          documento: editingSocio.pessoa.documento,
          tipo: editingSocio.pessoa.tipo,
          inscricaoEstadual: editingSocio.pessoa.inscricaoEstadual,
          inscricaoMunicipal: editingSocio.pessoa.inscricaoMunicipal,
        },
        endereco: editingSocio.endereco
          ? {
              cep: editingSocio.endereco.cep,
              endereco: editingSocio.endereco.endereco,
              numero: editingSocio.endereco.numero,
              complemento: editingSocio.endereco.complemento,
              bairro: editingSocio.endereco.bairro,
              cidade: editingSocio.endereco.cidade,
              uf: editingSocio.endereco.uf,
            }
          : undefined,
        dadosBancarios: editingSocio.dadosBancarios
          ? {
              dadosBancariosId: editingSocio.dadosBancarios.dadosBancariosId,
              bancoId: editingSocio.dadosBancarios.bancoId,
              agencia: editingSocio.dadosBancarios.agencia,
              conta: editingSocio.dadosBancarios.conta,
              contaTipo: editingSocio.dadosBancarios.contaTipo as 1 | 2,
              chavePix: editingSocio.dadosBancarios.chavePix,
              contaDigito: editingSocio.dadosBancarios.contaDigito,
              agenciaDigito: editingSocio.dadosBancarios.agenciaDigito,
            }
          : undefined,
        socioInfo: {
          percRateio: editingSocio.percRateio,
        },
      });
      setHasUnsavedChanges(false);
    }
  }, [editingSocio]);

  const [formData, setFormData] = useState<SocioFormData>(
    DEFAULT_SOCIO_FORM_DATA
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      loadSocios();
    }, 500);
  }, []);

  const loadSocios = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await socioService.findAll();
      setSocios(response.data);
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / perPage));
    } catch (error) {
      console.error("Erro ao carregar sócios:", error);
      toast.error("Erro ao carregar sócios");
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    loadSocios();
  }, [loadSocios]);

  const filteredSocios = useMemo(() => {
    return socios;
  }, [socios]);

  const handleCreate = async () => {
    if (!formData.pessoa.nome || !formData.pessoa.documento) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      const apiData = socioService.convertToApiFormat(formData);
      const newSocioApi = await socioService.create(apiData);
      const newSocio =
        socioService.convertCreateUpdateToFrontendFormat(newSocioApi);

      setSocios((prevSocios) => [...prevSocios, newSocio]);
      setFormData(DEFAULT_SOCIO_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreateDialogOpen(false);
      toast.success("Sócio criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar sócio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar sócio";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (socio: Socio) => {
    setEditingSocio(socio);
    setFormData({
      pessoa: {
        nome: socio.pessoa.nome,
        razao: socio.pessoa.razao,
        documento: socio.pessoa.documento,
        tipo: socio.pessoa.tipo,
        inscricaoEstadual: socio.pessoa.inscricaoEstadual,
        inscricaoMunicipal: socio.pessoa.inscricaoMunicipal,
      },
      endereco: socio.endereco
        ? {
            cep: socio.endereco.cep,
            endereco: socio.endereco.endereco,
            numero: socio.endereco.numero,
            complemento: socio.endereco.complemento,
            bairro: socio.endereco.bairro,
            cidade: socio.endereco.cidade,
            uf: socio.endereco.uf,
          }
        : undefined,
      dadosBancarios: socio.dadosBancarios
        ? {
            dadosBancariosId: socio.dadosBancarios.dadosBancariosId,
            bancoId: socio.dadosBancarios.bancoId,
            agencia: socio.dadosBancarios.agencia,
            conta: socio.dadosBancarios.conta,
            contaTipo: socio.dadosBancarios.contaTipo as 1 | 2,
            chavePix: socio.dadosBancarios.chavePix,
            contaDigito: socio.dadosBancarios.contaDigito,
            agenciaDigito: socio.dadosBancarios.agenciaDigito,
          }
        : undefined,
      socioInfo: {
        percRateio: socio.percRateio,
      },
    });
    setActiveTab("pessoa");
    setHasUnsavedChanges(false);
    setIsEditDialogOpen(true);
  };
  //botão  Atualizar Sócio dispara esta função
  const handleUpdate = async () => {
    // Early return/guard clause
    if (!editingSocio) return;
    // Inicia o estado de atualização
    setIsUpdating(true);
    try {
      const apiData = socioService.convertToApiFormat(formData);
      const updatedSocioApi = await socioService.update(
        editingSocio.socioInfoId,
        apiData
      );
      const updatedSocio =
        socioService.convertCreateUpdateToFrontendFormat(updatedSocioApi);

      setSocios((prevSocios) =>
        prevSocios.map((socio) =>
          socio.socioInfoId === editingSocio.socioInfoId ? updatedSocio : socio
        )
      );

      setEditingSocio(null);
      setFormData(DEFAULT_SOCIO_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsEditDialogOpen(false);
      toast.success("Sócio atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar sócio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar sócio";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };
  //botão Remover Sócio dispara esta função
  const handleDelete = async (socio: Socio) => {
    setIsDeleting(true);
    try {
      await socioService.remove(socio.socioInfoId);
      setSocios((prevSocios) =>
        prevSocios.filter((s) => s.socioInfoId !== socio.socioInfoId)
      );
      toast.success("Sócio removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover sócio:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao remover sócio";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  // Função para atualizar o estado do formulário
  const handleFormDataChange = (newFormData: SocioFormData) => {
    setFormData(newFormData);
    setHasUnsavedChanges(true);
  };

  // Função para fechar dialog com confirmação
  const handleCloseDialog = useCallback(
    (dialogType: "create" | "edit") => {
      if (hasUnsavedChanges) {
        setShowCloseConfirmation(true);
      } else {
        if (dialogType === "create") {
          setIsCreateDialogOpen(false);
          setFormData(DEFAULT_SOCIO_FORM_DATA);
        } else {
          setIsEditDialogOpen(false);
          setEditingSocio(null);
        }
        setHasUnsavedChanges(false);
      }
    },
    [hasUnsavedChanges]
  );

  // Função para confirmar fechamento
  const confirmClose = useCallback(() => {
    setShowCloseConfirmation(false);
    setHasUnsavedChanges(false);
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingSocio(null);
    setFormData(DEFAULT_SOCIO_FORM_DATA);
  }, []);

  // Função para cancelar fechamento
  const cancelClose = useCallback(() => {
    setShowCloseConfirmation(false);
  }, []);
  // Função para atualizar a página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentSocios = filteredSocios.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsCreateDialogOpen(true);
              return;
            }

            if (hasUnsavedChanges) {
              setShowCloseConfirmation(true);
            } else {
              setIsCreateDialogOpen(false);
              setFormData(DEFAULT_SOCIO_FORM_DATA);
              setHasUnsavedChanges(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Sócio
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Sócio</DialogTitle>
              <DialogDescription>
                Preencha as informações do sócio. Os campos marcados com * são
                obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <SocioForm
              formData={formData}
              setFormData={handleFormDataChange}
              isCreating={isCreating}
              isUpdating={false}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleCloseDialog("create")}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Sócio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Pesquisar sócios..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        title="Lista de Sócios"
        data={currentSocios}
        columns={columns}
        isLoading={isLoading}
        loadingText="Carregando sócios..."
        emptyText="Nenhum sócio encontrado"
        keyExtractor={(socio) => socio.socioInfoId}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de{" "}
            {totalItems} sócios
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsEditDialogOpen(true);
          } else {
            if (hasUnsavedChanges) {
              setShowCloseConfirmation(true);
            } else {
              setIsEditDialogOpen(false);
              setEditingSocio(null);
              setHasUnsavedChanges(false);
            }
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Sócio</DialogTitle>
            <DialogDescription>
              Atualize as informações do sócio. Os campos marcados com * são
              obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <SocioForm
            formData={formData}
            setFormData={handleFormDataChange}
            isCreating={false}
            isUpdating={isUpdating}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => handleCloseDialog("edit")}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Atualizar Sócio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para fechar com mudanças não salvas */}
      <Dialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudanças não salvas</DialogTitle>
            <DialogDescription>
              Você tem mudanças não salvas. Tem certeza que deseja fechar sem
              salvar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelClose}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmClose}>
              Fechar sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
