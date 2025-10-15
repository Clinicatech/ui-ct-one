import React, { useState, useCallback } from "react";
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
import { Search, User, Building, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  pessoaService,
  Pessoa,
  PessoaSearchParams,
} from "../services/pessoa.service";
import { maskCPF, maskCNPJ } from "../utils/masks";

interface PersonSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson: (person: Pessoa) => void;
  title?: string;
  excludePersonId?: number;
}

export function PersonSearchDialog({
  isOpen,
  onClose,
  onSelectPerson,
  title = "Buscar Pessoa",
  excludePersonId,
}: PersonSearchDialogProps) {
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
    if (!searchParams.documento && !searchParams.nome) {
      toast.error("Informe pelo menos o documento ou nome para pesquisar");
      return;
    }

    setIsLoading(true);
    try {
      const response = await pessoaService.search({
        ...searchParams,
        offset: (currentPage - 1) * (searchParams.limit || 20),
      });

      // Filtrar pessoa excluída se especificada
      let filteredResults = response.data;
      if (excludePersonId) {
        filteredResults = response.data.filter(
          (person) => person.pessoaId !== excludePersonId
        );
      }

      setSearchResults(filteredResults);
      setTotalResults(response.total);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error);
      toast.error("Erro ao buscar pessoas");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, currentPage, excludePersonId]);

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch();
  };

  const handleSelectPerson = (person: Pessoa) => {
    onSelectPerson(person);
    onClose();
  };

  const handleDocumentoChange = (value: string) => {
    const maskedValue =
      searchParams.tipo === "PF" ? maskCPF(value) : maskCNPJ(value);
    setSearchParams((prev) => ({ ...prev, documento: maskedValue }));
  };

  const handleTipoChange = (value: "PF" | "PJ") => {
    setSearchParams((prev) => ({
      ...prev,
      tipo: value,
      documento: "", // Limpar documento ao mudar tipo
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(totalResults / (searchParams.limit || 20));

  const formatDocumento = (documento: string, tipo: "PF" | "PJ") => {
    return tipo === "PF" ? maskCPF(documento) : maskCNPJ(documento);
  };

  const getPersonIcon = (tipo: "PF" | "PJ") => {
    return tipo === "PF" ? (
      <User className="h-4 w-4" />
    ) : (
      <Building className="h-4 w-4" />
    );
  };

  const getPersonTypeLabel = (tipo: "PF" | "PJ") => {
    return tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Busque e selecione uma pessoa existente para preencher
            automaticamente os dados do formulário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Filtros de busca */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={searchParams.tipo || ""}
                onValueChange={handleTipoChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PF">Pessoa Física</SelectItem>
                  <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                placeholder={
                  searchParams.tipo === "PF"
                    ? "000.000.000-00"
                    : searchParams.tipo === "PJ"
                    ? "00.000.000/0000-00"
                    : "CPF ou CNPJ"
                }
                value={searchParams.documento || ""}
                onChange={(e) => handleDocumentoChange(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={searchParams.tipo === "PF" ? 14 : 18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome ou razão social"
                value={searchParams.nome || ""}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, nome: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Botão de busca */}
          <div className="flex justify-center">
            <Button
              onClick={handleSearch}
              disabled={
                isLoading || (!searchParams.documento && !searchParams.nome)
              }
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {totalResults} pessoa(s) encontrada(s)
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1 || isLoading}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma pessoa encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </div>
                </div>
              ) : (
                searchResults.map((person) => (
                  <div
                    key={person.pessoaId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSelectPerson(person)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getPersonIcon(person.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {person.nome}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getPersonTypeLabel(person.tipo)}
                            </Badge>
                          </div>
                          {person.razao && person.tipo === "PJ" && (
                            <p className="text-sm text-gray-600 mb-1">
                              {person.razao}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {formatDocumento(person.documento, person.tipo)}
                          </p>
                          {person.enderecos && person.enderecos.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {person.enderecos[0].cidade},{" "}
                              {person.enderecos[0].uf}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPerson(person);
                        }}
                      >
                        Selecionar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
