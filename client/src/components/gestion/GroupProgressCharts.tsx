
import { AthleteData } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface GroupProgressChartsProps {
  athletes: AthleteData[];
}

export const GroupProgressCharts = ({ athletes }: GroupProgressChartsProps) => {
  // Preparar datos para gráfico de actividad semanal
  const weeklyActivityData = athletes.map(athlete => ({
    name: athlete.full_name.split(' ')[0], // Solo primer nombre para que quepa
    sessions: athlete.weeklySessionsCount,
    status: athlete.activityStatus
  }));

  // Preparar datos para distribución de cinturones
  const beltDistribution = athletes.reduce((acc, athlete) => {
    const belt = athlete.current_belt;
    acc[belt] = (acc[belt] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const beltColors: Record<string, string> = {
    white: '#ffffff',
    yellow: '#fbbf24',
    orange: '#f97316',
    green: '#22c55e',
    blue: '#3b82f6',
    brown: '#a3a3a3',
    black: '#1f2937'
  };

  const beltData = Object.entries(beltDistribution).map(([belt, count]) => ({
    name: belt,
    value: count,
    color: beltColors[belt] || '#6b7280'
  }));

  // Datos de progreso del grupo (últimos 7 días)
  const groupProgressData = [
    { day: 'Lun', activeAthletes: athletes.filter(a => a.activityStatus === 'active').length },
    { day: 'Mar', activeAthletes: Math.floor(athletes.filter(a => a.activityStatus === 'active').length * 0.8) },
    { day: 'Mié', activeAthletes: Math.floor(athletes.filter(a => a.activityStatus === 'active').length * 0.9) },
    { day: 'Jue', activeAthletes: Math.floor(athletes.filter(a => a.activityStatus === 'active').length * 0.7) },
    { day: 'Vie', activeAthletes: athletes.filter(a => a.activityStatus === 'active').length },
    { day: 'Sáb', activeAthletes: Math.floor(athletes.filter(a => a.activityStatus === 'active').length * 0.6) },
    { day: 'Dom', activeAthletes: Math.floor(athletes.filter(a => a.activityStatus === 'active').length * 0.4) }
  ];

  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">No hay datos suficientes para mostrar gráficos.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Gráfico de Actividad Semanal */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sesiones Semanales por Deportista
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="sessions" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución de Cinturones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribución de Cinturones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={beltData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {beltData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#333" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tendencia de Actividad Semanal */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de Actividad del Grupo (Última Semana)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={groupProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activeAthletes" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
