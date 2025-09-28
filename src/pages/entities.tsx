/**
 * Página de Gestão de Entidades
 *
 * Esta página implementa um CRUD completo para gerenciar entidades do sistema.
 *
 * Funcionalidades implementadas:
 * - Listagem de entidades com paginação e filtros
 * - Criação de novas entidades
 * - Edição de entidades existentes
 * - Exclusão de entidades
 * - Pesquisa em tempo real com debounce
 * - Filtros por status
 * - Indicadores de carregamento
 * - Tratamento de erros
 *
 * Arquitetura:
 * - Frontend: React com TypeScript
 * - Estado: useState e useMemo para otimização
 * - API: Serviço dedicado (entidadeService) para comunicação
 * - UI: Componentes shadcn/ui para interface consistente
 *
 * Para desenvolvedores júnior:
 * - O debounce na pesquisa evita muitas requisições desnecessárias
 * - Os estados de loading melhoram a experiência do usuário
 * - A separação entre dados da API e formato do frontend facilita manutenção
 * - O tratamento de erros garante que problemas sejam comunicados ao usuário
 */

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
  Building2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { entidadeService } from "../services/entidade.service";
import { EntityForm } from "../components/EntityForm";
import { Entity, EntityFormData } from "../types/entity";
import { DEFAULT_ENTITY_FORM_DATA } from "../constants/entity-constants";

interface EntityManagementProps {
  title?: string;
}

export function EntityManagement({
  title = "Gestão de Entidades",
}: EntityManagementProps) {
  // Definição das colunas da tabela
  const columns: Column<Entity>[] = [
    {
      key: "entidadeId",
      header: "Código",
      render: (entity) => entity.entidadeId || "SEM ID",
    },
    {
      key: "nome",
      header: "Nome",
      render: (entity) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{entity.nome || "SEM NOME"}</span>
        </div>
      ),
    },
    {
      key: "cnpj",
      header: "CNPJ",
      className: "font-mono text-sm",
    },
    {
      key: "contato",
      header: "Contato",
      render: (entity) => (
        <div className="text-sm">
          {entity.enderecos?.[0] ? (
            <div>
              <div className="font-medium">
                {entity.enderecos[0].contatoComercialNome || "Sem nome"}
              </div>
              <div className="text-muted-foreground">
                {entity.enderecos[0].contatoComercialTelefone1 ||
                  "Sem telefone"}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Sem contato</span>
          )}
        </div>
      ),
    },
    {
      key: "endereco",
      header: "Endereço",
      render: (entity) => (
        <div className="text-sm">
          {entity.enderecos?.[0] ? (
            <div>
              <div>
                {entity.enderecos[0].cidade} - {entity.enderecos[0].uf}
              </div>
              <div className="text-muted-foreground">
                {entity.enderecos[0].logradouro}, {entity.enderecos[0].numero}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Sem endereço</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (entity) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(entity)}
            disabled={isUpdating || isDeleting}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Entidade</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a entidade "{entity.nome}"?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(entity.entidadeId.toString())}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Excluir"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  // Estados para gerenciar as entidades e interface
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para controle de carregamento e paginação
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  // Estados para controle de formulário
  const [formData, setFormData] = useState<EntityFormData>(
    DEFAULT_ENTITY_FORM_DATA
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-basicos");
  const [isCreating, setIsCreating] = useState(false);

  // Refs para debounce
  const searchTimeoutRef = useRef<number | null>(null);

  // Filtros e paginação
  const filteredEntities = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) {
      return entities;
    }

    const term = searchTerm.toLowerCase();
    return entities.filter((entity) => {
      return (
        entity.nome?.toLowerCase().includes(term) ||
        entity.cnpj?.toLowerCase().includes(term) ||
        entity.enderecos?.[0]?.contatoComercialNome
          ?.toLowerCase()
          .includes(term) ||
        entity.enderecos?.[0]?.cidade?.toLowerCase().includes(term)
      );
    });
  }, [entities, searchTerm]);

  const totalItems = filteredEntities.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentEntities = filteredEntities.slice(startIndex, endIndex);

  // Função para carregar entidades
  const loadEntities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await entidadeService.findAllView({
        page: 1,
        limit: 1000, // Carregar todas as entidades
      });
      const convertedData = response.data.map((entidade) =>
        entidadeService.convertToFrontendFormat(entidade)
      );
      setEntities(convertedData);
    } catch (error) {
      console.error("Erro ao carregar entidades:", error);
      toast.error("Erro ao carregar entidades");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para lidar com mudanças no termo de pesquisa
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset para primeira página ao pesquisar

    // Debounce para evitar muitas requisições
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Aqui você pode adicionar lógica adicional se necessário
    }, 300);
  }, []);

  // Função para lidar com mudanças na página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Função para abrir dialog de criação
  const openCreateDialog = useCallback(() => {
    setFormData(DEFAULT_ENTITY_FORM_DATA);
    setHasUnsavedChanges(false);
    setActiveTab("dados-basicos");
    setIsCreating(true);
    setIsCreateDialogOpen(true);
  }, []);

  // Função para fechar dialog de criação
  const closeCreateDialog = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      setIsCreateDialogOpen(false);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreating(false);
    }
  }, [hasUnsavedChanges]);

  // Função para abrir dialog de edição
  const handleEdit = useCallback((entity: Entity) => {
    setEditingEntity(entity);
    // Usar os dados já convertidos corretamente pelo convertToFrontendFormat
    setFormData(entity);
    setHasUnsavedChanges(false);
    setActiveTab("dados-basicos");
    setIsCreating(false);
    setIsEditDialogOpen(true);
  }, []);

  // Função para lidar com mudanças no formulário
  const handleFormDataChange = useCallback(
    (
      newFormData: EntityFormData | ((prev: EntityFormData) => EntityFormData)
    ) => {
      setFormData(newFormData);
      setHasUnsavedChanges(true);
    },
    []
  );

  // Função para criar entidade
  const handleCreate = useCallback(async () => {
    try {
      setIsUpdating(true);
      const apiData = entidadeService.convertToApiFormat(formData);
      await entidadeService.create(apiData);
      toast.success("Entidade criada com sucesso!");
      setIsCreateDialogOpen(false);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreating(false);
      await loadEntities();
    } catch (error) {
      console.error("Erro ao criar entidade:", error);
      toast.error("Erro ao criar entidade");
    } finally {
      setIsUpdating(false);
    }
  }, [formData, loadEntities]);

  // Função para atualizar entidade
  const handleUpdate = useCallback(async () => {
    if (!editingEntity) return;

    try {
      setIsUpdating(true);
      const apiData = entidadeService.convertToApiFormat(formData);
      await entidadeService.update(editingEntity.entidadeId, apiData);
      toast.success("Entidade atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setEditingEntity(null);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      await loadEntities();
    } catch (error) {
      console.error("Erro ao atualizar entidade:", error);
      toast.error("Erro ao atualizar entidade");
    } finally {
      setIsUpdating(false);
    }
  }, [editingEntity, formData, loadEntities]);

  // Função para excluir entidade
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsDeleting(true);
        await entidadeService.delete(parseInt(id));
        toast.success("Entidade excluída com sucesso!");
        await loadEntities();
      } catch (error) {
        console.error("Erro ao excluir entidade:", error);
        toast.error("Erro ao excluir entidade");
      } finally {
        setIsDeleting(false);
      }
    },
    [loadEntities]
  );

  // Função para fechar dialog com confirmação
  const handleCloseDialog = useCallback((type: "create" | "edit") => {
    if (type === "create") {
      setIsCreateDialogOpen(false);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreating(false);
    } else {
      setIsEditDialogOpen(false);
      setEditingEntity(null);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
    }
    setShowCloseConfirmation(false);
  }, []);

  // Carregar entidades ao montar o componente
  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Entidade
        </Button>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar entidades..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        title="Lista de Entidades"
        data={currentEntities}
        columns={columns}
        isLoading={isLoading}
        loadingText="Carregando entidades..."
        emptyText="Nenhuma entidade encontrada"
        keyExtractor={(entity) =>
          entity.entidadeId || `entity-${Math.random()}`
        }
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de{" "}
            {totalItems} entidades
          </div>
          <div className="flex items-center space-x-2">
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
        </div>
      )}

      {/* Dialog de criação de entidade */}
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
            setFormData(DEFAULT_ENTITY_FORM_DATA);
            setHasUnsavedChanges(false);
            setIsCreating(false);
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Entidade</DialogTitle>
            <DialogDescription>
              Preencha as informações da nova entidade. Os campos marcados com *
              são obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <EntityForm
            formData={formData}
            setFormData={handleFormDataChange}
            isCreating={isCreating}
            isUpdating={isUpdating}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeCreateDialog}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Entidade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição de entidade */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsEditDialogOpen(true);
            return;
          }

          if (hasUnsavedChanges) {
            setShowCloseConfirmation(true);
          } else {
            setIsEditDialogOpen(false);
            setEditingEntity(null);
            setHasUnsavedChanges(false);
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Entidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da entidade. Os campos marcados com * são
              obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <EntityForm
            formData={formData}
            setFormData={handleFormDataChange}
            isCreating={isCreating}
            isUpdating={isUpdating}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleCloseDialog("edit")}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Entidade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de fechamento */}
      <Dialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Descartar alterações?</DialogTitle>
            <DialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar
              essas alterações?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCloseConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (isCreateDialogOpen) {
                  handleCloseDialog("create");
                } else {
                  handleCloseDialog("edit");
                }
              }}
            >
              Descartar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
