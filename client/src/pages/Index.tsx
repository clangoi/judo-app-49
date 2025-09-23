
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
  // AuthProvider está disponible pero la autenticación es opcional
  const navigate = useNavigate();
  
  // Intentamos obtener el usuario si está autenticado, sino usamos valores por defecto
  let user = null;
  let currentUserRole = 'deportista'; // Rol por defecto
  
  try {
    const auth = useAuth();
    user = auth.user;
    const { currentUserRole: role } = useUserRoles(user?.id);
    if (role) currentUserRole = role;
  } catch (error) {
    // Si useAuth falla, continuamos sin autenticación
    console.log('Funcionando sin autenticación');
  }

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

  // Si no hay autenticación, mostramos todos los elementos por defecto
  const availableItems = user 
    ? menuItems.filter(item => item.roles.includes(currentUserRole as string))
    : menuItems; // Sin autenticación = acceso completo

  return (
    <div className="min-h-screen bg-background">
      <NavHeader 
        title={`${getGreeting()}, ${user?.fullName || user?.email?.split('@')[0] || 'Deportista'}`}
        subtitle="¿Qué quieres hacer hoy?"
      />

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card key={item.path} className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(180, 30%, 35%)', color: 'white' }}>
                      <IconComponent className="h-6 w-6" style={{ color: 'white', display: 'block' }} />
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

export default Index;
