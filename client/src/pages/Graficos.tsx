
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Loader2, TrendingUp, Activity, Target } from "lucide-react";

const Graficos = () => {
  const { user } = useAuth();

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

  // Query para frecuencia de entrenamientos
  const { data: trainingFrequency = [], isLoading: isLoadingTraining } = useQuery({
    queryKey: ['training_frequency', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return await api.getTrainingFrequency(user.id);
    },
    enabled: !!user,
  });

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

  const isLoading = isLoadingWeight || isLoadingTraining || isLoadingNutrition || isLoadingProgress;

  // Preparar datos para el gráfico de frecuencia de entrenamientos
  const trainingByWeek = trainingFrequency.reduce((acc: any, session: any) => {
    const date = new Date(session.date);
    const week = `${date.getFullYear()}-S${Math.ceil((date.getDate()) / 7)}`;
    
    if (!acc[week]) {
      acc[week] = { week, physical: 0, judo: 0, total: 0 };
    }
    
    if (session.type === 'physical') {
      acc[week].physical += 1;
    } else {
      acc[week].judo += 1;
    }
    acc[week].total += 1;
    
    return acc;
  }, {});

  const trainingWeeklyData = Object.values(trainingByWeek).slice(-12); // Últimas 12 semanas

  // Datos para el gráfico de distribución de actividades
  const activityDistribution = [
    { name: 'Preparación Física', value: progressSummary.physicalTraining || 0, color: '#8884d8' },
    { name: 'Judo', value: progressSummary.judoTraining || 0, color: '#C5A46C' },
    { name: 'Técnicas', value: progressSummary.techniques || 0, color: '#82ca9d' },
    { name: 'Táctica', value: progressSummary.tacticalNotes || 0, color: '#ffc658' }
  ].filter(item => item.value > 0);

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
                  <p className="text-sm text-[#575757]">Entrenamientos Judo</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{progressSummary.judoTraining || 0}</p>
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
        <Card className="bg-white border-[#C5A46C]">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Evolución del Peso</CardTitle>
          </CardHeader>
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
        </Card>

        {/* Gráfico de Frecuencia de Entrenamientos */}
        <Card className="bg-white border-[#C5A46C]">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Frecuencia de Entrenamientos</CardTitle>
          </CardHeader>
          <CardContent>
            {trainingWeeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trainingWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="physical" stackId="a" fill="#8884d8" name="Preparación Física" />
                  <Bar dataKey="judo" stackId="a" fill="#C5A46C" name="Judo" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-[#575757]">
                No hay datos de entrenamientos suficientes para mostrar el gráfico
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Nutrición */}
        <Card className="bg-white border-[#C5A46C]">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Evolución Nutricional</CardTitle>
          </CardHeader>
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
        </Card>

        {/* Distribución de Actividades */}
        <Card className="bg-white border-[#C5A46C]">
          <CardHeader>
            <CardTitle className="text-[#1A1A1A]">Distribución de Actividades</CardTitle>
          </CardHeader>
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
        </Card>
      </div>
    </div>
  );
};

export default Graficos;
