import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
          cidade_codigo: data.ibge,
          uf_codigo: data.ibge ? data.ibge.substring(0, 2) : undefined,
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
          cidade_codigo: data.ibge,
          uf_codigo: data.ibge ? data.ibge.substring(0, 2) : undefined,
        },
      });

      toast.success("CEP encontrado com sucesso!");

      setTimeout(() => {
        const numeroInput = document.querySelector(
          'input[name="numero_responsavel"]'
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Novo Cliente" : "Editar Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="pessoa" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pessoa">Pessoa</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
              <TabsTrigger value="endereco_responsavel">
                Endereço Responsável
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoa" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 border border-gray-300 rounded-md p-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.pessoa.tipo}
                    onValueChange={(value) => handlePessoaChange("tipo", value)}
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
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.pessoa.nome}
                    onChange={(e) => handlePessoaChange("nome", e.target.value)}
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
                      const maskedValue = getDocumentMask(formData.pessoa.tipo)(
                        e.target.value
                      );
                      handlePessoaChange("documento", maskedValue);
                    }}
                    placeholder={getDocumentPlaceholder(formData.pessoa.tipo)}
                    required
                  />
                </div>

                {formData.pessoa.tipo === "PJ" && (
                  <>
                    <div className="space-y-2 border border-gray-300 rounded-md p-2">
                      <Label htmlFor="inscricao_estadual">
                        Inscrição Estadual
                      </Label>
                      <Input
                        id="inscricao_estadual"
                        value={formData.pessoa.inscricao_estadual || ""}
                        onChange={(e) =>
                          handlePessoaChange(
                            "inscricao_estadual",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2 border border-gray-300 rounded-md p-2">
                      <Label htmlFor="inscricao_municipal">
                        Inscrição Municipal
                      </Label>
                      <Input
                        id="inscricao_municipal"
                        value={formData.pessoa.inscricao_municipal || ""}
                        onChange={(e) =>
                          handlePessoaChange(
                            "inscricao_municipal",
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
                    onChange={(e) => handleEnderecoChange("uf", e.target.value)}
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
                    value={formData.endereco?.contato_comercial_telefone1 || ""}
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_telefone1",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="space-y-2 border border-gray-300 rounded-md p-2">
                  <Label htmlFor="celular">Celular</Label>
                  <Input
                    id="celular"
                    value={formData.endereco?.contato_comercial_telefone2 || ""}
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_telefone2",
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
                    value={formData.endereco?.contato_comercial_email || ""}
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_email",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="responsavel" className="space-y-4">
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
                  <ValidatedInput
                    id="responsavel_documento"
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
                      <Label htmlFor="responsavel_inscricao_estadual">
                        Inscrição Estadual
                      </Label>
                      <Input
                        id="responsavel_inscricao_estadual"
                        value={formData.responsavel?.inscricao_estadual || ""}
                        onChange={(e) =>
                          handleResponsavelChange(
                            "inscricao_estadual",
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
                        value={formData.responsavel?.inscricao_municipal || ""}
                        onChange={(e) =>
                          handleResponsavelChange(
                            "inscricao_municipal",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="endereco_responsavel" className="space-y-4">
              <div className="grid grid-cols-[20%_60%_15%] gap-4">
                <div className="space-y-2 border border-gray-300 rounded-md p-2">
                  <Label htmlFor="cep_responsavel">CEP</Label>
                  <div className="flex gap-2">
                    <ValidatedInput
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
                      handleEnderecoResponsavelChange(
                        "endereco",
                        e.target.value
                      )
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
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={
                      formData.enderecoResponsavel
                        ?.contato_comercial_telefone1 || ""
                    }
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_telefone1",
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
                        ?.contato_comercial_telefone2 || ""
                    }
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_telefone2",
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
                      formData.enderecoResponsavel?.contato_comercial_email ||
                      ""
                    }
                    onChange={(e) =>
                      handleEnderecoChange(
                        "contato_comercial_email",
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
  );
}
