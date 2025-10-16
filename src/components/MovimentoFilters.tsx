import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search, Filter, X, Plus } from "lucide-react";
import { MovimentoFilters } from "../types/movimento";

interface MovimentoFiltersProps {
  filters: MovimentoFilters;
  setFilters: (filters: MovimentoFilters) => void;
  statusOptions: string[];
  onSearch: () => void;
  onClear: () => void;
  onGerarMovimento: () => void;
  isLoading?: boolean;
}

export function MovimentoFiltersComponent({
  filters,
  setFilters,
  statusOptions,
  onSearch,
  onClear,
  onGerarMovimento,
  isLoading = false,
}: MovimentoFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof MovimentoFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: value === "all" ? undefined : value || undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ""
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Menos" : "Mais"}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="numeroContrato">Número do Contrato</Label>
            <Input
              id="numeroContrato"
              placeholder="Digite o número do contrato"
              value={filters.numeroContrato || ""}
              onChange={(e) =>
                handleFilterChange("numeroContrato", e.target.value)
              }
            />
          </div>

          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Digite o nome"
              value={filters.nome || ""}
              onChange={(e) => handleFilterChange("nome", e.target.value)}
            />
          </div>
          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              placeholder="Digite o documento"
              value={filters.documento || ""}
              onChange={(e) => handleFilterChange("documento", e.target.value)}
            />
          </div>

          {isExpanded && (
            <>
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataVencimentoInicio">
                  Data Vencimento (Início)
                </Label>
                <Input
                  id="dataVencimentoInicio"
                  type="date"
                  value={filters.dataVencimentoInicio || ""}
                  onChange={(e) =>
                    handleFilterChange("dataVencimentoInicio", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataVencimentoFim">Data Vencimento (Fim)</Label>
                <Input
                  id="dataVencimentoFim"
                  type="date"
                  value={filters.dataVencimentoFim || ""}
                  onChange={(e) =>
                    handleFilterChange("dataVencimentoFim", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataPagamentoInicio">
                  Data Quitação (Início)
                </Label>
                <Input
                  id="dataPagamentoInicio"
                  type="date"
                  value={filters.dataPagamentoInicio || ""}
                  onChange={(e) =>
                    handleFilterChange("dataPagamentoInicio", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataPagamentoFim">Data Quitação (Fim)</Label>
                <Input
                  id="dataPagamentoFim"
                  type="date"
                  value={filters.dataPagamentoFim || ""}
                  onChange={(e) =>
                    handleFilterChange("dataPagamentoFim", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataLancamentoInicio">
                  Data Lançamento (Início)
                </Label>
                <Input
                  id="dataLancamentoInicio"
                  type="date"
                  value={filters.dataLancamentoInicio || ""}
                  onChange={(e) =>
                    handleFilterChange("dataLancamentoInicio", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="dataLancamentoFim">Data Lançamento (Fim)</Label>
                <Input
                  id="dataLancamentoFim"
                  type="date"
                  value={filters.dataLancamentoFim || ""}
                  onChange={(e) =>
                    handleFilterChange("dataLancamentoFim", e.target.value)
                  }
                />
              </div>
            </>
          )}
          {/* cria duas div vazias, para posicioanro o botão corretamente na ultima div */}
          {!isExpanded && (
            <>
              <div className="space-y-2"></div>
              <div className="space-y-2"></div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onGerarMovimento} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Gerando..." : "Gerar Movimento"}
            </Button>
            <Button onClick={onSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
