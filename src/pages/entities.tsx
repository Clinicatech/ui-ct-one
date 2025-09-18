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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { toast } from "sonner";
import { entidadeService } from "../services/entidade.service";
import { EntityForm } from "../components/EntityForm";
import { Entity, EntityFormData } from "../types/entity";
import { DEFAULT_ENTITY_FORM_DATA } from "../constants/entity-constants";

// Interface Entity agora importada de types/entity.ts

export function EntityManagement() {
  // Estados para gerenciar as entidades e interface
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para controle de carregamento e paginação
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-basicos");

  // Estados para controlar mudanças não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(3); // Limite temporário de 3 itens por página para testar paginação

  // Ref para controlar o timeout do debounce
  const searchTimeoutRef = useRef<number | null>(null);
  // Ref para manter o foco no input de pesquisa
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Resetar tab ativa quando abrir dialogs
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      setActiveTab("dados-basicos");
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  // Limpar campos quando abrir dialog de criação
  useEffect(() => {
    if (isCreateDialogOpen) {
      setFormData(DEFAULT_ENTITY_FORM_DATA);
    }
  }, [isCreateDialogOpen]);

  // Estado do formulário para criação/edição de entidades
  const [formData, setFormData] = useState<EntityFormData>(
    DEFAULT_ENTITY_FORM_DATA
  );

  // Função para carregar entidades da API (memoizada para evitar re-criação)
  const loadEntities = useCallback(
    async (searchTerm?: string, page: number = 1) => {
      setIsLoading(true);
      try {
        let response;

        // Usar endpoint com filtros e paginação
        if (searchTerm && searchTerm.trim()) {
          response = await entidadeService.findAllView({
            search: searchTerm.trim(),
            page: page,
            limit: perPage,
          });
        } else {
          response = await entidadeService.findAllView({
            page: page,
            limit: perPage,
          });
        }

        // Atualizar estados de paginação
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalItems || 0);
        setCurrentPage(response.page || page);

        // Validar se data é um array válido
        if (!Array.isArray(response.data)) {
          console.error("Resposta da API não é um array:", response.data);
          setEntities([]);
          return;
        }

        const entitiesFormatted = response.data.map(
          entidadeService.convertToFrontendFormat
        );

        setEntities(entitiesFormatted);
      } catch (error) {
        console.error("Erro ao carregar entidades:", error);
        toast.error("Erro ao carregar entidades");
        setEntities([]); // Limpar lista em caso de erro
      } finally {
        setIsLoading(false);
      }
    },
    [perPage]
  );

  // Carregar entidades quando o componente for montado
  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  // Função para lidar com mudanças no termo de pesquisa com debounce
  const handleSearchChange = useCallback(
    (newSearchTerm: string) => {
      // Limpar timeout anterior se existir
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Definir novo timeout
      searchTimeoutRef.current = setTimeout(() => {
        if (newSearchTerm !== "" && newSearchTerm.length >= 2) {
          // Só pesquisar se tiver pelo menos 2 caracteres
          setCurrentPage(1); // Resetar para primeira página
          loadEntities(newSearchTerm, 1);
        } else if (newSearchTerm === "") {
          // Se estiver vazio, carregar todas
          setCurrentPage(1); // Resetar para primeira página
          loadEntities(undefined, 1);
        }
        // Se tiver 1 caractere, não fazer nada (aguardar mais caracteres)
      }, 500);
    },
    [perPage]
  );

  // Debounce para pesquisa - aguarda 500ms após o usuário parar de digitar
  useEffect(() => {
    // Não executar na primeira renderização (quando searchTerm está vazio)
    if (searchTerm === "" && entities.length === 0) {
      return;
    }

    handleSearchChange(searchTerm);
  }, [searchTerm, handleSearchChange]);

  // Limpar timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Restaurar foco no input de pesquisa após carregamento
  useEffect(() => {
    if (!isLoading && searchInputRef.current && searchTerm) {
      // Pequeno delay para garantir que o DOM foi atualizado
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isLoading, searchTerm]);

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadEntities(searchTerm || undefined, page);
  };

  // Função para detectar mudanças no formulário
  const handleFormDataChange = useCallback((newFormData: any) => {
    setFormData(newFormData);
    setHasUnsavedChanges(true);
  }, []);

  // Função para fechar dialog com confirmação
  const handleCloseDialog = useCallback(
    (dialogType: "create" | "edit") => {
      if (hasUnsavedChanges) {
        setShowCloseConfirmation(true);
      } else {
        if (dialogType === "create") {
          setIsCreateDialogOpen(false);
          setFormData(DEFAULT_ENTITY_FORM_DATA);
        } else {
          setIsEditDialogOpen(false);
          setEditingEntity(null);
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
    setEditingEntity(null);
    setFormData(DEFAULT_ENTITY_FORM_DATA);
  }, []);

  // Função para cancelar fechamento
  const cancelClose = useCallback(() => {
    setShowCloseConfirmation(false);
  }, []);

  // Usar todas as entidades (filtros são feitos na API)
  const filteredEntities = useMemo(() => {
    return entities;
  }, [entities]);

  // Função para criar nova entidade via API
  const handleCreate = async () => {
    if (!formData.nome || !formData.cnpj) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsCreating(true);
    try {
      // Converter dados do frontend para formato da API
      const apiData = entidadeService.convertToApiFormat(formData);

      // Criar entidade na API
      const newEntityApi = await entidadeService.create(apiData);

      // Converter resposta da API para formato do frontend
      const newEntity =
        entidadeService.convertCreateUpdateToFrontendFormat(newEntityApi);

      // Adicionar nova entidade à lista local
      setEntities((prevEntities) => [...prevEntities, newEntity]);

      // Limpar formulário e fechar dialog
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsCreateDialogOpen(false);
      toast.success("Entidade criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar entidade:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar entidade";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Função para iniciar edição de entidade
  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setFormData(entity); // Agora Entity e EntityFormData são a mesma coisa
    setActiveTab("dados-basicos"); // Resetar para primeira tab
    setHasUnsavedChanges(false); // Resetar estado de mudanças
    setIsEditDialogOpen(true);
  };

  // Função para atualizar entidade via API
  const handleUpdate = async () => {
    if (!formData.nome || !formData.cnpj) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!editingEntity) return;

    setIsUpdating(true);
    try {
      // Converter dados do frontend para formato de atualização da API
      const updateData = entidadeService.convertToApiFormat(formData);

      // Atualizar entidade na API
      const updatedEntityApi = await entidadeService.update(
        editingEntity.entidadeId,
        updateData
      );

      const updatedEntity =
        entidadeService.convertCreateUpdateToFrontendFormat(updatedEntityApi);

      // Atualizar entidade na lista local
      setEntities((prevEntities) =>
        prevEntities.map((entity) =>
          entity.entidadeId === editingEntity.entidadeId
            ? updatedEntity
            : entity
        )
      );

      // Limpar estado e fechar dialog
      setEditingEntity(null);
      setFormData(DEFAULT_ENTITY_FORM_DATA);
      setHasUnsavedChanges(false);
      setIsEditDialogOpen(false);
      toast.success("Entidade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar entidade:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar entidade";
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Função para excluir entidade via API
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      // Excluir entidade na API
      await entidadeService.delete(parseInt(id));

      // Atualizar lista local
      setEntities(
        entities.filter((entity) => entity.entidadeId !== parseInt(id))
      );
      toast.success("Entidade excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir entidade:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir entidade";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com título e botão de nova entidade */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestão de Entidades</h2>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsCreateDialogOpen(true);
            } else {
              if (hasUnsavedChanges) {
                setShowCloseConfirmation(true);
              } else {
                setIsCreateDialogOpen(false);
                setFormData(DEFAULT_ENTITY_FORM_DATA);
                setHasUnsavedChanges(false);
              }
            }
          }}
        >
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entidade
            </Button>
          </DialogTrigger>
          <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Entidade</DialogTitle>
              <DialogDescription>
                Preencha as informações da nova entidade
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
                onClick={() => handleCloseDialog("create")}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Entidade"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seção de pesquisa e filtros */}
      <Card>
        <CardContent>
          <div className="flex gap-4 max-h-5">
            <div className="flex-1 mt-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={
                    searchTerm.length === 1
                      ? "Digite pelo menos 2 caracteres para pesquisar..."
                      : "Pesquisar por razão social ou CNPJ..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                  autoComplete="off"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setSearchTerm("")}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de entidades */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Entidades ({filteredEntities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Carregando entidades...</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity, index) => {
                    return (
                      <TableRow key={entity.entidadeId || `entity-${index}`}>
                        <TableCell>{entity.entidadeId || "SEM ID"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{entity.nome || "SEM NOME"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entity.cnpj}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entity.enderecos?.[0] ? (
                              <div>
                                <div className="font-medium">
                                  {entity.enderecos[0].contatoComercialNome ||
                                    "Sem nome"}
                                </div>
                                <div className="text-muted-foreground">
                                  {entity.enderecos[0]
                                    .contatoComercialTelefone1 ||
                                    "Sem telefone"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Sem contato
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entity.enderecos?.[0] ? (
                              <div>
                                <div>
                                  {entity.enderecos[0].cidade} -{" "}
                                  {entity.enderecos[0].uf}
                                </div>
                                <div className="text-muted-foreground">
                                  {entity.enderecos[0].logradouro},{" "}
                                  {entity.enderecos[0].numero}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Sem endereço
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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
                                  <AlertDialogTitle>
                                    Excluir Entidade
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a entidade "
                                    {entity.nome}"? Esta ação não pode ser
                                    desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isDeleting}>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(entity.entidadeId.toString())
                                    }
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredEntities.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm.length === 1
                      ? "Digite pelo menos 2 caracteres para pesquisar"
                      : searchTerm.length >= 2
                      ? "Nenhuma entidade encontrada"
                      : "Nenhuma entidade encontrada"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm.length === 1
                      ? "A pesquisa requer pelo menos 2 caracteres"
                      : searchTerm.length >= 2
                      ? "Tente ajustar os filtros de pesquisa"
                      : "Comece criando uma nova entidade"}
                  </p>
                </div>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * perPage + 1} a{" "}
                    {Math.min(currentPage * perPage, totalItems)} de{" "}
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
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
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              disabled={isLoading}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edição de entidade */}
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
              setEditingEntity(null);
              setHasUnsavedChanges(false);
            }
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Entidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da entidade
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
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
