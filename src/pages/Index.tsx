
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Weight, Activity, Users, Target, BookOpen, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, signOut } = useAuth();

  const cards = [
    {
      title: "Alimentación Diaria",
      description: "Registra tus comidas y nutrición",
      icon: Utensils,
      href: "/alimentacion",
      color: "bg-green-500"
    },
    {
      title: "Peso Semanal",
      description: "Seguimiento de peso corporal",
      icon: Weight,
      href: "/peso",
      color: "bg-blue-500"
    },
    {
      title: "Preparación Física",
      description: "Sesiones de acondicionamiento",
      icon: Activity,
      href: "/sesiones-preparacion",
      color: "bg-orange-500"
    },
    {
      title: "Entrenamientos de Judo",
      description: "Registro de entrenamientos",
      icon: Users,
      href: "/entrenamientos-judo",
      color: "bg-red-500"
    },
    {
      title: "Técnicas de Judo",
      description: "Biblioteca de técnicas",
      icon: BookOpen,
      href: "/tecnicas-judo",
      color: "bg-purple-500"
    },
    {
      title: "Táctica de Judo",
      description: "Estrategias y planes tácticos",
      icon: Target,
      href: "/tactica-judo",
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Panel de Entrenamiento de Judo
              </h1>
              <p className="text-slate-600">
                Bienvenido, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                {user?.email}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="ml-4"
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
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
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
