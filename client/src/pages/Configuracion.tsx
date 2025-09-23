import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import NavHeader from "@/components/NavHeader";
import UserProfileForm from "@/components/configuration/UserProfileForm";
import { User, Settings, Edit, Save, X, Eye, Camera, Calendar, Smartphone, RefreshCw, Link, Copy, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSyncManager } from "@/hooks/useSyncManager";

const Configuracion = () => {
  const { user } = useAuth();
  const { currentUserRole } = useUserRoles(user?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Sync Manager para dispositivos
  const {
    status: syncStatus,
    generateSyncCode,
    linkDevice,
    syncData,
    updateRemoteData,
    clearSyncData,
    checkSyncStatus
  } = useSyncManager();

  // Cargar el perfil actual del usuario
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => api.getUserProfile(user?.id!),
    enabled: !!user?.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
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
  
  // Estados para sincronización
  const [linkCodeInput, setLinkCodeInput] = useState("");

  // Funciones de validación
  const validateNumericInput = (value: string, allowSpecialChars = false) => {
    if (allowSpecialChars) {
      // Para categorías de competición: permite números, kg, +, -, espacios
      return /^[0-9+\-kg\s]*$/i.test(value);
    }
    // Para códigos: solo números
    return /^\d*$/.test(value);
  };

  const validateCompetitionCategory = (value: string) => {
    if (!value) return true; // Permitir vacío
    // Formatos válidos: "73kg", "-73kg", "+100kg", "73 kg", etc.
    return /^[+\-]?\d+(\s*kg)?$/i.test(value.trim());
  };

  const validateSyncCode = (value: string) => {
    // Formato válido: SPORT-A8F2-B1C3 (letras, números y guiones)
    return /^[A-Z0-9\-]*$/.test(value);
  };

  const validateEmail = (email: string) => {
    if (!email) return true; // Permitir vacío
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (userProfile) {
      setProfileData({
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

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.updateUserProfile(user?.id!, data),
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Configuración guardada",
        description: "Tus datos personales han sido actualizados correctamente.",
      });
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

  const handleSaveProfile = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userProfile) {
      setProfileData({
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
    setProfileData(prev => ({
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
        setProfileData(prev => ({
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

  // Funciones de sincronización
  const handleGenerateCode = async () => {
    try {
      // Recopilar datos del dispositivo actual
      const deviceData = {
        timer: localStorage.getItem('timer_data') || '{}',
        mentalHealth: localStorage.getItem('mental_health_data') || '{}',
        settings: localStorage.getItem('app_settings') || '{}',
        userProfile: profileData
      };
      
      const code = await generateSyncCode(deviceData);
      if (code) {
        toast({
          title: "Código generado",
          description: `Tu código de sincronización es: ${code}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el código de sincronización",
        variant: "destructive",
      });
    }
  };

  const handleLinkDevice = async () => {
    if (!linkCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un código de sincronización válido",
        variant: "destructive",
      });
      return;
    }

    const success = await linkDevice(linkCodeInput.trim());
    if (success) {
      setLinkCodeInput("");
      toast({
        title: "Dispositivo vinculado",
        description: "Tu dispositivo se ha vinculado exitosamente",
      });
    }
  };

  const handleSyncData = async () => {
    const success = await syncData(true);
    if (success) {
      // Invalidar caches relacionados después de sincronización
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['timer-data'] });
      queryClient.invalidateQueries({ queryKey: ['mental-health'] });
      
      toast({
        title: "Sincronización completada",
        description: "Tus datos se han sincronizado correctamente",
      });
    }
  };

  const handleClearSync = () => {
    clearSyncData();
    toast({
      title: "Datos limpiados",
      description: "Se han eliminado todos los datos de sincronización",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Código copiado al portapapeles",
    });
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
                {isEditing && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Edit className="h-3 w-3" />
                    Modo Edición
                  </Badge>
                )}
              </div>
              <CardDescription>
                {isEditing ? "Modifica tu información básica y preferencias de perfil" : "Consulta tu información básica y preferencias de perfil"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                // MODO VISTA - Datos fijos y limpios
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="outline">
                      Rol: {currentUserRole === 'admin' ? 'Administrador' : 
                            currentUserRole === 'entrenador' ? 'Entrenador' : 'Deportista'}
                    </Badge>
                  </div>

                  {/* Imagen de perfil en modo vista */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.profileImageUrl} alt="Foto de perfil" />
                      <AvatarFallback>
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Foto de Perfil</p>
                      <p className="text-sm">{profileData.profileImageUrl ? "Imagen cargada" : "Sin imagen"}</p>
                    </div>
                  </div>

                  {/* Datos personales en modo vista */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
                      <p className="text-base">{profileData.fullName || "No especificado"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Correo Electrónico</p>
                      <p className="text-base">{profileData.email || "No especificado"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Nacimiento
                      </p>
                      <p className="text-base">{profileData.birthDate || "No especificada"}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Género</p>
                      <p className="text-base">
                        {profileData.gender === 'male' ? 'Masculino' : 
                         profileData.gender === 'female' ? 'Femenino' : 'No especificado'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Cinturón Actual</p>
                      <p className="text-base">
                        {getBeltOptions().find(belt => belt.value === profileData.currentBelt)?.label || "No especificado"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Categoría de Competición</p>
                      <p className="text-base">{profileData.competitionCategory || "No especificada"}</p>
                    </div>
                  </div>

                  {/* Lesiones en modo vista */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Lesiones</p>
                    {profileData.injuries.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.injuries.map((injury) => (
                          <Badge key={injury} variant="secondary" className="text-xs">
                            {injury}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Ninguna lesión registrada</p>
                    )}
                  </div>

                  {/* Descripción de lesiones en modo vista */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Descripción de Lesiones</p>
                    <p className="text-base whitespace-pre-wrap">
                      {profileData.injuryDescription || "Sin descripción adicional"}
                    </p>
                  </div>
                </>
              ) : (
                // MODO EDICIÓN - Formularios
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">
                      Rol: {currentUserRole === 'admin' ? 'Administrador' : 
                            currentUserRole === 'entrenador' ? 'Entrenador' : 'Deportista'}
                    </Badge>
                  </div>

                  {/* Imagen de perfil en modo edición */}
                  <div className="flex items-center gap-4 mb-6 p-4 border rounded-lg">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.profileImageUrl} alt="Foto de perfil" />
                      <AvatarFallback>
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="profileImage" className="text-sm font-medium">Foto de Perfil</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Sube una imagen para tu perfil
                      </p>
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
                          {profileData.profileImageUrl ? 'Cambiar Foto' : 'Subir Foto'}
                        </Button>
                        {profileData.profileImageUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProfileData(prev => ({ ...prev, profileImageUrl: "" }))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Formularios en modo edición */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre Completo</Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && !validateEmail(value)) {
                            toast({
                              title: "Email inválido",
                              description: "Ingresa una dirección de correo electrónico válida",
                              variant: "destructive",
                            });
                          }
                        }}
                        placeholder="tu@correo.com"
                        data-testid="input-email"
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
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Género</Label>
                      <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
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
                      <Select value={profileData.currentBelt} onValueChange={(value) => setProfileData(prev => ({ ...prev, currentBelt: value }))}>
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

                    <div className="space-y-2">
                      <Label htmlFor="competitionCategory">Categoría de Competición</Label>
                      <Input
                        id="competitionCategory"
                        value={profileData.competitionCategory}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Solo permitir entrada si es válida o está vacía
                          if (value === '' || validateNumericInput(value, true)) {
                            setProfileData(prev => ({ ...prev, competitionCategory: value }));
                          }
                        }}
                        onBlur={(e) => {
                          // Validación final al perder el foco
                          const value = e.target.value.trim();
                          if (value && !validateCompetitionCategory(value)) {
                            toast({
                              title: "Formato inválido",
                              description: "Ingresa una categoría válida (ej: 73kg, -73kg, +100kg)",
                              variant: "destructive",
                            });
                          }
                        }}
                        placeholder="Ej: -73kg, +100kg, 73kg"
                        data-testid="input-competition-category"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos válidos: 73kg, -73kg, +100kg
                      </p>
                    </div>
                  </div>

                  {/* Lesiones en modo edición */}
                  <div className="space-y-4">
                    <Label>Lesiones</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecciona las lesiones que has tenido o que te afectan actualmente
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {getTypicalInjuries().map((injury) => (
                        <div key={injury} className="flex items-center space-x-2">
                          <Checkbox
                            id={`injury-${injury}`}
                            checked={profileData.injuries.includes(injury)}
                            onCheckedChange={(checked) => handleInjuryChange(injury, checked as boolean)}
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

                  {/* Descripción de lesiones en modo edición */}
                  <div className="space-y-2">
                    <Label htmlFor="injuryDescription">Descripción de Lesiones</Label>
                    <Textarea
                      id="injuryDescription"
                      value={profileData.injuryDescription}
                      onChange={(e) => setProfileData(prev => ({ ...prev, injuryDescription: e.target.value }))}
                      placeholder="Describe cualquier lesión o limitación física que debamos tener en cuenta..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
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
                  onClick={handleCancelEdit}
                  disabled={updateProfileMutation.isPending}
                  className="min-w-[100px]"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </div>
                </Button>
                <Button
                  onClick={() => handleSaveProfile(profileData)}
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