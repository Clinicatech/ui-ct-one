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
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  CreditCard,
  Home,
  //FileText
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

export interface Entity {
  id: string;
  codigo: string;
  razaoSocial: string;
  cnpj: string;
  status: "ativo" | "inativo";
  endereco: string;
  telefone: string;
  email: string;
  observacoes?: string;
  urlSite?: string;
  urlLogo?: string;
  // Dados do endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cidadeCodigo?: string;
  ufCodigo?: string;
  // Contatos
  contatoComercialNome?: string;
  contatoComercialTelefone1?: string;
  contatoComercialTelefone2?: string;
  contatoComercialTelefone3?: string;
  contatoComercialEmail?: string;
  contatoTecnicoNome?: string;
  contatoTecnicoTelefone1?: string;
  contatoTecnicoTelefone2?: string;
  contatoTecnicoTelefone3?: string;
  contatoTecnicoEmail?: string;
  contatoFinanceiroNome?: string;
  contatoFinanceiroTelefone1?: string;
  contatoFinanceiroTelefone2?: string;
  contatoFinanceiroTelefone3?: string;
  contatoFinanceiroEmail?: string;
  // Dados bancários
  bancoId?: number;
  agencia?: string;
  agenciaDigito?: string;
  conta?: string;
  contaDigito?: string;
  carteira?: string;
  cedenteCodigo?: string;
  cedenteNome?: string;
  chavePix?: string;
}

// Componente do formulário para criação/edição de entidades
const EntityForm = ({ 
  formData, 
  setFormData, 
  isCreating, 
  isUpdating, 
  buscarCEP, 
  activeTab, 
  setActiveTab 
}: {
  formData: Partial<Entity>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Entity>>>;
  isCreating: boolean;
  isUpdating: boolean;
  buscarCEP: (cep: string) => Promise<void>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}) => (
  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="dados-basicos" className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Dados Básicos
      </TabsTrigger>
      <TabsTrigger value="endereco" className="flex items-center gap-2">
        <Home className="h-4 w-4" />
        Endereço
      </TabsTrigger>
      <TabsTrigger
        value="dados-bancarios"
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Dados Bancários
      </TabsTrigger>
    </TabsList>

    {/* Tab: Dados Básicos */}
    <TabsContent value="dados-basicos" className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dados Básicos da Entidade</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão Social *</Label>
            <Input
              key="razaoSocial-input"
              id="razaoSocial"          
              name="razaoSocial"
              value={formData.razaoSocial || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, razaoSocial: e.target.value }))
              }
              placeholder="Nome da empresa"
              disabled={isCreating || isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              key="cnpj-input"
              id="cnpj"
              value={formData.cnpj || ""}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, cnpj: e.target.value }))
              }
              placeholder="00.000.000/0000-00"
              disabled={isCreating || isUpdating}
            />
          </div>
        </div>
      </div>
    </TabsContent>

    {/* Tab: Endereço */}
    <TabsContent value="endereco" className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Endereço e Contatos</h3>
        
        {/* CEP e busca automática */}
        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            name="cep"
            value={formData.cep || ""}
            onChange={(e) => {
              const cep = e.target.value;
              setFormData(prev => ({ ...prev, cep }));
              if (cep.length === 9) {
                // 00000-000
                buscarCEP(cep);
              }
            }}
            placeholder="00000-000"
            disabled={isCreating || isUpdating}
          />
        </div>
      </div>
    </TabsContent>

    {/* Tab: Dados Bancários */}
    <TabsContent value="dados-bancarios" className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dados Bancários</h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bancoId">ID do Banco</Label>
            <Input
              id="bancoId"
              name="bancoId"
              type="number"
              value={formData.bancoId || ""}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  bancoId: parseInt(e.target.value) || undefined,
                }))
              }
              placeholder="1"
              disabled={isCreating || isUpdating}
            />
          </div>
        </div>
      </div>
    </TabsContent>
  </Tabs>
);

export function EntityManagement() {
  // Estados para gerenciar as entidades e interface
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para controle de carregamento e paginação
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-basicos");

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(25); // Limite fixo de 25 itens por página

  // Ref para controlar o timeout do debounce
  const searchTimeoutRef = useRef<number | null>(null);

  // Resetar tab ativa quando abrir dialogs
  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      setActiveTab("dados-basicos");
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  // Estado do formulário para criação/edição de entidades
  const [formData, setFormData] = useState<Partial<Entity>>({
    razaoSocial: "",
    cnpj: "",
    status: "ativo",
    endereco: "",
    telefone: "",
    email: "",
    observacoes: "",
    urlSite: "",
    urlLogo: "",
    // Dados do endereço
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    cidadeCodigo: "",
    ufCodigo: "",
    // Contatos
    contatoComercialNome: "",
    contatoComercialTelefone1: "",
    contatoComercialTelefone2: "",
    contatoComercialTelefone3: "",
    contatoComercialEmail: "",
    contatoTecnicoNome: "",
    contatoTecnicoTelefone1: "",
    contatoTecnicoTelefone2: "",
    contatoTecnicoTelefone3: "",
    contatoTecnicoEmail: "",
    contatoFinanceiroNome: "",
    contatoFinanceiroTelefone1: "",
    contatoFinanceiroTelefone2: "",
    contatoFinanceiroTelefone3: "",
    contatoFinanceiroEmail: "",
    // Dados bancários
    bancoId: undefined,
    agencia: "",
    agenciaDigito: "",
    conta: "",
    contaDigito: "",
    carteira: "",
    cedenteCodigo: "",
    cedenteNome: "",
    chavePix: "",
  });

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
    [loadEntities]
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

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadEntities(searchTerm || undefined, page);
  };

  // Função para buscar CEP no ViaCEP
  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) return;

    try {
      const cepLimpo = cep.replace(/\D/g, "");
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      // Preencher campos com dados do ViaCEP
      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        uf: data.uf || "",
        cidadeCodigo: data.ibge || "",
        ufCodigo: data.ibge ? data.ibge.substring(0, 2) : "",
      }));

      // Focar no campo número após preencher
      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numero"]'
        ) as HTMLInputElement;
        if (numeroInput) {
          numeroInput.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  }, []);

  // Filtrar entidades baseado apenas no status (pesquisa é feita na API)
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesStatus =
        statusFilter === "todos" || entity.status === statusFilter;
      return matchesStatus;
    });
  }, [entities, statusFilter]);

  // Função para criar nova entidade via API
  const handleCreate = async () => {
    if (!formData.razaoSocial || !formData.cnpj || !formData.email) {
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
      const newEntity = entidadeService.convertToFrontendFormat(newEntityApi);

      // Atualizar lista local
      setEntities([...entities, newEntity]);

      // Limpar formulário e fechar dialog
      setFormData({
        razaoSocial: "",
        cnpj: "",
        status: "ativo",
        endereco: "",
        telefone: "",
        email: "",
        observacoes: "",
      });
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
    setFormData(entity);
    setActiveTab("dados-basicos"); // Resetar para primeira tab
    setIsEditDialogOpen(true);
  };

  // Função para atualizar entidade via API
  const handleUpdate = async () => {
    if (!formData.razaoSocial || !formData.cnpj || !formData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (!editingEntity) return;

    setIsUpdating(true);
    try {
      // Converter dados do frontend para formato da API
      const apiData = entidadeService.convertToApiFormat(formData);

      // Atualizar entidade na API
      const updatedEntityApi = await entidadeService.update(
        parseInt(editingEntity.id),
        apiData
      );

      // Converter resposta da API para formato do frontend
      const updatedEntity =
        entidadeService.convertToFrontendFormat(updatedEntityApi);

      // Atualizar lista local
      setEntities(
        entities.map((entity) =>
          entity.id === editingEntity.id ? updatedEntity : entity
        )
      );

      // Limpar estado e fechar dialog
      setEditingEntity(null);
      setFormData({
        razaoSocial: "",
        cnpj: "",
        status: "ativo",
        endereco: "",
        telefone: "",
        email: "",
        observacoes: "",
      });
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
      setEntities(entities.filter((entity) => entity.id !== id));
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

  // Componente do formulário para criação/edição de entidades
  const EntityForm = useMemo(
    () => (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="dados-basicos"
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Dados Básicos
          </TabsTrigger>
          <TabsTrigger value="endereco" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger
            value="dados-bancarios"
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Dados Bancários
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dados Básicos */}
        <TabsContent value="dados-basicos" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Básicos da Entidade</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão Social *</Label>
                <Input
                  key="razaoSocial-input"
                  id="razaoSocial"
                  name="razaoSocial"
                  value={formData.razaoSocial || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      razaoSocial: e.target.value,
                    }))
                  }
                  placeholder="Nome da empresa"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  key="cnpj-input"
                  id="cnpj"
                  value={formData.cnpj || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cnpj: e.target.value }))
                  }
                  placeholder="00.000.000/0000-00"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urlSite">URL do Site</Label>
                  <Input
                    id="urlSite"
                    name="urlSite"
                    value={formData.urlSite || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, urlSite: e.target.value })
                    }
                    placeholder="https://www.exemplo.com"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urlLogo">URL do Logo</Label>
                  <Input
                    id="urlLogo"
                    name="urlLogo"
                    value={formData.urlLogo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, urlLogo: e.target.value })
                    }
                    placeholder="https://www.exemplo.com/logo.png"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Endereço */}
        <TabsContent value="endereco" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço e Contatos</h3>

            {/* CEP e busca automática */}
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                name="cep"
                value={formData.cep || ""}
                onChange={(e) => {
                  const cep = e.target.value;
                  setFormData({ ...formData, cep });
                  if (cep.length === 9) {
                    // 00000-000
                    buscarCEP(cep);
                  }
                }}
                placeholder="00000-000"
                disabled={isCreating || isUpdating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  name="logradouro"
                  value={formData.logradouro || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logradouro: e.target.value })
                  }
                  placeholder="Rua, Avenida, etc."
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  value={formData.numero || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  placeholder="123"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  name="complemento"
                  value={formData.complemento || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, complemento: e.target.value })
                  }
                  placeholder="Sala, Andar, etc."
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  name="bairro"
                  value={formData.bairro || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, bairro: e.target.value })
                  }
                  placeholder="Nome do bairro"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  value={formData.cidade || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  placeholder="Nome da cidade"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  name="uf"
                  value={formData.uf || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, uf: e.target.value })
                  }
                  placeholder="SP"
                  maxLength={2}
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidadeCodigo">Código IBGE</Label>
                <Input
                  id="cidadeCodigo"
                  name="cidadeCodigo"
                  value={formData.cidadeCodigo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, cidadeCodigo: e.target.value })
                  }
                  placeholder="Código IBGE"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Dados Bancários */}
        <TabsContent value="dados-bancarios" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Bancários</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bancoId">ID do Banco</Label>
                  <Input
                    id="bancoId"
                    name="bancoId"
                    type="number"
                    value={formData.bancoId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bancoId: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="1"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carteira">Carteira</Label>
                  <Input
                    id="carteira"
                    name="carteira"
                    value={formData.carteira || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, carteira: e.target.value })
                    }
                    placeholder="COBRANCA"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agência</Label>
                  <Input
                    id="agencia"
                    name="agencia"
                    value={formData.agencia || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, agencia: e.target.value })
                    }
                    placeholder="123456"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agenciaDigito">Dígito da Agência</Label>
                  <Input
                    id="agenciaDigito"
                    name="agenciaDigito"
                    value={formData.agenciaDigito || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agenciaDigito: e.target.value,
                      })
                    }
                    placeholder="5"
                    maxLength={1}
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conta">Conta</Label>
                  <Input
                    id="conta"
                    name="conta"
                    value={formData.conta || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, conta: e.target.value })
                    }
                    placeholder="12345678"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contaDigito">Dígito da Conta</Label>
                  <Input
                    id="contaDigito"
                    name="contaDigito"
                    value={formData.contaDigito || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contaDigito: e.target.value })
                    }
                    placeholder="9"
                    maxLength={1}
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cedenteCodigo">Código do Cedente</Label>
                  <Input
                    id="cedenteCodigo"
                    name="cedenteCodigo"
                    value={formData.cedenteCodigo || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cedenteCodigo: e.target.value,
                      })
                    }
                    placeholder="123456"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedenteNome">Nome do Cedente</Label>
                  <Input
                    id="cedenteNome"
                    name="cedenteNome"
                    value={formData.cedenteNome || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, cedenteNome: e.target.value })
                    }
                    placeholder="Nome da empresa"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chavePix">Chave PIX</Label>
                <Input
                  id="chavePix"
                  name="chavePix"
                  value={formData.chavePix || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, chavePix: e.target.value })
                  }
                  placeholder="empresa@exemplo.com"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>

            {/* Contatos Comerciais */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Contato Comercial</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoComercialNome">Nome</Label>
                  <Input
                    id="contatoComercialNome"
                    name="contatoComercialNome"
                    value={formData.contatoComercialNome || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoComercialNome: e.target.value,
                      })
                    }
                    placeholder="Nome do contato comercial"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoComercialEmail">E-mail</Label>
                  <Input
                    id="contatoComercialEmail"
                    name="contatoComercialEmail"
                    type="email"
                    value={formData.contatoComercialEmail || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoComercialEmail: e.target.value,
                      })
                    }
                    placeholder="comercial@exemplo.com"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoComercialTelefone1">Telefone 1</Label>
                  <Input
                    id="contatoComercialTelefone1"
                    name="contatoComercialTelefone1"
                    value={formData.contatoComercialTelefone1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoComercialTelefone1: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoComercialTelefone2">Telefone 2</Label>
                  <Input
                    id="contatoComercialTelefone2"
                    name="contatoComercialTelefone2"
                    value={formData.contatoComercialTelefone2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoComercialTelefone2: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoComercialTelefone3">Telefone 3</Label>
                  <Input
                    id="contatoComercialTelefone3"
                    name="contatoComercialTelefone3"
                    value={formData.contatoComercialTelefone3 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoComercialTelefone3: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
            </div>

            {/* Contatos Técnicos */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Contato Técnico</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoTecnicoNome">Nome</Label>
                  <Input
                    id="contatoTecnicoNome"
                    name="contatoTecnicoNome"
                    value={formData.contatoTecnicoNome || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoTecnicoNome: e.target.value,
                      })
                    }
                    placeholder="Nome do contato técnico"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoTecnicoEmail">E-mail</Label>
                  <Input
                    id="contatoTecnicoEmail"
                    name="contatoTecnicoEmail"
                    type="email"
                    value={formData.contatoTecnicoEmail || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoTecnicoEmail: e.target.value,
                      })
                    }
                    placeholder="tecnico@exemplo.com"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoTecnicoTelefone1">Telefone 1</Label>
                  <Input
                    id="contatoTecnicoTelefone1"
                    name="contatoTecnicoTelefone1"
                    value={formData.contatoTecnicoTelefone1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoTecnicoTelefone1: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoTecnicoTelefone2">Telefone 2</Label>
                  <Input
                    id="contatoTecnicoTelefone2"
                    name="contatoTecnicoTelefone2"
                    value={formData.contatoTecnicoTelefone2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoTecnicoTelefone2: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoTecnicoTelefone3">Telefone 3</Label>
                  <Input
                    id="contatoTecnicoTelefone3"
                    name="contatoTecnicoTelefone3"
                    value={formData.contatoTecnicoTelefone3 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoTecnicoTelefone3: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
            </div>

            {/* Contatos Financeiros */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">Contato Financeiro</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoFinanceiroNome">Nome</Label>
                  <Input
                    id="contatoFinanceiroNome"
                    name="contatoFinanceiroNome"
                    value={formData.contatoFinanceiroNome || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoFinanceiroNome: e.target.value,
                      })
                    }
                    placeholder="Nome do contato financeiro"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoFinanceiroEmail">E-mail</Label>
                  <Input
                    id="contatoFinanceiroEmail"
                    name="contatoFinanceiroEmail"
                    type="email"
                    value={formData.contatoFinanceiroEmail || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoFinanceiroEmail: e.target.value,
                      })
                    }
                    placeholder="financeiro@exemplo.com"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contatoFinanceiroTelefone1">Telefone 1</Label>
                  <Input
                    id="contatoFinanceiroTelefone1"
                    name="contatoFinanceiroTelefone1"
                    value={formData.contatoFinanceiroTelefone1 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoFinanceiroTelefone1: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoFinanceiroTelefone2">Telefone 2</Label>
                  <Input
                    id="contatoFinanceiroTelefone2"
                    name="contatoFinanceiroTelefone2"
                    value={formData.contatoFinanceiroTelefone2 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoFinanceiroTelefone2: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoFinanceiroTelefone3">Telefone 3</Label>
                  <Input
                    id="contatoFinanceiroTelefone3"
                    name="contatoFinanceiroTelefone3"
                    value={formData.contatoFinanceiroTelefone3 || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contatoFinanceiroTelefone3: e.target.value,
                      })
                    }
                    placeholder="(00) 00000-0000"
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    ),
    [formData, isCreating, isUpdating, buscarCEP, activeTab, setActiveTab]
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com título e botão de nova entidade */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestão de Entidades</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie as entidades do sistema
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Entidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Entidade</DialogTitle>
              <DialogDescription>
                Preencha as informações da nova entidade
              </DialogDescription>
            </DialogHeader>
            <EntityForm />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
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
        <CardHeader>
          <CardTitle>Pesquisar Entidades</CardTitle>
          <CardDescription>
            Encontre entidades por nome ou CNPJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
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
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              disabled={isLoading}
            >
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
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>{entity.codigo}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{entity.razaoSocial}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entity.cnpj}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {entity.status === "ativo" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <Badge
                            variant={
                              entity.status === "ativo"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              entity.status === "ativo"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {entity.status === "ativo" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{entity.endereco}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{entity.telefone}</span>
                          </div>
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
                                  {entity.razaoSocial}"? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(entity.id)}
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
                  ))}
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Entidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da entidade
            </DialogDescription>
          </DialogHeader>
          <EntityForm />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
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
    </div>
  );
}
