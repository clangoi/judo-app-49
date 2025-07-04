
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Play, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string) => void;
  currentVideoUrl?: string;
  onRemoveVideo?: () => void;
}

const VideoUpload = ({ onVideoUploaded, currentVideoUrl, onRemoveVideo }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten videos MP4, WebM, QuickTime o AVI",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB)
    if (file.size > 104857600) {
      toast({
        title: "Error",
        description: "El video no puede superar los 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('judo-videos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('judo-videos')
        .getPublicUrl(fileName);

      onVideoUploaded(publicUrl);
      
      toast({
        title: "Éxito",
        description: "Video subido correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir el video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Video (opcional)</Label>
      
      {currentVideoUrl ? (
        <div className="space-y-2">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              controls 
              className="w-full h-48 object-contain"
              preload="metadata"
            >
              <source src={currentVideoUrl} type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
          {onRemoveVideo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemoveVideo}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Eliminar Video
            </Button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Play className="h-8 w-8 text-slate-400" />
            <div className="text-center">
              <Label htmlFor="video-upload" className="cursor-pointer text-sm text-slate-600">
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo video...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 inline mr-1" />
                    Haz clic para subir un video
                  </>
                )}
              </Label>
              <p className="text-xs text-slate-500 mt-1">
                MP4, WebM, QuickTime o AVI (máx. 100MB)
              </p>
            </div>
          </div>
          <Input
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            onChange={handleVideoUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
