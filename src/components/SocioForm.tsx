import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Home, CreditCard, Percent } from "lucide-react";
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
import { SocioFormData } from "../types/socio";
import { Banco } from "../services/banco.service";
import {
  TIPO_PESSOA_OPTIONS,
  CONTA_TIPO_OPTIONS,
} from "../constants/socio-constants";
import { BancoService } from "../services/banco.service";
import { isValidBancoId, formatBancoDisplay } from "../utils/bancoUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SocioFormProps {
  formData: SocioFormData;
  setFormData: (newFormData: SocioFormData) => void;
  isCreating: boolean;
  isUpdating: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function SocioForm({
  formData,
  setFormData,
  isCreating,
  isUpdating,
  activeTab,
  setActiveTab,
}: SocioFormProps) {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [bancoSelecionado, setBancoSelecionado] = useState<Banco | null>(null);
  const [bancoIdInput, setBancoIdInput] = useState<string>("");
  const [carregandoBancos, setCarregandoBancos] = useState(false);

  useEffect(() => {
    loadBancos();
  }, []);

  // Sincronizar banco selecionado com formData
  useEffect(() => {
    if (formData.dadosBancarios?.banco_id && bancos.length > 0) {
      const banco = bancos.find(
        (b) => b.bancoId === formData.dadosBancarios?.banco_id
      );
      if (banco) {
        setBancoSelecionado(banco);
        setBancoIdInput(banco.bancoId.toString());
      }
    } else if (!formData.dadosBancarios?.banco_id) {
      // Limpar seleção quando não há banco_id
      setBancoSelecionado(null);
      setBancoIdInput("");
    }
  }, [formData.dadosBancarios?.banco_id, bancos]);

  const loadBancos = async () => {
    setCarregandoBancos(true);
    try {
      const bancosData = await BancoService.findAll();
      setBancos(Array.isArray(bancosData) ? bancosData : []);
    } catch (error) {
      console.error("Erro ao carregar bancos:", error);
      setBancos([]);
    } finally {
      setCarregandoBancos(false);
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
          banco_id: undefined,
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
          banco_id: banco.bancoId,
        },
      });
    } else {
      setBancoSelecionado(null);
      setFormData({
        ...formData,
        dadosBancarios: {
          ...formData.dadosBancarios,
          banco_id: undefined,
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
          banco_id: banco.bancoId,
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
          cidade_codigo: data.ibge,
          uf_codigo: data.ibge ? data.ibge.substring(0, 2) : undefined,
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

  const handleSocioInfoChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      socioInfo: {
        ...formData.socioInfo,
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
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
        <TabsTrigger value="socio-info" className="flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Participação
        </TabsTrigger>
      </TabsList>

      {/* Tab: Pessoa */}
      <TabsContent value="pessoa" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dados da Pessoa</h3>

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
                    <SelectItem key={option.value} value={option.value || ""}>
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
                  value={formData.pessoa.inscricao_estadual || ""}
                  onChange={(e) =>
                    handlePessoaChange("inscricao_estadual", e.target.value)
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
                value={formData.pessoa.inscricao_municipal || ""}
                onChange={(e) =>
                  handlePessoaChange("inscricao_municipal", e.target.value)
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
                onChange={(e) => handleEnderecoChange("numero", e.target.value)}
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
                onChange={(e) => handleEnderecoChange("bairro", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                placeholder="Cidade"
                value={formData.endereco?.cidade || ""}
                onChange={(e) => handleEnderecoChange("cidade", e.target.value)}
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
                value={formData.dadosBancarios?.agencia_digito || ""}
                onChange={(e) =>
                  handleDadosBancariosChange("agencia_digito", e.target.value)
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
                value={formData.dadosBancarios?.conta_digito || ""}
                onChange={(e) =>
                  handleDadosBancariosChange("conta_digito", e.target.value)
                }
                maxLength={1}
              />
            </div>
          </div>

          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="conta_tipo">Tipo de Conta</Label>
            <Select
              value={formData.dadosBancarios?.conta_tipo?.toString() || ""}
              onValueChange={(value) =>
                handleDadosBancariosChange("conta_tipo", parseInt(value))
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
              value={formData.dadosBancarios?.chave_pix || ""}
              onChange={(e) =>
                handleDadosBancariosChange("chave_pix", e.target.value)
              }
            />
          </div>
        </div>
      </TabsContent>

      {/* Tab: Participação */}
      <TabsContent value="socio-info" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Participação</h3>

          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <Label htmlFor="perc_rateio">Percentual de Rateio (%)</Label>
            <Input
              id="perc_rateio"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              value={formData.socioInfo?.perc_rateio || 0}
              onChange={(e) =>
                handleSocioInfoChange(
                  "perc_rateio",
                  parseFloat(e.target.value) || 0
                )
              }
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
