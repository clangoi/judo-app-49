import React, { useState } from "react";
import { useNavigate } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Timer, Brain, Heart, Zap, TrendingUp } from "lucide-react";

// Componente para rating con emojis
interface EmojiRatingProps {
  value: number;
  onChange: (value: number) => void;
  emojis: string[];
  labels: string[];
  title: string;
  description: string;
}

const EmojiRating: React.FC<EmojiRatingProps> = ({ 
  value, 
  onChange, 
  emojis, 
  labels, 
  title, 
  description 
}) => (
  <div className="space-y-3">
    <div className="text-center">
      <h3 className="text-lg font-medium text-[#1A1A1A]">{title}</h3>
      <p className="text-sm text-[#575757] mt-1">{description}</p>
    </div>
    
    <div className="flex justify-center space-x-4">
      {emojis.map((emoji, index) => {
        const rating = index + 1;
        return (
          <div key={index} className="text-center">
            <button
              onClick={() => onChange(rating)}
              className={`text-4xl p-2 rounded-full transition-all transform hover:scale-110 ${
                value === rating ? 'bg-[#C5A46C]/20 scale-110' : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
            <div className={`text-xs mt-1 ${value === rating ? 'text-[#C5A46C] font-semibold' : 'text-[#575757]'}`}>
              {labels[index]}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function CheckinRapido() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentMood, setCurrentMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [quickNote, setQuickNote] = useState<string>('');
  const [startTime] = useState<number>(Date.now());

  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quick-checkin-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create check-in');
      }
      
      return response.json();
    },
    onSuccess: () => {
      const elapsedTime = Math.round((Date.now() - startTime) / 1000);
      
      queryClient.invalidateQueries({ queryKey: ['/api/quick-checkin-entries'] });
      
      toast({
        title: "¡Check-in completado! ⚡",
        description: `Tiempo: ${elapsedTime}s. Tu bienestar ha sido registrado.`,
        duration: 3000,
      });
      
      navigate('/mentalcheck');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar tu check-in. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      currentMood,
      energyLevel,
      stressLevel,
      currentActivity: currentActivity.trim() || null,
      location: location.trim() || null,
      quickNote: quickNote.trim() || null
    };
    
    checkInMutation.mutate(data);
  };

  const getElapsedTime = () => {
    return Math.round((Date.now() - startTime) / 1000);
  };

  const moodEmojis = ['😰', '😔', '😐', '😊', '😄'];
  const moodLabels = ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'];

  const energyEmojis = ['🔋', '🔋', '🔋', '🔋', '🔋'];
  const energyLabels = ['Agotado', 'Cansado', 'Normal', 'Energético', 'Súper activo'];

  const stressEmojis = ['😌', '🙂', '😐', '😟', '😵‍💫'];
  const stressLabels = ['Muy relajado', 'Relajado', 'Normal', 'Estresado', 'Muy estresado'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E8E3D3] p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header con timer */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/mentalcheck')}
            className="flex items-center text-[#C5A46C] hover:text-[#A08751]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <Timer className="h-4 w-4 text-[#C5A46C] mr-2" />
            <span className="text-sm font-medium text-[#1A1A1A]">
              {getElapsedTime()}s
            </span>
          </div>
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C5A46C] to-[#A08751] rounded-full flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Check-in Rápido</h1>
          <p className="text-[#575757] text-lg">¿Cómo te sientes en este momento?</p>
          <div className="text-sm text-[#C5A46C] mt-2 font-medium">⚡ Solo 30 segundos</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Estado de ánimo */}
          <Card className="bg-white/90 backdrop-blur-sm border-[#C5A46C]/20 shadow-lg">
            <CardContent className="p-6">
              <EmojiRating
                value={currentMood}
                onChange={setCurrentMood}
                emojis={moodEmojis}
                labels={moodLabels}
                title="Estado de Ánimo"
                description="¿Cómo te sientes emocionalmente?"
              />
            </CardContent>
          </Card>

          {/* Nivel de energía */}
          <Card className="bg-white/90 backdrop-blur-sm border-[#C5A46C]/20 shadow-lg">
            <CardContent className="p-6">
              <EmojiRating
                value={energyLevel}
                onChange={setEnergyLevel}
                emojis={energyEmojis}
                labels={energyLabels}
                title="Nivel de Energía"
                description="¿Qué tan activo te sientes?"
              />
            </CardContent>
          </Card>

          {/* Nivel de estrés */}
          <Card className="bg-white/90 backdrop-blur-sm border-[#C5A46C]/20 shadow-lg">
            <CardContent className="p-6">
              <EmojiRating
                value={stressLevel}
                onChange={setStressLevel}
                emojis={stressEmojis}
                labels={stressLabels}
                title="Nivel de Estrés"
                description="¿Qué tan tenso o relajado estás?"
              />
            </CardContent>
          </Card>

          {/* Contexto opcional (rápido) */}
          <Card className="bg-white/90 backdrop-blur-sm border-[#C5A46C]/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-[#1A1A1A]">
                <Brain className="mr-2 h-5 w-5 text-[#C5A46C]" />
                Contexto del Momento (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activity" className="text-sm font-medium text-[#1A1A1A]">
                    ¿Qué estás haciendo?
                  </Label>
                  <Input
                    id="activity"
                    value={currentActivity}
                    onChange={(e) => setCurrentActivity(e.target.value)}
                    placeholder="ej: trabajando, entrenando, descansando"
                    className="mt-1 bg-white border-[#C5A46C]/20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-[#1A1A1A]">
                    ¿Dónde estás?
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ej: casa, gimnasio, oficina"
                    className="mt-1 bg-white border-[#C5A46C]/20"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="note" className="text-sm font-medium text-[#1A1A1A]">
                  Reflexión rápida
                </Label>
                <Textarea
                  id="note"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Una reflexión breve sobre este momento..."
                  rows={2}
                  maxLength={100}
                  className="mt-1 bg-white border-[#C5A46C]/20 resize-none"
                />
                <div className="text-xs text-[#575757] mt-1 text-right">
                  {quickNote.length}/100
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de envío */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={checkInMutation.isPending}
              className="bg-gradient-to-r from-[#C5A46C] to-[#A08751] hover:from-[#A08751] hover:to-[#8B7355] text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {checkInMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Completar Check-in
                </>
              )}
            </Button>
          </div>
          
          {/* Mensaje motivacional */}
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-[#C5A46C]/10 to-[#A08751]/10 rounded-full px-4 py-2">
              <TrendingUp className="h-4 w-4 text-[#C5A46C] mr-2" />
              <span className="text-sm text-[#1A1A1A] font-medium">
                ¡Cada check-in te ayuda a conocerte mejor!
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}