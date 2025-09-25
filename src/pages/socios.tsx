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
  User,
  Loader2,
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
import { socioService } from "../services/socio.service";
import { SocioForm } from "../components/SocioForm";
import { Socio, SocioFormData } from "../types/socio";
import { DEFAULT_SOCIO_FORM_DATA } from "../constants/socio-constants";

interface SocioManagementProps {
  title?: string;
}

export function SocioManagement({
  title = "Gestão de Sócios",
}: SocioManagementProps) {
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
  const [perPage] = useState(10);

  const searchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      setActiveTab("pessoa");
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  useEffect(() => {
    setFormData(DEFAULT_SOCIO_FORM_DATA);
    setHasUnsavedChanges(false);
  }, [isCreateDialogOpen]);

  useEffect(() => {
    if (editingSocio) {
      setFormData({
        pessoa: {
          nome: editingSocio.pessoa.nome,
          razao: editingSocio.pessoa.razao,
          documento: editingSocio.pessoa.documento,
          tipo: editingSocio.pessoa.tipo,
          entidade_id: editingSocio.pessoa.entidade_id,
          inscricao_estadual: editingSocio.pessoa.inscricao_estadual,
          inscricao_municipal: editingSocio.pessoa.inscricao_municipal,
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
              banco_id: editingSocio.dadosBancarios.banco_id,
              agencia: editingSocio.dadosBancarios.agencia,
              conta: editingSocio.dadosBancarios.conta,
              conta_tipo: editingSocio.dadosBancarios.conta_tipo as 1 | 2,
              chave_pix: editingSocio.dadosBancarios.chave_pix,
              conta_digito: editingSocio.dadosBancarios.conta_digito,
              agencia_digito: editingSocio.dadosBancarios.agencia_digito,
            }
          : undefined,
        socioInfo: {
          perc_rateio: editingSocio.perc_rateio,
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
        entidade_id: socio.pessoa.entidade_id,
        inscricao_estadual: socio.pessoa.inscricao_estadual,
        inscricao_municipal: socio.pessoa.inscricao_municipal,
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
            banco_id: socio.dadosBancarios.banco_id,
            agencia: socio.dadosBancarios.agencia,
            conta: socio.dadosBancarios.conta,
            conta_tipo: socio.dadosBancarios.conta_tipo as 1 | 2,
            chave_pix: socio.dadosBancarios.chave_pix,
            conta_digito: socio.dadosBancarios.conta_digito,
            agencia_digito: socio.dadosBancarios.agencia_digito,
          }
        : undefined,
      socioInfo: {
        perc_rateio: socio.perc_rateio,
      },
    });
    setActiveTab("pessoa");
    setHasUnsavedChanges(false);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSocio) return;

    setIsUpdating(true);
    try {
      const apiData = socioService.convertToApiFormat(formData);
      const updatedSocioApi = await socioService.update(
        editingSocio.socio_info_id,
        apiData
      );
      const updatedSocio =
        socioService.convertCreateUpdateToFrontendFormat(updatedSocioApi);

      setSocios((prevSocios) =>
        prevSocios.map((socio) =>
          socio.socio_info_id === editingSocio.socio_info_id
            ? updatedSocio
            : socio
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

  const handleDelete = async (socio: Socio) => {
    setIsDeleting(true);
    try {
      await socioService.remove(socio.socio_info_id);
      setSocios((prevSocios) =>
        prevSocios.filter((s) => s.socio_info_id !== socio.socio_info_id)
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentSocios = filteredSocios.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
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
                setFormData(DEFAULT_SOCIO_FORM_DATA);
                setHasUnsavedChanges(false);
              }
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lista de Sócios
          </CardTitle>
        </CardHeader>
        <CardContent>
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

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>% Rateio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSocios.map((socio) => (
                    <TableRow key={socio.socio_info_id}>
                      <TableCell className="font-medium">
                        {socio.pessoa.nome}
                      </TableCell>
                      <TableCell>{socio.pessoa.documento}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            socio.pessoa.tipo === "PF"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {socio.pessoa.tipo}
                        </span>
                      </TableCell>
                      <TableCell>{socio.pessoa.entidade_id}</TableCell>
                      <TableCell>{socio.perc_rateio}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(socio)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Confirmar Exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o sócio "
                                  {socio.pessoa.nome}"? Esta ação não pode ser
                                  desfeita.
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a{" "}
                    {Math.min(endIndex, totalItems)} de {totalItems} sócios
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
            </>
          )}
        </CardContent>
      </Card>

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
