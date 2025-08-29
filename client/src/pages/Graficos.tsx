
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp, Activity, Target, ChevronDown, ChevronUp, Brain, Heart, Smile, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const Graficos = () => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  
  // Estado para controlar qué gráficos están colapsados
  const [collapsedCharts, setCollapsedCharts] = useState({
    weight: false,
    activity: false,
    exercise: false,
    nutrition: false,
    mentalTrends: false,
    sportTrends: false
  });

  // Estado para controlar qué sección está visible
  const [activeSection, setActiveSection] = useState<'sport' | 'mental'>('sport');

  const toggleChart = (chartName: keyof typeof collapsedCharts) => {
    setCollapsedCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  // Query para datos de peso
  const { data: weightData = [], isLoading: isLoadingWeight } = useQuery({
    queryKey: ['weight_chart_data', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await api.getWeightEntries(user.id);
      return data.map((entry: any) => ({
        date: entry.date,
        peso: entry.weight
      }));
    },
    enabled: !!user,
  });

  // Training frequency query removed as requested

  // Query para datos de nutrición
  const { data: nutritionData = [], isLoading: isLoadingNutrition } = useQuery({
    queryKey: ['nutrition_summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await api.getNutritionSummary(user.id);
    },
    enabled: !!user,
  });

  // Query para resumen de progreso
  const { data: progressSummary = {}, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['progress_summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      return await api.getProgressSummary(user.id);
    },
    enabled: !!user,
  });

  // Query para lista de ejercicios
  const { data: exercisesList = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises_list', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await api.getExerciseProgression(user.id);
    },
    enabled: !!user,
  });

  // Query para progresión del ejercicio seleccionado
  const { data: exerciseProgression = [], isLoading: isLoadingProgression } = useQuery({
    queryKey: ['exercise_progression', user?.id, selectedExercise],
    queryFn: async () => {
      if (!user?.id || !selectedExercise) return [];
      return await api.getExerciseProgression(user.id, selectedExercise);
    },
    enabled: !!user && !!selectedExercise,
  });

  // Query para datos de estado de ánimo
  const { data: moodData = [], isLoading: isLoadingMood } = useQuery<any[]>({
    queryKey: ['/api/mood-entries'],
    enabled: !!user,
  });

  // Query para datos de estrés
  const { data: stressData = [], isLoading: isLoadingStress } = useQuery<any[]>({
    queryKey: ['/api/stress-entries'],
    enabled: !!user,
  });

  // Query para datos de concentración
  const { data: concentrationData = [], isLoading: isLoadingConcentration } = useQuery<any[]>({
    queryKey: ['/api/concentration-entries'],
    enabled: !!user,
  });

  // Query para datos de bienestar mental
  const { data: mentalWellnessData = [], isLoading: isLoadingMentalWellness } = useQuery<any[]>({
    queryKey: ['/api/mental-wellness-entries'],
    enabled: !!user,
  });

  // Query para evaluaciones profundas
  const { data: deepAssessmentData = [], isLoading: isLoadingDeepAssessment } = useQuery<any[]>({
    queryKey: ['/api/deep-assessment-entries'],
    enabled: !!user,
  });

  // Query para check-ins rápidos
  const { data: quickCheckInData = [], isLoading: isLoadingQuickCheckIns } = useQuery<any[]>({
    queryKey: ['/api/quick-checkin-entries'],
    enabled: !!user,
  });

  // Establecer ejercicio por defecto (el primero alfabéticamente)
  React.useEffect(() => {
    if (exercisesList.length > 0 && !selectedExercise) {
      setSelectedExercise(exercisesList[0].exercise_id);
    }
  }, [exercisesList, selectedExercise]);

  const isLoading = isLoadingWeight || isLoadingNutrition || isLoadingProgress || isLoadingExercises || isLoadingMood || isLoadingStress || isLoadingConcentration || isLoadingMentalWellness || isLoadingDeepAssessment;

  // Training frequency chart removed as requested

  // Datos para el gráfico de distribución de actividades deportivas
  const activityDistribution = [
    { name: 'Preparación Física', value: Number(progressSummary.physicalTraining) || 0, color: '#8884d8' },
    { name: 'Deportivo', value: Number(progressSummary.deportivoTraining) || 0, color: '#C5A46C' },
    { name: 'Técnicas', value: Number(progressSummary.techniques) || 0, color: '#82ca9d' },
    { name: 'Táctica', value: Number(progressSummary.tacticalNotes) || 0, color: '#ffc658' }
  ].filter(item => item.value > 0);

  // Procesar datos mentales combinados (evaluaciones profundas + check-ins rápidos)
  const mentalTrendsData = React.useMemo(() => {
    const combinedData = [];
    
    // Agregar datos de evaluaciones profundas
    if (deepAssessmentData.length > 0) {
      (deepAssessmentData as any[]).forEach((entry: any) => {
        combinedData.push({
          date: entry.date,
          timestamp: entry.date,
          'Estado de Ánimo': entry.moodLevel,
          'Estrés': 6 - entry.stressLevel, // Invertir escala
          'Concentración': entry.focusLevel,
          'Bienestar': entry.overallWellness,
          type: 'profunda'
        });
      });
    }
    
    // Agregar datos de check-ins rápidos (convertir escalas para consistencia)
    if (quickCheckInData.length > 0) {
      (quickCheckInData as any[]).forEach((entry: any) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        combinedData.push({
          date: date,
          timestamp: entry.timestamp,
          'Estado de Ánimo': entry.currentMood, // Ya en escala 1-5
          'Estrés': 6 - entry.stressLevel, // Invertir escala 1-5 
          'Concentración': entry.energyLevel * 2, // Convertir de 1-5 a 1-10
          'Bienestar': (entry.currentMood + (6 - entry.stressLevel) + entry.energyLevel) / 3 * 2, // Promedio escalado a 1-10
          type: 'rapida'
        });
      });
    }
    
    // Ordenar por timestamp y tomar los últimos 30 días
    return combinedData
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-30)
      .map(entry => ({
        date: entry.date,
        'Estado de Ánimo': Math.round(entry['Estado de Ánimo'] * 10) / 10,
        'Estrés': Math.round(entry['Estrés'] * 10) / 10,
        'Concentración': Math.round(entry['Concentración'] * 10) / 10,
        'Bienestar': Math.round(entry['Bienestar'] * 10) / 10,
        type: entry.type
      }));
  }, [deepAssessmentData, quickCheckInData]);

  // Resumen mental combinado para estadísticas
  const mentalSummary = React.useMemo(() => {
    if (mentalTrendsData.length === 0) return {
      avgMood: 0,
      avgStress: 0,
      avgFocus: 0,
      avgWellness: 0,
      totalEvaluations: 0,
      totalQuickCheckIns: 0,
      totalDeepAssessments: 0
    };

    return {
      avgMood: (mentalTrendsData.reduce((sum: number, entry: any) => sum + entry['Estado de Ánimo'], 0) / mentalTrendsData.length).toFixed(1),
      avgStress: (6 - mentalTrendsData.reduce((sum: number, entry: any) => sum + entry['Estrés'], 0) / mentalTrendsData.length).toFixed(1), // Convertir de vuelta
      avgFocus: (mentalTrendsData.reduce((sum: number, entry: any) => sum + entry['Concentración'], 0) / mentalTrendsData.length).toFixed(1),
      avgWellness: (mentalTrendsData.reduce((sum: number, entry: any) => sum + entry['Bienestar'], 0) / mentalTrendsData.length).toFixed(1),
      totalEvaluations: (deepAssessmentData as any[]).length + (quickCheckInData as any[]).length,
      totalQuickCheckIns: (quickCheckInData as any[]).length,
      totalDeepAssessments: (deepAssessmentData as any[]).length
    };
  }, [mentalTrendsData, deepAssessmentData, quickCheckInData]);

  // Datos para distribución de bienestar mental
  const mentalDistribution = [
    { name: 'Excelente (9-10)', value: (deepAssessmentData as any[]).filter((entry: any) => entry.overallWellness >= 9).length, color: '#22c55e' },
    { name: 'Bueno (7-8)', value: (deepAssessmentData as any[]).filter((entry: any) => entry.overallWellness >= 7 && entry.overallWellness < 9).length, color: '#84cc16' },
    { name: 'Regular (5-6)', value: (deepAssessmentData as any[]).filter((entry: any) => entry.overallWellness >= 5 && entry.overallWellness < 7).length, color: '#eab308' },
    { name: 'Bajo (1-4)', value: (deepAssessmentData as any[]).filter((entry: any) => entry.overallWellness < 5).length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  console.log('Progress Summary:', progressSummary);
  console.log('Activity Distribution:', activityDistribution);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C5A46C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Gráficos y Progreso" 
        subtitle="Visualiza tu evolución en el tiempo"
      />
      
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Selector de Sección */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-lg border border-[#C5A46C] shadow-sm">
            <div className="flex">
              <button
                onClick={() => setActiveSection('sport')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeSection === 'sport'
                    ? 'bg-[#C5A46C] text-white shadow-md'
                    : 'text-[#1A1A1A] hover:bg-gray-50'
                }`}
              >
                <Target className="h-4 w-4" />
                Análisis Deportivo
              </button>
              <button
                onClick={() => setActiveSection('mental')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeSection === 'mental'
                    ? 'bg-[#C5A46C] text-white shadow-md'
                    : 'text-[#1A1A1A] hover:bg-gray-50'
                }`}
              >
                <Brain className="h-4 w-4" />
                Análisis Mental
              </button>
            </div>
          </div>
        </div>

        {/* Sección Deportiva */}
        {activeSection === 'sport' && (
          <>
            {/* Estadísticas Deportivas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Preparación Física</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{progressSummary.physicalTraining || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-[#C5A46C]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Entrenamientos Deportivo</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{progressSummary.deportivoTraining || 0}</p>
                    </div>
                    <Target className="h-8 w-8 text-[#C5A46C]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Técnicas</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{progressSummary.techniques || 0}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#C5A46C]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Notas Tácticas</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{progressSummary.tacticalNotes || 0}</p>
                    </div>
                    <Target className="h-8 w-8 text-[#C5A46C]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Sección Mental */}
        {activeSection === 'mental' && (
          <>
            {/* Estadísticas Mentales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Estado de Ánimo Prom.</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{mentalSummary.avgMood}/5</p>
                    </div>
                    <Smile className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Concentración Prom.</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{mentalSummary.avgFocus}/10</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Bienestar Prom.</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{mentalSummary.avgWellness}/10</p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-[#C5A46C]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#575757]">Registros Totales</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{mentalSummary.totalEvaluations}</p>
                      <div className="flex text-xs text-[#575757] mt-1 gap-2">
                        <span>{mentalSummary.totalDeepAssessments} profundas</span>
                        <span>•</span>
                        <span>{mentalSummary.totalQuickCheckIns} rápidas</span>
                      </div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Tendencias Mentales */}
            <Collapsible open={!collapsedCharts.mentalTrends} onOpenChange={() => toggleChart('mentalTrends')}>
              <Card className="bg-white border-[#C5A46C]">
                <CardHeader>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
                      <CardTitle className="text-[#1A1A1A] flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-[#C5A46C]" />
                        Tendencias de Bienestar Mental (Últimos 30 días)
                      </CardTitle>
                      {collapsedCharts.mentalTrends ? 
                        <ChevronDown className="h-4 w-4 text-[#C5A46C]" /> : 
                        <ChevronUp className="h-4 w-4 text-[#C5A46C]" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    {mentalTrendsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={mentalTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[1, 10]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="Estado de Ánimo" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Estrés" 
                            stroke="#f97316" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Concentración" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="Bienestar" 
                            stroke="#ec4899" 
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-[#575757]">
                        No hay datos de evaluaciones mentales suficientes para mostrar tendencias
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Distribución de Bienestar Mental */}
            {mentalDistribution.length > 0 && (
              <Card className="bg-white border-[#C5A46C]">
                <CardHeader>
                  <CardTitle className="text-[#1A1A1A] flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-[#C5A46C]" />
                    Distribución de Niveles de Bienestar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mentalDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {mentalDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Los gráficos deportivos existentes solo se muestran en la sección deportiva */}
        {activeSection === 'sport' && (
          <>

        {/* Gráfico de Peso */}
        <Collapsible open={!collapsedCharts.weight} onOpenChange={() => toggleChart('weight')}>
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
                  <CardTitle className="text-[#1A1A1A] flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-[#C5A46C]" />
                    Evolución del Peso
                  </CardTitle>
                  {collapsedCharts.weight ? 
                    <ChevronDown className="h-4 w-4 text-[#C5A46C]" /> : 
                    <ChevronUp className="h-4 w-4 text-[#C5A46C]" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                {weightData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#C5A46C" 
                        strokeWidth={2}
                        name="Peso (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-[#575757]">
                    No hay datos de peso suficientes para mostrar el gráfico
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Gráfico de Progresión de Ejercicios */}
        <Collapsible open={!collapsedCharts.exercise} onOpenChange={() => toggleChart('exercise')}>
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
                  <CardTitle className="text-[#1A1A1A] flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-[#C5A46C]" />
                    Progresión de Ejercicios
                  </CardTitle>
                  {collapsedCharts.exercise ? 
                    <ChevronDown className="h-4 w-4 text-[#C5A46C]" /> : 
                    <ChevronUp className="h-4 w-4 text-[#C5A46C]" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <div className="mb-4">
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Seleccionar ejercicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercisesList.map((exercise: any) => (
                        <SelectItem key={exercise.exercise_id} value={exercise.exercise_id}>
                          {exercise.exercise_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isLoadingProgression ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#C5A46C]" />
                  </div>
                ) : exerciseProgression.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={exerciseProgression}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES')}
                        formatter={(value: any, name: string) => [
                          name === 'weight_kg' ? `${value} kg` : value,
                          name === 'weight_kg' ? 'Peso' : name
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight_kg" 
                        stroke="#C5A46C" 
                        strokeWidth={3}
                        dot={{ fill: '#C5A46C', strokeWidth: 2, r: 4 }}
                        name="Peso (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-[#575757]">
                    {selectedExercise ? 'No hay datos de progresión para este ejercicio' : 'Selecciona un ejercicio para ver su progresión'}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Gráfico de Nutrición */}
        <Collapsible open={!collapsedCharts.nutrition} onOpenChange={() => toggleChart('nutrition')}>
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
                  <CardTitle className="text-[#1A1A1A] flex items-center">
                    <Target className="mr-2 h-5 w-5 text-[#C5A46C]" />
                    Evolución Nutricional
                  </CardTitle>
                  {collapsedCharts.nutrition ? 
                    <ChevronDown className="h-4 w-4 text-[#C5A46C]" /> : 
                    <ChevronUp className="h-4 w-4 text-[#C5A46C]" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                {nutritionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="calories" stroke="#ff7300" name="Calorías" />
                      <Line type="monotone" dataKey="protein" stroke="#82ca9d" name="Proteínas (g)" />
                      <Line type="monotone" dataKey="carbs" stroke="#8884d8" name="Carbohidratos (g)" />
                      <Line type="monotone" dataKey="fats" stroke="#ffc658" name="Grasas (g)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-[#575757]">
                    No hay datos nutricionales suficientes para mostrar el gráfico
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Distribución de Actividades */}
        <Collapsible open={!collapsedCharts.activity} onOpenChange={() => toggleChart('activity')}>
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full p-0 h-auto justify-between hover:bg-transparent">
                  <CardTitle className="text-[#1A1A1A] flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-[#C5A46C]" />
                    Distribución de Actividades
                  </CardTitle>
                  {collapsedCharts.activity ? 
                    <ChevronDown className="h-4 w-4 text-[#C5A46C]" /> : 
                    <ChevronUp className="h-4 w-4 text-[#C5A46C]" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                {activityDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-[#575757]">
                    No hay datos de actividades suficientes para mostrar el gráfico
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
          </>
        )}
      </div>
    </div>
  );
};

export default Graficos;
