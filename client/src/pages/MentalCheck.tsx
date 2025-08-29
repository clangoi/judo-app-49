import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Smile, Activity } from "lucide-react";
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Bienvenido a tu evaluación mental
          </h2>
          <p className="text-gray-400 mb-4">
            Tu salud mental es tan importante como tu entrenamiento físico. Utiliza estas herramientas para monitorear y mejorar tu bienestar psicológico.
          </p>
          
          {/* Explanation cards */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Smile className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Estado de Ánimo</h3>
              </div>
              <p className="text-xs text-blue-700">
                <strong>¿Cómo me siento en general hoy?</strong><br/>
                Evalúa tu bienestar emocional completo del día
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-900">Niveles de Estrés</h3>
              </div>
              <p className="text-xs text-orange-700">
                <strong>¿Qué me estresa y cómo lo manejo?</strong><br/>
                Identifica causas del estrés y mejora tus estrategias
              </p>
            </div>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-pink-600" />
                <h3 className="text-sm font-medium text-pink-900">Evaluación del Día</h3>
              </div>
              <p className="text-xs text-pink-700">
                <strong>¿Cómo está mi salud psicológica integral?</strong><br/>
                Evalúa autoestima, propósito, conexiones y crecimiento
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Concentración</h3>
              </div>
              <p className="text-xs text-purple-700">
                <strong>¿Cómo está mi capacidad de enfoque?</strong><br/>
                Evalúa concentración, claridad mental y técnicas
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
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