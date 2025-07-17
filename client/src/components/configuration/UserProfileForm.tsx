import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Edit, X, Camera, Loader2 } from "lucide-react";

interface UserProfileData {
  fullName: string;
  email: string;
  gender: string;
  currentBelt: string;
  competitionCategory: string;
  injuryDescription: string;
  profileImageUrl: string;
  birthDate: string;
  injuries: string[];
}

interface UserProfileFormProps {
  profile: UserProfileData;
  isEditing: boolean;
  isLoading: boolean;
  onSave: (data: UserProfileData) => void;
  onEdit: () => void;
  onCancel: () => void;
}

const commonInjuries = [
  "Lesión de rodilla",
  "Lesión de hombro", 
  "Lesión de espalda",
  "Lesión de muñeca",
  "Lesión de tobillo",
  "Lesión de codo",
  "Otras lesiones",
];

const belts = [
  "Blanco", "Amarillo", "Naranja", "Verde", "Azul", "Marrón", "Negro 1º Dan",
  "Negro 2º Dan", "Negro 3º Dan", "Negro 4º Dan", "Negro 5º Dan"
];

const competitionCategories = [
  "Sub-15", "Sub-18", "Sub-21", "Senior", "Veteranos (+30)", 
  "Veteranos (+35)", "Veteranos (+40)", "Veteranos (+45)", "Veteranos (+50)"
];

const UserProfileForm = ({ 
  profile, 
  isEditing, 
  isLoading, 
  onSave, 
  onEdit, 
  onCancel 
}: UserProfileFormProps) => {
  const [formData, setFormData] = useState<UserProfileData>(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (field: keyof UserProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInjuryChange = (injury: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ 
        ...prev, 
        injuries: [...prev.injuries, injury] 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        injuries: prev.injuries.filter(i => i !== injury) 
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      {/* Avatar y datos básicos */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={formData.profileImageUrl} />
          <AvatarFallback>
            {formData.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          {!isEditing ? (
            <div>
              <h2 className="text-2xl font-bold text-foreground">{formData.fullName || "Nombre no especificado"}</h2>
              <p className="text-muted-foreground">{formData.email}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="URL de imagen de perfil"
                value={formData.profileImageUrl}
                onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={onEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
              <Button onClick={onCancel} variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Formularios */}
      {isEditing ? (
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
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select onValueChange={(value) => handleInputChange('gender', value)} value={formData.gender}>
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
            <Label htmlFor="currentBelt">Grado Actual</Label>
            <Select onValueChange={(value) => handleInputChange('currentBelt', value)} value={formData.currentBelt}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu grado" />
              </SelectTrigger>
              <SelectContent>
                {belts.map((belt) => (
                  <SelectItem key={belt} value={belt}>{belt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitionCategory">Categoría de Competencia</Label>
            <Select onValueChange={(value) => handleInputChange('competitionCategory', value)} value={formData.competitionCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu categoría" />
              </SelectTrigger>
              <SelectContent>
                {competitionCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Lesiones Previas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonInjuries.map((injury) => (
                <div key={injury} className="flex items-center space-x-2">
                  <Checkbox
                    id={injury}
                    checked={formData.injuries.includes(injury)}
                    onCheckedChange={(checked) => handleInjuryChange(injury, checked as boolean)}
                  />
                  <Label htmlFor={injury} className="text-sm">{injury}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="injuryDescription">Descripción de Lesiones</Label>
            <Textarea
              id="injuryDescription"
              placeholder="Describe en detalle tus lesiones o problemas físicos..."
              rows={3}
              value={formData.injuryDescription}
              onChange={(e) => handleInputChange('injuryDescription', e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Información Personal</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nombre:</span> {formData.fullName || "No especificado"}</p>
              <p><span className="font-medium">Email:</span> {formData.email || "No especificado"}</p>
              <p><span className="font-medium">Fecha de nacimiento:</span> {formData.birthDate || "No especificada"}</p>
              <p><span className="font-medium">Género:</span> {formData.gender === 'male' ? 'Masculino' : formData.gender === 'female' ? 'Femenino' : 'No especificado'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Información Deportiva</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Grado actual:</span> {formData.currentBelt || "No especificado"}</p>
              <p><span className="font-medium">Categoría:</span> {formData.competitionCategory || "No especificada"}</p>
            </div>
          </div>

          {(formData.injuries.length > 0 || formData.injuryDescription) && (
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground mb-2">Información Médica</h3>
              <div className="space-y-2 text-sm">
                {formData.injuries.length > 0 && (
                  <p><span className="font-medium">Lesiones:</span> {formData.injuries.join(', ')}</p>
                )}
                {formData.injuryDescription && (
                  <p><span className="font-medium">Descripción:</span> {formData.injuryDescription}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileForm;