
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Weight, Activity, Users, Target, BookOpen, LogOut, User, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getGreeting = () => {
    // Use the gender_preference field from auth signup or fallback to 'masculino'
    const genderPreference = (profile as any)?.gender_preference || 'masculino';
    if (genderPreference === 'femenino') {
      return 'Bienvenida';
    } else if (genderPreference === 'neutro'){
      return 'Bienvenide'
    }
    return 'Bienvenido';
  };

  const cards = [
    {
      title: "Peso Semanal",
      description: "Seguimiento de peso corporal",
      icon: Weight,
      href: "/peso",
      color: "bg-[#C5A46C]"
    },
    {
      title: "Preparación Física",
      description: "Sesiones de acondicionamiento",
      icon: Activity,
      href: "/sesiones-preparacion",
      color: "bg-[#575757]"
    },
    {
      title: "Entrenamientos de Judo",
      description: "Registro de entrenamientos",
      icon: Users,
      href: "/entrenamientos-judo",
      color: "bg-[#C5A46C]"
    },
    {
      title: "Técnicas de Judo",
      description: "Biblioteca de técnicas",
      icon: BookOpen,
      href: "/tecnicas-judo",
      color: "bg-[#575757]"
    },
    {
      title: "Táctica de Judo",
      description: "Estrategias y planes tácticos",
      icon: Target,
      href: "/tactica-judo",
      color: "bg-[#C5A46C]"
    },
    {
      title: "Gráficos y Progreso",
      description: "Visualiza tu evolución",
      icon: BarChart3,
      href: "/graficos",
      color: "bg-[#575757]"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <div className="bg-white border-b border-[#C5A46C]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/c6a3ed23-61eb-43e2-94de-c781c8d1107b.png" 
                alt="Royal Strength Logo" 
                className="w-12 h-12 rounded-full object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                  Panel de Entrenamiento
                </h1>
                <p className="text-[#575757]">
                  {getGreeting()}, {profile?.full_name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-[#575757]">
                <User className="h-4 w-4" />
                {user?.email}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="ml-4 border-[#C5A46C] text-[#C5A46C] hover:bg-[#C5A46C] hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} to={card.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full bg-white border-[#C5A46C]">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-[#1A1A1A]">{card.title}</CardTitle>
                        <CardDescription className="text-[#575757]">{card.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#575757]">
                      Haz clic para acceder a {card.title.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
