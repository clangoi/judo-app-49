
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Camera, Shield } from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio"),
  profile_image_url: z.string().optional(),
  club_name: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  competition_category: z.string().optional(),
  injuries: z.array(z.string()).optional(),
  injury_description: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const maleCategories = [
  "Sub-15 (-46kg, -50kg, -55kg, -60kg, -66kg, -73kg, +73kg)",
  "Sub-18 (-55kg, -60kg, -66kg, -73kg, -81kg, -90kg, +90kg)",
  "Sub-21 (-60kg, -66kg, -73kg, -81kg, -90kg, -100kg, +100kg)",
  "Senior (-60kg, -66kg, -73kg, -81kg, -90kg, -100kg, +100kg)",
  "Veteranos (+30, +35, +40, +45, +50 años)",
];

const femaleCategories = [
  "Sub-15 (-40kg, -44kg, -48kg, -52kg, -57kg, -63kg, +63kg)",
  "Sub-18 (-44kg, -48kg, -52kg, -57kg, -63kg, -70kg, +70kg)",
  "Sub-21 (-48kg, -52kg, -57kg, -63kg, -70kg, -78kg, +78kg)",
  "Senior (-48kg, -52kg, -57kg, -63kg, -70kg, -78kg, +78kg)",
  "Veteranas (+30, +35, +40, +45, +50 años)",
];

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      profile_image_url: "",
      club_name: "",
      gender: undefined,
      competition_category: "",
      injuries: [],
      injury_description: "",
    },
  });

  const watchedGender = form.watch("gender");

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
        form.reset({
          full_name: data.full_name || "",
          profile_image_url: (data as any).profile_image_url || "",
          club_name: data.club_name || "",
          gender: data.gender || undefined,
          competition_category: (data as any).competition_category || "",
          injuries: (data as any).injuries || [],
          injury_description: (data as any).injury_description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      // Si el perfil ya existe, usamos UPDATE, si no, usamos INSERT
      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: values.full_name,
            profile_image_url: values.profile_image_url,
            club_name: values.club_name,
            gender: values.gender,
            competition_category: values.competition_category,
            injuries: values.injuries,
            injury_description: values.injury_description,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            full_name: values.full_name,
            profile_image_url: values.profile_image_url,
            club_name: values.club_name,
            gender: values.gender,
            competition_category: values.competition_category,
            injuries: values.injuries,
            injury_description: values.injury_description,
          });

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInjuryChange = (injury: string, checked: boolean) => {
    const currentInjuries = form.getValues("injuries") || [];
    if (checked) {
      form.setValue("injuries", [...currentInjuries, injury]);
    } else {
      form.setValue("injuries", currentInjuries.filter(i => i !== injury));
    }
  };

  const getCategoriesForGender = () => {
    if (watchedGender === "male") return maleCategories;
    if (watchedGender === "female") return femaleCategories;
    return [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Configurar Perfil
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foto de Perfil */}
            <FormField
              control={form.control}
              name="profile_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Foto de Perfil
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="URL de la imagen" 
                      {...field} 
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Club */}
            <FormField
              control={form.control}
              name="club_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Club</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del club" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Género */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría de Competencia */}
            {watchedGender && (
              <FormField
                control={form.control}
                name="competition_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría de Competencia</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getCategoriesForGender().map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Lesiones */}
            <div className="space-y-3">
              <FormLabel>Lesiones Actuales</FormLabel>
              <div className="grid grid-cols-2 gap-3">
                {commonInjuries.map((injury) => (
                  <div key={injury} className="flex items-center space-x-2">
                    <Checkbox
                      id={injury}
                      checked={(form.getValues("injuries") || []).includes(injury)}
                      onCheckedChange={(checked) => 
                        handleInjuryChange(injury, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={injury}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {injury}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Descripción de Lesiones */}
            <FormField
              control={form.control}
              name="injury_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción de Lesiones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe tus lesiones actuales o historial médico relevante"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
