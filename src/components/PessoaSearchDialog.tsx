import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { Search, User, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  pessoaService,
  Pessoa,
  PessoaSearchParams,
} from "../services/pessoa.service";
import { ClienteService } from "../services/cliente.service";
import { parceiroService } from "../services/parceiro.service";
import { socioService } from "../services/socio.service";
import { maskCPF, maskCNPJ } from "../utils/masks";

interface PessoaSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPessoa: (pessoa: Pessoa) => void;
  title?: string;
  tipoPessoa?: "cliente" | "parceiro" | "socio";
  excludePessoaId?: number;
}

export function PessoaSearchDialog({
  isOpen,
  onClose,
  onSelectPessoa,
  title = "Buscar Pessoa",
  tipoPessoa,
  excludePessoaId: _excludePessoaId,
}: PessoaSearchDialogProps) {
  const [searchParams, setSearchParams] = useState<PessoaSearchParams>({
    documento: "",
    nome: "",
    tipo: undefined,
    limit: 20,
    offset: 0,
  });
  const [searchResults, setSearchResults] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const performSearch = useCallback(async () => {
    if (!searchParams.nome && !searchParams.documento) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    try {
      let results;

      // Usar endpoint específico baseado no tipo de pessoa
      switch (tipoPessoa) {
        case "cliente":
          results = await ClienteService.findAll();
          // Filtrar clientes baseado nos parâmetros de busca
          const clientesFiltrados = results.filter((cliente: any) => {
            const nomeMatch =
              !searchParams.nome ||
              cliente.pessoa?.nome
                ?.toLowerCase()
                .includes(searchParams.nome.toLowerCase());
            const documentoMatch =
              !searchParams.documento ||
              cliente.pessoa?.documento?.includes(searchParams.documento);
            const tipoMatch =
              !searchParams.tipo || cliente.pessoa?.tipo === searchParams.tipo;

            return nomeMatch && documentoMatch && tipoMatch;
          });

          setSearchResults(
            clientesFiltrados.map((cliente: any) => ({
              pessoaId: cliente.pessoa.pessoaId,
              nome: cliente.pessoa.nome,
              razao: cliente.pessoa.razao,
              documento: cliente.pessoa.documento,
              tipo: cliente.pessoa.tipo,
              entidadeId: cliente.pessoa.entidadeId,
              inscricaoEstadual: cliente.pessoa.inscricaoEstadual,
              inscricaoMunicipal: cliente.pessoa.inscricaoMunicipal,
              enderecos: cliente.pessoa.enderecos,
              dadosBancarios: cliente.pessoa.dadosBancarios,
              clienteInfoId: cliente.clienteInfoId, // ✅ Incluir ID do cliente
            }))
          );
          setTotalResults(clientesFiltrados.length);
          break;

        case "parceiro":
          results = await parceiroService.findAll();
          // Filtrar parceiros baseado nos parâmetros de busca
          const parceirosFiltrados = results.data.filter((parceiro: any) => {
            const nomeMatch =
              !searchParams.nome ||
              parceiro.pessoa?.nome
                ?.toLowerCase()
                .includes(searchParams.nome.toLowerCase());
            const documentoMatch =
              !searchParams.documento ||
              parceiro.pessoa?.documento?.includes(searchParams.documento);
            const tipoMatch =
              !searchParams.tipo || parceiro.pessoa?.tipo === searchParams.tipo;

            return nomeMatch && documentoMatch && tipoMatch;
          });

          setSearchResults(
            parceirosFiltrados.map((parceiro: any) => ({
              pessoaId: parceiro.pessoa.pessoaId,
              nome: parceiro.pessoa.nome,
              razao: parceiro.pessoa.razao,
              documento: parceiro.pessoa.documento,
              tipo: parceiro.pessoa.tipo,
              entidadeId: parceiro.pessoa.entidadeId,
              inscricaoEstadual: parceiro.pessoa.inscricaoEstadual,
              inscricaoMunicipal: parceiro.pessoa.inscricaoMunicipal,
              enderecos: parceiro.pessoa.enderecos,
              dadosBancarios: parceiro.pessoa.dadosBancarios,
              parceiroInfoId: parceiro.parceiroInfoId, // ✅ Incluir ID do parceiro
            }))
          );
          setTotalResults(parceirosFiltrados.length);
          break;

        case "socio":
          results = await socioService.findAll();
          // Filtrar sócios baseado nos parâmetros de busca
          const sociosFiltrados = results.data.filter((socio: any) => {
            const nomeMatch =
              !searchParams.nome ||
              socio.pessoa?.nome
                ?.toLowerCase()
                .includes(searchParams.nome.toLowerCase());
            const documentoMatch =
              !searchParams.documento ||
              socio.pessoa?.documento?.includes(searchParams.documento);
            const tipoMatch =
              !searchParams.tipo || socio.pessoa?.tipo === searchParams.tipo;

            return nomeMatch && documentoMatch && tipoMatch;
          });

          setSearchResults(
            sociosFiltrados.map((socio: any) => ({
              pessoaId: socio.pessoa.pessoaId,
              nome: socio.pessoa.nome,
              razao: socio.pessoa.razao,
              documento: socio.pessoa.documento,
              tipo: socio.pessoa.tipo,
              entidadeId: socio.pessoa.entidadeId,
              inscricaoEstadual: socio.pessoa.inscricaoEstadual,
              inscricaoMunicipal: socio.pessoa.inscricaoMunicipal,
              enderecos: socio.pessoa.enderecos,
              dadosBancarios: socio.pessoa.dadosBancarios,
              socioInfoId: socio.socioInfoId, // ✅ Incluir ID do sócio
            }))
          );
          setTotalResults(sociosFiltrados.length);
          break;

        default:
          // Fallback para busca geral de pessoas
          const pessoaResults = await pessoaService.search(searchParams);
          setSearchResults(pessoaResults.data);
          setTotalResults(pessoaResults.total);
          break;
      }
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
      toast.error("Erro ao buscar pessoas");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, tipoPessoa]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchParams((prev) => ({ ...prev, offset: 0 }));
    performSearch();
  };

  const handleSelectPessoa = (pessoa: Pessoa) => {
    onSelectPessoa(pessoa);
    onClose();
  };

  const handleInputChange = (
    field: keyof PessoaSearchParams,
    value: string
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
      offset: 0,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * (searchParams.limit || 20);
    setSearchParams((prev) => ({ ...prev, offset: newOffset }));
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalResults / (searchParams.limit || 20));

  const getTipoPessoaLabel = () => {
    switch (tipoPessoa) {
      case "cliente":
        return "Cliente";
      case "parceiro":
        return "Parceiro";
      case "socio":
        return "Sócio";
      default:
        return "Pessoa";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {tipoPessoa ? `Buscar ${getTipoPessoaLabel()}` : title}
          </DialogTitle>
          <DialogDescription>
            {tipoPessoa
              ? `Busque e selecione um ${getTipoPessoaLabel().toLowerCase()} para o contrato`
              : "Busque e selecione uma pessoa"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filtros de busca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Digite o nome..."
                value={searchParams.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                placeholder="CPF ou CNPJ..."
                value={searchParams.documento}
                onChange={(e) => {
                  const value = e.target.value;
                  const maskedValue =
                    value.length <= 14 ? maskCPF(value) : maskCNPJ(value);
                  handleInputChange("documento", maskedValue);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={searchParams.tipo || "all"}
                onValueChange={(value) =>
                  handleInputChange("tipo", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>

          {/* Resultados */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {totalResults} resultado(s) encontrado(s)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Buscando...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <Search className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhum resultado encontrado</p>
                  <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((pessoa) => (
                    <div
                      key={pessoa.pessoaId}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectPessoa(pessoa)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {pessoa.tipo === "PF" ? (
                              <User className="w-8 h-8 text-blue-600" />
                            ) : (
                              <Building className="w-8 h-8 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{pessoa.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              {pessoa.documento}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              pessoa.tipo === "PF" ? "default" : "secondary"
                            }
                          >
                            {pessoa.tipo === "PF"
                              ? "Pessoa Física"
                              : "Pessoa Jurídica"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Selecionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
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
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
