import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMoodTheme } from "@/hooks/useMoodTheme";
import { MoodTheme } from "@/lib/moodThemes";
import { Palette, Heart, Smile, Meh, Frown, Sun } from "lucide-react";

interface MoodThemeSelectorProps {
  onThemeSelect?: (theme: MoodTheme) => void;
  showTitle?: boolean;
  currentMood?: number;
}

const MoodThemeSelector: React.FC<MoodThemeSelectorProps> = ({ 
  onThemeSelect, 
  showTitle = true,
  currentMood 
}) => {
  const { currentTheme, changeTheme, availableThemes } = useMoodTheme();

  const getMoodIcon = (mood: number) => {
    switch (mood) {
      case 1: return Frown;
      case 2: return Meh;
      case 3: return Smile;
      case 4: return Heart;
      case 5: return Sun;
      default: return Palette;
    }
  };

  const getMoodLabel = (mood: number) => {
    switch (mood) {
      case 1: return 'Triste';
      case 2: return 'Bajo';
      case 3: return 'Normal';
      case 4: return 'Bien';
      case 5: return 'Feliz';
      default: return 'Neutral';
    }
  };

  const handleThemeSelect = (theme: MoodTheme) => {
    changeTheme(theme);
    onThemeSelect?.(theme);
  };

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Temas de Color por Estado de Ánimo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Elige un tema que refleje cómo te sientes hoy
          </p>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {availableThemes.map((theme) => {
            const IconComponent = getMoodIcon(theme.mood);
            const isSelected = currentTheme.id === theme.id;
            const isRecommended = currentMood && currentMood === theme.mood;
            
            return (
              <Card 
                key={theme.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleThemeSelect(theme)}
                style={{
                  borderColor: `hsl(${theme.colors.primary})`
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="p-2 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `hsl(${theme.colors.primary} / 0.1)`,
                        color: `hsl(${theme.colors.primary})`
                      }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          Actual
                        </Badge>
                      )}
                      {isRecommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recomendado
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{theme.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {theme.description}
                    </p>
                    
                    {/* Preview de colores */}
                    <div className="flex gap-1 mt-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                      />
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>Para estado:</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getMoodLabel(theme.mood)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {currentMood && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Sugerencia:</strong> Basado en tu estado de ánimo actual ({getMoodLabel(currentMood)}), 
              te recomendamos el tema "{availableThemes.find(t => t.mood === currentMood)?.name || 'Equilibrio Natural'}".
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodThemeSelector;