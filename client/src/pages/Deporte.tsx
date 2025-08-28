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
  Scale 
} from "lucide-react";
import NavHeader from "@/components/NavHeader";

const Deporte = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const navigate = useNavigate();

  const sportsItems = [
    {
      title: "Preparación Física",
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
    }
  ];

  const availableItems = sportsItems.filter(item => 
    item.roles.includes(currentUserRole as string)
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Deporte"
        subtitle="Accede a todas las funciones deportivas"
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

export default Deporte;