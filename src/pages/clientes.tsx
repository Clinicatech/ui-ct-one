import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ClienteForm } from "../components/ClienteForm";
import { ClienteService } from "../services/cliente.service";
import { Cliente, ClienteFormData } from "../types/cliente";
import { DEFAULT_CLIENTE_FORM_DATA } from "../constants/cliente-constants";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface ClienteManagementProps {
  title?: string;
}

export function ClienteManagement({
  title = "Gestão de Clientes",
}: ClienteManagementProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteFormData>(
    DEFAULT_CLIENTE_FORM_DATA
  );

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const data = await ClienteService.findAll();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: ClienteFormData) => {
    try {
      await ClienteService.create(data);
      await loadClientes();
      setFormData(DEFAULT_CLIENTE_FORM_DATA);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  };

  const handleEdit = async (data: ClienteFormData) => {
    if (!editingCliente) return;

    try {
      await ClienteService.update(editingCliente.cliente_info_id, data);
      await loadClientes();
      setEditingCliente(null);
      setFormData(DEFAULT_CLIENTE_FORM_DATA);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      await ClienteService.remove(id);
      await loadClientes();
      toast.success("Cliente removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      toast.error("Erro ao remover cliente");
    }
  };

  const openEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      pessoa: {
        nome: cliente.pessoa.nome,
        razao: cliente.pessoa.razao,
        documento: cliente.pessoa.documento,
        tipo: cliente.pessoa.tipo,
        inscricao_estadual: cliente.pessoa.inscricao_estadual,
        inscricao_municipal: cliente.pessoa.inscricao_municipal,
      },
      endereco: cliente.endereco
        ? {
            cep: cliente.endereco.cep,
            endereco: cliente.endereco.endereco,
            numero: cliente.endereco.numero,
            complemento: cliente.endereco.complemento,
            bairro: cliente.endereco.bairro,
            cidade: cliente.endereco.cidade,
            uf: cliente.endereco.uf,
          }
        : undefined,
      responsavel: cliente.responsavel
        ? {
            nome: cliente.responsavel.nome,
            razao: cliente.responsavel.razao,
            documento: cliente.responsavel.documento,
            tipo: cliente.responsavel.tipo,
            inscricao_estadual: cliente.responsavel.inscricao_estadual,
            inscricao_municipal: cliente.responsavel.inscricao_municipal,
          }
        : undefined,
      enderecoResponsavel: cliente.responsavel?.endereco
        ? {
            cep: cliente.responsavel.endereco.cep,
            endereco: cliente.responsavel.endereco.endereco,
            numero: cliente.responsavel.endereco.numero,
            complemento: cliente.responsavel.endereco.complemento,
            bairro: cliente.responsavel.endereco.bairro,
            cidade: cliente.responsavel.endereco.cidade,
            uf: cliente.responsavel.endereco.uf,
          }
        : undefined,
      clienteInfo: {},
    });

    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData(DEFAULT_CLIENTE_FORM_DATA);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingCliente(null);
    setFormData(DEFAULT_CLIENTE_FORM_DATA);
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.pessoa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.pessoa.documento.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.cliente_info_id}>
                    <TableCell className="font-medium">
                      {cliente.pessoa.nome}
                    </TableCell>
                    <TableCell>{cliente.pessoa.documento}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cliente.pessoa.tipo === "PF"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {cliente.pessoa.tipo}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cliente.responsavel ? cliente.responsavel.nome : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(cliente)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cliente.cliente_info_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClienteForm
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={handleCreate}
        formData={formData}
        setFormData={setFormData}
        isCreating={true}
        isUpdating={false}
      />

      <ClienteForm
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
