import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Plus, TrendingUp, Users, MapPin, Calendar, Target } from 'lucide-react';
import type { Club } from '@/hooks/useClubs';

interface SmartSuggestionChipsProps {
  clubs: Club[];
  onCreateClub: (suggestion: ClubSuggestion) => void;
  onApplySuggestion: (suggestion: ActionSuggestion) => void;
}

interface ClubSuggestion {
  type: 'create';
  name: string;
  description: string;
  category: string;
  reason: string;
  icon: React.ReactNode;
}

interface ActionSuggestion {
  type: 'action';
  title: string;
  description: string;
  action: string;
  clubId?: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

type Suggestion = ClubSuggestion | ActionSuggestion;

const SmartSuggestionChips: React.FC<SmartSuggestionChipsProps> = ({
  clubs,
  onCreateClub,
  onApplySuggestion
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [clubs]);

  const generateSuggestions = () => {
    const newSuggestions: Suggestion[] = [];

    // Analizar datos existentes para generar sugerencias inteligentes
    const clubsWithoutLogo = clubs.filter(club => !club.logoUrl && !club.logo_url);
    const recentlyCreatedClubs = clubs.filter(club => {
      const createdDate = new Date(club.created_at || club.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    });

    // Sugerencias de acciones para clubes existentes
    if (clubsWithoutLogo.length > 0) {
      newSuggestions.push({
        type: 'action',
        title: `${clubsWithoutLogo.length} clubes sin logo`,
        description: 'Agregar logos mejora la identidad visual y reconocimiento',
        action: 'add_logos',
        priority: 'medium',
        icon: <Lightbulb className="h-4 w-4" />
      });
    }

    // Sugerencias basadas en patrones de crecimiento
    if (clubs.length > 0 && clubs.length < 3) {
      newSuggestions.push({
        type: 'create',
        name: 'Club Regional',
        description: 'Amplía tu alcance con un club que cubra diferentes zonas geográficas',
        category: 'expansion',
        reason: 'Tienes pocos clubes registrados, considera expandir tu cobertura',
        icon: <MapPin className="h-4 w-4" />
      });
    }

    // Sugerencias basadas en especialización
    const hasCompetitionClub = clubs.some(club => 
      club.name.toLowerCase().includes('competición') || 
      club.name.toLowerCase().includes('competition')
    );

    if (!hasCompetitionClub && clubs.length >= 1) {
      newSuggestions.push({
        type: 'create',
        name: 'Club de Competición',
        description: 'Especializado en preparación para torneos y competencias de alto nivel',
        category: 'especialización',
        reason: 'No tienes un club enfocado en competición',
        icon: <Target className="h-4 w-4" />
      });
    }

    // Sugerencias de mejores prácticas
    if (recentlyCreatedClubs.length > 0) {
      newSuggestions.push({
        type: 'action',
        title: 'Configurar clubes nuevos',
        description: 'Completa la información y configuración de clubes recién creados',
        action: 'setup_new_clubs',
        priority: 'high',
        icon: <Calendar className="h-4 w-4" />
      });
    }

    // Sugerencias de crecimiento
    if (clubs.length >= 3) {
      newSuggestions.push({
        type: 'action',
        title: 'Analizar rendimiento',
        description: 'Revisa métricas y estadísticas de tus clubes más activos',
        action: 'analyze_performance',
        priority: 'low',
        icon: <TrendingUp className="h-4 w-4" />
      });
    }

    // Sugerencias de categorías populares en judo
    const hasYouthClub = clubs.some(club => 
      club.name.toLowerCase().includes('juvenil') || 
      club.name.toLowerCase().includes('youth') ||
      club.name.toLowerCase().includes('infantil')
    );

    if (!hasYouthClub) {
      newSuggestions.push({
        type: 'create',
        name: 'Club Juvenil',
        description: 'Enfocado en el desarrollo de jóvenes judokas desde edad temprana',
        category: 'categorías',
        reason: 'La formación juvenil es clave para el desarrollo del judo',
        icon: <Users className="h-4 w-4" />
      });
    }

    // Sugerencias adicionales basadas en buenas prácticas
    const hasAdultClub = clubs.some(club => 
      club.name.toLowerCase().includes('adultos') || 
      club.name.toLowerCase().includes('adult') ||
      club.name.toLowerCase().includes('seniors')
    );

    if (!hasAdultClub && clubs.length >= 1) {
      newSuggestions.push({
        type: 'create',
        name: 'Club de Adultos',
        description: 'Clases especializadas para practicantes adultos con horarios flexibles',
        category: 'categorías',
        reason: 'Los adultos requieren enfoques de entrenamiento diferenciados',
        icon: <Users className="h-4 w-4" />
      });
    }

    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'create') {
      onCreateClub(suggestion);
    } else {
      onApplySuggestion(suggestion);
    }
  };

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 3);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Sugerencias Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground">
                      {suggestion.type === 'create' ? suggestion.name : suggestion.title}
                    </h4>
                    {suggestion.type === 'action' && (
                      <Badge variant={
                        suggestion.priority === 'high' ? 'destructive' : 
                        suggestion.priority === 'medium' ? 'default' : 
                        'secondary'
                      }>
                        {suggestion.priority === 'high' ? 'Alta' : 
                         suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    )}
                    {suggestion.type === 'create' && (
                      <Badge variant="outline">{suggestion.category}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  {suggestion.type === 'create' && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {suggestion.reason}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant={suggestion.type === 'create' ? 'default' : 'outline'}
                onClick={() => handleSuggestionClick(suggestion)}
                className="ml-3"
              >
                {suggestion.type === 'create' ? (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Crear
                  </>
                ) : (
                  'Aplicar'
                )}
              </Button>
            </div>
          ))}
          
          {suggestions.length > 3 && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Ver menos' : `Ver ${suggestions.length - 3} más`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartSuggestionChips;