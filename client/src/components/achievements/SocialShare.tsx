import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Twitter, Facebook, Instagram, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AchievementBadge } from "@/hooks/useAchievements";

interface SocialShareProps {
  badge: AchievementBadge;
  userEmail?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ badge, userEmail }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const userName = userEmail?.split('@')[0] || 'Judoka';
  const achievementText = `¡Acabo de desbloquear el logro "${badge.name}" en mi entrenamiento de judo! 🥋 ${badge.description}`;
  const hashtags = "#Judo #Entrenamiento #Logros #MartesArtes #JudoLife";
  const fullShareText = `${achievementText} ${hashtags}`;

  // Generate a shareable image URL (using a placeholder service for demo)
  const generateShareImageUrl = () => {
    const baseUrl = "https://via.placeholder.com/800x400/C5A46C/FFFFFF";
    const text = encodeURIComponent(`${badge.name}\n${badge.description}\n- ${userName}`);
    return `${baseUrl}?text=${text}`;
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(achievementText)}`,
    instagram: generateShareImageUrl(), // For Instagram, we'll provide the image to download
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      toast({
        title: "¡Copiado!",
        description: "El texto del logro se ha copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el texto",
        variant: "destructive",
      });
    }
  };

  const downloadShareImage = () => {
    // Create a canvas to generate the share image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 800;
    canvas.height = 400;
    
    // Background
    ctx.fillStyle = '#C5A46C';
    ctx.fillRect(0, 0, 800, 400);
    
    // Add text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡Nuevo Logro!', 400, 80);
    
    ctx.font = 'bold 36px Arial';
    ctx.fillText(badge.name, 400, 160);
    
    ctx.font = '24px Arial';
    ctx.fillText(badge.description, 400, 220);
    
    ctx.font = '20px Arial';
    ctx.fillText(`- ${userName}`, 400, 280);
    
    ctx.font = '18px Arial';
    ctx.fillText('#Judo #Entrenamiento #Logros', 400, 340);
    
    // Download the image
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logro-${badge.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "¡Descargado!",
          description: "La imagen del logro se ha descargado",
        });
      }
    });
  };

  const openShareUrl = (platform: 'twitter' | 'facebook') => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      training: '🥋',
      technique: '🎯',
      weight: '⚖️',
      nutrition: '🍎',
      consistency: '🔥'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartir
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(badge.category)}</span>
            Compartir Logro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Achievement Preview */}
          <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-4xl">{getCategoryIcon(badge.category)}</div>
                <h3 className="font-bold text-lg">{badge.name}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
                <p className="text-xs text-gray-500">Conseguido por {userName}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Share Text Preview */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm">{fullShareText}</p>
          </div>
          
          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => openShareUrl('twitter')}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            
            <Button
              onClick={() => openShareUrl('facebook')}
              className="gap-2 bg-blue-700 hover:bg-blue-800"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            
            <Button
              onClick={downloadShareImage}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Imagen
            </Button>
            
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar Texto
            </Button>
          </div>
          
          {/* Instagram Instructions */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Para Instagram:</strong> Descarga la imagen y súbela manualmente a tu historia o feed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};