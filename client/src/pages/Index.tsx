
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Target,
  Brain
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
      title: "Deporte",
      description: "Accede a todas las funciones deportivas: entrenamiento, técnicas, táctica y más",
      icon: Target,
      path: "/deporte",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "MentalCheck",
      description: "Evalúa y mejora tu estado mental y bienestar psicológico",
      icon: Brain,
      path: "/mentalcheck",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    },
    {
      title: "Gráficos y Análisis",
      description: "Visualiza tu progreso con gráficos detallados",
      icon: BarChart3,
      path: "/graficos",
      color: "bg-gray-700",
      roles: ['deportista', 'entrenador', 'admin']
    }
  ];

  const availableItems = menuItems.filter(item => 
    item.roles.includes(currentUserRole as string)
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title={`${getGreeting()}, ${user?.email?.split('@')[0] || 'Usuario'}`}
        subtitle="¿Qué quieres hacer hoy?"
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
