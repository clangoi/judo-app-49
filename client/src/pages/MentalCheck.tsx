import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Heart, Smile, Activity } from "lucide-react";
import NavHeader from "@/components/NavHeader";

const MentalCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const mentalHealthItems = [
    {
      title: "Estado de Ánimo",
      description: "Evalúa tu bienestar emocional general del día: ánimo, energía, sueño y motivación",
      icon: Smile,
      action: "Evaluar Ahora",
      path: "/estado-animo"
    },
    {
      title: "Niveles de Estrés",
      description: "Identifica qué te estresa y registra estrategias para manejarlo efectivamente",
      icon: Activity,
      action: "Medir Estrés",
      path: "/niveles-estres"
    },
    {
      title: "Evaluación del Día",
      description: "Evalúa tu bienestar psicológico integral: autoestima, propósito, conexión social",
      icon: Heart,
      action: "Evaluar Día",
      path: "/bienestar-mental"
    },
    {
      title: "Concentración",
      description: "Evalúa tu capacidad de concentración y enfoque",
      icon: Brain,
      action: "Test de Enfoque"
    }
  ];

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
          <div className="grid gap-3 md:grid-cols-3 mb-4">
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
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mentalHealthItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#C5A46C]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#283750]">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-[#1A1A1A]">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#575757] mb-4">
                    {item.description}
                  </CardDescription>
                  <Button 
                    onClick={() => {
                      if (item.path) {
                        navigate(item.path);
                      } else {
                        // Por ahora solo mostramos un mensaje, se puede implementar funcionalidad específica después
                        alert(`Funcionalidad de ${item.title} próximamente disponible`);
                      }
                    }}
                    className="w-full bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                  >
                    {item.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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