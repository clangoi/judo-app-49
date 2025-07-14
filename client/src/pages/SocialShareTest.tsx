import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Share2 } from "lucide-react";
import { SocialShare } from "@/components/achievements/SocialShare";
import { AchievementBadge } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";

const SocialShareTest: React.FC = () => {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  // Sample milestone achievements for testing
  const milestoneAchievements: AchievementBadge[] = [
    {
      id: "milestone-1",
      name: "Guerrero del Tatami",
      description: "Completaste 10 sesiones de entrenamiento",
      iconUrl: null,
      category: "training",
      criteriaType: "count",
      criteriaValue: 10,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "milestone-2", 
      name: "Maestro de Técnicas",
      description: "Registraste 25 técnicas diferentes de judo",
      iconUrl: null,
      category: "technique",
      criteriaType: "count",
      criteriaValue: 25,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "milestone-3",
      name: "Disciplina Total",
      description: "Mantuviste una racha de 30 días de entrenamiento",
      iconUrl: null,
      category: "consistency",
      criteriaType: "streak",
      criteriaValue: 30,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "milestone-4",
      name: "Peso Ideal",
      description: "Alcanzaste tu peso objetivo y lo mantuviste por 2 semanas",
      iconUrl: null,
      category: "weight",
      criteriaType: "milestone",
      criteriaValue: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "milestone-5",
      name: "Nutrición Perfecta",
      description: "Registraste tu alimentación por 21 días consecutivos",
      iconUrl: null,
      category: "nutrition",
      criteriaType: "streak",
      criteriaValue: 21,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      training: '🥋',
      technique: '🎯',
      weight: '⚖️',
      nutrition: '🍎',
      consistency: '🔥'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'training':
        return 'bg-blue-500';
      case 'technique':
        return 'bg-green-500';
      case 'consistency':
        return 'bg-orange-500';
      case 'weight':
        return 'bg-purple-500';
      case 'nutrition':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <p className="text-center text-white">Debe iniciar sesión para probar el compartir en redes sociales.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="🏆 Compartir Logros en Redes Sociales"
        subtitle="Prueba el sistema de compartir logros milestone en redes sociales"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Milestone Achievements */}
          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Logros Milestone Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestoneAchievements.map((badge) => (
                  <Card 
                    key={badge.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBadge?.id === badge.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getCategoryColor(badge.category)}`}>
                          <span className="text-lg">{getCategoryIcon(badge.category)}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{badge.name}</h4>
                          <p className="text-xs text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Social Share Preview */}
          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  Vista Previa de Compartir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBadge ? (
                  <div className="space-y-4">
                    {/* Selected Achievement Display */}
                    <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="text-3xl">{getCategoryIcon(selectedBadge.category)}</div>
                          <h3 className="font-bold text-lg">{selectedBadge.name}</h3>
                          <p className="text-sm text-gray-600">{selectedBadge.description}</p>
                          <p className="text-xs text-gray-500">Conseguido por {user.email?.split('@')[0]}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Social Share Component */}
                    <div className="text-center">
                      <SocialShare badge={selectedBadge} userEmail={user.email || undefined} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un logro de la izquierda para ver las opciones de compartir</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona el sistema de compartir?</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Twitter:</strong> Abre una nueva ventana con el texto pre-llenado listo para compartir</li>
              <li>• <strong>Facebook:</strong> Permite compartir el logro con una descripción personalizada</li>
              <li>• <strong>Descargar Imagen:</strong> Genera una imagen personalizada del logro para compartir en Instagram</li>
              <li>• <strong>Copiar Texto:</strong> Copia el texto del logro al portapapeles para usar en cualquier plataforma</li>
              <li>• <strong>Instagram:</strong> Descarga la imagen y súbela manualmente a tu historia o feed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialShareTest;