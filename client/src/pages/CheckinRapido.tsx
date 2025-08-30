import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Timer, Brain, Heart, Zap, TrendingUp, Moon, Users, Utensils, Droplets, Activity, Sun, Monitor, Sparkles, Wind, Shield, Palette } from "lucide-react";
import { api } from "@/lib/api";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import MoodThemeSelector from "@/components/MoodThemeSelector";

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
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
    
    <div className="flex justify-center space-x-4">
      {emojis.map((emoji, index) => {
        const rating = index + 1;
        return (
          <div key={index} className="text-center">
            <button
              type="button"
              onClick={() => onChange(rating)}
              className={`text-4xl p-2 rounded-full transition-all transform hover:scale-110 ${
                value === rating ? 'bg-primary/20 scale-110' : 'hover:bg-gray-100'
              }`}
            >
              {emoji}
            </button>
            <div className={`text-xs mt-1 ${value === rating ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
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
  const { suggestAndApplyTheme } = useMoodTheme();

  const [currentMood, setCurrentMood] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [quickNote, setQuickNote] = useState<string>('');
  
  // Factores protectores
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [socialConnections, setSocialConnections] = useState<number>(0);
  const [mealsCount, setMealsCount] = useState<number>(3);
  const [waterIntake, setWaterIntake] = useState<number>(8);
  const [physicalActivity, setPhysicalActivity] = useState<number>(30);
  const [sunlightExposure, setSunlightExposure] = useState<number>(15);
  const [screenTimeHours, setScreenTimeHours] = useState<number>(6);
  const [gratitudeMoments, setGratitudeMoments] = useState<number>(1);
  const [deepBreathingMinutes, setDeepBreathingMinutes] = useState<number>(5);
  
  const [startTime] = useState<number>(Date.now());
  const [showThemeSelector, setShowThemeSelector] = useState<boolean>(false);

  const checkInMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/quick-checkin-entries', data);
      return response.data;
    },
    onSuccess: () => {
      const elapsedTime = Math.round((Date.now() - startTime) / 1000);
      
      queryClient.invalidateQueries({ queryKey: ['/api/quick-checkin-entries'] });
      
      // Mostrar selector de temas después del check-in exitoso
      setShowThemeSelector(true);
      
      toast({
        title: "¡Check-in completado! ⚡",
        description: `Tiempo: ${elapsedTime}s. Tu bienestar ha sido registrado.`,
        duration: 3000,
      });
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
      location: userLocation.trim() || null,
      quickNote: quickNote.trim() || null,
      // Factores protectores
      sleepHours: sleepHours.toString(),
      socialConnections,
      mealsCount,
      waterIntake,
      physicalActivity,
      sunlightExposure,
      screenTimeHours: screenTimeHours.toString(),
      gratitudeMoments,
      deepBreathingMinutes
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

  // Función para manejar la selección de tema y continuar
  const handleThemeSelection = () => {
    // Sugerir tema basado en el estado de ánimo actual
    const suggestedTheme = suggestAndApplyTheme(currentMood, energyLevel, stressLevel, true);
    
    toast({
      title: "🎨 Tema personalizado aplicado",
      description: `Se aplicó el tema "${suggestedTheme.name}" basado en tu estado de ánimo.`,
      duration: 3000,
    });
    
    setTimeout(() => {
      navigate('/mentalcheck');
    }, 1000);
  };

  const handleSkipTheme = () => {
    navigate('/mentalcheck');
  };

  // Si se debe mostrar el selector de temas
  if (showThemeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E8E3D3] p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/mentalcheck')}
              className="flex items-center text-primary hover:text-[#A08751]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>

          {/* Título principal */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">¡Check-in completado!</h1>
            <p className="text-muted-foreground text-lg">Personaliza tu experiencia con un tema de color</p>
          </div>

          {/* Mensaje de éxito del check-in */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6">
            <CardContent className="p-6 text-center">
              <p className="text-green-700">
                Tu estado de ánimo ha sido registrado. Ahora elige un tema de color que refleje cómo te sientes y te haga sentir bien.
              </p>
            </CardContent>
          </Card>

          {/* Selector de temas */}
          <MoodThemeSelector 
            currentMood={currentMood}
            onThemeSelect={handleThemeSelection}
            showTitle={false}
          />

          {/* Botones de acción */}
          <div className="flex gap-3 justify-center mt-6">
            <Button
              onClick={handleThemeSelection}
              className="bg-primary hover:bg-primary/90"
            >
              <Palette className="mr-2 h-4 w-4" />
              Aplicar tema recomendado
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSkipTheme}
            >
              Saltar por ahora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E8E3D3] p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header con timer */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/mentalcheck')}
            className="flex items-center text-primary hover:text-[#A08751]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
            <Timer className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-foreground">
              {getElapsedTime()}s
            </span>
          </div>
        </div>

        {/* Título principal */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Check-in Rápido</h1>
          <p className="text-muted-foreground text-lg">¿Cómo te sientes en este momento?</p>
          <div className="text-sm text-primary mt-2 font-medium">⚡ Solo 30 segundos</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Estado de ánimo */}
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg">
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
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg">
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
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg">
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

          {/* Factores Protectores */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-emerald-800">
                <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                Factores Protectores de Hoy
              </CardTitle>
              <p className="text-sm text-emerald-600">
                Estos hábitos saludables fortalecen tu bienestar mental
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Horas de sueño */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Moon className="h-4 w-4" />
                    Sueño: {sleepHours}h
                  </Label>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Personas vistas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Personas: {socialConnections}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={socialConnections}
                    onChange={(e) => setSocialConnections(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Comidas */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Utensils className="h-4 w-4" />
                    Comidas: {mealsCount}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Agua */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Droplets className="h-4 w-4" />
                    Agua: {waterIntake} vasos
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={waterIntake}
                    onChange={(e) => setWaterIntake(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Actividad física */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Ejercicio: {physicalActivity}min
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Sol/aire libre */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Sun className="h-4 w-4" />
                    Sol: {sunlightExposure}min
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    value={sunlightExposure}
                    onChange={(e) => setSunlightExposure(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Tiempo de pantalla */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Monitor className="h-4 w-4" />
                    Pantalla: {screenTimeHours}h
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="0.5"
                    value={screenTimeHours}
                    onChange={(e) => setScreenTimeHours(Number(e.target.value))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Momentos de gratitud */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    Gratitud: {gratitudeMoments}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={gratitudeMoments}
                    onChange={(e) => setGratitudeMoments(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Respiración consciente */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-emerald-800 flex items-center gap-1">
                    <Wind className="h-4 w-4" />
                    Respiración: {deepBreathingMinutes}min
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={deepBreathingMinutes}
                    onChange={(e) => setDeepBreathingMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="bg-emerald-100 rounded-lg p-3 mt-4">
                <p className="text-xs text-emerald-700 text-center">
                  💡 <strong>Tip:</strong> Estos factores fortalecen tu resiliencia mental y mejoran tu estado de ánimo naturalmente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contexto opcional (rápido) */}
          <Card className="bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-foreground">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Contexto del Momento (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="activity" className="text-sm font-medium text-foreground">
                    ¿Qué estás haciendo?
                  </Label>
                  <Input
                    id="activity"
                    value={currentActivity}
                    onChange={(e) => setCurrentActivity(e.target.value)}
                    placeholder="ej: trabajando, entrenando, descansando"
                    className="mt-1 bg-white border-primary/20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-foreground">
                    ¿Dónde estás?
                  </Label>
                  <Input
                    id="location"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="ej: casa, gimnasio, oficina"
                    className="mt-1 bg-white border-primary/20"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="note" className="text-sm font-medium text-foreground">
                  Reflexión rápida
                </Label>
                <Textarea
                  id="note"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Una reflexión breve sobre este momento..."
                  rows={2}
                  maxLength={100}
                  className="mt-1 bg-white border-primary/20 resize-none"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
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
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/80 hover:to-primary/60 text-white font-semibold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
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
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-primary/10 rounded-full px-4 py-2">
              <TrendingUp className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm text-foreground font-medium">
                ¡Cada check-in te ayuda a conocerte mejor!
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}