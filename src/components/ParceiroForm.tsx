import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Home, CreditCard, Percent, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { maskCPF, maskCNPJ, maskCEP } from "../utils/masks";
import { ValidatedInput } from "./ui/validated-input";
import { toast } from "sonner";
import { ParceiroFormData } from "../types/parceiro";
import { AtividadeParceiro } from "../types/parceiro";
import {
  TIPO_PESSOA_OPTIONS,
  CONTA_TIPO_OPTIONS,
} from "../constants/parceiro-constants";
import { bancoService, Banco } from "../services/banco.service";
import { isValidBancoId, formatBancoDisplay } from "../utils/bancoUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { parceiroService } from "../services/parceiro.service";
import { PersonSearchDialog } from "./PersonSearchDialog";
import { Pessoa } from "../services/pessoa.service";

interface ParceiroFormProps {
  formData: ParceiroFormData;
  setFormData: (newFormData: ParceiroFormData) => void;
  isCreating: boolean;
  isUpdating: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function ParceiroForm({
  formData,
  setFormData,
  isCreating,
  isUpdating,
  activeTab,
  setActiveTab,
}: ParceiroFormProps) {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [atividadesParceiro, setAtividadesParceiro] = useState<
    AtividadeParceiro[]
  >([]);
  const [bancoSelecionado, setBancoSelecionado] = useState<Banco | null>(null);
  const [bancoIdInput, setBancoIdInput] = useState<string>("");
  const [carregandoBancos, setCarregandoBancos] = useState(false);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);

  // Estados para pesquisa de pessoas
  const [isPersonSearchOpen, setIsPersonSearchOpen] = useState(false);
  const [isResponsavelSearchOpen, setIsResponsavelSearchOpen] = useState(false);

  useEffect(() => {
    loadBancos();
    loadAtividadesParceiro();
  }, []);

  // Sincronizar banco selecionado com formData
  useEffect(() => {
    if (formData.dadosBancarios?.bancoId && bancos.length > 0) {
      const banco = bancos.find(
        (b) => b.bancoId === formData.dadosBancarios?.bancoId
      );
      if (banco) {
        setBancoSelecionado(banco);
        setBancoIdInput(banco.bancoId.toString());
      }
    } else if (!formData.dadosBancarios?.bancoId) {
      // Limpar seleção quando não há bancoId
      setBancoSelecionado(null);
      setBancoIdInput("");
    }
  }, [formData.dadosBancarios?.bancoId, bancos]);

  const loadBancos = async () => {
    setCarregandoBancos(true);
    try {
      const bancosData = await bancoService.findAll();
      setBancos(Array.isArray(bancosData.data) ? bancosData.data : []);
    } catch (error) {
      console.error("Erro ao carregar bancos:", error);
      setBancos([]);
    } finally {
      setCarregandoBancos(false);
    }
  };

  const loadAtividadesParceiro = async () => {
    setCarregandoAtividades(true);
    try {
      const atividadesData = await parceiroService.getAtividadesParceiro();
      setAtividadesParceiro(
        Array.isArray(atividadesData) ? atividadesData : []
      );
    } catch (error) {
      console.error("Erro ao carregar atividades de parceiro:", error);
      setAtividadesParceiro([]);
    } finally {
      setCarregandoAtividades(false);
    }
  };

  // Função para buscar banco por ID
  const buscarBancoPorId = async (id: string) => {
    if (!isValidBancoId(id)) {
      // Se o ID não é válido, limpar seleção
      setBancoSelecionado(null);
      setFormData({
        ...formData,
        dadosBancarios: {
          ...formData.dadosBancarios,
          bancoId: undefined,
        },
      });
      return;
    }

    const idNumber = Number(id);
    // Buscar apenas na lista local de bancos
    const banco = bancos.find((b) => b.bancoId === idNumber);

    if (banco) {
      setBancoSelecionado(banco);
      setFormData({
        ...formData,
        dadosBancarios: {
          ...formData.dadosBancarios,
          bancoId: banco.bancoId,
        },
      });
    } else {
      setBancoSelecionado(null);
      setFormData({
        ...formData,
        dadosBancarios: {
          ...formData.dadosBancarios,
          bancoId: undefined,
        },
      });
    }
  };

  // Função para selecionar banco do select
  const selecionarBanco = (bancoId: string) => {
    const banco = bancos.find((b) => b.bancoId === Number(bancoId));
    if (banco) {
      setBancoSelecionado(banco);
      setBancoIdInput(banco.bancoId.toString());
      setFormData({
        ...formData,
        dadosBancarios: {
          ...formData.dadosBancarios,
          bancoId: banco.bancoId,
        },
      });
    }
  };

  // Função para buscar CEP manualmente
  const handleBuscarCEP = async () => {
    const cep = formData.endereco?.cep || "";

    if (!cep || cep.length < 8) {
      toast.error("CEP deve ter pelo menos 8 dígitos");
      return;
    }

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

      // Atualizar os campos de endereço
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          cep: data.cep,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
          cidadeCodigo: data.ibge,
          ufCodigo: data.ibge ? data.ibge.substring(0, 2) : undefined,
        },
      });

      // Focar no campo número
      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numero"]'
        ) as HTMLInputElement;
        if (numeroInput) {
          numeroInput.focus();
        }
      }, 100);

      toast.success("CEP encontrado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  const handlePessoaChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      pessoa: {
        ...formData.pessoa,
        [field]: value,
      },
    });
  };

  const handleEnderecoChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      endereco: {
        ...formData.endereco,
        [field]: value,
      },
    });
  };

  const handleDadosBancariosChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      dadosBancarios: {
        ...formData.dadosBancarios,
        [field]: value,
      },
    });
  };

  const handleResponsavelChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      responsavel: {
        nome: "",
        documento: "",
        tipo: "PF" as const,
        ...formData.responsavel,
        [field]: value,
      },
    });
  };

  const handleEnderecoResponsavelChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      enderecoResponsavel: {
        ...formData.enderecoResponsavel,
        [field]: value,
      },
    });
  };

  const handleParceiroInfoChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      parceiroInfo: {
        ...formData.parceiroInfo,
        [field]: value,
      },
    });
  };

  const handleDocumentoChange = (value: string) => {
    const maskedValue =
      formData.pessoa.tipo === "PF" ? maskCPF(value) : maskCNPJ(value);

    handlePessoaChange("documento", maskedValue);
  };

  const handleCepChange = (value: string) => {
    const maskedValue = maskCEP(value);
    handleEnderecoChange("cep", maskedValue);
  };

  // Funções para seleção de pessoas
  const handleSelectPerson = (person: Pessoa) => {
    // Preservar dados bancários que o usuário já preencheu
    const dadosBancariosPreservados = formData.dadosBancarios;

    setFormData({
      ...formData,
      pessoa: {
        pessoaId: person.pessoaId, // Incluir ID da pessoa existente
        nome: person.nome,
        razao: person.razao || null,
        documento: person.documento,
        tipo: person.tipo,
        inscricaoEstadual: person.inscricaoEstadual || null,
        inscricaoMunicipal: person.inscricaoMunicipal || null,
      },
      endereco:
        person.enderecos && person.enderecos.length > 0
          ? {
              cep: person.enderecos[0].cep,
              endereco: person.enderecos[0].logradouro || null,
              numero: person.enderecos[0].numero || null,
              complemento: person.enderecos[0].complemento || null,
              bairro: person.enderecos[0].bairro || null,
              cidade: person.enderecos[0].cidade || null,
              uf: person.enderecos[0].uf || null,
              cidadeCodigo: person.enderecos[0].cidadeCodigo || null,
              ufCodigo: person.enderecos[0].ufCodigo || null,
            }
          : undefined,
      dadosBancarios:
        person.dadosBancarios && person.dadosBancarios.length > 0
          ? {
              dadosBancariosId: person.dadosBancarios[0].dadosBancariosId, // Incluir ID para UPDATE
              bancoId: person.dadosBancarios[0].bancoId,
              agencia: person.dadosBancarios[0].agencia,
              conta: person.dadosBancarios[0].conta,
              contaTipo: person.dadosBancarios[0].contaTipo as 1 | 2,
              chavePix: person.dadosBancarios[0].chavePix || null,
              contaDigito: person.dadosBancarios[0].contaDigito || null,
              agenciaDigito: person.dadosBancarios[0].agenciaDigito || null,
            }
          : dadosBancariosPreservados, // Preservar dados bancários preenchidos pelo usuário
    });

    // Sincronizar banco selecionado se houver dados bancários
    if (person.dadosBancarios && person.dadosBancarios.length > 0) {
      const banco = bancos.find(
        (b) => b.bancoId === person.dadosBancarios![0].bancoId
      );
      if (banco) {
        setBancoSelecionado(banco);
        setBancoIdInput(banco.bancoId.toString());
      }
    }

    toast.success("Dados da pessoa carregados com sucesso!");
  };

  const handleSelectResponsavel = (person: Pessoa) => {
    setFormData({
      ...formData,
      responsavel: {
        nome: person.nome,
        razao: person.razao || null,
        documento: person.documento,
        tipo: person.tipo,
        inscricaoEstadual: person.inscricaoEstadual || null,
        inscricaoMunicipal: person.inscricaoMunicipal || null,
      },
      enderecoResponsavel:
        person.enderecos && person.enderecos.length > 0
          ? {
              cep: person.enderecos[0].cep,
              endereco: person.enderecos[0].logradouro || null,
              numero: person.enderecos[0].numero || null,
              complemento: person.enderecos[0].complemento || null,
              bairro: person.enderecos[0].bairro || null,
              cidade: person.enderecos[0].cidade || null,
              uf: person.enderecos[0].uf || null,
              cidadeCodigo: person.enderecos[0].cidadeCodigo || null,
              ufCodigo: person.enderecos[0].ufCodigo || null,
            }
          : undefined,
      parceiroInfo: {
        ...formData.parceiroInfo,
        pessoaResponsavelId: person.pessoaId,
      },
    });

    toast.success("Dados do responsável carregados com sucesso!");
  };

  const handleRemoveResponsavel = () => {
    setFormData({
      ...formData,
      responsavel: undefined,
      parceiroInfo: {
        ...formData.parceiroInfo,
        pessoaResponsavelId: undefined,
      },
    });
    toast.success("Responsável removido com sucesso!");
  };

  const handleBuscarCepResponsavel = async () => {
    const cep = formData.enderecoResponsavel?.cep || "";

    if (!cep || cep.length < 8) {
      toast.error("CEP deve ter pelo menos 8 dígitos");
      return;
    }

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

      setFormData({
        ...formData,
        enderecoResponsavel: {
          ...formData.enderecoResponsavel,
          cep: data.cep,
          endereco: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
          cidadeCodigo: data.ibge,
          ufCodigo: data.ibge ? data.ibge.substring(0, 2) : undefined,
        },
      });

      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numero_responsavel"]'
        ) as HTMLInputElement;
        if (numeroInput) {
          numeroInput.focus();
        }
      }, 100);

      toast.success("CEP encontrado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pessoa" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Pessoa
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
          <TabsTrigger value="responsavel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Responsável
          </TabsTrigger>
          <TabsTrigger
            value="endereco-responsavel"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            End. Responsável
          </TabsTrigger>
          <TabsTrigger
            value="parceiro-info"
            className="flex items-center gap-2"
          >
            <Percent className="h-4 w-4" />
            Participação
          </TabsTrigger>
        </TabsList>

        {/* Tab: Pessoa */}
        <TabsContent value="pessoa" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dados da Pessoa</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPersonSearchOpen(true)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Buscar Pessoa
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.pessoa.tipo}
                  onValueChange={(value: "PF" | "PJ") =>
                    handlePessoaChange("tipo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_PESSOA_OPTIONS?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value || "default"}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">Documento *</Label>
                <Input
                  id="documento"
                  placeholder={
                    formData.pessoa.tipo === "PF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  value={formData.pessoa.documento}
                  onChange={(e) => handleDocumentoChange(e.target.value)}
                  maxLength={formData.pessoa.tipo === "PF" ? 14 : 18}
                />
              </div>
            </div>

            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={formData.pessoa.nome}
                onChange={(e) => handlePessoaChange("nome", e.target.value)}
              />
            </div>

            {formData.pessoa.tipo === "PJ" && (
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="razao">Razão Social</Label>
                <Input
                  id="razao"
                  placeholder="Razão social"
                  value={formData.pessoa.razao || ""}
                  onChange={(e) => handlePessoaChange("razao", e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              {formData.pessoa.tipo === "PJ" && (
                <div className="space-y-2">
                  <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricao_estadual"
                    placeholder="Inscrição estadual"
                    value={formData.pessoa.inscricaoEstadual || ""}
                    onChange={(e) =>
                      handlePessoaChange("inscricaoEstadual", e.target.value)
                    }
                  />
                </div>
              )}
            </div>

            {formData.pessoa.tipo === "PJ" && (
              <div className="space-y-2">
                <Label htmlFor="inscricao_municipal">Inscrição Municipal</Label>
                <Input
                  id="inscricao_municipal"
                  placeholder="Inscrição municipal"
                  value={formData.pessoa.inscricaoMunicipal || ""}
                  onChange={(e) =>
                    handlePessoaChange("inscricaoMunicipal", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Endereço */}
        <TabsContent value="endereco" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço</h3>

            {/* CEP e busca manual */}
            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <div className="flex gap-2 max-w-[20%]">
                <ValidatedInput
                  id="cep"
                  name="cep"
                  label="CEP"
                  value={formData.endereco?.cep || ""}
                  onChange={(e) => {
                    const maskedValue = maskCEP(e.target.value);
                    handleCepChange(maskedValue);
                  }}
                  placeholder="00000-000"
                  isRequired={true}
                  validationMessage="CEP é obrigatório"
                  customValidation={(value) => {
                    // Validação básica de CEP (8 dígitos)
                    const digits = value.replace(/\D/g, "");
                    return digits.length === 8;
                  }}
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBuscarCEP}
                        disabled={
                          !formData.endereco?.cep ||
                          formData.endereco.cep.replace(/\D/g, "").length !== 8
                        }
                        className="px-3"
                      >
                        🔍
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pesquisar CEP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="grid grid-cols-[80%_15%] gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="endereco">Logradouro</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, Avenida, etc."
                  value={formData.endereco?.endereco || ""}
                  onChange={(e) =>
                    handleEnderecoChange("endereco", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  name="numero"
                  placeholder="123"
                  value={formData.endereco?.numero || ""}
                  onChange={(e) =>
                    handleEnderecoChange("numero", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                placeholder="Apartamento, sala, etc."
                value={formData.endereco?.complemento || ""}
                onChange={(e) =>
                  handleEnderecoChange("complemento", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  placeholder="Bairro"
                  value={formData.endereco?.bairro || ""}
                  onChange={(e) =>
                    handleEnderecoChange("bairro", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="Cidade"
                  value={formData.endereco?.cidade || ""}
                  onChange={(e) =>
                    handleEnderecoChange("cidade", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  placeholder="SP"
                  value={formData.endereco?.uf || ""}
                  onChange={(e) => handleEnderecoChange("uf", e.target.value)}
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Dados Bancários */}
        <TabsContent value="dados-bancarios" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dados Bancários</h3>

            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="banco_id">Banco</Label>
              <div className="flex gap-2">
                {/* Input para buscar por ID */}
                <div className="flex gap-2 flex-1 max-w-[20%]">
                  <Input
                    id="banco_id"
                    name="banco_id"
                    placeholder="000"
                    value={bancoIdInput}
                    onChange={(e) => setBancoIdInput(e.target.value)}
                    onBlur={() => buscarBancoPorId(bancoIdInput)}
                    disabled={isCreating || isUpdating}
                    className="flex-1"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => buscarBancoPorId(bancoIdInput)}
                          disabled={isCreating || isUpdating || !bancoIdInput}
                          className="px-3"
                        >
                          🔍
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Buscar banco por Nº</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Select para escolher banco */}
                <div className="flex-1">
                  <Select
                    value={bancoSelecionado?.bancoId?.toString() || ""}
                    onValueChange={selecionarBanco}
                    disabled={isCreating || isUpdating || carregandoBancos}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          carregandoBancos
                            ? "Carregando bancos..."
                            : "Selecione um banco"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {Array.isArray(bancos) &&
                        bancos.map((banco) => (
                          <SelectItem
                            key={banco.bancoId}
                            value={banco.bancoId.toString()}
                          >
                            {formatBancoDisplay(banco)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  value={formData.dadosBancarios?.agencia || ""}
                  onChange={(e) =>
                    handleDadosBancariosChange("agencia", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agencia_digito">Dígito da Agência</Label>
                <Input
                  id="agencia_digito"
                  value={formData.dadosBancarios?.agenciaDigito || ""}
                  onChange={(e) =>
                    handleDadosBancariosChange("agenciaDigito", e.target.value)
                  }
                  maxLength={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  value={formData.dadosBancarios?.conta || ""}
                  onChange={(e) =>
                    handleDadosBancariosChange("conta", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta_digito">Dígito da Conta</Label>
                <Input
                  id="conta_digito"
                  value={formData.dadosBancarios?.contaDigito || ""}
                  onChange={(e) =>
                    handleDadosBancariosChange("contaDigito", e.target.value)
                  }
                  maxLength={1}
                />
              </div>
            </div>

            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="conta_tipo">Tipo de Conta</Label>
              <Select
                value={formData.dadosBancarios?.contaTipo?.toString() || ""}
                onValueChange={(value) =>
                  handleDadosBancariosChange("contaTipo", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  {CONTA_TIPO_OPTIONS?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chave_pix">Chave PIX</Label>
              <Input
                id="chave_pix"
                placeholder="Chave PIX"
                value={formData.dadosBancarios?.chavePix || ""}
                onChange={(e) =>
                  handleDadosBancariosChange("chavePix", e.target.value)
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab: Responsável */}
        <TabsContent value="responsavel" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Dados do Responsável</h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResponsavelSearchOpen(true)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Buscar Responsável
                </Button>
                {formData.responsavel && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveResponsavel}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="responsavel_tipo">Tipo</Label>
                <Select
                  value={formData.responsavel?.tipo || "PF"}
                  onValueChange={(value) =>
                    handleResponsavelChange("tipo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_PESSOA_OPTIONS?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="responsavel_nome">Nome</Label>
                <Input
                  id="responsavel_nome"
                  value={formData.responsavel?.nome || ""}
                  onChange={(e) =>
                    handleResponsavelChange("nome", e.target.value)
                  }
                />
              </div>

              {formData.responsavel?.tipo === "PJ" && (
                <div className="space-y-2 border border-gray-300 rounded-md p-2">
                  <Label htmlFor="responsavel_razao">Razão Social</Label>
                  <Input
                    id="responsavel_razao"
                    value={formData.responsavel?.razao || ""}
                    onChange={(e) =>
                      handleResponsavelChange("razao", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="responsavel_documento">Documento</Label>
                <Input
                  id="responsavel_documento"
                  value={formData.responsavel?.documento || ""}
                  onChange={(e) => {
                    const maskedValue =
                      formData.responsavel?.tipo === "PF"
                        ? maskCPF(e.target.value)
                        : maskCNPJ(e.target.value);
                    handleResponsavelChange("documento", maskedValue);
                  }}
                  placeholder={
                    formData.responsavel?.tipo === "PF"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  maxLength={formData.responsavel?.tipo === "PF" ? 14 : 18}
                />
              </div>

              {formData.responsavel?.tipo === "PJ" && (
                <>
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="responsavel_inscricao_estadual">
                      Inscrição Estadual
                    </Label>
                    <Input
                      id="responsavel_inscricao_estadual"
                      value={formData.responsavel?.inscricaoEstadual || ""}
                      onChange={(e) =>
                        handleResponsavelChange(
                          "inscricaoEstadual",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="responsavel_inscricao_municipal">
                      Inscrição Municipal
                    </Label>
                    <Input
                      id="responsavel_inscricao_municipal"
                      value={formData.responsavel?.inscricaoMunicipal || ""}
                      onChange={(e) =>
                        handleResponsavelChange(
                          "inscricaoMunicipal",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="atividade_parceiro_id">
                Atividade do Parceiro
              </Label>
              <Select
                value={
                  formData.parceiroInfo?.atividadeParceiroId?.toString() ||
                  "null"
                }
                onValueChange={(value) =>
                  handleParceiroInfoChange(
                    "atividadeParceiroId",
                    value === "null" ? null : parseInt(value)
                  )
                }
                disabled={carregandoAtividades}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      carregandoAtividades
                        ? "Carregando atividades..."
                        : "Selecione uma atividade"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  <SelectItem value="null">Nenhuma atividade</SelectItem>
                  {Array.isArray(atividadesParceiro) &&
                    atividadesParceiro.map((atividade) => (
                      <SelectItem
                        key={atividade.atividadeParceiroId}
                        value={atividade.atividadeParceiroId.toString()}
                      >
                        {atividade.descricao}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Endereço do Responsável */}
        <TabsContent value="endereco-responsavel" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Endereço do Responsável</h3>

            <div className="grid grid-cols-[20%_60%_15%] gap-4">
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="cep_responsavel">CEP</Label>
                <div className="flex gap-2">
                  <Input
                    id="cep_responsavel"
                    value={formData.enderecoResponsavel?.cep || ""}
                    onChange={(e) => {
                      const maskedValue = maskCEP(e.target.value);
                      handleEnderecoResponsavelChange("cep", maskedValue);
                    }}
                    placeholder="00000-000"
                    className="flex-1"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBuscarCepResponsavel}
                          disabled={
                            !formData.enderecoResponsavel?.cep ||
                            (formData.enderecoResponsavel?.cep?.replace(
                              /\D/g,
                              ""
                            ).length || 0) !== 8
                          }
                          className="px-3"
                        >
                          🔍
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pesquisar CEP</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="endereco_responsavel">Logradouro</Label>
                <Input
                  id="endereco_responsavel"
                  value={formData.enderecoResponsavel?.endereco || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange("endereco", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="numero_responsavel">Número</Label>
                <Input
                  id="numero_responsavel"
                  name="numero_responsavel"
                  value={formData.enderecoResponsavel?.numero || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange("numero", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-[40%_57%] gap-4">
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="complemento_responsavel">Complemento</Label>
                <Input
                  id="complemento_responsavel"
                  value={formData.enderecoResponsavel?.complemento || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange(
                      "complemento",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="bairro_responsavel">Bairro</Label>
                <Input
                  id="bairro_responsavel"
                  value={formData.enderecoResponsavel?.bairro || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange("bairro", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-[70%_10%] gap-4">
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="cidade_responsavel">Cidade</Label>
                <Input
                  id="cidade_responsavel"
                  value={formData.enderecoResponsavel?.cidade || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange("cidade", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="uf_responsavel">UF</Label>
                <Input
                  id="uf_responsavel"
                  value={formData.enderecoResponsavel?.uf || ""}
                  onChange={(e) =>
                    handleEnderecoResponsavelChange("uf", e.target.value)
                  }
                  maxLength={2}
                />
              </div>
            </div>

            {/* Campos de Contato */}
            <div className="grid grid-cols-[20%_20%_55%] gap-4">
              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="telefone_responsavel">Telefone</Label>
                <Input
                  id="telefone_responsavel"
                  value={
                    formData.enderecoResponsavel?.contatoComercialTelefone1 ||
                    ""
                  }
                  onChange={(e) =>
                    handleEnderecoResponsavelChange(
                      "contatoComercialTelefone1",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="celular_responsavel">Celular</Label>
                <Input
                  id="celular_responsavel"
                  value={
                    formData.enderecoResponsavel?.contatoComercialTelefone2 ||
                    ""
                  }
                  onChange={(e) =>
                    handleEnderecoResponsavelChange(
                      "contatoComercialTelefone2",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="space-y-2 border border-gray-300 rounded-md p-2">
                <Label htmlFor="email_responsavel">E-mail</Label>
                <Input
                  id="email_responsavel"
                  type="email"
                  value={
                    formData.enderecoResponsavel?.contatoComercialEmail || ""
                  }
                  onChange={(e) =>
                    handleEnderecoResponsavelChange(
                      "contatoComercialEmail",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Participação */}
        <TabsContent value="parceiro-info" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Participação</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="perc_indicacao">
                  Percentual de Indicação (%)
                </Label>
                <Input
                  id="perc_indicacao"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.parceiroInfo?.percIndicacao || 0}
                  onChange={(e) =>
                    handleParceiroInfoChange(
                      "percIndicacao",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perc_mensalidade">
                  Percentual de Mensalidade (%)
                </Label>
                <Input
                  id="perc_mensalidade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.parceiroInfo?.percMensalidade || 0}
                  onChange={(e) =>
                    handleParceiroInfoChange(
                      "percMensalidade",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs de pesquisa de pessoas */}
      <PersonSearchDialog
        isOpen={isPersonSearchOpen}
        onClose={() => setIsPersonSearchOpen(false)}
        onSelectPerson={handleSelectPerson}
        title="Buscar Pessoa para Parceiro"
      />

      <PersonSearchDialog
        isOpen={isResponsavelSearchOpen}
        onClose={() => setIsResponsavelSearchOpen(false)}
        onSelectPerson={handleSelectResponsavel}
        title="Buscar Responsável"
      />
    </>
  );
}
