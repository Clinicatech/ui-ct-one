import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Usuario } from "../types/usuario";
import { UsuarioFormData, DEFAULT_USUARIO_FORM_DATA } from "../types/usuario";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioForm } from "../components/UsuarioForm";
import { useAuth } from "../hooks/useAuth";
import { AuthService } from "../services/auth.service";
import { Search, Plus, Edit, Trash2, User } from "lucide-react";

interface UsuarioManagementProps {
  title?: string;
}

export function UsuarioManagement({
  title = "Gestão de Usuários",
}: UsuarioManagementProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<UsuarioFormData>(
    DEFAULT_USUARIO_FORM_DATA
  );
  const {} = useAuth();

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setIsLoading(true);
    try {
      const entidadeId = AuthService.getEntidadeId();
      console.log("🔍 EntidadeId obtido:", entidadeId);

      if (!entidadeId) {
        toast.error("Não foi possível obter a entidade do usuário logado");
        return;
      }

      console.log("🔍 Buscando usuários da entidade:", entidadeId);
      const data = await UsuarioService.findByEntidade(entidadeId);
      console.log("🔍 Usuários encontrados:", data);
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: UsuarioFormData) => {
    try {
      await UsuarioService.create(data);
      await loadUsuarios();
      setFormData(DEFAULT_USUARIO_FORM_DATA);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  };

  const handleEdit = async (data: UsuarioFormData) => {
    if (!editingUsuario) return;

    try {
      await UsuarioService.update(editingUsuario.usuarioId, data);
      await loadUsuarios();
      setEditingUsuario(null);
      setFormData(DEFAULT_USUARIO_FORM_DATA);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await UsuarioService.delete(id);
        await loadUsuarios();
        toast.success("Usuário excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        toast.error("Erro ao excluir usuário");
      }
    }
  };

  const openCreateDialog = () => {
    setFormData(DEFAULT_USUARIO_FORM_DATA);
    setIsCreateDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData(DEFAULT_USUARIO_FORM_DATA);
  };

  const openEditDialog = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      email: usuario.email,
      ativo: usuario.ativo,
      adm: usuario.adm,
      pessoaId: usuario.pessoaId,
      pessoa: usuario.pessoa
        ? {
            tipo: "PF", // Default para PF já que não temos essa info na interface Usuario
            nome: usuario.pessoa.nome,
            documento: usuario.pessoa.documento,
            razao: "", // Default vazio já que não temos essa info na interface Usuario
            entidadeId: AuthService.getEntidadeId() || 1, // Usar entidadeId do usuário logado
          }
        : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingUsuario(null);
    setFormData(DEFAULT_USUARIO_FORM_DATA);
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.pessoa?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.entidade?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Inativo
      </Badge>
    );
  };

  const getAdmBadge = (adm: boolean) => {
    return adm ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        Administrador
      </Badge>
    ) : (
      <Badge variant="outline">Usuário</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-white">Gerencie os usuários do sistema</p>
        </div>
        <Button
          variant="outline"
          onClick={openCreateDialog}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lista de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email, nome ou entidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <User className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">
                          {searchTerm
                            ? "Nenhum usuário encontrado"
                            : "Nenhum usuário cadastrado"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <TableRow key={usuario.usuarioId}>
                      <TableCell className="font-medium">
                        {usuario.email}
                      </TableCell>
                      <TableCell>{usuario.pessoa?.nome || "N/A"}</TableCell>
                      <TableCell>{usuario.entidade?.nome || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(usuario.ativo)}</TableCell>
                      <TableCell>{getAdmBadge(usuario.adm)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(usuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(usuario.usuarioId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UsuarioForm
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={handleCreate}
        formData={formData}
        setFormData={setFormData}
        isCreating={true}
        isUpdating={false}
      />

      <UsuarioForm
        isOpen={isEditDialogOpen}
        onClose={closeEditDialog}
        onSubmit={handleEdit}
        formData={formData}
        setFormData={setFormData}
        isCreating={false}
        isUpdating={true}
      />
    </div>
  );
}
