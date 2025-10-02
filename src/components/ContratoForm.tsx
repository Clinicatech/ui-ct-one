import React, { useState, useEffect, useCallback } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, List, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { PessoaSearchDialog } from "./PessoaSearchDialog";
import { Pessoa } from "../services/pessoa.service";
import { BancoSearchDialog } from "./BancoSearchDialog";
import { EntidadeContaBancaria, bancoService } from "../services/banco.service";

// Funções para máscara de valor
const formatCurrency = (value: number): string => {
  if (value === 0) return "0,00";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove tudo exceto números, vírgulas e pontos
  const cleanValue = value.replace(/[^\d,.-]/g, "");
  // Substitui vírgula por ponto para parseFloat
  const normalizedValue = cleanValue.replace(",", ".");
  const parsed = parseFloat(normalizedValue) || 0;
  return Math.round(parsed * 100) / 100; // Arredonda para 2 casas decimais
};

// Função para buscar contas bancárias de uma entidade
const buscarContasBancariasEntidade = async (
  entidadeId: number
): Promise<EntidadeContaBancaria[]> => {
  try {
    const response = await bancoService.findByEntidade(entidadeId);
    return response.data || [];
  } catch (error) {
    console.error(
      "❌ buscarContasBancariasEntidade - Erro ao buscar contas bancárias da entidade:",
      error
    );
    toast.error("Erro ao buscar contas bancárias da entidade");
    return [];
  }
};

// Tipos
interface Contrato {
  contratoId: number;
  numeroContrato?: string;
  descricao?: string;
  valor: number;
  ativo?: boolean;
  tipoContrato?: string;
  urlContrato?: string;
  cliente?: any;
  parceiro?: any;
  socio?: any;
  tipo?: any;
  itens?: ContratoItem[];
}

interface ContratoTipo {
  contratoTipoId: number;
  descricao: string;
  recorrente: boolean;
  tipo: string;
}

interface ContratoItem {
  descricao: string;
  valor: number;
  dataIni: string;
  dataFim?: string;
  diaVencimento: number;
  ativo: boolean;
  gerarBoleto: boolean;
  juros: number;
  mora: number;
  instrucoesBanco?: string;
  operacao?: string;
  entidadeContaBancariaId?: number;
  mesVencimento: number;
  anoVencimento: number;
  contaBancaria?: EntidadeContaBancaria;
}

interface ContratoFormData {
  numeroContrato?: string;
  clienteInfoId?: number;
  parceiroInfoId?: number;
  socioInfoId?: number;
  contratoTipoId: number;
  descricao: string;
  valor: number;
  ativo: boolean;
  urlContrato?: string;
  itens: ContratoItem[];
}

interface ContratoFormProps {
  contrato?: Contrato | null;
  contratoTipos: ContratoTipo[];
  onSubmit: (data: ContratoFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ContratoForm({
  contrato,
  contratoTipos,
  onSubmit,
  onCancel,
  isSubmitting,
}: ContratoFormProps) {
  const [activeTab, setActiveTab] = useState("contrato");
  const [formData, setFormData] = useState<ContratoFormData>({
    numeroContrato: "",
    clienteInfoId: undefined,
    parceiroInfoId: undefined,
    socioInfoId: undefined,
    contratoTipoId: contrato?.tipo?.contratoTipoId || 0,
    descricao: "",
    valor: 0,
    ativo: true,
    urlContrato: "",
    itens: [],
  });

  const [selectedTipoPessoa, setSelectedTipoPessoa] = useState<
    "cliente" | "parceiro" | "socio" | ""
  >("");
  const [selectedContratoTipo, setSelectedContratoTipo] =
    useState<ContratoTipo | null>(null);
  const [isPessoaSearchOpen, setIsPessoaSearchOpen] = useState(false);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [isBancoSearchOpen, setIsBancoSearchOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [entidadeTemApenasUmaConta, setEntidadeTemApenasUmaConta] =
    useState(false);

  // Armazenar a pessoa original para restaurar se necessário
  const [originalPessoa, setOriginalPessoa] = useState<Pessoa | null>(null);
  const [originalTipoPessoa, setOriginalTipoPessoa] = useState<
    "cliente" | "parceiro" | "socio" | ""
  >("");

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Inicializar dados do formulário
  useEffect(() => {
    if (contrato) {
      const contratoTipoId = contrato.tipo?.contratoTipoId || 0;
      setFormData({
        numeroContrato: contrato.numeroContrato || "",
        clienteInfoId: contrato.cliente?.clienteInfoId,
        parceiroInfoId: contrato.parceiro?.parceiroInfoId,
        socioInfoId: contrato.socio?.socioInfoId,
        contratoTipoId: contratoTipoId,
        descricao: contrato.descricao || "",
        valor: contrato.valor,
        ativo: contrato.ativo ?? true,
        urlContrato: contrato.urlContrato || "",
        itens: (contrato.itens || []).map((item) => ({
          ...item,
          contaBancaria: item.contaBancaria || undefined,
        })),
      });

      // Determinar tipo de pessoa e carregar pessoa selecionada
      if (contrato.cliente) {
        setSelectedTipoPessoa("cliente");
        setSelectedPessoa(contrato.cliente);
        setOriginalTipoPessoa("cliente");
        setOriginalPessoa(contrato.cliente);
      } else if (contrato.parceiro) {
        setSelectedTipoPessoa("parceiro");
        setSelectedPessoa(contrato.parceiro);
        setOriginalTipoPessoa("parceiro");
        setOriginalPessoa(contrato.parceiro);
      } else if (contrato.socio) {
        setSelectedTipoPessoa("socio");
        setSelectedPessoa(contrato.socio);
        setOriginalTipoPessoa("socio");
        setOriginalPessoa(contrato.socio);
      }

      // Determinar tipo de contrato
      if (contrato.tipo) {
        setSelectedContratoTipo(contrato.tipo);
      }
    }
  }, [contrato]);

  // Atualizar tipo de contrato selecionado
  useEffect(() => {
    if (formData.contratoTipoId > 0) {
      const tipo = contratoTipos.find(
        (t) => t.contratoTipoId === formData.contratoTipoId
      );
      setSelectedContratoTipo(tipo || null);
    }
  }, [formData.contratoTipoId, contratoTipos]);

  // Calcular valor total dos itens
  const valorTotal = formData.itens.reduce((sum, item) => sum + item.valor, 0);

  // Atualizar valor total quando itens mudarem
  useEffect(() => {
    setFormData((prev) => ({ ...prev, valor: valorTotal }));
  }, [valorTotal]);

  const handleInputChange = (field: keyof ContratoFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTipoPessoaChange = (tipo: "cliente" | "parceiro" | "socio") => {
    // Só limpar se o tipo realmente mudou
    if (selectedTipoPessoa !== tipo) {
      setSelectedTipoPessoa(tipo);

      // Se voltar ao tipo original, restaurar a pessoa original
      if (tipo === originalTipoPessoa && originalPessoa) {
        setSelectedPessoa(originalPessoa);
        // Restaurar o ID correto no formData
        if (tipo === "cliente") {
          setFormData((prev) => ({
            ...prev,
            clienteInfoId: (originalPessoa as any).clienteInfoId,
          }));
        } else if (tipo === "parceiro") {
          setFormData((prev) => ({
            ...prev,
            parceiroInfoId: (originalPessoa as any).parceiroInfoId,
          }));
        } else if (tipo === "socio") {
          setFormData((prev) => ({
            ...prev,
            socioInfoId: (originalPessoa as any).socioInfoId,
          }));
        }
      } else {
        setSelectedPessoa(null);
        setFormData((prev) => ({
          ...prev,
          clienteInfoId: undefined,
          parceiroInfoId: undefined,
          socioInfoId: undefined,
        }));
      }

      setHasUnsavedChanges(true);
    }
  };

  const handleSelectPessoa = (pessoa: Pessoa) => {
    setSelectedPessoa(pessoa);
    // Aqui você precisaria buscar o ID específico (clienteInfoId, parceiroInfoId, socioInfoId)
    // baseado no tipo de pessoa selecionado
    // Por enquanto, vamos simular
    if (selectedTipoPessoa === "cliente") {
      setFormData((prev) => ({ ...prev, clienteInfoId: 1 })); // Simulado
    } else if (selectedTipoPessoa === "parceiro") {
      setFormData((prev) => ({ ...prev, parceiroInfoId: 1 })); // Simulado
    } else if (selectedTipoPessoa === "socio") {
      setFormData((prev) => ({ ...prev, socioInfoId: 1 })); // Simulado
    }
    setHasUnsavedChanges(true);
  };

  // Verificar se a entidade tem apenas uma conta quando uma pessoa é selecionada
  useEffect(() => {
    const verificarContas = async () => {
      if (selectedPessoa) {
        // Se a entidade é sempre a do usuário logado, usar uma entidade fixa por enquanto
        // Em produção, isso deveria vir do contexto de autenticação
        const entidadeId = selectedPessoa.entidadeId || 48; // Fallback para entidade 48

        const temApenasUma = await verificarContasBancariasEntidade(entidadeId);
        setEntidadeTemApenasUmaConta(temApenasUma);
      } else {
        setEntidadeTemApenasUmaConta(false);
      }
    };

    verificarContas();
  }, [selectedPessoa]);

  const handleOpenBancoSearch = async (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);

    // Se há uma pessoa selecionada, buscar suas contas bancárias
    if (selectedPessoa) {
      try {
        const entidadeId = selectedPessoa.entidadeId;

        const contasBancarias = await buscarContasBancariasEntidade(entidadeId);

        if (contasBancarias.length === 1) {
          // Se há apenas uma conta, selecionar automaticamente
          handleSelectBanco(contasBancarias[0]);
          toast.success("Conta bancária selecionada automaticamente");
          return;
        } else if (contasBancarias.length > 1) {
          // Se há múltiplas contas, abrir modal para seleção
          setIsBancoSearchOpen(true);
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar contas bancárias:", error);
      }
    }

    // Se não há pessoa selecionada ou erro, abrir modal normal
    setIsBancoSearchOpen(true);
  };

  // Função para verificar se a entidade tem apenas uma conta bancária
  const verificarContasBancariasEntidade = async (
    entidadeId: number
  ): Promise<boolean> => {
    try {
      const contasBancarias = await buscarContasBancariasEntidade(entidadeId);
      return contasBancarias.length === 1;
    } catch (error) {
      console.error("Erro ao verificar contas bancárias:", error);
      return false;
    }
  };

  const handleSelectBanco = (banco: EntidadeContaBancaria) => {
    if (currentItemIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        itens: prev.itens.map((item, index) =>
          index === currentItemIndex
            ? {
                ...item,
                entidadeContaBancariaId: banco.entidadeContaBancariaId,
                contaBancaria: banco,
              }
            : item
        ),
      }));
      setHasUnsavedChanges(true);
    }
    setIsBancoSearchOpen(false);
    setCurrentItemIndex(null);
  };

  const handleAddItem = () => {
    const newItem: ContratoItem = {
      descricao: "",
      valor: 0,
      dataIni: new Date().toISOString().split("T")[0],
      dataFim: "",
      diaVencimento: 1,
      ativo: true,
      gerarBoleto: false,
      juros: 0,
      mora: 0,
      instrucoesBanco: "",
      operacao: selectedContratoTipo?.tipo === "R" ? "C" : "D",
      entidadeContaBancariaId: undefined,
      mesVencimento: 0,
      anoVencimento: 0,
      contaBancaria: undefined,
    };

    setFormData((prev) => ({
      ...prev,
      itens: [...prev.itens, newItem],
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  const handleItemChange = (
    index: number,
    field: keyof ContratoItem,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!selectedTipoPessoa) {
      toast.error("Selecione o tipo de pessoa");
      return;
    }

    if (!formData.contratoTipoId) {
      toast.error("Selecione o tipo de contrato");
      return;
    }

    if (!formData.descricao.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (formData.itens.length === 0) {
      toast.error("Adicione pelo menos um item ao contrato");
      return;
    }

    // Validar itens
    for (const item of formData.itens) {
      if (!item.descricao.trim()) {
        toast.error("Descrição do item é obrigatória");
        return;
      }
      if (item.valor <= 0) {
        toast.error("Valor do item deve ser maior que zero");
        return;
      }
      if (!item.dataIni) {
        toast.error("Data de início do item é obrigatória");
        return;
      }
    }

    onSubmit(formData);
    setHasUnsavedChanges(false);
  };

  // Função para fechar dialog com verificação de alterações
  const handleCloseDialog = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      onCancel?.();
    }
  }, [hasUnsavedChanges, onCancel]);

  // Função para fechar dialog forçadamente (sem verificação)
  const handleForceClose = useCallback(() => {
    setHasUnsavedChanges(false);
    setShowCloseConfirmation(false);
    onCancel?.();
  }, [onCancel]);

  // Função para descartar alterações
  const handleDiscardChanges = useCallback(() => {
    setShowCloseConfirmation(false);
    setHasUnsavedChanges(false);
    onCancel?.();
  }, [onCancel]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contrato" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contrato
            </TabsTrigger>
            <TabsTrigger value="itens" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Itens ({formData.itens.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba 1: Contrato */}
          <TabsContent value="contrato" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de Pessoa */}
                <div className="space-y-2 border border-gray-300 rounded-md p-2 min-w-[30%] max-w-[40%]">
                  <Label>Tipo de Pessoa *</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={
                        selectedTipoPessoa === "cliente"
                          ? "default"
                          : "secondary"
                      }
                      onClick={() => handleTipoPessoaChange("cliente")}
                      className={
                        selectedTipoPessoa === "cliente"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      Cliente
                    </Button>
                    <Button
                      type="button"
                      variant={
                        selectedTipoPessoa === "parceiro"
                          ? "default"
                          : "secondary"
                      }
                      onClick={() => handleTipoPessoaChange("parceiro")}
                      className={
                        selectedTipoPessoa === "parceiro"
                          ? "bg-blue-600 hover:bg-blue-500"
                          : ""
                      }
                    >
                      Parceiro
                    </Button>
                    <Button
                      type="button"
                      variant={
                        selectedTipoPessoa === "socio" ? "default" : "secondary"
                      }
                      onClick={() => handleTipoPessoaChange("socio")}
                      className={
                        selectedTipoPessoa === "socio"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      Sócio
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ativo"
                        checked={formData.ativo}
                        onCheckedChange={(checked) =>
                          handleInputChange("ativo", checked)
                        }
                      />
                      <Label htmlFor="ativo">Contrato ativo</Label>
                    </div>
                  </div>
                </div>

                {/* Seleção da Pessoa */}
                {selectedTipoPessoa && (
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label>
                      Selecionar{" "}
                      {selectedTipoPessoa === "cliente"
                        ? "Cliente"
                        : selectedTipoPessoa === "parceiro"
                        ? "Parceiro"
                        : "Sócio"}{" "}
                      *
                    </Label>
                    <Button
                      type="button"
                      className="w-full justify-start"
                      onClick={() => setIsPessoaSearchOpen(true)}
                    >
                      {selectedPessoa
                        ? selectedPessoa.nome
                        : `Selecionar ${
                            selectedTipoPessoa === "cliente"
                              ? "Cliente"
                              : selectedTipoPessoa === "parceiro"
                              ? "Parceiro"
                              : "Sócio"
                          }`}
                    </Button>
                  </div>
                )}

                {/* Tipo de Contrato */}
                <div className="space-y-2 border border-gray-300 rounded-md p-2 max-w-[40%]">
                  <Label>Tipo de Contrato *</Label>
                  <Select
                    value={
                      formData.contratoTipoId && formData.contratoTipoId > 0
                        ? formData.contratoTipoId.toString()
                        : ""
                    }
                    onValueChange={(value) => {
                      const numValue = parseInt(value) || 0;
                      handleInputChange("contratoTipoId", numValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {contratoTipos.map((tipo) => {
                        const tipoId = tipo.contratoTipoId;
                        return (
                          <SelectItem
                            key={tipoId}
                            value={tipoId?.toString() || "0"}
                          >
                            <div className="flex items-center gap-2">
                              <span>{tipo.descricao}</span>
                              <Badge
                                variant={
                                  tipo.tipo === "R" ? "default" : "destructive"
                                }
                              >
                                {tipo.tipo === "R" ? "Receita" : "Despesa"}
                              </Badge>
                              {tipo.recorrente && (
                                <Badge variant="outline">Recorrente</Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Descrição */}
                <div className="space-y-2 border border-gray-300 rounded-md p-2 ">
                  <Label>Descrição *</Label>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      handleInputChange("descricao", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {/* URL do Contrato */}
                <div className="space-y-2 border border-gray-300 rounded-md p-2 ">
                  <Label>URL do Contrato</Label>
                  <Input
                    value={formData.urlContrato}
                    onChange={(e) =>
                      handleInputChange("urlContrato", e.target.value)
                    }
                  />
                </div>

                {/* Valor Total */}
                <div className="space-y-2 border border-gray-300 rounded-md p-2 max-w-[40%]">
                  <Label>
                    Valor do contrato (calculado automaticamente pela soma dos
                    itens)
                  </Label>
                  <Input
                    value={`R$ ${formatCurrency(formData.valor)}`}
                    disabled
                    className="bg-green-500 font-bold text-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 2: Itens do Contrato */}
          <TabsContent value="itens" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Itens do Contrato</CardTitle>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.itens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum item adicionado</p>
                    <p className="text-sm">
                      Clique em "Adicionar Item" para começar
                    </p>
                  </div>
                ) : (
                  (formData.itens || []).map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Item {index + 1}
                          </CardTitle>
                          {/* Status do Item */}
                          <div className="flex items-end justify-end space-x-2 bg-gray-200 p-2">
                            <Checkbox
                              id={`ativo-${index}`}
                              checked={item.ativo}
                              onCheckedChange={(checked) =>
                                handleItemChange(index, "ativo", checked)
                              }
                            />
                            <Label htmlFor={`ativo-${index}`}>Item ativo</Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 border border-gray-300 rounded-md p-2">
                          {/* Descrição */}
                          <div className="space-y-2">
                            <Label>Descrição *</Label>
                            <Input
                              value={item.descricao}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "descricao",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-300 rounded-md p-2">
                          {/* Valor */}
                          <div className="space-y-2">
                            <Label>Valor *</Label>
                            <Input
                              value={formatCurrency(item.valor || 0)}
                              onChange={(e) => {
                                const parsedValue = parseCurrency(
                                  e.target.value
                                );
                                handleItemChange(index, "valor", parsedValue);
                              }}
                              placeholder="0,00"
                            />
                          </div>

                          {/* Data Início */}
                          <div className="space-y-2">
                            <Label>Data de Início *</Label>
                            <Input
                              type="date"
                              value={item.dataIni}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "dataIni",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Data Fim */}
                          <div className="space-y-2">
                            <Label>Data de Fim</Label>
                            <Input
                              type="date"
                              value={item.dataFim}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "dataFim",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Dia de Vencimento */}
                          <div className="space-y-2">
                            <Label>Dia de Vencimento *</Label>
                            <Input
                              type="number"
                              min="1"
                              max="28"
                              value={item.diaVencimento || 1}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "diaVencimento",
                                  parseInt(e.target.value) || 1
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-300 rounded-md p-2">
                          {/* Mês de Vencimento (se recorrente) */}
                          {selectedContratoTipo?.recorrente && (
                            <div className="space-y-2">
                              <Label>Mês de Vencimento</Label>
                              <Select
                                value={item.mesVencimento?.toString() || "0"}
                                onValueChange={(value) =>
                                  handleItemChange(
                                    index,
                                    "mesVencimento",
                                    parseInt(value)
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o mês" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem
                                      key={i + 1}
                                      value={(i + 1).toString()}
                                    >
                                      {new Date(0, i).toLocaleString("pt-BR", {
                                        month: "long",
                                      })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Ano de Vencimento (se recorrente) */}
                          {selectedContratoTipo?.recorrente && (
                            <div className="space-y-2">
                              <Label>Ano de Vencimento</Label>
                              <Input
                                type="number"
                                min={new Date().getFullYear()}
                                value={item.anoVencimento || 0}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "anoVencimento",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="Deixe vazio para recorrente"
                              />
                            </div>
                          )}

                          {/* Juros */}
                          <div className="space-y-2">
                            <Label>Juros (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.juros || 0}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "juros",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>

                          {/* Mora */}
                          <div className="space-y-2">
                            <Label>Mora (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.mora || 0}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "mora",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 border border-gray-300 rounded-md p-2">
                          {/* Gerar Boleto */}
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`gerarBoleto-${index}`}
                              checked={item.gerarBoleto}
                              onCheckedChange={(checked) =>
                                handleItemChange(index, "gerarBoleto", checked)
                              }
                            />
                            <Label htmlFor={`gerarBoleto-${index}`}>
                              Gerar boleto para este item
                            </Label>
                          </div>

                          {/* Instruções do Banco (se gerar boleto) */}
                          {item.gerarBoleto && (
                            <div className="space-y-2">
                              <Label>Instruções do Banco</Label>
                              <Textarea
                                value={item.instrucoesBanco}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "instrucoesBanco",
                                    e.target.value
                                  )
                                }
                                placeholder="Instruções para o banco..."
                                rows={2}
                              />
                            </div>
                          )}

                          {/* Conta Bancária */}
                          <div className="space-y-2">
                            <Label>Conta Bancária</Label>
                            <div className="flex gap-2">
                              <Input
                                value={
                                  item.contaBancaria &&
                                  item.contaBancaria.bancoNome
                                    ? `${item.contaBancaria.bancoNome} - ${item.contaBancaria.agencia}/${item.contaBancaria.conta}`
                                    : ""
                                }
                                placeholder="Selecione uma conta bancária"
                                readOnly
                                className="flex-1"
                              />
                              {(() => {
                                // Se a entidade tem apenas uma conta, não mostrar botão
                                if (entidadeTemApenasUmaConta) {
                                  return null;
                                }

                                // Se a entidade tem múltiplas contas, mostrar botão
                                return item.contaBancaria ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      handleOpenBancoSearch(index);
                                    }}
                                  >
                                    Alterar
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      handleOpenBancoSearch(index);
                                    }}
                                  >
                                    Selecionar
                                  </Button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        {/* Conta Bancária (se operação for débito) */}
                        {selectedContratoTipo?.tipo === "D" && (
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 border border-gray-300 rounded-md p-2">
                            <Label>Conta Bancária *</Label>
                            <Button
                              type="button"
                              className="w-full justify-start"
                              onClick={() => {
                                // TODO: Abrir modal de seleção de conta bancária
                                toast.info(
                                  "Modal de seleção de conta bancária será implementado"
                                );
                              }}
                            >
                              Selecionar conta bancária
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Salvando..." : contrato ? "Atualizar" : "Criar"}{" "}
            Contrato
          </Button>
        </div>
      </form>

      {/* Modal de pesquisa de pessoa */}
      <PessoaSearchDialog
        isOpen={isPessoaSearchOpen}
        onClose={() => setIsPessoaSearchOpen(false)}
        onSelectPessoa={handleSelectPessoa}
        title={`Buscar ${
          selectedTipoPessoa === "cliente"
            ? "Cliente"
            : selectedTipoPessoa === "parceiro"
            ? "Parceiro"
            : "Sócio"
        }`}
        tipoPessoa={selectedTipoPessoa || undefined}
      />

      <BancoSearchDialog
        isOpen={isBancoSearchOpen}
        onClose={() => {
          setIsBancoSearchOpen(false);
          setCurrentItemIndex(null);
        }}
        onSelectBanco={handleSelectBanco}
      />
    </>
  );
}
