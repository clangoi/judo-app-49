import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Smile, 
  Battery, 
  Brain, 
  Bed, 
  Target,
  Calendar,
  TrendingUp,
  Plus
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  moodLevel: number;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  motivation: number;
  notes?: string;
  factors?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MoodFormData {
  moodLevel: number;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  motivation: number;
  notes: string;
  factors: string[];
}

const EstadoAnimo = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [formData, setFormData] = useState<MoodFormData>({
    moodLevel: 3,
    energyLevel: 3,
    stressLevel: 3,
    sleepQuality: 3,
    motivation: 3,
    notes: "",
    factors: []
  });

  const availableFactors = [
    "Entrenamiento intenso",
    "Buen descanso", 
    "Estrés laboral",
    "Problemas familiares",
    "Logro personal",
    "Alimentación saludable",
    "Lesión/Dolor",
    "Clima",
    "Competencia próxima",
    "Apoyo social"
  ];

  // Fetch mood entries
  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['mood-entries', user?.id],
    queryFn: async (): Promise<MoodEntry[]> => {
      if (!user?.id) return [];
      const response = await fetch(`/api/mood-entries?user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch mood entries');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Create mood entry mutation
  const createMoodEntryMutation = useMutation({
    mutationFn: async (data: Omit<MoodEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/mood-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create mood entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      toast({
        title: "Registro guardado",
        description: "Tu estado de ánimo ha sido registrado exitosamente.",
      });
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar el registro. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      moodLevel: 3,
      energyLevel: 3,
      stressLevel: 3,
      sleepQuality: 3,
      motivation: 3,
      notes: "",
      factors: []
    });
    setSelectedFactors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    createMoodEntryMutation.mutate({
      userId: user.id,
      date: today,
      ...formData,
      factors: selectedFactors
    });
  };

  const getMoodEmoji = (level: number) => {
    const emojis = ['😢', '😟', '😐', '😊', '😃'];
    return emojis[level - 1] || '😐';
  };

  const getEnergyColor = (level: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    return colors[level - 1] || 'bg-gray-500';
  };

  const getStressColor = (level: number) => {
    const colors = ['bg-emerald-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
    return colors[level - 1] || 'bg-gray-500';
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors(prev => 
      prev.includes(factor) 
        ? prev.filter(f => f !== factor)
        : [...prev, factor]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const todaysEntry = moodEntries.find(entry => {
    const today = new Date().toISOString().split('T')[0];
    return entry.date === today;
  });

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Estado de Ánimo"
        subtitle="¿Cómo te sientes hoy? Evalúa tu bienestar emocional general: ánimo, energía, sueño y motivación"
      />

      <div className="max-w-6xl mx-auto p-4">
        {/* Today's entry or form */}
        <div className="mb-6">
          {todaysEntry ? (
            <Card className="bg-white border-primary">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Estado de Hoy
                </CardTitle>
                <CardDescription>
                  Registrado el {new Date(todaysEntry.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{getMoodEmoji(todaysEntry.moodLevel)}</div>
                    <div className="text-sm text-gray-600">Ánimo</div>
                    <div className="font-semibold">{todaysEntry.moodLevel}/5</div>
                  </div>
                  <div className="text-center">
                    <Battery className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                    <div className="text-sm text-gray-600">Energía</div>
                    <div className="font-semibold">{todaysEntry.energyLevel}/5</div>
                  </div>
                  <div className="text-center">
                    <Brain className="h-6 w-6 mx-auto mb-1 text-purple-500" />
                    <div className="text-sm text-gray-600">Estrés</div>
                    <div className="font-semibold">{todaysEntry.stressLevel}/5</div>
                  </div>
                  <div className="text-center">
                    <Bed className="h-6 w-6 mx-auto mb-1 text-indigo-500" />
                    <div className="text-sm text-gray-600">Sueño</div>
                    <div className="font-semibold">{todaysEntry.sleepQuality}/5</div>
                  </div>
                  <div className="text-center">
                    <Target className="h-6 w-6 mx-auto mb-1 text-green-500" />
                    <div className="text-sm text-gray-600">Motivación</div>
                    <div className="font-semibold">{todaysEntry.motivation}/5</div>
                  </div>
                </div>
                
                {todaysEntry.factors && todaysEntry.factors.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Factores que influyeron:</div>
                    <div className="flex flex-wrap gap-2">
                      {todaysEntry.factors.map((factor, index) => (
                        <Badge key={index} variant="secondary">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {todaysEntry.notes && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-1">Notas:</div>
                    <div className="text-sm bg-gray-50 p-2 rounded">{todaysEntry.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-primary">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  ¿Cómo te sientes hoy?
                </CardTitle>
                <CardDescription>
                  Registra tu estado emocional para llevar un seguimiento de tu bienestar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Estado de Ánimo
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mood Level */}
                    <div>
                      <Label className="text-sm font-medium">Estado de Ánimo (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, moodLevel: level })}
                            className={`p-3 rounded text-2xl transition-colors ${
                              formData.moodLevel === level 
                                ? 'bg-primary shadow-lg' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {getMoodEmoji(level)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Energy Level */}
                    <div>
                      <Label className="text-sm font-medium">Nivel de Energía (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, energyLevel: level })}
                            className={`p-2 rounded transition-colors flex items-center justify-center ${
                              formData.energyLevel === level 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <Battery className={`h-4 w-4 ${getEnergyColor(level)}`} />
                            <span className="ml-1 text-sm">{level}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stress Level */}
                    <div>
                      <Label className="text-sm font-medium">Nivel de Estrés (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, stressLevel: level })}
                            className={`p-2 rounded transition-colors flex items-center justify-center ${
                              formData.stressLevel === level 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <Brain className={`h-4 w-4 ${getStressColor(level)}`} />
                            <span className="ml-1 text-sm">{level}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sleep Quality */}
                    <div>
                      <Label className="text-sm font-medium">Calidad del Sueño (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, sleepQuality: level })}
                            className={`p-2 rounded transition-colors flex items-center justify-center ${
                              formData.sleepQuality === level 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <Bed className="h-4 w-4" />
                            <span className="ml-1 text-sm">{level}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Motivation */}
                    <div>
                      <Label className="text-sm font-medium">Motivación (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, motivation: level })}
                            className={`p-2 rounded transition-colors flex items-center justify-center ${
                              formData.motivation === level 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <Target className="h-4 w-4" />
                            <span className="ml-1 text-sm">{level}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Factors */}
                    <div>
                      <Label className="text-sm font-medium">Factores que influyeron (opcional)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableFactors.map((factor) => (
                          <button
                            key={factor}
                            type="button"
                            onClick={() => toggleFactor(factor)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedFactors.includes(factor)
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {factor}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-sm font-medium">Notas adicionales (opcional)</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="¿Algo más que quieras recordar sobre tu día?"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createMoodEntryMutation.isPending}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      >
                        {createMoodEntryMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        className="px-6"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent entries */}
        {moodEntries.length > 0 && (
          <Card className="bg-white border-primary">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historial Reciente
              </CardTitle>
              <CardDescription>
                Tus últimos registros de estado de ánimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {moodEntries.slice(0, 7).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getMoodEmoji(entry.moodLevel)}</div>
                      <div>
                        <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">
                          Energía: {entry.energyLevel}/5 | Estrés: {entry.stressLevel}/5 | Sueño: {entry.sleepQuality}/5
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.moodLevel}/5
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EstadoAnimo;