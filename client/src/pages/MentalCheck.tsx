import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Smile, Activity, Zap, Timer, TrendingUp, AlertTriangle, Wind, Sparkles } from "lucide-react";
import NavHeader from "@/components/NavHeader";

const MentalCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const mentalHealthItem = {
    title: "Evaluación Profunda",
    description: "Evaluación integral que combina estado de ánimo, niveles de estrés, concentración y bienestar mental en una sola herramienta completa",
    icon: Brain,
    action: "Comenzar Evaluación",
    path: "/evaluacion-profunda"
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="MentalCheck"
        subtitle="Evalúa y mejora tu bienestar mental"
      />

      <div className="max-w-6xl mx-auto p-4">

        {/* Quick Action Buttons */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white mb-2">¿Cómo quieres evaluar tu bienestar hoy?</h2>
            <p className="text-gray-400">Elige la opción que mejor se adapte a tu tiempo disponible</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 max-w-7xl mx-auto">
            {/* Check-in Rápido */}
            <Card 
              className="bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-orange-200 hover:border-orange-300 transform hover:scale-105"
              onClick={() => navigate('/checkin-rapido')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-500 shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1A1A] text-xl flex items-center gap-2">
                      Check-in Rápido
                      <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        ⚡ 30s
                      </div>
                    </CardTitle>
                    <div className="text-sm text-orange-600 font-medium mt-1">Evaluación instantánea</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[#575757] text-base leading-relaxed">
                  ¿No tienes mucho tiempo? Registra rápidamente cómo te sientes en este momento con solo 3 preguntas esenciales.
                </CardDescription>
                
                <div className="bg-orange-100 border border-orange-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-900 text-sm">Solo 3 preguntas:</span>
                  </div>
                  <div className="text-xs text-orange-800 space-y-1">
                    <div>• 😊 ¿Cómo te sientes ahora?</div>
                    <div>• 🔋 ¿Cuál es tu nivel de energía?</div>
                    <div>• 😌 ¿Qué tan estresado estás?</div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white font-semibold py-3 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/checkin-rapido');
                  }}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Iniciar Check-in (30s)
                </Button>
              </CardContent>
            </Card>

            {/* Evaluación Profunda */}
            <Card 
              className="bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-300 transform hover:scale-105"
              onClick={() => navigate(mentalHealthItem.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1A1A] text-xl flex items-center gap-2">
                      Evaluación Profunda
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        📊 5-10 min
                      </div>
                    </CardTitle>
                    <div className="text-sm text-blue-600 font-medium mt-1">Análisis completo</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[#575757] text-base leading-relaxed">
                  {mentalHealthItem.description}
                </CardDescription>
                
                <div className="bg-blue-100 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Incluye 4 áreas completas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    <div className="flex items-center gap-1">
                      <Smile className="h-3 w-3" />
                      <span>Estado de Ánimo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Niveles de Estrés</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span>Concentración</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>Bienestar Mental</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(mentalHealthItem.path);
                  }}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Comenzar Evaluación Completa
                </Button>
              </CardContent>
            </Card>

            {/* Manejo de Crisis */}
            <Card 
              className="bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-red-200 hover:border-red-300 transform hover:scale-105"
              onClick={() => navigate('/manejo-crisis')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1A1A] text-xl flex items-center gap-2">
                      Manejo de Crisis
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🚨 SOS
                      </div>
                    </CardTitle>
                    <div className="text-sm text-red-600 font-medium mt-1">Herramientas de emergencia</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[#575757] text-base leading-relaxed">
                  Para momentos de alta ansiedad, pánico o estrés intenso. Técnicas de emergencia para recuperar el control.
                </CardDescription>
                
                <div className="bg-red-100 border border-red-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2 text-sm flex items-center gap-1">
                    <Wind className="h-4 w-4" />
                    Técnicas incluidas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-red-800">
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span>Respiración 4-7-8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Técnica 5-4-3-2-1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span>Visualización</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>Movimiento Suave</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/manejo-crisis');
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Iniciar Manejo de Crisis
                </Button>
              </CardContent>
            </Card>

            {/* Técnicas de Respiración */}
            <Card 
              className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-300 transform hover:scale-105"
              onClick={() => navigate('/tecnicas-respiracion')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                    <Wind className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1A1A] text-xl flex items-center gap-2">
                      Técnicas de Respiración
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        💨 RESPIRA
                      </div>
                    </CardTitle>
                    <div className="text-sm text-blue-600 font-medium mt-1">Ejercicios guiados de relajación</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[#575757] text-base leading-relaxed">
                  Ejercicios de respiración guiados para reducir estrés, ansiedad y mejorar tu enfoque mental.
                </CardDescription>
                
                <div className="bg-blue-100 border border-blue-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1">
                    <Wind className="h-4 w-4" />
                    Técnicas incluidas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                    <div className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      <span>Respiración 4-7-8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      <span>Respiración de Caja</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>Respiración Abdominal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Respiración Alternada</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/tecnicas-respiracion');
                  }}
                >
                  <Wind className="mr-2 h-4 w-4" />
                  Iniciar Respiración
                </Button>
              </CardContent>
            </Card>

            {/* Mindfulness Express */}
            <Card 
              className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-purple-200 hover:border-purple-300 transform hover:scale-105"
              onClick={() => navigate('/mindfulness-express')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1A1A] text-xl flex items-center gap-2">
                      Mindfulness Express
                      <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        🧘 ZEN
                      </div>
                    </CardTitle>
                    <div className="text-sm text-purple-600 font-medium mt-1">Meditaciones de 2-5 minutos</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-[#575757] text-base leading-relaxed">
                  Meditaciones cortas y guiadas perfectas para cualquier momento del día. Cultiva calma y presencia.
                </CardDescription>
                
                <div className="bg-purple-100 border border-purple-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2 text-sm flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    Meditaciones incluidas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Escaneo Corporal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span>Atención Respiración</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>Bondad Amorosa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Smile className="h-3 w-3" />
                      <span>Gratitud Profunda</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/mindfulness-express');
                  }}
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Iniciar Meditación
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-2xl mx-auto hidden">
          <Card 
            className="bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border-[#C5A46C]"
            onClick={() => navigate(mentalHealthItem.path)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-[#1A1A1A] text-2xl">{mentalHealthItem.title}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">Herramienta completa de evaluación mental</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-[#575757] text-base leading-relaxed">
                {mentalHealthItem.description}
              </CardDescription>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">¿Qué incluye esta evaluación?</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    <span>Estado de Ánimo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Niveles de Estrés</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Concentración</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Bienestar Mental</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-[#C5A46C] hover:bg-[#A08B5A] text-white text-lg py-6"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(mentalHealthItem.path);
                }}
              >
                {mentalHealthItem.action}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-white border-[#C5A46C]">
            <CardHeader>
              <CardTitle className="text-[#1A1A1A] flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Consejos para tu Bienestar Mental
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#575757]">
                <li>• Mantén una rutina diaria equilibrada entre entrenamiento y descanso</li>
                <li>• Practica técnicas de respiración y meditación</li>
                <li>• Establece objetivos realistas y celebra tus logros</li>
                <li>• Mantén conexiones sociales saludables</li>
                <li>• No dudes en buscar ayuda profesional cuando lo necesites</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentalCheck;