import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import NavHeader from "@/components/NavHeader";
import { User, Settings, Save } from "lucide-react";

const Configuracion = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const { toast } = useToast();

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    gender: user?.gender || "",
    currentBelt: user?.currentBelt || "",
    competitionCategory: user?.competitionCategory || "",
    injuryDescription: user?.injuryDescription || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aquí se implementaría la lógica para guardar los datos
      // Por ahora solo mostramos un mensaje de éxito
      toast({
        title: "Configuración guardada",
        description: "Tus datos personales han sido actualizados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBeltOptions = () => {
    return [
      { value: "white", label: "Blanco" },
      { value: "yellow", label: "Amarillo" },
      { value: "orange", label: "Naranja" },
      { value: "green", label: "Verde" },
      { value: "blue", label: "Azul" },
      { value: "brown", label: "Marrón" },
      { value: "black", label: "Negro" },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavHeader 
        title="Configuración Personal" 
        subtitle="Edita tus datos personales y preferencias"
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Información Personal</CardTitle>
              </div>
              <CardDescription>
                Actualiza tu información básica y preferencias de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  Rol: {currentUserRole === 'admin' ? 'Administrador' : 
                        currentUserRole === 'entrenador' ? 'Entrenador' : 'Deportista'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="tu@correo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentBelt">Cinturón Actual</Label>
                  <Select value={formData.currentBelt} onValueChange={(value) => handleInputChange('currentBelt', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu cinturón" />
                    </SelectTrigger>
                    <SelectContent>
                      {getBeltOptions().map((belt) => (
                        <SelectItem key={belt.value} value={belt.value}>
                          {belt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="competitionCategory">Categoría de Competición</Label>
                  <Input
                    id="competitionCategory"
                    value={formData.competitionCategory}
                    onChange={(e) => handleInputChange('competitionCategory', e.target.value)}
                    placeholder="Ej: -73kg, +100kg, etc."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="injuryDescription">Descripción de Lesiones</Label>
                  <Textarea
                    id="injuryDescription"
                    value={formData.injuryDescription}
                    onChange={(e) => handleInputChange('injuryDescription', e.target.value)}
                    placeholder="Describe cualquier lesión o limitación física que debamos tener en cuenta..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;