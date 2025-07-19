import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

interface PerformanceChartsWidgetProps {
  config: any;
}

export const PerformanceChartsWidget = ({ config }: PerformanceChartsWidgetProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['/api/trainer/performance-charts']
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  // Mock data until backend is implemented
  const mockData = [
    { week: 'Sem 1', sessions: 4, attendance: 85 },
    { week: 'Sem 2', sessions: 6, attendance: 92 },
    { week: 'Sem 3', sessions: 5, attendance: 78 },
    { week: 'Sem 4', sessions: 8, attendance: 95 }
  ];

  const data = chartData || mockData;
  const chartType = config?.chartType || 'line';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Rendimiento Semanal</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">{chartType}</span>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Sesiones</span>
        </div>
        {chartType === 'line' && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Asistencia (%)</span>
          </div>
        )}
      </div>
    </div>
  );
};