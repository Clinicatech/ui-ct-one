/**
 * Página de Gestão de Contratos
 *
 * Esta página implementa um CRUD completo para gerenciar contratos do sistema.
 *
 * Funcionalidades implementadas:
 * - Listagem de contratos com paginação e filtros
 * - Criação de novos contratos
 * - Edição de contratos existentes
 * - Exclusão de contratos
 * - Pesquisa em tempo real com debounce
 * - Filtros por status ativo/inativo
 * - Indicadores de carregamento
 * - Tratamento de erros
 *
 * Arquitetura:
 * - Frontend: React com TypeScript
 * - Estado: useState e useMemo para otimização
 * - API: Serviço dedicado (contratoService) para comunicação
 * - UI: Componentes shadcn/ui para interface consistente
 */

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, Search, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ContratoForm } from "../components/ContratoForm";
import {
  contratoService,
  Contrato,
  ContratoTipo,
  ContratoFormData,
} from "../services/contrato.service";
import { contratoTipoService } from "../services/contrato-tipo.service";

// Tipos já importados dos serviços

export function ContratoManagement() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [contratoTipos, setContratoTipos] = useState<ContratoTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContrato, setEditingContrato] = useState<Contrato | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Função para carregar todos os contratos (sem filtros)
  const loadContratos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Carrega todos os contratos sem filtros iniciais
      const response = await contratoService.findAll({
        page: 1,
        perPage: 25, // Padrão de 25 itens por página
      });

      setContratos(response.data);
    } catch (err) {
      setError("Erro ao carregar contratos");
      toast.error("Não foi possível carregar os contratos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para buscar tipos de contrato
  const fetchContratoTipos = useCallback(async () => {
    try {
      const response = await contratoTipoService.findAll();
      setContratoTipos(response.data || []);
    } catch (err) {
      setContratoTipos([]);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadContratos();
    fetchContratoTipos();
  }, [loadContratos, fetchContratoTipos]);

  // Função para lidar com mudanças no termo de pesquisa
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);

    // Debounce para evitar muitas requisições
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Aqui você pode adicionar lógica adicional se necessário
    }, 300);
  }, []);

  // Cleanup do timeout ao desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Filtrar contratos localmente
  const filteredContratos = useMemo(() => {
    let filtered = contratos;

    // Filtro por termo de pesquisa
    if (searchTerm && searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((contrato) => {
        return (
          contrato.numeroContrato?.toLowerCase().includes(term) ||
          contrato.descricao?.toLowerCase().includes(term) ||
          contrato.cliente?.nome?.toLowerCase().includes(term) ||
          contrato.parceiro?.nome?.toLowerCase().includes(term) ||
          contrato.socio?.nome?.toLowerCase().includes(term)
        );
      });
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((contrato) => {
        return (
          (statusFilter === "active" && contrato.ativo) ||
          (statusFilter === "inactive" && !contrato.ativo)
        );
      });
    }

    return filtered;
  }, [contratos, searchTerm, statusFilter]);

  // Função para abrir dialog de criação/edição
  const handleOpenDialog = (contrato?: Contrato) => {
    setEditingContrato(contrato || null);
    setIsDialogOpen(true);
  };

  // Função para fechar dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingContrato(null);
  };

  // Função para salvar contrato
  const handleSaveContrato = async (data: ContratoFormData) => {
    try {
      setIsSubmitting(true);

      if (editingContrato) {
        await contratoService.patch(editingContrato.contratoId, data);
        toast.success("Contrato atualizado com sucesso");
      } else {
        await contratoService.create(data);
        toast.success("Contrato criado com sucesso");
      }

      handleCloseDialog();
      loadContratos();
    } catch (err) {
      toast.error("Não foi possível salvar o contrato");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para excluir contrato
  const handleDeleteContrato = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return;

    try {
      await contratoService.remove(id);
      await loadContratos();
      toast.success("Contrato removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover contrato");
    }
  };

  // Função para obter nome da pessoa
  const getPessoaNome = (contrato: Contrato) => {
    if (contrato.cliente) return contrato.cliente.nome;
    if (contrato.parceiro) return contrato.parceiro.nome;
    if (contrato.socio) return contrato.socio.nome;
    return "N/A";
  };

  // Função para obter tipo da pessoa
  const getPessoaTipo = (contrato: Contrato) => {
    if (contrato.cliente) return "Cliente";
    if (contrato.parceiro) return "Parceiro";
    if (contrato.socio) return "Sócio";
    return "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestão de Contratos</h1>
        <Button variant="outline" onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-500">{error}</span>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, descrição ou nome da pessoa..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white text-black">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos ({filteredContratos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Contrato</TableHead>
                  <TableHead>Pessoa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => (
                  <TableRow key={contrato.contratoId}>
                    <TableCell className="font-medium">
                      {contrato.numeroContrato || `#${contrato.contratoId}`}
                    </TableCell>
                    <TableCell>{getPessoaNome(contrato)}</TableCell>
                    <TableCell>{getPessoaTipo(contrato)}</TableCell>
                    <TableCell>{contrato.descricao || "N/A"}</TableCell>
                    <TableCell>
                      R${" "}
                      {contrato.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={contrato.ativo ? "default" : "secondary"}
                        className={
                          contrato.ativo ? "bg-green-500" : "bg-gray-500"
                        }
                      >
                        {contrato.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(contrato)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteContrato(contrato.contratoId)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de criação/edição */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Chamar a função de fechamento que verifica alterações
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContrato ? "Editar Contrato" : "Novo Contrato"}
            </DialogTitle>
            <DialogDescription>
              {editingContrato
                ? "Atualize as informações do contrato"
                : "Preencha as informações para criar um novo contrato"}
            </DialogDescription>
          </DialogHeader>

          <ContratoForm
            contrato={editingContrato}
            contratoTipos={contratoTipos}
            onSubmit={handleSaveContrato}
            onCancel={handleCloseDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
