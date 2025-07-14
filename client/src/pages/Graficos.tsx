
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

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

  // Query para datos de ejercicios
  const { data: exerciseData = [], isLoading: isLoadingExercise } = useQuery({
    queryKey: ['exercise_chart_data', user?.id],
    queryFn: async () => {
      // Since the new tables aren't in the types yet, we'll use a different approach
      // For now, let's just return empty data to prevent errors
      return [];
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

        {/* Placeholder para futuros gráficos de ejercicios */}
        <Card className="bg-white border-[#C5A46C]">
          <CardContent className="p-8 text-center">
            <p className="text-[#575757]">Los gráficos de progreso de ejercicios se mostrarán aquí</p>
            <p className="text-sm text-[#575757]">Una vez que registres ejercicios en tus sesiones de preparación</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Graficos;
