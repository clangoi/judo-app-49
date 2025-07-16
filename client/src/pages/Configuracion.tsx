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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import NavHeader from "@/components/NavHeader";
import { User, Settings, Save, Edit, X, Eye, Camera, Calendar } from "lucide-react";
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
    profileImageUrl: "",
    birthDate: "",
    injuries: [] as string[],
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
        profileImageUrl: userProfile.profileImageUrl || "",
        birthDate: userProfile.birthDate || "",
        injuries: userProfile.injuries || [],
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
        profileImageUrl: userProfile.profileImageUrl || "",
        birthDate: userProfile.birthDate || "",
        injuries: userProfile.injuries || [],
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

  const getTypicalInjuries = () => {
    return [
      "Lesión de rodilla",
      "Lesión de hombro",
      "Lesión de muñeca",
      "Lesión de tobillo",
      "Lesión de espalda baja",
      "Lesión de cuello",
      "Lesión de dedos",
      "Lesión de codo",
      "Problemas de cadera",
      "Contusiones frecuentes"
    ];
  };

  const handleInjuryChange = (injury: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      injuries: checked 
        ? [...prev.injuries, injury]
        : prev.injuries.filter(i => i !== injury)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          profileImageUrl: data.url
        }));
        toast({
          title: "Imagen cargada",
          description: "Tu foto de perfil se ha cargado correctamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la imagen. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
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

              {/* Imagen de perfil */}
              <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.profileImageUrl} alt="Foto de perfil" />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="profileImage" className="text-sm font-medium">Foto de Perfil</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    {isEditing ? "Sube una imagen para tu perfil" : "Tu foto de perfil actual"}
                  </p>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('profileImage')?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {formData.profileImageUrl ? 'Cambiar Foto' : 'Subir Foto'}
                      </Button>
                      {formData.profileImageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: "" }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
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
                  <Label htmlFor="birthDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
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

                {/* Lesiones */}
                <div className="space-y-4 md:col-span-2">
                  <Label>Lesiones</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona las lesiones que has tenido o que te afectan actualmente
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getTypicalInjuries().map((injury) => (
                      <div key={injury} className="flex items-center space-x-2">
                        <Checkbox
                          id={`injury-${injury}`}
                          checked={formData.injuries.includes(injury)}
                          onCheckedChange={(checked) => handleInjuryChange(injury, checked as boolean)}
                          disabled={!isEditing}
                        />
                        <Label
                          htmlFor={`injury-${injury}`}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {injury}
                        </Label>
                      </div>
                    ))}
                  </div>
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