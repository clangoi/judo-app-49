
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, 
  Target, 
  Zap, 
  Brain, 
  Scale, 
  Utensils, 
  BarChart3, 
  Users,
  Shield,
  Building,
  Trophy
} from "lucide-react";
import NavHeader from "@/components/NavHeader";


const Index = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const menuItems = [
    {
      title: "Sesiones de Preparación",
      description: "Registra y administra tus sesiones de entrenamiento físico",
      icon: Dumbbell,
      path: "/sesiones-preparacion",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Entrenamientos Deportivos",
      description: "Documenta tus sesiones deportivas y combates",
      icon: Target,
      path: "/entrenamientos-deportivo",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Técnicas Deportivas",
      description: "Explora y aprende técnicas por categorías",
      icon: Zap,
      path: "/tecnicas-deportivo",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Táctica Deportiva",
      description: "Desarrolla estrategias y tácticas de combate",
      icon: Brain,
      path: "/tactica-deportivo",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Control de Peso",
      description: "Monitorea tu peso y progreso físico",
      icon: Scale,
      path: "/peso",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Alimentación",
      description: "Registra y planifica tu nutrición diaria",
      icon: Utensils,
      path: "/alimentacion",
      color: "bg-gray-700",
      roles: ['admin']
    },
    {
      title: "Gráficos y Análisis",
      description: "Visualiza tu progreso con gráficos detallados",
      icon: BarChart3,
      path: "/graficos",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Logros y Insignias",
      description: "Desbloquea logros y ve tu progreso gamificado",
      icon: Trophy,
      path: "/logros",
      color: "bg-yellow-600",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Gestión de Deportistas",
      description: "Administra y monitorea el progreso de tus deportistas",
      icon: Users,
      path: "/gestion",
      color: "bg-gray-700",
      roles: ['entrenador', 'admin']
    },
    {
      title: "Gestión de Clubes",
      description: "Administra los clubes de tus deportistas",
      icon: Building,
      path: "/clubes",
      color: "bg-gray-700",
      roles: ['entrenador', 'admin']
    },
    {
      title: "Administración",
      description: "Panel de administración del sistema",
      icon: Shield,
      path: "/admin",
      color: "bg-gray-700",
      roles: ['admin']
    },

  ];

  const availableItems = menuItems.filter(item => 
    item.roles.includes(currentUserRole as string)
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title={`${getGreeting()}, ${user?.email?.split('@')[0] || 'Usuario'}`}
        subtitle="Selecciona una opción para comenzar"
      />

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.path} className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-[#C5A46C]">
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
                    onClick={() => navigate(item.path)}
                    className="w-full bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
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
