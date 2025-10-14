import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Building2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import {
  contasBancariasEntidadesService,
  EntidadeContaBancaria,
} from "../services/contas-bancarias-entidades.service";

interface ContasBancariasEntidadeSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBanco: (banco: EntidadeContaBancaria) => void;
  title?: string;
  entidadeId?: number;
}

export function ContasBancariasEntidadeSearch({
  isOpen,
  onClose,
  onSelectBanco,
  title = "Buscar Conta Bancária",
  entidadeId,
}: ContasBancariasEntidadeSearchProps) {
  const [bancos, setBancos] = useState<EntidadeContaBancaria[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: "",
    tipoConta: "all",
  });

  // Buscar contas bancárias reais
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      let bancosData: EntidadeContaBancaria[] = [];

      if (entidadeId) {
        // Se temos entidadeId, buscar apenas contas dessa entidade
        response = await contasBancariasEntidadesService.findByEntidade(
          entidadeId
        );

        // Aplicar filtros no frontend
        bancosData = response.data || [];

        // Filtro por texto de busca
        if (searchParams.search) {
          const searchTerm = searchParams.search.toLowerCase();
          bancosData = bancosData.filter((banco) => {
            const bancoNome =
              banco.banco?.nome?.toLowerCase() ||
              banco.bancoNome?.toLowerCase() ||
              "";
            const agencia = banco.agencia?.toLowerCase() || "";
            const conta = banco.conta?.toLowerCase() || "";
            return (
              bancoNome.includes(searchTerm) ||
              agencia.includes(searchTerm) ||
              conta.includes(searchTerm)
            );
          });
        }

        // Filtro por tipo de conta
        if (searchParams.tipoConta && searchParams.tipoConta !== "all") {
          bancosData = bancosData.filter(
            (banco) => banco.tipoConta === searchParams.tipoConta
          );
        }
      } else {
        // Fallback: buscar todas as contas (comportamento antigo)
        response = await contasBancariasEntidadesService.findAll({
          search: searchParams.search || undefined,
          tipoConta:
            searchParams.tipoConta && searchParams.tipoConta !== "all"
              ? searchParams.tipoConta
              : undefined,
        });

        // A API já faz o filtro, então usar os dados diretamente
        bancosData = response.data || [];
      }

      setBancos(bancosData);

      // Se há apenas uma conta bancária e não há filtros aplicados, selecionar automaticamente
      if (
        bancosData.length === 1 &&
        !searchParams.search &&
        searchParams.tipoConta === "all"
      ) {
        toast.success("Conta bancária selecionada automaticamente");
        onSelectBanco(bancosData[0]);
        onClose();
        return;
      }
    } catch (error) {
      console.error("Erro ao buscar contas bancárias:", error);
      toast.error("Erro ao buscar contas bancárias");
    } finally {
      setLoading(false);
    }
  }, [searchParams, onSelectBanco, onClose, entidadeId]);

  useEffect(() => {
    if (isOpen) {
      performSearch();
    }
  }, [isOpen, performSearch]);

  const handleInputChange = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectBanco = (banco: EntidadeContaBancaria) => {
    onSelectBanco(banco);
    onClose();
  };

  const getTipoContaLabel = (tipo: string) => {
    switch (tipo) {
      case "CORRENTE":
        return "Conta Corrente";
      case "POUPANCA":
        return "Poupança";
      case "SALARIO":
        return "Conta Salário";
      default:
        return tipo;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Selecione uma conta bancária para o contrato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Banco, agência, conta..."
                  value={searchParams.search}
                  onChange={(e) => handleInputChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select
                value={searchParams.tipoConta}
                onValueChange={(value) => handleInputChange("tipoConta", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="CORRENTE">Conta Corrente</SelectItem>
                  <SelectItem value="POUPANCA">Poupança</SelectItem>
                  <SelectItem value="SALARIO">Conta Salário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de resultados */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Buscando contas bancárias...
                </p>
              </div>
            ) : bancos.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhuma conta bancária encontrada
                </p>
              </div>
            ) : (
              bancos.map((banco) => (
                <Card
                  key={banco.entidadeContaBancariaId}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectBanco(banco)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {banco.banco?.nome ||
                                banco.bancoNome ||
                                "Nome não disponível"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Código:{" "}
                              {banco.banco?.bancoId
                                ?.toString()
                                .padStart(3, "0") || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p>
                            <span className="font-medium">Agência:</span>{" "}
                            {banco.agencia}
                          </p>
                          <p>
                            <span className="font-medium">Conta:</span>{" "}
                            {banco.conta}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            banco.tipoConta === "CORRENTE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {getTipoContaLabel(banco.tipoConta || "")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
