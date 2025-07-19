import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

interface UpcomingSessionsWidgetProps {
  config: any;
}

export const UpcomingSessionsWidget = ({ config }: UpcomingSessionsWidgetProps) => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/trainer/upcoming-sessions']
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-2 bg-gray-100 rounded animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-1" />
            <div className="h-2 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  // Mock data until backend is implemented
  const mockSessions = [
    {
      id: 1,
      title: 'Entrenamiento Judo Avanzado',
      date: 'Hoy',
      time: '18:00',
      participants: 6,
      location: 'Dojo Principal'
    },
    {
      id: 2,
      title: 'Técnicas de Suelo',
      date: 'Mañana',
      time: '19:30',
      participants: 4,
      location: 'Sala 2'
    },
    {
      id: 3,
      title: 'Preparación Física',
      date: 'Miércoles',
      time: '17:00',
      participants: 8,
      location: 'Gimnasio'
    }
  ];

  const sessionsData = sessions || mockSessions;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Próximas Sesiones</span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto">
        {sessionsData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay sesiones programadas</p>
          </div>
        ) : (
          sessionsData.slice(0, config?.maxSessions || 5).map((session: any) => (
            <div key={session.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm leading-tight">{session.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {session.date}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{session.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{session.participants} participantes</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{session.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {sessionsData.length > (config?.maxSessions || 5) && (
        <div className="pt-2 border-t">
          <button className="text-xs text-blue-600 hover:text-blue-700">
            Ver todas las sesiones
          </button>
        </div>
      )}
    </div>
  );
};