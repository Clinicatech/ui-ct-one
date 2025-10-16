import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User } from "lucide-react";
import { maskCPF, maskCNPJ, maskCEP } from "../utils/masks";
import { ValidatedInput } from "./ui/validated-input";
import { toast } from "sonner";
import { ClienteFormData } from "../types/cliente";
import { TIPO_PESSOA_OPTIONS } from "../constants/cliente-constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { PersonSearchDialog } from "./PersonSearchDialog";
import { Pessoa } from "../services/pessoa.service";

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  formData: ClienteFormData;
  setFormData: (data: ClienteFormData) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function ClienteForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isCreating,
}: ClienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonSearchOpen, setIsPersonSearchOpen] = useState(false);
  const [isResponsavelSearchOpen, setIsResponsavelSearchOpen] = useState(false);

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

      toast.success("CEP encontrado com sucesso!");

      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numero"]'
        ) as HTMLInputElement;
        if (numeroInput) {
          numeroInput.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  // Função para seleção de pessoa
  const handleSelectPerson = (person: Pessoa) => {
    setFormData({
      ...formData,
      pessoa: {
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
    });

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
      clienteInfo: {
        ...formData.clienteInfo,
        pessoaResponsavelId: person.pessoaId,
      },
    });

    toast.success("Dados do responsável carregados com sucesso!");
  };

  const handleRemoveResponsavel = () => {
    setFormData({
      ...formData,
      responsavel: undefined,
      enderecoResponsavel: undefined,
      clienteInfo: {
        ...formData.clienteInfo,
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

      toast.success("CEP encontrado com sucesso!");

      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numeroResponsavel"]'
        ) as HTMLInputElement;
        if (numeroInput) {
          numeroInput.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      toast.success(
        isCreating
          ? "Cliente criado com sucesso!"
          : "Cliente atualizado com sucesso!"
      );
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Erro ao salvar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentMask = (tipo: string) => {
    return tipo === "PF" ? maskCPF : maskCNPJ;
  };

  const getDocumentPlaceholder = (tipo: string) => {
    return tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Novo Cliente" : "Editar Cliente"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Preencha os dados para cadastrar um novo cliente"
                : "Edite os dados do cliente selecionado"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="pessoa" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pessoa">Pessoa</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                <TabsTrigger value="enderecoResponsavel">
                  Endereço Responsável
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pessoa" className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="tipoPessoa">Tipo *</Label>
                    <Select
                      value={formData.pessoa.tipo}
                      onValueChange={(value) =>
                        handlePessoaChange("tipo", value)
                      }
                      name="tipoPessoa"
                    >
                      <SelectTrigger id="tipoPessoa">
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
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.pessoa.nome}
                      onChange={(e) =>
                        handlePessoaChange("nome", e.target.value)
                      }
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  {formData.pessoa.tipo === "PJ" && (
                    <div className="space-y-2 border border-gray-300 rounded-md p-2">
                      <Label htmlFor="razao">Razão Social</Label>
                      <Input
                        id="razao"
                        value={formData.pessoa.razao || ""}
                        onChange={(e) =>
                          handlePessoaChange("razao", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="documento">Documento *</Label>
                    <ValidatedInput
                      id="documento"
                      value={formData.pessoa.documento}
                      onChange={(e) => {
                        const maskedValue = getDocumentMask(
                          formData.pessoa.tipo
                        )(e.target.value);
                        handlePessoaChange("documento", maskedValue);
                      }}
                      placeholder={getDocumentPlaceholder(formData.pessoa.tipo)}
                      required
                    />
                  </div>

                  {formData.pessoa.tipo === "PJ" && (
                    <>
                      <div className="space-y-2 border border-gray-300 rounded-md p-2">
                        <Label htmlFor="inscricaoEstadual">
                          Inscrição Estadual
                        </Label>
                        <Input
                          id="inscricaoEstadual"
                          value={formData.pessoa.inscricaoEstadual || ""}
                          onChange={(e) =>
                            handlePessoaChange(
                              "inscricaoEstadual",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2 border border-gray-300 rounded-md p-2">
                        <Label htmlFor="inscricaoMunicipal">
                          Inscrição Municipal
                        </Label>
                        <Input
                          id="inscricaoMunicipal"
                          value={formData.pessoa.inscricaoMunicipal || ""}
                          onChange={(e) =>
                            handlePessoaChange(
                              "inscricaoMunicipal",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="endereco" className="space-y-4">
                <div className="grid grid-cols-[20%_60%_15%] gap-4">
                  <div className="space-y-2  border border-gray-300 rounded-md p-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="flex gap-2">
                      <ValidatedInput
                        id="cep"
                        value={formData.endereco?.cep || ""}
                        onChange={(e) => {
                          const maskedValue = maskCEP(e.target.value);
                          handleEnderecoChange("cep", maskedValue);
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
                              onClick={handleBuscarCEP}
                              disabled={
                                !formData.endereco?.cep ||
                                (formData.endereco?.cep?.replace(/\D/g, "")
                                  .length || 0) !== 8
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
                    <Label htmlFor="endereco">Logradouro</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco?.endereco || ""}
                      onChange={(e) =>
                        handleEnderecoChange("endereco", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      name="numero"
                      value={formData.endereco?.numero || ""}
                      onChange={(e) =>
                        handleEnderecoChange("numero", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[40%_57%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.endereco?.complemento || ""}
                      onChange={(e) =>
                        handleEnderecoChange("complemento", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.endereco?.bairro || ""}
                      onChange={(e) =>
                        handleEnderecoChange("bairro", e.target.value)
                      }
                      placeholder="Nome do bairro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[70%_10%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.endereco?.cidade || ""}
                      onChange={(e) =>
                        handleEnderecoChange("cidade", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      value={formData.endereco?.uf || ""}
                      onChange={(e) =>
                        handleEnderecoChange("uf", e.target.value)
                      }
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Campos de Contato */}
                <div className="grid grid-cols-[20%_20%_55%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.endereco?.contatoComercialTelefone1 || ""}
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialTelefone1",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.endereco?.contatoComercialTelefone2 || ""}
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialTelefone2",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.endereco?.contatoComercialEmail || ""}
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialEmail",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="responsavel" className="space-y-4">
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
                    <Label htmlFor="responsavelTipo">Tipo</Label>
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
                    <Label htmlFor="responsavelNome">Nome</Label>
                    <Input
                      id="responsavelNome"
                      value={formData.responsavel?.nome || ""}
                      onChange={(e) =>
                        handleResponsavelChange("nome", e.target.value)
                      }
                    />
                  </div>

                  {formData.responsavel?.tipo === "PJ" && (
                    <div className="space-y-2 border border-gray-300 rounded-md p-2">
                      <Label htmlFor="responsavelRazao">Razão Social</Label>
                      <Input
                        id="responsavelRazao"
                        value={formData.responsavel?.razao || ""}
                        onChange={(e) =>
                          handleResponsavelChange("razao", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="responsavelDocumento">Documento</Label>
                    <ValidatedInput
                      id="responsavelDocumento"
                      value={formData.responsavel?.documento || ""}
                      onChange={(e) => {
                        const maskedValue = getDocumentMask(
                          formData.responsavel?.tipo || "PF"
                        )(e.target.value);
                        handleResponsavelChange("documento", maskedValue);
                      }}
                      placeholder={getDocumentPlaceholder(
                        formData.responsavel?.tipo || "PF"
                      )}
                    />
                  </div>

                  {formData.responsavel?.tipo === "PJ" && (
                    <>
                      <div className="space-y-2 border border-gray-300 rounded-md p-2">
                        <Label htmlFor="responsavelInscricaoEstadual">
                          Inscrição Estadual
                        </Label>
                        <Input
                          id="responsavelInscricaoEstadual"
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
                        <Label htmlFor="responsavelInscricaoMunicipal">
                          Inscrição Municipal
                        </Label>
                        <Input
                          id="responsavelInscricaoMunicipal"
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
              </TabsContent>

              <TabsContent value="enderecoResponsavel" className="space-y-4">
                <div className="grid grid-cols-[20%_60%_15%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="cepResponsavel">CEP</Label>
                    <div className="flex gap-2">
                      <ValidatedInput
                        id="cepResponsavel"
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
                    <Label htmlFor="enderecoResponsavel">Logradouro</Label>
                    <Input
                      id="enderecoResponsavel"
                      value={formData.enderecoResponsavel?.endereco || ""}
                      onChange={(e) =>
                        handleEnderecoResponsavelChange(
                          "endereco",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="numeroResponsavel">Número</Label>
                    <Input
                      id="numeroResponsavel"
                      name="numeroResponsavel"
                      value={formData.enderecoResponsavel?.numero || ""}
                      onChange={(e) =>
                        handleEnderecoResponsavelChange(
                          "numero",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-[40%_57%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="complementoResponsavel">Complemento</Label>
                    <Input
                      id="complementoResponsavel"
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
                    <Label htmlFor="bairroResponsavel">Bairro</Label>
                    <Input
                      id="bairroResponsavel"
                      value={formData.enderecoResponsavel?.bairro || ""}
                      onChange={(e) =>
                        handleEnderecoResponsavelChange(
                          "bairro",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[70%_10%] gap-4">
                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="cidadeResponsavel">Cidade</Label>
                    <Input
                      id="cidadeResponsavel"
                      value={formData.enderecoResponsavel?.cidade || ""}
                      onChange={(e) =>
                        handleEnderecoResponsavelChange(
                          "cidade",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="ufResponsavel">UF</Label>
                    <Input
                      id="ufResponsavel"
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
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={
                        formData.enderecoResponsavel
                          ?.contatoComercialTelefone1 || ""
                      }
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialTelefone1",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={
                        formData.enderecoResponsavel
                          ?.contatoComercialTelefone2 || ""
                      }
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialTelefone2",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2 border border-gray-300 rounded-md p-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={
                        formData.enderecoResponsavel?.contatoComercialEmail ||
                        ""
                      }
                      onChange={(e) =>
                        handleEnderecoChange(
                          "contatoComercialEmail",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : isCreating
                  ? "Criar Cliente"
                  : "Atualizar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de pesquisa de pessoas */}
      <PersonSearchDialog
        isOpen={isPersonSearchOpen}
        onClose={() => setIsPersonSearchOpen(false)}
        onSelectPerson={handleSelectPerson}
        title="Buscar Pessoa para Cliente"
      />

      {/* Dialog de pesquisa de responsável */}
      <PersonSearchDialog
        isOpen={isResponsavelSearchOpen}
        onClose={() => setIsResponsavelSearchOpen(false)}
        onSelectPerson={handleSelectResponsavel}
        title="Buscar Responsável"
      />
    </>
  );
}
