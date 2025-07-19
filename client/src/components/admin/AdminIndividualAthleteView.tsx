
import { AdminAthleteData } from "@/hooks/useAdminAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, Weight, Calendar, Trophy, Target, UserCheck, Mail, Search, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AdminIndividualAthleteViewProps {
  athlete?: AdminAthleteData;
  athletes: AdminAthleteData[];
  onBack: () => void;
  onSelectAthlete: (athlete: AdminAthleteData) => void;
}

// Helper functions moved outside component to avoid hoisting issues
const getActivityColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'inactive':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getActivityLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'moderate':
      return 'Moderado';
    case 'inactive':
      return 'Inactivo';
    default:
      return 'Desconocido';
  }
};

const getBeltColor = (belt: string) => {
  const colors: Record<string, string> = {
    white: 'bg-white text-gray-800 border-gray-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    brown: 'bg-amber-100 text-amber-800 border-amber-300',
    black: 'bg-gray-800 text-white border-gray-700'
  };
  return colors[belt] || colors.white;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const AdminIndividualAthleteView = ({ athlete, athletes, onBack, onSelectAthlete }: AdminIndividualAthleteViewProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter athletes based on search term
  const filteredAthletes = athletes.filter(a => 
    a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.current_belt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.competition_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.trainer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!athlete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Seleccionar Deportista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar por nombre, club, categoría, entrenador...</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  Selecciona un deportista...
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <Command>
                  <CommandInput 
                    placeholder="Buscar deportista..." 
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>No se encontraron deportistas.</CommandEmpty>
                    <CommandGroup>
                      {filteredAthletes.map((a) => (
                        <CommandItem
                          key={a.id}
                          value={`${a.full_name}-${a.email}`}
                          onSelect={() => {
                            onSelectAthlete(a);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{a.full_name}</span>
                              <span className="text-sm text-muted-foreground">{a.email}</span>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {a.club_name || 'Sin club'}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  {a.current_belt || 'Sin cinturón'}
                                </span>
                                {a.trainer_name && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {a.trainer_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge className={getActivityColor(a.activityStatus)} variant="outline">
                                {getActivityLabel(a.activityStatus)}
                              </Badge>
                              <span className="text-xs text-muted-foreground mt-1">
                                {a.weeklySessionsCount} sesiones/sem
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Filtros rápidos:</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm("active")}
              >
                Deportistas Activos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm("inactive")}
              >
                Deportistas Inactivos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Mostrar Todos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Deportista */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{athlete.full_name}</h2>
                <p className="text-muted-foreground">{athlete.email}</p>
                <p className="text-sm text-muted-foreground">{athlete.club_name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getActivityColor(athlete.activityStatus)}>
                {getActivityLabel(athlete.activityStatus)}
              </Badge>
              <Badge className={getBeltColor(athlete.current_belt)}>
                Cinturón {athlete.current_belt}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Información del Entrenador Asignado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Entrenador Asignado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Nombre:</span>
            <span>{athlete.trainer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{athlete.trainer_email}</span>
          </div>
          {athlete.assigned_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Asignado el: {formatDate(athlete.assigned_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas del Deportista */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{athlete.weeklySessionsCount}</div>
                <div className="text-xs text-muted-foreground">Sesiones/semana</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{athlete.totalTechniques}</div>
                <div className="text-xs text-muted-foreground">Técnicas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{athlete.totalTacticalNotes}</div>
                <div className="text-xs text-muted-foreground">Notas Tácticas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {athlete.lastWeightEntry ? `${athlete.lastWeightEntry.weight} kg` : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">Último peso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Actividad */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Actividad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {athlete.lastWeightEntry && (
            <div>
              <h4 className="font-semibold mb-2">Último Registro de Peso</h4>
              <p>
                <strong>{athlete.lastWeightEntry.weight} kg</strong> registrado el{' '}
                {formatDate(athlete.lastWeightEntry.date)}
              </p>
            </div>
          )}

          {athlete.lastTrainingSession && (
            <div>
              <h4 className="font-semibold mb-2">Última Sesión de Entrenamiento</h4>
              <p>
                <strong>{athlete.lastTrainingSession.session_type}</strong> el{' '}
                {formatDate(athlete.lastTrainingSession.date)}
              </p>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Estadísticas Generales</h4>
            <ul className="space-y-1 text-sm">
              <li>• {athlete.weeklySessionsCount} sesiones esta semana</li>
              <li>• {athlete.totalTechniques} técnicas registradas</li>
              <li>• {athlete.totalTacticalNotes} notas tácticas</li>
              <li>• Entrenador: {athlete.trainer_name}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
