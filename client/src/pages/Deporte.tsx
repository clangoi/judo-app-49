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
import TabataTimer from "@/components/TabataTimer";

const Deporte = () => {
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

  // Sin autenticación obligatoria, mostrar todos los elementos
  const availableItems = sportsItems;

  return (
    <div className="min-h-screen bg-background">
      <NavHeader 
        title="Deporte"
        subtitle="Accede a todas las funciones deportivas"
      />

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Timer Tabata */}
          <TabataTimer />
          
          {availableItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.path} className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#283750]">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-foreground">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground mb-4">
                    {item.description}
                  </CardDescription>
                  <Button 
                    onClick={() => navigate(item.path)}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
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