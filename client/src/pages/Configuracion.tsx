import { useState, useEffect } from "react";
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
import { User, Settings, Save, Edit, X, Eye } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const Configuracion = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cargar el perfil actual del usuario
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => api.getUserProfile(user?.id!),
    enabled: !!user?.id,
  });

  // Estados para el modo de edición y los campos del formulario
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "",
    currentBelt: "",
    competitionCategory: "",
    injuryDescription: "",
  });

  // Actualizar formData cuando se carga el perfil
  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        currentBelt: userProfile.currentBelt || "",
        competitionCategory: userProfile.competitionCategory || "",
        injuryDescription: userProfile.injuryDescription || "",
      });
    }
  }, [userProfile]);

  // Mutación para actualizar el perfil
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.updateUserProfile(user?.id!, data),
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Configuración guardada",
        description: "Tus datos personales han sido actualizados correctamente.",
      });
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    updateProfileMutation.mutate(formData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        currentBelt: userProfile.currentBelt || "",
        competitionCategory: userProfile.competitionCategory || "",
        injuryDescription: userProfile.injuryDescription || "",
      });
    }
    setIsEditing(false);
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
        title={isEditing ? "Editar Datos Personales" : "Ver Datos Personales"} 
        subtitle={isEditing ? "Modifica tu información personal" : "Revisa tu información personal actual"} 
      />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Información del usuario */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Información Personal</CardTitle>
                </div>
                <Badge variant={isEditing ? "default" : "secondary"} className="flex items-center gap-1">
                  {isEditing ? <Edit className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {isEditing ? "Modo Edición" : "Modo Vista"}
                </Badge>
              </div>
              <CardDescription>
                {isEditing ? "Modifica tu información básica y preferencias de perfil" : "Consulta tu información básica y preferencias de perfil"}
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)} disabled={!isEditing}>
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
                  <Select value={formData.currentBelt} onValueChange={(value) => handleInputChange('currentBelt', value)} disabled={!isEditing}>
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
                    disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Datos
                </div>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                  className="min-w-[100px]"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </div>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || isLoadingProfile}
                  className="min-w-[120px]"
                >
                  {updateProfileMutation.isPending ? (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;