
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Play, Image, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface MediaUploadProps {
  onMediaUploaded: (mediaFiles: MediaFile[]) => void;
  currentMediaFiles?: MediaFile[];
  onRemoveMedia?: (index: number) => void;
  label?: string;
}

const MediaUpload = ({ onMediaUploaded, currentMediaFiles = [], onRemoveMedia, label = "Archivos multimedia (opcional)" }: MediaUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !user) return;

    // Validate file types
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP) y video (MP4, WebM, QuickTime, AVI)",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (100MB for videos, 10MB for images)
    const oversizedFiles = files.filter(file => {
      const isVideo = allowedVideoTypes.includes(file.type);
      const maxSize = isVideo ? 104857600 : 10485760; // 100MB for videos, 10MB for images
      return file.size > maxSize;
    });

    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: "Los videos no pueden superar los 100MB y las imágenes no pueden superar los 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const bucketName = allowedVideoTypes.includes(file.type) ? 'judo-videos' : 'judo-images';

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        return {
          url: publicUrl,
          type: allowedVideoTypes.includes(file.type) ? 'video' as const : 'image' as const,
          name: file.name
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const allMediaFiles = [...currentMediaFiles, ...uploadedFiles];
      onMediaUploaded(allMediaFiles);
      
      toast({
        title: "Éxito",
        description: `${uploadedFiles.length} archivo(s) subido(s) correctamente`,
      });

      // Reset input
      e.target.value = '';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir los archivos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (index: number) => {
    if (onRemoveMedia) {
      onRemoveMedia(index);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentMediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {currentMediaFiles.map((mediaFile, index) => (
            <div key={index} className="relative border rounded-lg overflow-hidden">
              {mediaFile.type === 'video' ? (
                <video 
                  controls 
                  className="w-full h-32 object-cover"
                  preload="metadata"
                >
                  <source src={mediaFile.url} type="video/mp4" />
                  Tu navegador no soporta videos HTML5.
                </video>
              ) : (
                <img 
                  src={mediaFile.url} 
                  alt={mediaFile.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    console.error('Error loading image:', mediaFile.url);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              )}
              {onRemoveMedia && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => handleRemoveMedia(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <div className="absolute bottom-1 left-1">
                {mediaFile.type === 'video' ? (
                  <Play className="h-4 w-4 text-white bg-black bg-opacity-50 rounded-full p-0.5" />
                ) : (
                  <Image className="h-4 w-4 text-white bg-black bg-opacity-50 rounded-full p-0.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-2">
            <Image className="h-6 w-6 text-slate-400" />
            <Play className="h-6 w-6 text-slate-400" />
          </div>
          <div className="text-center">
            <Label htmlFor="media-upload" className="cursor-pointer text-sm text-slate-600">
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo archivos...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 inline mr-1" />
                  Haz clic para subir fotos y videos
                </>
              )}
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              Imágenes: JPEG, PNG, GIF, WebP (máx. 10MB)<br />
              Videos: MP4, WebM, QuickTime, AVI (máx. 100MB)
            </p>
          </div>
        </div>
        <Input
          id="media-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
          onChange={handleMediaUpload}
          disabled={uploading}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );
};

export default MediaUpload;
