import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { movimentoService } from "../services/movimento.service";

interface MovimentoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimento: any;
  tipo: "receita" | "despesa";
}

export function MovimentoDetailsModal({
  isOpen,
  onClose,
  movimento,
  tipo,
}: MovimentoDetailsModalProps) {
  if (!movimento) return null;

  const getTipoContratoTitle = (tipoContrato: string) => {
    switch (tipoContrato) {
      case "S":
        return "Sócio";
      case "P":
        return "Parceiro";
      case "C":
        return "Cliente";
      default:
        return "Cliente";
    }
  };

  const getStatusBadge = (status: string) => {
    const colorClass = movimentoService.getStatusColor(status);
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return movimentoService.formatCurrency(value);
  };

  const formatDate = (date: string) => {
    return movimentoService.formatDate(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes da {tipo === "receita" ? "Receita" : "Despesa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">{getStatusBadge(movimento.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID do Movimento
                  </label>
                  <div className="mt-1">{movimento.movimentoId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data de Vencimento
                  </label>
                  <div className="mt-1">
                    {formatDate(movimento.dataVencimento)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Data da Quitação
                  </label>
                  <div className="mt-1">
                    {movimento.dataPagamento
                      ? formatDate(movimento.dataPagamento)
                      : "Não pago"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Pago
                  </label>
                  <div className="mt-1">
                    <Badge variant={movimento.pago ? "default" : "secondary"}>
                      {movimento.pago ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dias de Atraso
                  </label>
                  <div className="mt-1">{movimento.diasAtraso} dias</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor Original
                  </label>
                  <div className="mt-1 text-lg font-semibold">
                    {formatCurrency(movimento.valor)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor Efetivo
                  </label>
                  <div className="mt-1 text-lg font-semibold">
                    {movimento.valorEfetivo
                      ? formatCurrency(movimento.valorEfetivo)
                      : "Não informado"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Juros
                  </label>
                  <div className="mt-1">
                    {movimento.juros
                      ? formatCurrency(movimento.juros)
                      : "R$ 0,00"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mora
                  </label>
                  <div className="mt-1">
                    {movimento.mora
                      ? formatCurrency(movimento.mora)
                      : "R$ 0,00"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor dos Juros
                  </label>
                  <div className="mt-1">
                    {formatCurrency(movimento.vrJuros)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor da Mora
                  </label>
                  <div className="mt-1">{formatCurrency(movimento.vrMora)}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Valor Total com Correções
                  </label>
                  <div className="mt-1 text-xl font-bold text-green-600">
                    {formatCurrency(movimento.valorTotalComCorrecoes)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {getTipoContratoTitle(movimento.tipoContrato)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nome
                  </label>
                  <div className="mt-1">{movimento.nome}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Documento
                  </label>
                  <div className="mt-1">{movimento.documento}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Número do Contrato
                  </label>
                  <div className="mt-1">{movimento.numeroContrato}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID do Contrato
                  </label>
                  <div className="mt-1">{movimento.contratoId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Descrição do Contrato
                  </label>
                  <div className="mt-1">{movimento.contrato}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipo do Contrato
                  </label>
                  <div className="mt-1">{movimento.tipoContrato}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor do Contrato
                  </label>
                  <div className="mt-1">
                    {formatCurrency(movimento.valorContrato)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Contrato Ativo
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        movimento.contratoAtivo ? "default" : "secondary"
                      }
                    >
                      {movimento.contratoAtivo ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID do Item do Contrato
                  </label>
                  <div className="mt-1">{movimento.contratoItemId}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gerar Boleto
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={movimento.gerarBoleto ? "default" : "secondary"}
                    >
                      {movimento.gerarBoleto ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Descrição do Movimento
                </label>
                <div className="mt-1">{movimento.descricao}</div>
              </div>
            </CardContent>
          </Card>

          {movimento.urlComprovante && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comprovante</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Comprovante Disponível
                  </label>
                  <div className="mt-1">
                    <Badge variant="default">Sim</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
