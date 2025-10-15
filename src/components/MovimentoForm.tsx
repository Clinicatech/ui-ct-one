import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { MovimentoFormData } from "../types/movimento";

interface MovimentoFormProps {
  formData: MovimentoFormData;
  setFormData: (data: MovimentoFormData) => void;
  isLoading?: boolean;
  onSubmit: (data: MovimentoFormData) => Promise<void>;
  onCancel: () => void;
  movimento?: any;
}

export function MovimentoForm({
  formData,
  setFormData,
  isLoading = false,
  onSubmit,
  onCancel,
  movimento,
}: MovimentoFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MovimentoFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande. Tamanho máximo: 5MB");
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de arquivo não permitido. Use PDF, JPG ou PNG");
        return;
      }

      setFormData({
        ...formData,
        comprovante: file,
      });

      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      comprovante: undefined,
    });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="h-4 w-4" />;

    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pago"
              checked={formData.pago}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;

                const newData = {
                  ...formData,
                  pago: isChecked,
                  // Resetar campos quando desmarcar pago
                  ...(isChecked ? {} : { valorEfetivo: 0, dataPagamento: "" }),
                };
                setFormData(newData);
              }}
            />
            <Label htmlFor="pago">Marcar como pago/recebido</Label>
          </div>

          {formData.pago && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">
                  Data do Pagamento/Recebimento
                </Label>
                <Input
                  id="dataPagamento"
                  type="date"
                  value={formData.dataPagamento}
                  onChange={(e) =>
                    handleInputChange("dataPagamento", e.target.value)
                  }
                  required={formData.pago}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorEfetivo">Valor Efetivo</Label>
                <Input
                  id="valorEfetivo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorEfetivo}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue =
                      value === "" ? 0 : parseFloat(value) || 0;
                    handleInputChange("valorEfetivo", numericValue);
                  }}
                  placeholder="0,00"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comprovante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comprovante">Arquivo do Comprovante</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="comprovante"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Formatos aceitos: PDF, JPG, PNG. Tamanho máximo: 5MB
            </p>
          </div>

          {formData.comprovante && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(formData.comprovante.name)}
                  <span className="text-sm font-medium">
                    {formData.comprovante.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(formData.comprovante.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          )}

          {movimento?.urlComprovante && !formData.comprovante && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Comprovante atual: {movimento.urlComprovante.split("/").pop()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </form>
  );
}
