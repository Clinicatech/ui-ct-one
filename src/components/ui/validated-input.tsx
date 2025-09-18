import React, { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";

interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isRequired?: boolean;
  validationMessage?: string;
  onValidationChange?: (isValid: boolean) => void;
  showValidation?: boolean;
  customValidation?: (value: string) => boolean;
}

export function ValidatedInput({
  label,
  isRequired = false,
  validationMessage,
  onValidationChange,
  showValidation = false,
  customValidation,
  className = "",
  value = "",
  onChange,
  ...props
}: ValidatedInputProps) {
  const [isValid, setIsValid] = useState(true);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  // Função de validação padrão
  const defaultValidation = (val: string) => {
    if (isRequired && !val?.trim()) {
      return false;
    }
    if (customValidation) {
      return customValidation(val);
    }
    return true;
  };

  // Validar quando o valor muda
  useEffect(() => {
    const valid = defaultValidation(value as string);
    setIsValid(valid);
    onValidationChange?.(valid);
  }, [value, isRequired, customValidation, onValidationChange]);

  // Marcar como tocado quando o usuário interage
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasBeenTouched(true);
    onChange?.(e);
  };

  const handleBlur = () => {
    setHasBeenTouched(true);
  };

  // Determinar se deve mostrar erro
  const shouldShowError = hasBeenTouched && !isValid;

  // Classes CSS para o input
  const inputClasses = [
    className,
    shouldShowError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Classes CSS para o label
  const labelClasses = [isRequired ? "font-bold" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className={labelClasses}>
          {label} {isRequired && "*"}
        </Label>
      )}
      <Input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClasses}
        required={isRequired}
      />
      {shouldShowError && validationMessage && (
        <p className="text-sm text-red-500">{validationMessage}</p>
      )}
    </div>
  );
}

// Hook para gerenciar validação de formulário
export function useFormValidation() {
  const [validationState, setValidationState] = useState<
    Record<string, boolean>
  >({});
  const [showValidation, setShowValidation] = useState(false);

  const validateField = (
    fieldName: string,
    value: string,
    isRequired: boolean = false,
    customValidation?: (val: string) => boolean
  ) => {
    let isValid = true;

    if (isRequired && !value?.trim()) {
      isValid = false;
    }

    if (customValidation && isValid) {
      isValid = customValidation(value);
    }

    setValidationState((prev) => ({
      ...prev,
      [fieldName]: isValid,
    }));

    return isValid;
  };

  const validateAllFields = (
    fields: Record<
      string,
      {
        value: string;
        isRequired: boolean;
        customValidation?: (val: string) => boolean;
      }
    >
  ) => {
    setShowValidation(true);
    let allValid = true;

    Object.entries(fields).forEach(([fieldName, config]) => {
      const isValid = validateField(
        fieldName,
        config.value,
        config.isRequired,
        config.customValidation
      );
      if (!isValid) allValid = false;
    });

    return allValid;
  };

  const clearValidation = () => {
    setValidationState({});
    setShowValidation(false);
  };

  const getFieldValidation = (fieldName: string) => {
    return {
      isValid: validationState[fieldName] !== false,
      showValidation,
    };
  };

  return {
    validateField,
    validateAllFields,
    clearValidation,
    getFieldValidation,
    showValidation,
    setShowValidation,
  };
}
