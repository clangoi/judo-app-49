
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NavHeader from "@/components/NavHeader";
import { 
  Activity, 
  Dumbbell, 
  Target, 
  BookOpen, 
  UtensilsCrossed, 
  Scale, 
  BarChart3, 
  Users,
  Shield,
  Bell
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Entrenamientos de Judo",
      description: "Registra y analiza tus sesiones de judo",
      icon: Activity,
      path: "/entrenamientos-judo",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Preparación Física",
      description: "Sesiones de acondicionamiento físico",
      icon: Dumbbell,
      path: "/sesiones-preparacion",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Técnicas de Judo",
      description: "Biblioteca de técnicas y movimientos",
      icon: Target,
      path: "/tecnicas-judo",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Táctica y Estrategia",
      description: "Notas tácticas y análisis de combate",
      icon: BookOpen,
      path: "/tactica-judo",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Alimentación",
      description: "Registro nutricional y dieta",
      icon: UtensilsCrossed,
      path: "/alimentacion",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      title: "Control de Peso",
      description: "Seguimiento del peso corporal",
      icon: Scale,
      path: "/peso",
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Gráficos y Análisis",
      description: "Visualización de tu progreso",
      icon: BarChart3,
      path: "/graficos",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Gestión de Deportistas",
      description: "Administra deportistas y entrenamientos",
      icon: Users,
      path: "/gestion",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      title: "Recordatorios",
      description: "Configura notificaciones de entrenamiento",
      icon: Bell,
      path: "/recordatorios",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "Administración",
      description: "Panel de administración del sistema",
      icon: Shield,
      path: "/admin",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NavHeader 
        title="Panel de Control" 
        subtitle={`Bienvenido de vuelta, ${user?.email}`}
      />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.path} className="hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(item.path)}
                    className="w-full"
                    variant="outline"
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
