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
import { ContasBancariasEntidadeSearch } from "./ContasBancariasEntidadeSearch";
import {
  EntidadeContaBancaria,
  contasBancariasEntidadesService,
} from "../services/contas-bancarias-entidades.service";
import { AuthService } from "../services/auth.service";

// Funções para máscara de valor
const formatCurrency = (value: number): string => {
  if (value === 0) return "0,00";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Função para buscar contas bancárias de uma entidade
const buscarContasBancariasEntidade = async (
  entidadeId: number
): Promise<EntidadeContaBancaria[]> => {
  try {
    const response = await contasBancariasEntidadesService.findByEntidade(
      entidadeId
    );
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
  contratoItemId?: number; // ID do item (para itens existentes)
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

  // Armazenar a pessoa original para restaurar se necessário
  const [originalPessoa, setOriginalPessoa] = useState<Pessoa | null>(null);
  const [originalTipoPessoa, setOriginalTipoPessoa] = useState<
    "cliente" | "parceiro" | "socio" | ""
  >("");

  const [valorInputs, setValorInputs] = useState<Record<number, string>>({});

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
          mesVencimento: item.mesVencimento || 0,
          anoVencimento: item.anoVencimento || 0,
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

      // Atualizar operação dos itens existentes
      if (tipo) {
        const novaOperacao = tipo.tipo === "R" ? "C" : "D";
        setFormData((prev) => ({
          ...prev,
          itens: prev.itens.map((item) => ({
            ...item,
            operacao: novaOperacao,
          })),
        }));
      }
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
    }
  };

  const handleSelectPessoa = (pessoa: Pessoa) => {
    setSelectedPessoa(pessoa);

    // Limpar todos os campos de Info primeiro
    setFormData((prev) => ({
      ...prev,
      clienteInfoId: undefined,
      parceiroInfoId: undefined,
      socioInfoId: undefined,
    }));

    // Definir apenas o campo correspondente ao tipo selecionado
    if (selectedTipoPessoa === "cliente") {
      const clienteInfoId = (pessoa as any).clienteInfoId;
      setFormData((prev) => ({
        ...prev,
        clienteInfoId: clienteInfoId,
      }));
    } else if (selectedTipoPessoa === "parceiro") {
      const parceiroInfoId = (pessoa as any).parceiroInfoId;
      setFormData((prev) => ({
        ...prev,
        parceiroInfoId: parceiroInfoId,
      }));
    } else if (selectedTipoPessoa === "socio") {
      const socioInfoId = (pessoa as any).socioInfoId;
      setFormData((prev) => ({
        ...prev,
        socioInfoId: socioInfoId,
      }));
    }
  };

  const handleOpenBancoSearch = async (itemIndex: number) => {
    setCurrentItemIndex(itemIndex);

    try {
      // Usar sempre a entidade do usuário logado
      const entidadeId = AuthService.getEntidadeId();

      if (!entidadeId) {
        toast.error("Erro: Entidade do usuário não encontrada");
        return;
      }

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
      } else {
        toast.error("Nenhuma conta bancária encontrada para esta entidade");
      }
    } catch (error) {
      console.error("Erro ao buscar contas bancárias:", error);
      toast.error("Erro ao buscar contas bancárias");
    }

    // Se não há pessoa selecionada ou erro, abrir modal normal
    setIsBancoSearchOpen(true);
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
    }
    setIsBancoSearchOpen(false);
    setCurrentItemIndex(null);
  };

  const handleAddItem = () => {
    const currentDate = new Date();
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
      mesVencimento: selectedContratoTipo?.recorrente
        ? currentDate.getMonth() + 1
        : 0,
      anoVencimento: selectedContratoTipo?.recorrente
        ? currentDate.getFullYear()
        : 0,
      contaBancaria: undefined,
    };

    setFormData((prev) => ({
      ...prev,
      itens: [newItem, ...prev.itens],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index),
    }));

    // Limpar o estado do input de valor
    setValorInputs((prev) => {
      const newState = { ...prev };
      delete newState[index];
      // Reindexar os inputs restantes
      const reindexed: Record<number, string> = {};
      Object.keys(newState).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newState[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newState[oldIndex];
        }
      });
      return reindexed;
    });
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

    // Para edição, usar apenas dados modificados
    const dataToSubmit = contrato ? getChangedData() : formData;

    // Se há itens no formulário, sempre incluir na submissão
    if (formData.itens && formData.itens.length > 0) {
      dataToSubmit.itens = formData.itens;
    }

    // Limpar dados antes de enviar (remover campos que não devem ir para a API)
    const cleanedData = {
      ...dataToSubmit,
      itens: dataToSubmit.itens?.map((item) => {
        const {
          contaBancaria,
          movimentos,
          naturezaOperacao,
          ...itemWithoutUnwantedFields
        } = item as any;

        // Preservar contratoItemId se existir (para itens existentes)
        if (item.contratoItemId) {
          itemWithoutUnwantedFields.contratoItemId = item.contratoItemId;
        }

        // Garantir que campos obrigatórios tenham valores padrão
        const cleanedItem = { ...itemWithoutUnwantedFields };

        // Limpar campos opcionais vazios
        if (!cleanedItem.dataFim || cleanedItem.dataFim.trim() === "") {
          delete cleanedItem.dataFim;
        }
        if (
          !cleanedItem.instrucoesBanco ||
          cleanedItem.instrucoesBanco.trim() === ""
        ) {
          delete cleanedItem.instrucoesBanco;
        }

        // Corrigir problema de timezone das datas
        if (cleanedItem.dataIni) {
          // Se já está no formato YYYY-MM-DD, usar diretamente
          if (cleanedItem.dataIni.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Já está no formato correto, não fazer nada
          } else {
            // Garantir que a data seja enviada como string no formato YYYY-MM-DD
            const dataIni = new Date(cleanedItem.dataIni);
            const year = dataIni.getFullYear();
            const month = String(dataIni.getMonth() + 1).padStart(2, "0");
            const day = String(dataIni.getDate()).padStart(2, "0");
            cleanedItem.dataIni = `${year}-${month}-${day}`;
          }
        }
        if (cleanedItem.dataFim) {
          // Se já está no formato YYYY-MM-DD, usar diretamente
          if (cleanedItem.dataFim.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Já está no formato correto, não fazer nada
          } else {
            // Garantir que a data seja enviada como string no formato YYYY-MM-DD
            const dataFim = new Date(cleanedItem.dataFim);
            const year = dataFim.getFullYear();
            const month = String(dataFim.getMonth() + 1).padStart(2, "0");
            const day = String(dataFim.getDate()).padStart(2, "0");
            cleanedItem.dataFim = `${year}-${month}-${day}`;
          }
        }

        // Incluir mesVencimento e anoVencimento baseado no tipo de contrato
        if (selectedContratoTipo?.recorrente) {
          // Para contratos recorrentes, incluir com valores padrão
          cleanedItem.mesVencimento =
            itemWithoutUnwantedFields.mesVencimento ?? 0;
          cleanedItem.anoVencimento =
            itemWithoutUnwantedFields.anoVencimento ?? 0;
        } else {
          // Para contratos não recorrentes, incluir os valores preenchidos (obrigatórios)
          cleanedItem.mesVencimento =
            itemWithoutUnwantedFields.mesVencimento ?? 0;
          cleanedItem.anoVencimento =
            itemWithoutUnwantedFields.anoVencimento ?? 0;
        }

        return cleanedItem;
      }),
    };

    onSubmit(cleanedData as ContratoFormData);
  };

  // Função para detectar mudanças nos dados
  const getChangedData = useCallback(() => {
    if (!contrato) return formData; // Para novos contratos, enviar todos os dados

    const changes: Partial<ContratoFormData> = {};

    // Verificar mudanças nos campos principais
    if (formData.numeroContrato !== contrato.numeroContrato) {
      changes.numeroContrato = formData.numeroContrato;
    }
    if (formData.clienteInfoId !== contrato.cliente?.clienteInfoId) {
      changes.clienteInfoId = formData.clienteInfoId;
    }
    if (formData.parceiroInfoId !== contrato.parceiro?.parceiroInfoId) {
      changes.parceiroInfoId = formData.parceiroInfoId;
    }
    if (formData.socioInfoId !== contrato.socio?.socioInfoId) {
      changes.socioInfoId = formData.socioInfoId;
    }
    if (formData.contratoTipoId !== contrato.tipo?.contratoTipoId) {
      changes.contratoTipoId = formData.contratoTipoId;
    }
    if (formData.descricao !== contrato.descricao) {
      changes.descricao = formData.descricao;
    }
    if (formData.valor !== contrato.valor) {
      changes.valor = formData.valor;
    }
    if (formData.ativo !== contrato.ativo) {
      changes.ativo = formData.ativo;
    }
    if (formData.urlContrato !== contrato.urlContrato) {
      changes.urlContrato = formData.urlContrato;
    }

    // Verificar mudanças nos itens
    const originalItens = contrato.itens || [];
    const currentItens = formData.itens || [];

    console.log("🔍 Debug detecção de mudanças:");
    console.log("🔍 Itens originais:", originalItens.length, originalItens);
    console.log("🔍 Itens atuais:", currentItens.length, currentItens);
    console.log(
      "🔍 IDs dos itens originais:",
      originalItens.map((item) => item.contratoItemId)
    );
    console.log(
      "🔍 IDs dos itens atuais:",
      currentItens.map((item) => item.contratoItemId)
    );

    // Se o número de itens mudou
    if (originalItens.length !== currentItens.length) {
      console.log("🔍 Número de itens mudou, incluindo itens nas mudanças");
      changes.itens = currentItens;
    } else if (currentItens.length > 0) {
      // Verificar se algum item foi modificado
      const hasItemChanges = currentItens.some((currentItem, index) => {
        const originalItem = originalItens[index];
        if (!originalItem) return true;

        return (
          currentItem.descricao !== originalItem.descricao ||
          currentItem.valor !== originalItem.valor ||
          currentItem.dataIni !== originalItem.dataIni ||
          currentItem.dataFim !== originalItem.dataFim ||
          currentItem.diaVencimento !== originalItem.diaVencimento ||
          currentItem.ativo !== originalItem.ativo ||
          currentItem.gerarBoleto !== originalItem.gerarBoleto ||
          currentItem.juros !== originalItem.juros ||
          currentItem.mora !== originalItem.mora ||
          currentItem.instrucoesBanco !== originalItem.instrucoesBanco ||
          currentItem.entidadeContaBancariaId !==
            originalItem.entidadeContaBancariaId ||
          currentItem.mesVencimento !== originalItem.mesVencimento ||
          currentItem.anoVencimento !== originalItem.anoVencimento
        );
      });

      if (hasItemChanges) {
        console.log("🔍 Itens foram modificados, incluindo nas mudanças");
        changes.itens = currentItens;
      } else {
        console.log("🔍 Nenhuma mudança nos itens detectada");
      }
    } else {
      console.log("🔍 Nenhum item atual para comparar");
    }

    console.log("🔍 Mudanças detectadas:", changes);
    return changes;
  }, [formData, contrato]);

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
                      onClick={() => {
                        if (!selectedTipoPessoa) {
                          toast.error(
                            "Selecione primeiro o tipo de pessoa (Cliente, Parceiro ou Sócio)"
                          );
                          return;
                        }
                        setIsPessoaSearchOpen(true);
                      }}
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
                              value={
                                valorInputs[index] ??
                                formatCurrency(item.valor || 0)
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                setValorInputs((prev) => ({
                                  ...prev,
                                  [index]: inputValue,
                                }));

                                // Parse apenas números para o valor real
                                const numbers = inputValue.replace(/\D/g, "");
                                if (numbers) {
                                  // Converter para valor real (ex: 1000 -> 10.00)
                                  const valor = parseInt(numbers) / 100;
                                  // Limitar a 9.999.999,99
                                  const limitedValor = Math.min(
                                    valor,
                                    9999999.99
                                  );
                                  handleItemChange(
                                    index,
                                    "valor",
                                    limitedValor
                                  );
                                } else {
                                  handleItemChange(index, "valor", 0);
                                }
                              }}
                              onBlur={(e) => {
                                // Formatar no blur para manter a formatação
                                const numbers = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                if (numbers) {
                                  const valor = parseInt(numbers) / 100;
                                  const formatted = formatCurrency(valor);
                                  setValorInputs((prev) => ({
                                    ...prev,
                                    [index]: formatted,
                                  }));
                                }
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
                              onChange={(e) => {
                                const value = e.target.value;
                                // Permitir digitação livre, validar apenas no blur
                                if (value === "" || /^\d*$/.test(value)) {
                                  handleItemChange(
                                    index,
                                    "diaVencimento",
                                    value === "" ? 1 : parseInt(value) || 1
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                const limitedValue = Math.min(
                                  Math.max(value, 1),
                                  28
                                );
                                handleItemChange(
                                  index,
                                  "diaVencimento",
                                  limitedValue
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-300 rounded-md p-2">
                          {/* Mês de Vencimento (se recorrente) */}
                          {selectedContratoTipo?.recorrente && (
                            <div className="space-y-2">
                              <Label>Mês de Vencimento</Label>
                              <Select
                                value={
                                  item.mesVencimento && item.mesVencimento > 0
                                    ? item.mesVencimento.toString()
                                    : "select-month"
                                }
                                onValueChange={(value) =>
                                  handleItemChange(
                                    index,
                                    "mesVencimento",
                                    value === "select-month"
                                      ? 0
                                      : parseInt(value)
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o mês" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="select-month">
                                    Selecione o mês
                                  </SelectItem>
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
                                min="2024"
                                max="2150"
                                value={
                                  item.anoVencimento && item.anoVencimento > 0
                                    ? item.anoVencimento.toString()
                                    : ""
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Permitir digitação livre, validar apenas no blur
                                  if (value === "" || /^\d*$/.test(value)) {
                                    handleItemChange(
                                      index,
                                      "anoVencimento",
                                      value === "" ? 0 : parseInt(value) || 0
                                    );
                                  }
                                }}
                                onBlur={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value && value > 0) {
                                    const limitedValue = Math.min(
                                      Math.max(value, 2024),
                                      2150
                                    );
                                    handleItemChange(
                                      index,
                                      "anoVencimento",
                                      limitedValue
                                    );
                                  } else {
                                    handleItemChange(index, "anoVencimento", 0);
                                  }
                                }}
                                //placeholder="Ex: 2025"
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
                              onChange={(e) => {
                                const value = e.target.value;
                                // Permitir digitação livre, validar apenas no blur
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  handleItemChange(
                                    index,
                                    "juros",
                                    value === "" ? 0 : parseFloat(value) || 0
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const limitedValue = Math.min(
                                  Math.max(value, 0),
                                  100
                                );
                                handleItemChange(index, "juros", limitedValue);
                              }}
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
                              onChange={(e) => {
                                const value = e.target.value;
                                // Permitir digitação livre, validar apenas no blur
                                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                                  handleItemChange(
                                    index,
                                    "mora",
                                    value === "" ? 0 : parseFloat(value) || 0
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                const limitedValue = Math.min(
                                  Math.max(value, 0),
                                  100
                                );
                                handleItemChange(index, "mora", limitedValue);
                              }}
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
                                  (item.contaBancaria.banco?.nome ||
                                    item.contaBancaria.bancoNome)
                                    ? `${
                                        item.contaBancaria.banco?.nome ||
                                        item.contaBancaria.bancoNome
                                      } - ${item.contaBancaria.agencia}/${
                                        item.contaBancaria.conta
                                      }`
                                    : ""
                                }
                                placeholder="Selecione uma conta bancária"
                                readOnly
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  handleOpenBancoSearch(index);
                                }}
                              >
                                {item.contaBancaria ? "Alterar" : "Selecionar"}
                              </Button>
                            </div>
                          </div>
                        </div>
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

      <ContasBancariasEntidadeSearch
        isOpen={isBancoSearchOpen}
        onClose={() => {
          setIsBancoSearchOpen(false);
          setCurrentItemIndex(null);
        }}
        onSelectBanco={handleSelectBanco}
        entidadeId={AuthService.getEntidadeId() || undefined}
      />
    </>
  );
}
