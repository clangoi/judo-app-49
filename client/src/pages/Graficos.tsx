
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Activity, Target, ChevronDown, ChevronUp } from "lucide-react";
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
    nutrition: false
  });

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

  // Establecer ejercicio por defecto (el primero alfabéticamente)
  React.useEffect(() => {
    if (exercisesList.length > 0 && !selectedExercise) {
      setSelectedExercise(exercisesList[0].exercise_id);
    }
  }, [exercisesList, selectedExercise]);

  const isLoading = isLoadingWeight || isLoadingNutrition || isLoadingProgress || isLoadingExercises;

  // Training frequency chart removed as requested

  // Datos para el gráfico de distribución de actividades
  const activityDistribution = [
    { name: 'Preparación Física', value: Number(progressSummary.physicalTraining) || 0, color: '#8884d8' },
    { name: 'Deportivo', value: Number(progressSummary.deportivoTraining) || 0, color: '#C5A46C' },
    { name: 'Técnicas', value: Number(progressSummary.techniques) || 0, color: '#82ca9d' },
    { name: 'Táctica', value: Number(progressSummary.tacticalNotes) || 0, color: '#ffc658' }
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
        {/* Estadísticas generales */}
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
      </div>
    </div>
  );
};

export default Graficos;
