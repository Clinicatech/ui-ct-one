import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Building2, Home, CreditCard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ValidatedInput } from "./ui/validated-input";
import { BancoService, Banco } from "../services/banco.service";
import { maskCNPJ, maskCEP, maskTelefone } from "../utils/masks";
import {
  findBancoById,
  isValidBancoId,
  formatBancoDisplay,
} from "../utils/bancoUtils";
import { buscarCEPCompleto } from "../utils/cepService";
import { toast } from "sonner";
import { EntityFormData } from "../types/entity";

interface EntityFormProps {
  formData: EntityFormData;
  setFormData: React.Dispatch<React.SetStateAction<EntityFormData>>;
  isCreating: boolean;
  isUpdating: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export function EntityForm({
  formData,
  setFormData,
  isCreating,
  isUpdating,
  activeTab,
  setActiveTab,
}: EntityFormProps) {
  // Hook para validação de formulário (não usado no momento, mas disponível para futuras implementações)
  // const { showValidation } = useFormValidation();
  // Estados para gerenciar bancos
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [bancoSelecionado, setBancoSelecionado] = useState<Banco | null>(null);
  const [bancoIdInput, setBancoIdInput] = useState<string>("");
  const [carregandoBancos, setCarregandoBancos] = useState(false);

  // Carregar bancos quando o componente for montado
  useEffect(() => {
    const carregarBancos = async () => {
      setCarregandoBancos(true);
      try {
        const bancosData = await BancoService.findAll();
        // Garantir que sempre temos um array válido
        setBancos(Array.isArray(bancosData) ? bancosData : []);
      } catch (error) {
        console.error("Erro ao carregar bancos:", error);
        // Em caso de erro, definir array vazio
        setBancos([]);
      } finally {
        setCarregandoBancos(false);
      }
    };

    carregarBancos();
  }, []);

  // Sincronizar banco selecionado com formData
  useEffect(() => {
    if (formData.bancoId && bancos.length > 0) {
      const banco = bancos.find((b) => b.bancoId === formData.bancoId);
      if (banco) {
        setBancoSelecionado(banco);
        setBancoIdInput(banco.bancoId.toString());
      }
    }
  }, [formData.bancoId, bancos]);

  // Função para buscar banco por ID
  const buscarBancoPorId = async (id: string) => {
    if (!isValidBancoId(id)) {
      // Se o ID não é válido, limpar seleção
      setBancoSelecionado(null);
      setFormData((prev) => ({ ...prev, bancoId: undefined }));
      return;
    }

    const idNumber = Number(id);
    const banco = await findBancoById(idNumber, bancos);

    if (banco) {
      setBancoSelecionado(banco);
      setFormData((prev) => ({ ...prev, bancoId: banco.bancoId }));
    } else {
      setBancoSelecionado(null);
      setFormData((prev) => ({ ...prev, bancoId: undefined }));
    }
  };

  // Função para selecionar banco do select
  const selecionarBanco = (bancoId: string) => {
    const banco = bancos.find((b) => b.bancoId === Number(bancoId));
    if (banco) {
      setBancoSelecionado(banco);
      setBancoIdInput(banco.bancoId.toString());
      setFormData((prev) => ({ ...prev, bancoId: banco.bancoId }));
    }
  };

  // Função para buscar CEP manualmente
  const handleBuscarCEP = async () => {
    const sucesso = await buscarCEPCompleto(
      formData.cep || "",
      setFormData,
      () => {
        // Callback de sucesso - focar no campo número
        setTimeout(() => {
          const numeroInput = document.querySelector(
            'input[name="numero"]'
          ) as HTMLInputElement;
          if (numeroInput) {
            numeroInput.focus();
          }
        }, 100);
      },
      (error) => {
        // Callback de erro - mostrar toast
        toast.error(error);
      }
    );

    if (sucesso) {
      toast.success("CEP encontrado e preenchido com sucesso!");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dados-basicos" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Dados Básicos
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
      </TabsList>

      {/* Tab: Dados Básicos */}
      <TabsContent value="dados-basicos" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dados Básicos da Entidade</h3>
        
          {/* razao cnpj e ativo */}
          <div className="grid grid-cols-[70%_15%_10%] gap-4 border border-gray-300 rounded-md p-2">
            <ValidatedInput
              id="razaoSocial"
              name="razaoSocial"
              label="Razão Social"
              value={formData.razaoSocial || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  razaoSocial: e.target.value,
                }))
              }
              placeholder="Nome da empresa"
              disabled={isCreating || isUpdating}
              isRequired={true}
              validationMessage="Razão Social é obrigatória"
            />

            <div className="space-y-2">
              <ValidatedInput
                id="cnpj"
                label="CNPJ"
                value={formData.cnpj || ""}
                onChange={(e) => {
                  const maskedValue = maskCNPJ(e.target.value);
                  setFormData((prev) => ({ ...prev, cnpj: maskedValue }));
                }}
                placeholder="00.000.000/0000-00"
                disabled={isCreating || isUpdating}
                isRequired={true}
                validationMessage="CNPJ é obrigatório"
                customValidation={(value) => {
                  // Validação básica de CNPJ (14 dígitos)
                  const digits = value.replace(/\D/g, "");
                  return digits.length === 14;
                }}
              />
            </div>
          </div>
          {/* razao cnpj - fim */}
         
          <div className="grid grid-cols-1 gap-4 border border-gray-300 rounded-md p-2">
            <ValidatedInput
              id="email"
              name="email"
              type="email"
              label="E-mail Principal"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              placeholder="contato@empresa.com"
              disabled={isCreating || isUpdating}
              isRequired={true}
              validationMessage="E-mail é obrigatório"
              customValidation={(value) => {
                // Validação básica de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 border border-gray-300 rounded-md p-2">
            <div className="space-y-2">
              <Label htmlFor="urlSite">URL do Site</Label>
              <Input
                id="urlSite"
                name="urlSite"
                value={formData.urlSite || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    urlSite: e.target.value,
                  }))
                }
                placeholder="https://www.exemplo.com"
                disabled={isCreating || isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urlLogo">URL do Logo</Label>
              <Input
                id="urlLogo"
                name="urlLogo"
                value={formData.urlLogo || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    urlLogo: e.target.value,
                  }))
                }
                placeholder="https://www.exemplo.com/logo.png"
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Endereço */}
      <TabsContent value="endereco" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Endereço e Contatos</h3>

          {/* CEP e busca manual */}
          <div className="space-y-2 border border-gray-300 rounded-md p-2">
            <div className="flex gap-2 max-w-[15%]">
              <ValidatedInput
                id="cep"
                name="cep"
                label="CEP"
                value={formData.cep || ""}
                onChange={(e) => {
                  const maskedValue = maskCEP(e.target.value);
                  setFormData((prev) => ({ ...prev, cep: maskedValue }));
                }}
                placeholder="00000-000"
                disabled={isCreating || isUpdating}
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
                        isCreating ||
                        isUpdating ||
                        !formData.cep ||
                        formData.cep.replace(/\D/g, "").length !== 8
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
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                name="logradouro"
                value={formData.logradouro || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    logradouro: e.target.value,
                  }))
                }
                placeholder="Rua, Avenida, etc."
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                name="numero"
                value={formData.numero || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numero: e.target.value }))
                }
                placeholder="123"
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                name="complemento"
                value={formData.complemento || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    complemento: e.target.value,
                  }))
                }
                placeholder="Sala, Andar, etc."
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                name="bairro"
                value={formData.bairro || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bairro: e.target.value }))
                }
                placeholder="Nome do bairro"
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>

          <div className="grid grid-cols-[70%_10%_10%] gap-4 border border-gray-300 rounded-md p-2">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                name="cidade"
                value={formData.cidade || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cidade: e.target.value }))
                }
                placeholder="Nome da cidade"
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                name="uf"
                value={formData.uf || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, uf: e.target.value }))
                }
                placeholder="SP"
                maxLength={2}
                disabled={isCreating || isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidadeCodigo">Código IBGE</Label>
              <Input
                id="cidadeCodigo"
                name="cidadeCodigo"
                value={formData.cidadeCodigo || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cidadeCodigo: e.target.value,
                  }))
                }
                placeholder="Código IBGE"
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>

          {/* Contatos Comerciais */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contato Comercial</h4>
            <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoComercialNome">Nome</Label>
                <Input
                  id="contatoComercialNome"
                  name="contatoComercialNome"
                  value={formData.contatoComercialNome || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoComercialNome: e.target.value,
                    }))
                  }
                  placeholder="Nome do contato comercial"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoComercialEmail">E-mail</Label>
                <Input
                  id="contatoComercialEmail"
                  name="contatoComercialEmail"
                  type="email"
                  value={formData.contatoComercialEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoComercialEmail: e.target.value,
                    }))
                  }
                  placeholder="comercial@exemplo.com"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoComercialTelefone1">Telefone 1</Label>
                <Input
                  id="contatoComercialTelefone1"
                  name="contatoComercialTelefone1"
                  value={formData.contatoComercialTelefone1 || ""}
                  onChange={(e) => {
                    const maskedValue = maskTelefone(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      contatoComercialTelefone1: maskedValue,
                    }));
                  }}
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoComercialTelefone2">Telefone 2</Label>
                <Input
                  id="contatoComercialTelefone2"
                  name="contatoComercialTelefone2"
                  value={formData.contatoComercialTelefone2 || ""}
                  onChange={(e) => {
                    const maskedValue = maskTelefone(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      contatoComercialTelefone2: maskedValue,
                    }));
                  }}
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoComercialTelefone3">Telefone 3</Label>
                <Input
                  id="contatoComercialTelefone3"
                  name="contatoComercialTelefone3"
                  value={formData.contatoComercialTelefone3 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoComercialTelefone3: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Contatos Técnicos */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contato Técnico</h4>
            <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoTecnicoNome">Nome</Label>
                <Input
                  id="contatoTecnicoNome"
                  name="contatoTecnicoNome"
                  value={formData.contatoTecnicoNome || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoTecnicoNome: e.target.value,
                    }))
                  }
                  placeholder="Nome do contato técnico"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoTecnicoEmail">E-mail</Label>
                <Input
                  id="contatoTecnicoEmail"
                  name="contatoTecnicoEmail"
                  type="email"
                  value={formData.contatoTecnicoEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoTecnicoEmail: e.target.value,
                    }))
                  }
                  placeholder="tecnico@exemplo.com"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoTecnicoTelefone1">Telefone 1</Label>
                <Input
                  id="contatoTecnicoTelefone1"
                  name="contatoTecnicoTelefone1"
                  value={formData.contatoTecnicoTelefone1 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoTecnicoTelefone1: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoTecnicoTelefone2">Telefone 2</Label>
                <Input
                  id="contatoTecnicoTelefone2"
                  name="contatoTecnicoTelefone2"
                  value={formData.contatoTecnicoTelefone2 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoTecnicoTelefone2: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoTecnicoTelefone3">Telefone 3</Label>
                <Input
                  id="contatoTecnicoTelefone3"
                  name="contatoTecnicoTelefone3"
                  value={formData.contatoTecnicoTelefone3 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoTecnicoTelefone3: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
          </div>

          {/* Contatos Financeiros */}
          <div className="space-y-4">
            <h4 className="text-md font-medium">Contato Financeiro</h4>
            <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoFinanceiroNome">Nome</Label>
                <Input
                  id="contatoFinanceiroNome"
                  name="contatoFinanceiroNome"
                  value={formData.contatoFinanceiroNome || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoFinanceiroNome: e.target.value,
                    }))
                  }
                  placeholder="Nome do contato financeiro"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoFinanceiroEmail">E-mail</Label>
                <Input
                  id="contatoFinanceiroEmail"
                  name="contatoFinanceiroEmail"
                  type="email"
                  value={formData.contatoFinanceiroEmail || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoFinanceiroEmail: e.target.value,
                    }))
                  }
                  placeholder="financeiro@exemplo.com"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="contatoFinanceiroTelefone1">Telefone 1</Label>
                <Input
                  id="contatoFinanceiroTelefone1"
                  name="contatoFinanceiroTelefone1"
                  value={formData.contatoFinanceiroTelefone1 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoFinanceiroTelefone1: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoFinanceiroTelefone2">Telefone 2</Label>
                <Input
                  id="contatoFinanceiroTelefone2"
                  name="contatoFinanceiroTelefone2"
                  value={formData.contatoFinanceiroTelefone2 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoFinanceiroTelefone2: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contatoFinanceiroTelefone3">Telefone 3</Label>
                <Input
                  id="contatoFinanceiroTelefone3"
                  name="contatoFinanceiroTelefone3"
                  value={formData.contatoFinanceiroTelefone3 || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contatoFinanceiroTelefone3: maskTelefone(e.target.value),
                    }))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Tab: Dados Bancários */}
      <TabsContent value="dados-bancarios" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Dados Bancários</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="bancoId">Banco</Label>
                <div className="flex gap-2">
                  {/* Input para buscar por ID */}
                  <div className="flex gap-2 flex-1 max-w-[20%]">
                    <Input
                      id="bancoId"
                      name="bancoId"
                      type="number"
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
              <div className="space-y-2">
                <Label htmlFor="carteira">Carteira</Label>
                <Input
                  id="carteira"
                  name="carteira"
                  value={formData.carteira || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      carteira: e.target.value,
                    }))
                  }
                  placeholder="COBRANCA"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="agencia">Agência</Label>
                <Input
                  id="agencia"
                  name="agencia"
                  value={formData.agencia || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agencia: e.target.value,
                    }))
                  }
                  placeholder="123456"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenciaDigito">Dígito da Agência</Label>
                <Input
                  id="agenciaDigito"
                  name="agenciaDigito"
                  value={formData.agenciaDigito || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agenciaDigito: e.target.value,
                    }))
                  }
                  placeholder="5"
                  maxLength={1}
                  disabled={isCreating || isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta">Conta</Label>
                <Input
                  id="conta"
                  name="conta"
                  value={formData.conta || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, conta: e.target.value }))
                  }
                  placeholder="12345678"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contaDigito">Dígito da Conta</Label>
                <Input
                  id="contaDigito"
                  name="contaDigito"
                  value={formData.contaDigito || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contaDigito: e.target.value,
                    }))
                  }
                  placeholder="9"
                  maxLength={1}
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-[20%_80%] gap-4 border border-gray-300 rounded-md p-2">
              <div className="space-y-2">
                <Label htmlFor="cedenteCodigo">Código do Cedente</Label>
                <Input
                  id="cedenteCodigo"
                  name="cedenteCodigo"
                  value={formData.cedenteCodigo || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cedenteCodigo: e.target.value,
                    }))
                  }
                  placeholder="123456"
                  disabled={isCreating || isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedenteNome">Nome do Cedente</Label>
                <Input
                  id="cedenteNome"
                  name="cedenteNome"
                  value={formData.cedenteNome || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cedenteNome: e.target.value,
                    }))
                  }
                  placeholder="Nome da empresa"
                  disabled={isCreating || isUpdating}
                />
              </div>
            </div>
            <div className="space-y-2 border border-gray-300 rounded-md p-2">
              <Label htmlFor="chavePix">Chave PIX</Label>
              <Input
                id="chavePix"
                name="chavePix"
                value={formData.chavePix || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, chavePix: e.target.value }))
                }
                placeholder="empresa@exemplo.com"
                disabled={isCreating || isUpdating}
              />
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
