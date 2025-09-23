/**
 * Generic form handler hook that eliminates form duplication across components
 * Provides standardized form state management, validation, and submission patterns
 */
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface FormConfig<T> {
  initialData: T;
  validate?: (data: T) => Record<string, string> | null;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface FormHandlerReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  updateField: (field: keyof T, value: any) => void;
  updateMultipleFields: (updates: Partial<T>) => void;
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  resetForm: () => void;
  setFormData: (data: T) => void;
}

export const useFormHandler = <T extends Record<string, any>>(
  config: FormConfig<T>
): FormHandlerReturn<T> => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<T>(config.initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update single field
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  }, [errors]);

  // Update multiple fields at once
  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!config.validate) return true;
    
    const validationErrors = config.validate(formData);
    if (validationErrors) {
      setErrors(validationErrors);
      return false;
    }
    
    setErrors({});
    return true;
  }, [formData, config]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await config.onSubmit(formData);
      
      if (config.successMessage) {
        toast({
          title: "Éxito",
          description: config.successMessage,
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || config.errorMessage || "Ocurrió un error inesperado";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, config, toast]);

  // Handle form cancellation
  const handleCancel = useCallback(() => {
    resetForm();
    config.onCancel?.();
  }, [config]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(config.initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [config.initialData]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && 
    Object.values(formData).some(value => 
      value !== null && value !== undefined && value !== ''
    );

  return {
    formData,
    errors,
    isSubmitting,
    isValid,
    updateField,
    updateMultipleFields,
    handleSubmit,
    handleCancel,
    resetForm,
    setFormData,
  };
};

/**
 * Specialized form handler for forms with file uploads
 */
export const useFormWithFileHandler = <T extends Record<string, any>>(
  config: FormConfig<T>
) => {
  const formHandler = useFormHandler(config);

  // Enhanced file handling
  const handleFileUpload = useCallback((
    field: keyof T,
    files: FileList | null,
    options?: {
      multiple?: boolean;
      maxSize?: number; // in MB
      allowedTypes?: string[];
      asDataURL?: boolean;
    }
  ) => {
    if (!files) return;

    const { multiple = false, maxSize = 10, allowedTypes = [], asDataURL = true } = options || {};

    const processFiles = async () => {
      const processedFiles: string[] = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          formHandler.setFormData(prev => ({
            ...prev,
            [`${String(field)}Error`]: `El archivo debe ser menor a ${maxSize}MB`
          } as T));
          continue;
        }

        // Validate file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
          formHandler.setFormData(prev => ({
            ...prev,
            [`${String(field)}Error`]: `Tipo de archivo no permitido`
          } as T));
          continue;
        }

        if (asDataURL) {
          // Convert to data URL
          const dataURL = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
          processedFiles.push(dataURL);
        } else {
          // Use file name or URL
          processedFiles.push(file.name);
        }

        // Break if not multiple
        if (!multiple) break;
      }

      // Update form data
      const currentValue = formHandler.formData[field] as string[] || [];
      const newValue = multiple 
        ? [...currentValue, ...processedFiles]
        : processedFiles[0];

      formHandler.updateField(field, newValue);
    };

    processFiles().catch(error => {
      console.error('File processing error:', error);
    });
  }, [formHandler]);

  // Remove file from array
  const removeFile = useCallback((field: keyof T, index: number) => {
    const currentFiles = formHandler.formData[field] as string[];
    if (Array.isArray(currentFiles)) {
      const newFiles = currentFiles.filter((_, i) => i !== index);
      formHandler.updateField(field, newFiles);
    }
  }, [formHandler]);

  return {
    ...formHandler,
    handleFileUpload,
    removeFile,
  };
};