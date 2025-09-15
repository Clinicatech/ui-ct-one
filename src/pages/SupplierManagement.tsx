import { useState, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  MapPin,
  Phone,
  //FileText
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export interface Supplier {
  id: string;
  codigo: string;
  razaoSocial: string;
  cnpj: string;
  status: 'ativo' | 'inativo';
  endereco: string;
  telefone: string;
  email: string;
  observacoes?: string;
}

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      codigo: '157',
      razaoSocial: 'EVOLARIS PRODUTOS FARMACÊUTICOS LTDA',
      cnpj: '05.049.218-0001/15',
      status: 'ativo',
      endereco: 'São Paulo - SP',
      telefone: '(11) 3456-7890',
      email: 'contato@evolaris.com.br'
    },
    {
      id: '2',
      codigo: '129',
      razaoSocial: 'EXELTIS LABORATÓRIO FARMACÊUTICO LTDA',
      cnpj: '15.116.092-0001/02',
      status: 'ativo',
      endereco: 'Rio de Janeiro - RJ',
      telefone: '(21) 2345-6789',
      email: 'comercial@exeltis.com.br'
    },
    {
      id: '3',
      codigo: '134',
      razaoSocial: 'HEMOFIL FARMACÊUTICA LTDA',
      cnpj: '07.770.637-0001/01',
      status: 'ativo',
      endereco: 'Belo Horizonte - MG',
      telefone: '(31) 9876-5432',
      email: 'vendas@hemofil.com.br'
    },
    {
      id: '4',
      codigo: '233',
      razaoSocial: 'A THERAPIST FARMÁCIA DE MANIPULAÇÃO LTDA EPP',
      cnpj: '50.472.711-0001/28',
      status: 'inativo',
      endereco: 'Porto Alegre - RS',
      telefone: '(51) 1234-5678',
      email: 'info@atherapist.com.br'
    },
    {
      id: '1',
      codigo: '157',
      razaoSocial: 'EVOLARIS PRODUTOS FARMACÊUTICOS LTDA',
      cnpj: '05.049.218-0001/15',
      status: 'ativo',
      endereco: 'São Paulo - SP',
      telefone: '(11) 3456-7890',
      email: 'contato@evolaris.com.br'
    },
    {
      id: '2',
      codigo: '129',
      razaoSocial: 'EXELTIS LABORATÓRIO FARMACÊUTICO LTDA',
      cnpj: '15.116.092-0001/02',
      status: 'ativo',
      endereco: 'Rio de Janeiro - RJ',
      telefone: '(21) 2345-6789',
      email: 'comercial@exeltis.com.br'
    },
    {
      id: '3',
      codigo: '134',
      razaoSocial: 'HEMOFIL FARMACÊUTICA LTDA',
      cnpj: '07.770.637-0001/01',
      status: 'ativo',
      endereco: 'Belo Horizonte - MG',
      telefone: '(31) 9876-5432',
      email: 'vendas@hemofil.com.br'
    },
    {
      id: '4',
      codigo: '233',
      razaoSocial: 'A THERAPIST FARMÁCIA DE MANIPULAÇÃO LTDA EPP',
      cnpj: '50.472.711-0001/28',
      status: 'inativo',
      endereco: 'Porto Alegre - RS',
      telefone: '(51) 1234-5678',
      email: 'info@atherapist.com.br'
    },
    {
      id: '1',
      codigo: '157',
      razaoSocial: 'EVOLARIS PRODUTOS FARMACÊUTICOS LTDA',
      cnpj: '05.049.218-0001/15',
      status: 'ativo',
      endereco: 'São Paulo - SP',
      telefone: '(11) 3456-7890',
      email: 'contato@evolaris.com.br'
    },
    {
      id: '2',
      codigo: '129',
      razaoSocial: 'EXELTIS LABORATÓRIO FARMACÊUTICO LTDA',
      cnpj: '15.116.092-0001/02',
      status: 'ativo',
      endereco: 'Rio de Janeiro - RJ',
      telefone: '(21) 2345-6789',
      email: 'comercial@exeltis.com.br'
    },
    {
      id: '3',
      codigo: '134',
      razaoSocial: 'HEMOFIL FARMACÊUTICA LTDA',
      cnpj: '07.770.637-0001/01',
      status: 'ativo',
      endereco: 'Belo Horizonte - MG',
      telefone: '(31) 9876-5432',
      email: 'vendas@hemofil.com.br'
    },
    {
      id: '4',
      codigo: '233',
      razaoSocial: 'A THERAPIST FARMÁCIA DE MANIPULAÇÃO LTDA EPP',
      cnpj: '50.472.711-0001/28',
      status: 'inativo',
      endereco: 'Porto Alegre - RS',
      telefone: '(51) 1234-5678',
      email: 'info@atherapist.com.br'
    }    
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    razaoSocial: '',
    cnpj: '',
    status: 'ativo',
    endereco: '',
    telefone: '',
    email: '',
    observacoes: ''
  });

  // Filter suppliers based on search and status
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.cnpj.includes(searchTerm) ||
        supplier.codigo.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'todos' || supplier.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  const handleCreate = () => {
    if (!formData.razaoSocial || !formData.cnpj || !formData.email) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newSupplier: Supplier = {
      id: Date.now().toString(),
      codigo: (suppliers.length + 1).toString(),
      razaoSocial: formData.razaoSocial!,
      cnpj: formData.cnpj!,
      status: formData.status as 'ativo' | 'inativo',
      endereco: formData.endereco!,
      telefone: formData.telefone!,
      email: formData.email!,
      observacoes: formData.observacoes
    };

    setSuppliers([...suppliers, newSupplier]);
    setFormData({
      razaoSocial: '',
      cnpj: '',
      status: 'ativo',
      endereco: '',
      telefone: '',
      email: '',
      observacoes: ''
    });
    setIsCreateDialogOpen(false);
    toast.success('Fornecedor criado com sucesso!');
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.razaoSocial || !formData.cnpj || !formData.email) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setSuppliers(suppliers.map(s => 
      s.id === editingSupplier?.id 
        ? { ...s, ...formData } as Supplier
        : s
    ));
    setEditingSupplier(null);
    setFormData({
      razaoSocial: '',
      cnpj: '',
      status: 'ativo',
      endereco: '',
      telefone: '',
      email: '',
      observacoes: ''
    });
    setIsEditDialogOpen(false);
    toast.success('Fornecedor atualizado com sucesso!');
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success('Fornecedor excluído com sucesso!');
  };

  const SupplierForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="razaoSocial">Razão Social *</Label>
          <Input
            id="razaoSocial"          
            value={formData.razaoSocial || ''}
            onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
            placeholder="Nome da empresa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj || ''}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contato@empresa.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone || ''}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="(00) 0000-0000"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco || ''}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            placeholder="Cidade - Estado"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: string) => setFormData({ ...formData, status: value as 'ativo' | 'inativo' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Informações adicionais..."
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestão de Fornecedores</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Fornecedor</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo fornecedor
              </DialogDescription>
            </DialogHeader>
            <SupplierForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Criar Fornecedor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar Fornecedores</CardTitle>
          <CardDescription>
            Encontre fornecedores por nome, CNPJ ou código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por razão social, CNPJ ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Apenas Ativos</SelectItem>
                <SelectItem value="inativo">Apenas Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.codigo}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.razaoSocial}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{supplier.cnpj}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === 'ativo' ? 'default' : 'secondary'}>
                      {supplier.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{supplier.endereco}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{supplier.telefone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
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
                            <AlertDialogTitle>Excluir Fornecedor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o fornecedor "{supplier.razaoSocial}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(supplier.id)}>
                              Excluir
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

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum fornecedor encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece criando um novo fornecedor'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
            <DialogDescription>
              Atualize as informações do fornecedor
            </DialogDescription>
          </DialogHeader>
          <SupplierForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}