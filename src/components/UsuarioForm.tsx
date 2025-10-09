import React, { useState, useEffect } from "react";
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
import { maskCPF, maskCNPJ } from "../utils/masks";
import { toast } from "sonner";
import { UsuarioFormData } from "../types/usuario";
import { TIPO_PESSOA_OPTIONS } from "../constants/cliente-constants";
import { PersonSearchDialog } from "./PersonSearchDialog";
import { Pessoa } from "../services/pessoa.service";
import { UsuarioService } from "../services/usuario.service";

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UsuarioFormData) => Promise<void>;
  formData: UsuarioFormData;
  setFormData: (data: UsuarioFormData) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function UsuarioForm({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isCreating,
}: UsuarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPersonSearchOpen, setIsPersonSearchOpen] = useState(false);
  const [showReplicationDialog, setShowReplicationDialog] = useState(false);
  const [usersInOtherEntities, setUsersInOtherEntities] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasChanges =
      formData.email !== "" ||
      formData.pessoaId !== undefined ||
      formData.pessoa !== undefined ||
      formData.ativo !== true ||
      formData.adm !== false;

    setHasUnsavedChanges(hasChanges);
  }, [formData]);

  // Função para fechar dialog com confirmação
  const handleCloseDialog = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirmation(true);
    } else {
      onClose();
    }
  };

  // Função para confirmar fechamento
  const confirmClose = () => {
    setShowCloseConfirmation(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  // Função para cancelar fechamento
  const cancelClose = () => {
    setShowCloseConfirmation(false);
  };

  const handlePersonSelect = (pessoa: Pessoa) => {
    setFormData({
      ...formData,
      pessoaId: pessoa.pessoaId,
      pessoa: {
        tipo: pessoa.tipo,
        nome: pessoa.nome,
        documento: pessoa.documento,
        razao: pessoa.razao || "",
        entidadeId: pessoa.entidadeId,
      },
    });
    setIsPersonSearchOpen(false);
    toast.success("Pessoa selecionada com sucesso!");
  };

  const handleRemovePerson = () => {
    setFormData({
      ...formData,
      pessoaId: undefined,
      pessoa: undefined,
    });
    toast.success("Pessoa removida com sucesso!");
  };

  const handleEmailChange = async (email: string) => {
    setFormData({ ...formData, email });

    if (email && email.includes("@")) {
      try {
        const usersInOtherEntities =
          await UsuarioService.findByEmailInOtherEntities(email, 1); // TODO: pegar entidadeId do usuário logado
        if (usersInOtherEntities.length > 0) {
          setUsersInOtherEntities(usersInOtherEntities);
          setShowReplicationDialog(true);
        }
      } catch (error) {
        console.error("Erro ao verificar email em outras entidades:", error);
      }
    }
  };

  const handleReplicateUser = async (usuarioId: number) => {
    try {
      await UsuarioService.replicateUserToEntity(usuarioId, 1); // TODO: pegar entidadeId do usuário logado
      const userToReplicate = usersInOtherEntities.find(
        (u) => u.usuarioId === usuarioId
      );
      if (userToReplicate) {
        setFormData({
          ...formData,
          pessoaId: userToReplicate.pessoaId,
        });
        toast.success("Usuário replicado com sucesso!");
      }
      setShowReplicationDialog(false);
    } catch (error) {
      console.error("Erro ao replicar usuário:", error);
      toast.error("Erro ao replicar usuário");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar se tem pessoa
      if (!formData.pessoaId && !formData.pessoa) {
        toast.error("É obrigatório informar uma pessoa");
        setIsSubmitting(false);
        return;
      }

      console.log("🔍 UsuarioForm - formData antes de enviar:", formData);
      await onSubmit(formData);
      toast.success(
        isCreating
          ? "Usuário criado com sucesso!"
          : "Usuário atualizado com sucesso!"
      );
      onClose();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário");
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
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="min-w-[65vw] min-h-[35vw] max-h-[35vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "Cadastrar Usuário" : "Editar Usuário"}
            </DialogTitle>
            <DialogDescription>
              {isCreating
                ? "Preencha os dados para cadastrar um novo usuário"
                : "Atualize os dados do usuário"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="dados-usuario" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados-usuario">
                  Dados do Usuário
                </TabsTrigger>
                <TabsTrigger value="dados-pessoa">Dados da Pessoa</TabsTrigger>
              </TabsList>

              <TabsContent value="dados-usuario" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="usuario@exemplo.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ativo">Status</Label>
                    <Select
                      value={formData.ativo ? "ativo" : "inativo"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, ativo: value === "ativo" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adm">Tipo de Usuário</Label>
                  <Select
                    value={formData.adm ? "adm" : "usuario"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, adm: value === "adm" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário</SelectItem>
                      <SelectItem value="adm">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Pessoa Vinculada
                      </h4>
                      <p className="text-sm text-blue-700">
                        {formData.pessoaId && formData.pessoa?.nome
                          ? formData.pessoa.nome
                          : "Selecione ou cadastre uma pessoa"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPersonSearchOpen(true)}
                    >
                      Buscar Pessoa
                    </Button>
                    {formData.pessoaId && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemovePerson}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dados-pessoa" className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Se não houver pessoa selecionada, você pode cadastrar uma
                    nova pessoa aqui.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select
                        value={formData.pessoa?.tipo || "PF"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            pessoa: {
                              tipo: value as "PF" | "PJ",
                              nome: formData.pessoa?.nome || "",
                              documento: formData.pessoa?.documento || "",
                              razao: formData.pessoa?.razao || "",
                              entidadeId: formData.pessoa?.entidadeId || 1, // TODO: pegar entidadeId do usuário logado
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPO_PESSOA_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
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
                        value={formData.pessoa?.documento || ""}
                        onChange={(e) => {
                          const maskFunction = getDocumentMask(
                            formData.pessoa?.tipo || "PF"
                          );
                          const maskedValue = maskFunction(e.target.value);
                          setFormData({
                            ...formData,
                            pessoa: {
                              tipo: formData.pessoa?.tipo || "PF",
                              nome: formData.pessoa?.nome || "",
                              documento: maskedValue,
                              razao: formData.pessoa?.razao || "",
                              entidadeId: formData.pessoa?.entidadeId || 1, // TODO: pegar entidadeId do usuário logado
                            },
                          });
                        }}
                        placeholder={getDocumentPlaceholder(
                          formData.pessoa?.tipo || "PF"
                        )}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.pessoa?.nome || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pessoa: {
                            tipo: formData.pessoa?.tipo || "PF",
                            nome: e.target.value,
                            documento: formData.pessoa?.documento || "",
                            razao: formData.pessoa?.razao || "",
                            entidadeId: formData.pessoa?.entidadeId || 1, // TODO: pegar entidadeId do usuário logado
                          },
                        })
                      }
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  {(formData.pessoa?.tipo || "PF") === "PJ" && (
                    <div className="space-y-2">
                      <Label htmlFor="razao">Razão Social</Label>
                      <Input
                        id="razao"
                        value={formData.pessoa?.razao || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pessoa: {
                              tipo: formData.pessoa?.tipo || "PF",
                              nome: formData.pessoa?.nome || "",
                              documento: formData.pessoa?.documento || "",
                              razao: e.target.value,
                              entidadeId: formData.pessoa?.entidadeId || 1, // TODO: pegar entidadeId do usuário logado
                            },
                          })
                        }
                        placeholder="Razão social"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-blue-800">
                        <strong>Dica:</strong> Você também pode buscar uma
                        pessoa existente clicando em "Buscar Pessoa" na aba
                        "Dados do Usuário".
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPersonSearchOpen(true)}
                    >
                      Buscar Pessoa
                    </Button>
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
                  ? "Cadastrar"
                  : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PersonSearchDialog
        isOpen={isPersonSearchOpen}
        onClose={() => setIsPersonSearchOpen(false)}
        onSelectPerson={handlePersonSelect}
      />

      <Dialog
        open={showReplicationDialog}
        onOpenChange={setShowReplicationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuário encontrado em outra entidade</DialogTitle>
            <DialogDescription>
              O e-mail informado está vinculado a outra entidade. Deseja
              replicar para esta?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {usersInOtherEntities.map((user) => (
              <div key={user.usuarioId} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-600">
                      Entidade: {user.entidade?.nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      Pessoa: {user.pessoa?.nome}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleReplicateUser(user.usuarioId)}
                    size="sm"
                  >
                    Replicar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReplicationDialog(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para fechar com mudanças não salvas */}
      <Dialog
        open={showCloseConfirmation}
        onOpenChange={setShowCloseConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudanças não salvas</DialogTitle>
            <DialogDescription>
              Você tem mudanças não salvas. Tem certeza que deseja fechar sem
              salvar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelClose}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmClose}>
              Fechar sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
