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
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Building2 } from "lucide-react";
import { toast } from "sonner";
import { bancoService, Banco } from "../services/banco.service";

interface BancoSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBanco: (banco: Banco) => void;
  title?: string;
}

export function BancoSearchDialog({
  isOpen,
  onClose,
  onSelectBanco,
  title = "Buscar Banco",
}: BancoSearchDialogProps) {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: "",
  });

  // Buscar bancos reais
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bancoService.findAll({
        search: searchParams.search || undefined,
      });

      const bancosData = response.data || [];
      setBancos(bancosData);

      // Se há apenas um banco e não há filtros aplicados, selecionar automaticamente
      if (bancosData.length === 1 && !searchParams.search) {
        toast.success("Banco selecionado automaticamente");
        onSelectBanco(bancosData[0]);
        onClose();
        return;
      }
    } catch (error) {
      console.error("Erro ao buscar bancos:", error);
      toast.error("Erro ao buscar bancos");
    } finally {
      setLoading(false);
    }
  }, [searchParams, onSelectBanco, onClose]);

  useEffect(() => {
    if (isOpen) {
      performSearch();
    }
  }, [isOpen, performSearch]);

  const handleInputChange = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectBanco = (banco: Banco) => {
    onSelectBanco(banco);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Selecione um banco da lista abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Filtros de busca */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Digite o nome do banco..."
                  value={searchParams.search}
                  onChange={(e) => handleInputChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={performSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          {/* Lista de bancos */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Buscando bancos...</p>
                </div>
              </div>
            ) : bancos.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchParams.search
                    ? "Nenhum banco encontrado com os filtros aplicados"
                    : "Nenhum banco encontrado"}
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {bancos.map((banco) => (
                  <Card
                    key={banco.bancoId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectBanco(banco)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{banco.nome}</p>
                            <p className="text-sm text-gray-500">
                              ID: {banco.bancoId}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Banco</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
