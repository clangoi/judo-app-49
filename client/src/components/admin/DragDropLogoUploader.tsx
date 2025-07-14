import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Image, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropLogoUploaderProps {
  clubId: string;
  currentLogoUrl?: string;
  onUpload: (file: File, clubId: string) => Promise<void>;
  isUploading?: boolean;
}

const DragDropLogoUploader: React.FC<DragDropLogoUploaderProps> = ({
  clubId,
  currentLogoUrl,
  onUpload,
  isUploading = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadSuccess(false);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        await onUpload(selectedFile, clubId);
        setUploadSuccess(true);
        setTimeout(() => {
          setPreview(null);
          setSelectedFile(null);
          setUploadSuccess(false);
        }, 2000);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadSuccess(false);
  };

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {currentLogoUrl && !preview && (
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={currentLogoUrl} 
              alt="Logo actual"
              className="h-20 w-20 object-contain rounded-lg border border-border"
            />
            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-primary/50",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-6 text-center space-y-4">
          {preview ? (
            // Preview Section
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={preview} 
                  alt="Vista previa"
                  className="h-24 w-24 object-contain rounded-lg border border-border"
                />
              </div>
              
              {uploadSuccess ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">¡Logo subido exitosamente!</span>
                </div>
              ) : (
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Logo
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Upload Area
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className={cn(
                  "p-3 rounded-full",
                  isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Image className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {isDragOver 
                    ? "Suelta la imagen aquí" 
                    : "Arrastra y suelta una imagen aquí"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  o haz clic para seleccionar un archivo
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                PNG, JPG, GIF hasta 5MB
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>
          )}
        </div>
      </Card>
      
      {/* Upload Instructions */}
      {!preview && !currentLogoUrl && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            El logo se mostrará en el perfil del club y será visible para todos los usuarios
          </p>
        </div>
      )}
    </div>
  );
};

export default DragDropLogoUploader;