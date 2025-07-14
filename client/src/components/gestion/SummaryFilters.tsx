
import { ActivityFilter } from "@/hooks/useAthleteManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface SummaryFiltersProps {
  filters: ActivityFilter;
  onFiltersChange: (filters: ActivityFilter) => void;
  totalAthletes: number;
}

export const SummaryFilters = ({ filters, onFiltersChange, totalAthletes }: SummaryFiltersProps) => {
  const handleFilterChange = (key: keyof ActivityFilter, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      activity: 'all',
      belt: 'all',
      trainingType: 'all',
      period: 'month',
      search: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.activity !== 'all') count++;
    if (filters.belt !== 'all') count++;
    if (filters.trainingType !== 'all') count++;
    if (filters.search) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Búsqueda por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros en grid (ahora con 3 columnas en lugar de 4) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro de actividad */}
          <div>
            <label className="text-sm font-medium mb-2 block">Estado de Actividad</label>
            <Select
              value={filters.activity}
              onValueChange={(value) => handleFilterChange('activity', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos (últimos 7 días)</SelectItem>
                <SelectItem value="moderate">Moderados (7-30 días)</SelectItem>
                <SelectItem value="inactive">Inactivos (+30 días)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de cinturón */}
          <div>
            <label className="text-sm font-medium mb-2 block">Cinturón</label>
            <Select
              value={filters.belt}
              onValueChange={(value) => handleFilterChange('belt', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="white">Blanco</SelectItem>
                <SelectItem value="yellow">Amarillo</SelectItem>
                <SelectItem value="orange">Naranja</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="brown">Marrón</SelectItem>
                <SelectItem value="black">Negro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de tipo de entrenamiento */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de Entrenamiento</label>
            <Select
              value={filters.trainingType}
              onValueChange={(value) => handleFilterChange('trainingType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="judo">Judo</SelectItem>
                <SelectItem value="physical">Preparación Física</SelectItem>
                <SelectItem value="mixed">Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Mostrando {totalAthletes} deportista{totalAthletes !== 1 ? 's' : ''}
          </p>
          
          {/* Período de análisis */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Período:</span>
            <Select
              value={filters.period}
              onValueChange={(value) => handleFilterChange('period', value as 'week' | 'month' | 'quarter')}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
