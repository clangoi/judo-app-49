
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2 } from "lucide-react";

const Graficos = () => {
  const { user } = useAuth();

  // Query para datos de peso
  const { data: weightData = [], isLoading: isLoadingWeight } = useQuery({
    queryKey: ['weight_chart_data', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_entries')
        .select('date, weight')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data.map(entry => ({
        date: entry.date,
        peso: entry.weight
      }));
    },
    enabled: !!user,
  });

  // Query para datos de ejercicios
  const { data: exerciseData = [], isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise_chart_data', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_records')
        .select(`
          date,
          weight_kg,
          reps,
          sets,
          exercises!inner(name)
        `)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Agrupar por ejercicio y fecha para crear series de datos
      const groupedData: Record<string, any[]> = {};
      
      data.forEach(record => {
        const exerciseName = record.exercises.name;
        if (!groupedData[exerciseName]) {
          groupedData[exerciseName] = [];
        }
        
        groupedData[exerciseName].push({
          date: record.date,
          weight: record.weight_kg || 0,
          volume: (record.reps || 0) * (record.sets || 0) * (record.weight_kg || 0)
        });
      });
      
      return groupedData;
    },
    enabled: !!user,
  });

  const isLoading = isLoadingWeight || isLoadingExercise;

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

        {/* Gráficos de Ejercicios */}
        {Object.entries(exerciseData).map(([exerciseName, data]) => (
          <Card key={exerciseName} className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A]">Progreso en {exerciseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#C5A46C" 
                    strokeWidth={2}
                    name="Peso (kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#575757" 
                    strokeWidth={2}
                    name="Volumen Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}

        {Object.keys(exerciseData).length === 0 && (
          <Card className="bg-white border-[#C5A46C]">
            <CardContent className="p-8 text-center">
              <p className="text-[#575757]">No hay datos de ejercicios suficientes para mostrar gráficos</p>
              <p className="text-sm text-[#575757]">Comienza a registrar tus entrenamientos para ver tu progreso</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Graficos;
