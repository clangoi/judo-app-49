import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Dumbbell, Target, Weight, Apple } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";

const NotificationTest = () => {
  const { user } = useAuth();
  const { checkAchievements, isCheckingAchievements } = useAchievements();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestAction = async (action: string, apiCall: () => Promise<any>) => {
    try {
      setTestResults(prev => [...prev, `${action} - Ejecutando...`]);
      const result = await apiCall();
      setTestResults(prev => [...prev.slice(0, -1), `${action} - ✅ Completado`]);
      
      // Check for new achievements after each action
      setTimeout(() => {
        checkAchievements();
      }, 500);
      
      return result;
    } catch (error) {
      setTestResults(prev => [...prev.slice(0, -1), `${action} - ❌ Error`]);
      console.error(`Error in ${action}:`, error);
    }
  };

  const testActions = [
    {
      title: "Crear Sesión de Entrenamiento",
      icon: Dumbbell,
      action: () => addTestAction("Nueva sesión de entrenamiento", async () => {
        const response = await fetch('/api/training-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            date: new Date().toISOString().split('T')[0],
            sessionType: 'judo',
            duration: 90,
            notes: `Sesión de prueba - ${new Date().toLocaleTimeString()}`
          })
        });
        return response.json();
      })
    },
    {
      title: "Registrar Nueva Técnica",
      icon: Target,
      action: () => addTestAction("Nueva técnica", async () => {
        const response = await fetch('/api/techniques', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            name: `Técnica de Prueba ${Date.now()}`,
            category: 'Nage-waza',
            description: 'Técnica creada para probar el sistema de logros',
            keyPoints: 'Puntos clave de la técnica',
            commonMistakes: 'Errores comunes a evitar'
          })
        });
        return response.json();
      })
    },
    {
      title: "Registrar Peso",
      icon: Weight,
      action: () => addTestAction("Nuevo registro de peso", async () => {
        const response = await fetch('/api/weight-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            date: new Date().toISOString().split('T')[0],
            weight: 70 + Math.random() * 10,
            notes: 'Peso registrado para prueba de logros'
          })
        });
        return response.json();
      })
    },
    {
      title: "Registrar Comida",
      icon: Apple,
      action: () => addTestAction("Nueva entrada nutricional", async () => {
        const response = await fetch('/api/nutrition-entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            date: new Date().toISOString().split('T')[0],
            calories: 400 + Math.random() * 200,
            mealDescription: `Comida de prueba - ${new Date().toLocaleTimeString()}`
          })
        });
        return response.json();
      })
    }
  ];

  const handleManualCheck = () => {
    setTestResults(prev => [...prev, "Verificación manual de logros - Ejecutando..."]);
    checkAchievements();
    setTimeout(() => {
      setTestResults(prev => [...prev.slice(0, -1), "Verificación manual de logros - ✅ Completado"]);
    }, 1000);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6">
            <p className="text-center">Debe iniciar sesión para probar las notificaciones.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Prueba del Sistema de Notificaciones"
        subtitle="Realiza acciones para ver las notificaciones de logros en tiempo real"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Test Actions */}
          <div>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  Acciones de Prueba
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testActions.map((test, index) => {
                  const IconComponent = test.icon;
                  return (
                    <Button
                      key={index}
                      onClick={test.action}
                      className="w-full justify-start gap-3 bg-[#C5A46C] hover:bg-[#A08B5A]"
                      variant="default"
                    >
                      <IconComponent className="w-4 h-4" />
                      {test.title}
                    </Button>
                  );
                })}
                
                <div className="border-t pt-3 mt-4">
                  <Button
                    onClick={handleManualCheck}
                    disabled={isCheckingAchievements}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    variant="default"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {isCheckingAchievements ? "Verificando..." : "Verificar Logros Manualmente"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div>
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Resultados de Pruebas</CardTitle>
                <Button 
                  onClick={clearResults} 
                  variant="outline" 
                  size="sm"
                  disabled={testResults.length === 0}
                >
                  Limpiar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No hay resultados aún. Realiza una acción para ver los resultados.
                    </p>
                  ) : (
                    testResults.map((result, index) => (
                      <div 
                        key={index} 
                        className="p-2 bg-gray-50 rounded text-sm border-l-4 border-blue-500"
                      >
                        {result}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">¿Cómo funciona?</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Haz clic en cualquier acción de prueba arriba</li>
              <li>• El sistema automáticamente verificará si has desbloqueado nuevos logros</li>
              <li>• Verás notificaciones toast y animaciones cuando desbloquees logros</li>
              <li>• Puedes verificar logros manualmente con el botón azul</li>
              <li>• Ve a la página de Logros para ver tu progreso completo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationTest;