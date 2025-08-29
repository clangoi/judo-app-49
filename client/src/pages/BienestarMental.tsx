import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Calendar, 
  TrendingUp,
  Plus,
  Star,
  Users,
  Target,
  Shield,
  Lightbulb,
  CheckCircle2,
  ThumbsUp
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

interface MentalWellnessEntry {
  id: string;
  userId: string;
  date: string;
  overallWellness: number;
  lifesatisfaction: number;
  selfEsteem: number;
  socialConnection: number;
  purposeMeaning: number;
  emotionalRegulation: number;
  anxietyLevel: number;
  positiveThoughts?: string[];
  challengesOvercome?: string[];
  gratitudeItems?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WellnessFormData {
  overallWellness: number;
  lifesatisfaction: number;
  selfEsteem: number;
  socialConnection: number;
  purposeMeaning: number;
  emotionalRegulation: number;
  anxietyLevel: number;
  positiveThoughts: string[];
  challengesOvercome: string[];
  gratitudeItems: string[];
  notes: string;
}

const BienestarMental = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [currentGratitude, setCurrentGratitude] = useState("");
  const [formData, setFormData] = useState<WellnessFormData>({
    overallWellness: 5,
    lifesatisfaction: 5,
    selfEsteem: 5,
    socialConnection: 5,
    purposeMeaning: 5,
    emotionalRegulation: 5,
    anxietyLevel: 5,
    positiveThoughts: [],
    challengesOvercome: [],
    gratitudeItems: [],
    notes: ""
  });

  const wellnessAspects = [
    { key: 'overallWellness', label: 'Bienestar General', icon: Heart, color: 'text-red-500' },
    { key: 'lifesatisfaction', label: 'Satisfacción con la Vida', icon: Star, color: 'text-yellow-500' },
    { key: 'selfEsteem', label: 'Autoestima', icon: Shield, color: 'text-green-500' },
    { key: 'socialConnection', label: 'Conexión Social', icon: Users, color: 'text-blue-500' },
    { key: 'purposeMeaning', label: 'Propósito y Significado', icon: Target, color: 'text-purple-500' },
    { key: 'emotionalRegulation', label: 'Regulación Emocional', icon: Heart, color: 'text-pink-500' },
  ];

  // Fetch mental wellness entries
  const { data: wellnessEntries = [], isLoading } = useQuery({
    queryKey: ['mental-wellness-entries', user?.id],
    queryFn: async (): Promise<MentalWellnessEntry[]> => {
      if (!user?.id) return [];
      const response = await fetch(`/api/mental-wellness-entries?user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch mental wellness entries');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Create mental wellness entry mutation
  const createWellnessEntryMutation = useMutation({
    mutationFn: async (data: Omit<MentalWellnessEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/mental-wellness-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create mental wellness entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mental-wellness-entries'] });
      toast({
        title: "Evaluación guardada",
        description: "Tu evaluación de bienestar mental ha sido registrada exitosamente.",
      });
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la evaluación. Inténtalo nuevamente.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      overallWellness: 5,
      lifesatisfaction: 5,
      selfEsteem: 5,
      socialConnection: 5,
      purposeMeaning: 5,
      emotionalRegulation: 5,
      anxietyLevel: 5,
      positiveThoughts: [],
      challengesOvercome: [],
      gratitudeItems: [],
      notes: ""
    });
    setCurrentThought("");
    setCurrentChallenge("");
    setCurrentGratitude("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    
    createWellnessEntryMutation.mutate({
      userId: user.id,
      date: today,
      ...formData
    });
  };

  const getWellnessColor = (level: number) => {
    if (level <= 3) return 'bg-red-500';
    if (level <= 5) return 'bg-yellow-500';
    if (level <= 7) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getAnxietyColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 5) return 'bg-yellow-500';
    if (level <= 7) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const addPositiveThought = () => {
    if (currentThought.trim()) {
      setFormData({
        ...formData,
        positiveThoughts: [...formData.positiveThoughts, currentThought.trim()]
      });
      setCurrentThought("");
    }
  };

  const addChallenge = () => {
    if (currentChallenge.trim()) {
      setFormData({
        ...formData,
        challengesOvercome: [...formData.challengesOvercome, currentChallenge.trim()]
      });
      setCurrentChallenge("");
    }
  };

  const addGratitude = () => {
    if (currentGratitude.trim()) {
      setFormData({
        ...formData,
        gratitudeItems: [...formData.gratitudeItems, currentGratitude.trim()]
      });
      setCurrentGratitude("");
    }
  };

  const removeItem = (array: string[], index: number, key: keyof WellnessFormData) => {
    const newArray = array.filter((_, i) => i !== index);
    setFormData({ ...formData, [key]: newArray });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  const todaysEntry = wellnessEntries.find(entry => {
    const today = new Date().toISOString().split('T')[0];
    return entry.date === today;
  });

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Evaluación del Día"
        subtitle="Evalúa tu bienestar psicológico integral y reflexiona sobre tu crecimiento personal diario"
      />

      <div className="max-w-6xl mx-auto p-4">
        {/* Today's entry or form */}
        <div className="mb-6">
          {todaysEntry ? (
            <Card className="bg-white border-[#C5A46C]">
              <CardHeader>
                <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Evaluación del Día
                </CardTitle>
                <CardDescription>
                  Registrado el {new Date(todaysEntry.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {wellnessAspects.map((aspect) => {
                        const IconComponent = aspect.icon;
                        const value = todaysEntry[aspect.key as keyof MentalWellnessEntry] as number;
                        return (
                          <div key={aspect.key} className="text-center p-3 bg-gray-50 rounded">
                            <IconComponent className={`h-5 w-5 mx-auto mb-1 ${aspect.color}`} />
                            <div className="text-xs text-gray-600 mb-1">{aspect.label}</div>
                            <div className="font-semibold">{value}/10</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-600 mb-1">Nivel de Ansiedad</div>
                      <div className="font-semibold">{todaysEntry.anxietyLevel}/10</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {todaysEntry.positiveThoughts && todaysEntry.positiveThoughts.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <Lightbulb className="h-4 w-4" />
                          Pensamientos positivos:
                        </div>
                        <div className="space-y-1">
                          {todaysEntry.positiveThoughts.map((thought, index) => (
                            <div key={index} className="text-sm bg-blue-50 text-blue-800 p-2 rounded">
                              • {thought}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {todaysEntry.challengesOvercome && todaysEntry.challengesOvercome.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Desafíos superados:
                        </div>
                        <div className="space-y-1">
                          {todaysEntry.challengesOvercome.map((challenge, index) => (
                            <div key={index} className="text-sm bg-green-50 text-green-800 p-2 rounded">
                              • {challenge}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {todaysEntry.gratitudeItems && todaysEntry.gratitudeItems.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          Agradecimientos:
                        </div>
                        <div className="space-y-1">
                          {todaysEntry.gratitudeItems.map((item, index) => (
                            <div key={index} className="text-sm bg-yellow-50 text-yellow-800 p-2 rounded">
                              • {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {todaysEntry.notes && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Reflexiones:</div>
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
                  <Heart className="h-5 w-5" />
                  ¿Cómo ha sido tu día en general?
                </CardTitle>
                <CardDescription>
                  Realiza una evaluación integral de tu estado psicológico y reflexiona sobre tu crecimiento personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showForm ? (
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Realizar Evaluación del Día
                  </Button>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Wellness Aspects */}
                    {wellnessAspects.map((aspect) => {
                      const IconComponent = aspect.icon;
                      return (
                        <div key={aspect.key}>
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <IconComponent className={`h-4 w-4 ${aspect.color}`} />
                            {aspect.label} (1-10)
                          </Label>
                          <div className="flex gap-1 mt-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setFormData({ 
                                  ...formData, 
                                  [aspect.key]: level 
                                })}
                                className={`px-2 py-1 rounded text-sm transition-colors flex-1 ${
                                  formData[aspect.key as keyof WellnessFormData] === level 
                                    ? 'bg-[#C5A46C] text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Anxiety Level */}
                    <div>
                      <Label className="text-sm font-medium">Nivel de Ansiedad (1-10)</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, anxietyLevel: level })}
                            className={`px-2 py-1 rounded text-sm transition-colors flex-1 ${
                              formData.anxietyLevel === level 
                                ? 'bg-[#C5A46C] text-white' 
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        1 = Nada ansioso, 10 = Muy ansioso
                      </div>
                    </div>

                    {/* Positive Thoughts */}
                    <div>
                      <Label className="text-sm font-medium">Pensamientos Positivos del Día</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={currentThought}
                          onChange={(e) => setCurrentThought(e.target.value)}
                          placeholder="Escribe un pensamiento positivo..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPositiveThought())}
                        />
                        <Button type="button" onClick={addPositiveThought} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.positiveThoughts.map((thought, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer bg-blue-100 text-blue-800"
                            onClick={() => removeItem(formData.positiveThoughts, index, 'positiveThoughts')}
                          >
                            {thought} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Challenges Overcome */}
                    <div>
                      <Label className="text-sm font-medium">Desafíos que Superé Hoy</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={currentChallenge}
                          onChange={(e) => setCurrentChallenge(e.target.value)}
                          placeholder="Describe un desafío que superaste..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChallenge())}
                        />
                        <Button type="button" onClick={addChallenge} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.challengesOvercome.map((challenge, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer bg-green-100 text-green-800"
                            onClick={() => removeItem(formData.challengesOvercome, index, 'challengesOvercome')}
                          >
                            {challenge} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Gratitude Items */}
                    <div>
                      <Label className="text-sm font-medium">Cosas por las que Estoy Agradecido</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={currentGratitude}
                          onChange={(e) => setCurrentGratitude(e.target.value)}
                          placeholder="¿Por qué estás agradecido hoy?"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGratitude())}
                        />
                        <Button type="button" onClick={addGratitude} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.gratitudeItems.map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer bg-yellow-100 text-yellow-800"
                            onClick={() => removeItem(formData.gratitudeItems, index, 'gratitudeItems')}
                          >
                            {item} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-sm font-medium">Reflexiones Adicionales</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="¿Qué reflexiones tienes sobre tu bienestar mental hoy? ¿Qué aprendiste sobre ti mismo?"
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createWellnessEntryMutation.isPending}
                        className="flex-1 bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                      >
                        {createWellnessEntryMutation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
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
        {wellnessEntries.length > 0 && (
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historial de Evaluaciones
              </CardTitle>
              <CardDescription>
                Tus evaluaciones recientes del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wellnessEntries.slice(0, 7).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">
                          Bienestar: {entry.overallWellness}/10 • Ansiedad: {entry.anxietyLevel}/10
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.overallWellness}/10
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

export default BienestarMental;