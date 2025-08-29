import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Calendar, 
  TrendingUp,
  Plus,
  Zap,
  Heart,
  User,
  CheckCircle,
  Target
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

interface StressEntry {
  id: string;
  userId: string;
  date: string;
  stressLevel: number;
  stressType?: string;
  triggers?: string[];
  copingStrategies?: string[];
  effectiveness?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface StressFormData {
  stressLevel: number;
  stressType: string;
  triggers: string[];
  copingStrategies: string[];
  effectiveness: number;
  notes: string;
}

const NivelesEstres = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [formData, setFormData] = useState<StressFormData>({
    stressLevel: 3,
    stressType: "mental",
    triggers: [],
    copingStrategies: [],
    effectiveness: 3,
    notes: ""
  });

  const stressTypes = [
    { value: "fisico", label: "Físico", icon: Zap },
    { value: "mental", label: "Mental", icon: Brain },
    { value: "emocional", label: "Emocional", icon: Heart },
    { value: "social", label: "Social", icon: User }
  ];

  const availableTriggers = [
    "Trabajo excesivo",
    "Falta de sueño", 
    "Problemas familiares",
    "Presión económica",
    "Lesión o dolor",
    "Competencia próxima",
    "Entrenamiento intenso",
    "Conflictos personales",
    "Problemas de salud",
    "Cambios importantes",
    "Sobrecarga de responsabilidades",
    "Incertidumbre"
  ];

  const availableStrategies = [
    "Respiración profunda",
    "Meditación",
    "Ejercicio físico",
    "Hablar con alguien",
    "Tomar un descanso",
    "Escuchar música",
    "Salir a caminar",
    "Escribir en un diario",
    "Técnicas de relajación",
    "Planificar mejor el tiempo",
    "Buscar ayuda profesional",
    "Actividades recreativas"
  ];

  // Fetch stress entries
  const { data: stressEntries = [], isLoading } = useQuery({
    queryKey: ['stress-entries', user?.id],
    queryFn: async (): Promise<StressEntry[]> => {
      if (!user?.id) return [];
      const response = await fetch(`/api/stress-entries?user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch stress entries');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Create stress entry mutation
  const createStressEntryMutation = useMutation({
    mutationFn: async (data: Omit<StressEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/stress-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create stress entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stress-entries'] });
      toast({
        title: "Registro guardado",
        description: "Tu nivel de estrés ha sido registrado exitosamente.",
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
      stressLevel: 3,
      stressType: "mental",
      triggers: [],
      copingStrategies: [],
      effectiveness: 3,
      notes: ""
    });
    setSelectedTriggers([]);
    setSelectedStrategies([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    createStressEntryMutation.mutate({
      userId: user.id,
      date: today,
      ...formData,
      triggers: selectedTriggers,
      copingStrategies: selectedStrategies
    });
  };

  const getStressEmoji = (level: number) => {
    const emojis = ['😌', '😐', '😟', '😰', '😱'];
    return emojis[level - 1] || '😐';
  };

  const getStressColor = (level: number) => {
    const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500'];
    return colors[level - 1] || 'bg-gray-500';
  };

  const getStressText = (level: number) => {
    const texts = ['Muy relajado', 'Tranquilo', 'Moderado', 'Alto', 'Muy alto'];
    return texts[level - 1] || 'Moderado';
  };

  const getEffectivenessColor = (level: number) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];
    return colors[level - 1] || 'bg-gray-500';
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const toggleStrategy = (strategy: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const todaysEntry = stressEntries.find(entry => {
    const today = new Date().toISOString().split('T')[0];
    return entry.date === today;
  });

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Niveles de Estrés"
        subtitle="¿Qué te estresa y cómo lo manejas? Identifica desencadenantes y mejora tus estrategias de afrontamiento"
      />

      <div className="max-w-6xl mx-auto p-4">
        {/* Today's entry or form */}
        <div className="mb-6">
          {todaysEntry ? (
            <Card className="bg-white border-[#C5A46C]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Nivel de Estrés de Hoy
                </CardTitle>
                <CardDescription>
                  Registrado el {new Date(todaysEntry.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-4xl mb-2">{getStressEmoji(todaysEntry.stressLevel)}</div>
                      <div className="text-sm text-gray-600">Nivel de Estrés</div>
                      <div className="font-bold text-lg">{todaysEntry.stressLevel}/5</div>
                      <div className="text-sm">{getStressText(todaysEntry.stressLevel)}</div>
                    </div>
                    
                    {todaysEntry.stressType && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Tipo de estrés:</div>
                        <Badge variant="secondary" className="capitalize">{todaysEntry.stressType}</Badge>
                      </div>
                    )}

                    {todaysEntry.effectiveness && (
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <div className="text-sm text-gray-600">Efectividad de estrategias</div>
                        <div className="font-semibold">{todaysEntry.effectiveness}/5</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {todaysEntry.triggers && todaysEntry.triggers.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Desencadenantes:</div>
                        <div className="flex flex-wrap gap-2">
                          {todaysEntry.triggers.map((trigger, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">{trigger}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {todaysEntry.copingStrategies && todaysEntry.copingStrategies.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Estrategias utilizadas:</div>
                        <div className="flex flex-wrap gap-2">
                          {todaysEntry.copingStrategies.map((strategy, index) => (
                            <Badge key={index} variant="default" className="text-xs bg-green-100 text-green-800">{strategy}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {todaysEntry.notes && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Notas:</div>
                        <div className="text-sm bg-gray-50 p-3 rounded">{todaysEntry.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-[#C5A46C]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  ¿Cómo está tu nivel de estrés hoy?
                </CardTitle>
                <CardDescription>
                  Registra tu estrés para identificar patrones y encontrar mejores estrategias de manejo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Nivel de Estrés
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Stress Level */}
                    <div>
                      <Label className="text-sm font-medium">Nivel de Estrés (1-5)</Label>
                      <div className="flex gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, stressLevel: level })}
                            className={`p-3 rounded text-2xl transition-colors flex-1 flex flex-col items-center ${
                              formData.stressLevel === level 
                                ? 'bg-[#C5A46C] shadow-lg text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <div>{getStressEmoji(level)}</div>
                            <div className="text-xs mt-1">{level}</div>
                          </button>
                        ))}
                      </div>
                      <div className="text-center text-sm text-gray-500 mt-2">
                        {getStressText(formData.stressLevel)}
                      </div>
                    </div>

                    {/* Stress Type */}
                    <div>
                      <Label className="text-sm font-medium">Tipo de Estrés</Label>
                      <Select 
                        value={formData.stressType} 
                        onValueChange={(value) => setFormData({ ...formData, stressType: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecciona el tipo de estrés" />
                        </SelectTrigger>
                        <SelectContent>
                          {stressTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Triggers */}
                    <div>
                      <Label className="text-sm font-medium">Desencadenantes del Estrés</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableTriggers.map((trigger) => (
                          <button
                            key={trigger}
                            type="button"
                            onClick={() => toggleTrigger(trigger)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedTriggers.includes(trigger)
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {trigger}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Coping Strategies */}
                    <div>
                      <Label className="text-sm font-medium">Estrategias de Afrontamiento Utilizadas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {availableStrategies.map((strategy) => (
                          <button
                            key={strategy}
                            type="button"
                            onClick={() => toggleStrategy(strategy)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedStrategies.includes(strategy)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {strategy}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Effectiveness */}
                    {selectedStrategies.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">¿Qué tan efectivas fueron las estrategias? (1-5)</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setFormData({ ...formData, effectiveness: level })}
                              className={`p-2 rounded transition-colors flex items-center justify-center flex-1 ${
                                formData.effectiveness === level 
                                  ? 'bg-[#C5A46C] text-white' 
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              <CheckCircle className={`h-4 w-4 mr-1 ${getEffectivenessColor(level)}`} />
                              <span className="text-sm">{level}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <Label className="text-sm font-medium">Notas adicionales (opcional)</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="¿Qué más notaste sobre tu estrés hoy? ¿Algo específico que te ayudó o empeoró la situación?"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createStressEntryMutation.isPending}
                        className="flex-1 bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                      >
                        {createStressEntryMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
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
        {stressEntries.length > 0 && (
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historial de Estrés
              </CardTitle>
              <CardDescription>
                Tus registros recientes de niveles de estrés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stressEntries.slice(0, 7).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getStressEmoji(entry.stressLevel)}</div>
                      <div>
                        <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">
                          {entry.stressType && <span className="capitalize">{entry.stressType} • </span>}
                          {getStressText(entry.stressLevel)}
                          {entry.effectiveness && ` • Efectividad: ${entry.effectiveness}/5`}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.stressLevel}/5
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

export default NivelesEstres;