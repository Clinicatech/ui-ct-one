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
import { parceiroService } from "../services/parceiro.service";
import { ParceiroForm } from "../components/ParceiroForm";
import { Parceiro, ParceiroFormData } from "../types/parceiro";

const DEFAULT_PARCEIRO_FORM_DATA: ParceiroFormData = {
  pessoa: {
    nome: "",
    razao: null,
    documento: "",
    tipo: "PF",
    inscricaoEstadual: null,
    inscricaoMunicipal: null,
  },
  endereco: {
    cep: "",
    endereco: null,
    numero: null,
    complemento: null,
    bairro: null,
    cidade: null,
    uf: null,
    cidadeCodigo: null,
    ufCodigo: null,
  },
  dadosBancarios: {
    bancoId: undefined,
    agencia: "",
    conta: "",
    contaTipo: undefined,
    chavePix: null,
    contaDigito: null,
    agenciaDigito: null,
  },
  responsavel: {
    nome: "",
    razao: null,
    documento: "",
    tipo: "PF",
    inscricaoEstadual: null,
    inscricaoMunicipal: null,
  },
  enderecoResponsavel: {
    cep: "",
    endereco: null,
    numero: null,
    complemento: null,
    bairro: null,
    cidade: null,
    uf: null,
    cidadeCodigo: null,
    ufCodigo: null,
    contatoComercialTelefone1: null,
    contatoComercialTelefone2: null,
    contatoComercialEmail: null,
  },
  parceiroInfo: {
    pessoaResponsavelId: undefined,
    atividadeParceiroId: null,
    percIndicacao: 0,
    percMensalidade: 0,
  },
};

interface ParceiroManagementProps {
  title?: string;
}

//esta função cria a pagina de gestão de parceiros
export function ParceiroManagement({
  title = "Gestão de Parceiros",
}: ParceiroManagementProps) {
  // Definição das colunas da tabela
  const columns: Column<Parceiro>[] = [
    {
      key: "pessoa.nome",
      header: "Nome",
      render: (parceiro) => (
        <span className="font-medium">{parceiro.pessoa.nome}</span>
      ),
    },
    {
      key: "pessoa.documento",
      header: "Documento",
      render: (parceiro) => parceiro.pessoa.documento,
    },
    {
      key: "pessoa.tipo",
      header: "Tipo",
      render: (parceiro) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            parceiro.pessoa.tipo === "PF"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {parceiro.pessoa.tipo}
        </span>
      ),
    },
    {
      key: "responsavel.nome",
      header: "Responsável",
      render: (parceiro) => (
        <span className="text-sm">
          {parceiro.responsavel?.nome || "Não informado"}
        </span>
      ),
    },
    {
      key: "percIndicacao",
      header: "% Indicação",
      render: (parceiro) => `${parceiro.percIndicacao}%`,
    },
    {
      key: "percMensalidade",
      header: "% Mensalidade",
      render: (parceiro) => `${parceiro.percMensalidade}%`,
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (parceiro) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(parceiro)}
          >
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
                  Tem certeza que deseja remover o parceiro "
                  {parceiro.pessoa.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(parceiro)}
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

  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingParceiro, setEditingParceiro] = useState<Parceiro | null>(null);
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

  const searchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      setActiveTab("pessoa");
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  useEffect(() => {
    setFormData(DEFAULT_PARCEIRO_FORM_DATA);
    setHasUnsavedChanges(false);
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (editingParceiro) {
      setFormData({
        pessoa: {
          nome: editingParceiro.pessoa.nome,
          razao: editingParceiro.pessoa.razao,
          documento: editingParceiro.pessoa.documento,
          tipo: editingParceiro.pessoa.tipo,
          inscricaoEstadual: editingParceiro.pessoa.inscricaoEstadual,
          inscricaoMunicipal: editingParceiro.pessoa.inscricaoMunicipal,
        },
        endereco: editingParceiro.endereco
          ? {
              cep: editingParceiro.endereco.cep,
              endereco: editingParceiro.endereco.endereco,
              numero: editingParceiro.endereco.numero,
              complemento: editingParceiro.endereco.complemento,
              bairro: editingParceiro.endereco.bairro,
              cidade: editingParceiro.endereco.cidade,
              uf: editingParceiro.endereco.uf,
              cidadeCodigo: editingParceiro.endereco.cidadeCodigo,
              ufCodigo: editingParceiro.endereco.ufCodigo,
            }
          : undefined,
        dadosBancarios: editingParceiro.dadosBancarios
          ? {
              bancoId: editingParceiro.dadosBancarios.bancoId,
              agencia: editingParceiro.dadosBancarios.agencia,
              conta: editingParceiro.dadosBancarios.conta,
              contaTipo: editingParceiro.dadosBancarios.contaTipo as 1 | 2,
              chavePix: editingParceiro.dadosBancarios.chavePix,
              contaDigito: editingParceiro.dadosBancarios.contaDigito,
              agenciaDigito: editingParceiro.dadosBancarios.agenciaDigito,
            }
          : undefined,
        responsavel: editingParceiro.responsavel
          ? {
              nome: editingParceiro.responsavel.nome,
              razao: editingParceiro.responsavel.razao,
              documento: editingParceiro.responsavel.documento,
              tipo: editingParceiro.responsavel.tipo,
              inscricaoEstadual: editingParceiro.responsavel.inscricaoEstadual,
              inscricaoMunicipal:
                editingParceiro.responsavel.inscricaoMunicipal,
            }
          : undefined,
        enderecoResponsavel: editingParceiro.responsavel?.endereco
          ? {
              cep: editingParceiro.responsavel.endereco.cep,
              endereco: editingParceiro.responsavel.endereco.endereco,
              numero: editingParceiro.responsavel.endereco.numero,
              complemento: editingParceiro.responsavel.endereco.complemento,
              bairro: editingParceiro.responsavel.endereco.bairro,
              cidade: editingParceiro.responsavel.endereco.cidade,
              uf: editingParceiro.responsavel.endereco.uf,
              cidadeCodigo: editingParceiro.responsavel.endereco.cidadeCodigo,
              ufCodigo: editingParceiro.responsavel.endereco.ufCodigo,
            }
          : undefined,
        parceiroInfo: {
          pessoaResponsavelId: editingParceiro.pessoaResponsavelId,
          atividadeParceiroId: editingParceiro.atividadeParceiroId,
          percIndicacao: editingParceiro.percIndicacao,
          percMensalidade: editingParceiro.percMensalidade,
        },
      });
      setHasUnsavedChanges(false);
    }
  }, [editingParceiro]);

  const [formData, setFormData] = useState<ParceiroFormData>(
    DEFAULT_PARCEIRO_FORM_DATA
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = window.setTimeout(() => {
      loadParceiros();
    }, 500);
  }, []);

  const loadParceiros = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await parceiroService.findAll();
      setParceiros(response.data);
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / perPage));
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      toast.error("Erro ao carregar parceiros");
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    loadParceiros();
  }, [loadParceiros]);

  const filteredParceiros = useMemo(() => {
    return parceiros;
  }, [parceiros]);

  const handleCreate = async () => {
    if (!formData.pessoa.nome || !formData.pessoa.documento) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Validação do responsável é opcional

    setIsCreating(true);
    try {
      const apiData = parceiroService.convertToApiFormat(formData);
      const newParceiroApi = await parceiroService.create(apiData);
      const newParceiro =
        parceiroService.convertCreateUpdateToFrontendFormat(newParceiroApi);

      setParceiros((prevParceiros) => [...prevParceiros, newParceiro]);
      setFormData(DEFAULT_PARCEIRO_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreateDialogOpen(false);
      toast.success("Parceiro criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar parceiro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar parceiro";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (parceiro: Parceiro) => {
    setEditingParceiro(parceiro);
    setFormData({
      pessoa: {
        nome: parceiro.pessoa.nome,
        razao: parceiro.pessoa.razao,
        documento: parceiro.pessoa.documento,
        tipo: parceiro.pessoa.tipo,
        inscricaoEstadual: parceiro.pessoa.inscricaoEstadual,
        inscricaoMunicipal: parceiro.pessoa.inscricaoMunicipal,
      },
      endereco: parceiro.endereco
        ? {
            cep: parceiro.endereco.cep,
            endereco: parceiro.endereco.endereco,
            numero: parceiro.endereco.numero,
            complemento: parceiro.endereco.complemento,
            bairro: parceiro.endereco.bairro,
            cidade: parceiro.endereco.cidade,
            uf: parceiro.endereco.uf,
            cidadeCodigo: parceiro.endereco.cidadeCodigo,
            ufCodigo: parceiro.endereco.ufCodigo,
          }
        : undefined,
      dadosBancarios: parceiro.dadosBancarios
        ? {
            bancoId: parceiro.dadosBancarios.bancoId,
            agencia: parceiro.dadosBancarios.agencia,
            conta: parceiro.dadosBancarios.conta,
            contaTipo: parceiro.dadosBancarios.contaTipo as 1 | 2,
            chavePix: parceiro.dadosBancarios.chavePix,
            contaDigito: parceiro.dadosBancarios.contaDigito,
            agenciaDigito: parceiro.dadosBancarios.agenciaDigito,
          }
        : undefined,
      responsavel: parceiro.responsavel
        ? {
            nome: parceiro.responsavel.nome,
            razao: parceiro.responsavel.razao,
            documento: parceiro.responsavel.documento,
            tipo: parceiro.responsavel.tipo,
            inscricaoEstadual: parceiro.responsavel.inscricaoEstadual,
            inscricaoMunicipal: parceiro.responsavel.inscricaoMunicipal,
          }
        : undefined,
      enderecoResponsavel: parceiro.responsavel?.endereco
        ? {
            cep: parceiro.responsavel.endereco.cep,
            endereco: parceiro.responsavel.endereco.endereco,
            numero: parceiro.responsavel.endereco.numero,
            complemento: parceiro.responsavel.endereco.complemento,
            bairro: parceiro.responsavel.endereco.bairro,
            cidade: parceiro.responsavel.endereco.cidade,
            uf: parceiro.responsavel.endereco.uf,
            cidadeCodigo: parceiro.responsavel.endereco.cidadeCodigo,
            ufCodigo: parceiro.responsavel.endereco.ufCodigo,
          }
        : undefined,
      parceiroInfo: {
        pessoaResponsavelId: parceiro.pessoaResponsavelId,
        atividadeParceiroId: parceiro.atividadeParceiroId,
        percIndicacao: parceiro.percIndicacao,
        percMensalidade: parceiro.percMensalidade,
      },
    });
    setActiveTab("pessoa");
    setHasUnsavedChanges(false);
    setIsEditDialogOpen(true);
  };

  //botão  Atualizar Parceiro dispara esta função
  const handleUpdate = async () => {
    // Early return/guard clause
    if (!editingParceiro) return;
    // Inicia o estado de atualização
    setIsUpdating(true);
    try {
      const apiData = parceiroService.convertToApiFormat(formData);
      const updatedParceiroApi = await parceiroService.update(
        editingParceiro.parceiroInfoId,
        apiData
      );
      const updatedParceiro =
        parceiroService.convertCreateUpdateToFrontendFormat(updatedParceiroApi);

      setParceiros((prevParceiros) =>
        prevParceiros.map((parceiro) =>
          parceiro.parceiroInfoId === editingParceiro.parceiroInfoId
            ? updatedParceiro
            : parceiro
        )
      );

      setEditingParceiro(null);
      setFormData(DEFAULT_PARCEIRO_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsEditDialogOpen(false);
      toast.success("Parceiro atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar parceiro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar parceiro";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  //botão Remover Parceiro dispara esta função
  const handleDelete = async (parceiro: Parceiro) => {
    setIsDeleting(true);
    try {
      await parceiroService.remove(parceiro.parceiroInfoId);
      setParceiros((prevParceiros) =>
        prevParceiros.filter(
          (p) => p.parceiroInfoId !== parceiro.parceiroInfoId
        )
      );
      toast.success("Parceiro removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover parceiro:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao remover parceiro";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para atualizar o estado do formulário
  const handleFormDataChange = (newFormData: ParceiroFormData) => {
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
          setFormData(DEFAULT_PARCEIRO_FORM_DATA);
        } else {
          setIsEditDialogOpen(false);
          setEditingParceiro(null);
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
    setEditingParceiro(null);
    setFormData(DEFAULT_PARCEIRO_FORM_DATA);
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
  const currentParceiros = filteredParceiros.slice(startIndex, endIndex);

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
              setFormData(DEFAULT_PARCEIRO_FORM_DATA);
              setHasUnsavedChanges(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Parceiro
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Parceiro</DialogTitle>
              <DialogDescription>
                Preencha as informações do parceiro. Os campos marcados com *
                são obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <ParceiroForm
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
                Criar Parceiro
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
            placeholder="Pesquisar parceiros..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
            id="searchTerm"
          />
        </div>
      </div>

      <DataTable
        title="Lista de Parceiros"
        data={currentParceiros}
        columns={columns}
        isLoading={isLoading}
        loadingText="Carregando parceiros..."
        emptyText="Nenhum parceiro encontrado"
        keyExtractor={(parceiro) => parceiro.parceiroInfoId}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de{" "}
            {totalItems} parceiros
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
              setEditingParceiro(null);
              setHasUnsavedChanges(false);
            }
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Parceiro</DialogTitle>
            <DialogDescription>
              Atualize as informações do parceiro. Os campos marcados com * são
              obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <ParceiroForm
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
              Atualizar Parceiro
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
