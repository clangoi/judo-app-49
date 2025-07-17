import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Settings, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Sport {
  id: string;
  name: string;
  description: string;
  belts: string[];
  genderCategories: {
    masculino: boolean;
    femenino: boolean;
    mixto: boolean;
  };
  ageCategories: string[];
  isActive: boolean;
  createdAt: string;
}

interface SportFormData {
  name: string;
  description: string;
  belts: string[];
  genderCategories: {
    masculino: boolean;
    femenino: boolean;
    mixto: boolean;
  };
  ageCategories: string[];
}

const defaultBelts = {
  deportivo: ["blanco", "amarillo", "naranja", "verde", "azul", "marrón", "negro"],
  karate: ["blanco", "amarillo", "naranja", "verde", "azul", "marrón", "negro"],
  jiujitsu: ["blanco", "azul", "púrpura", "marrón", "negro"]
};

const defaultAgeCategories = [
  "cadete", // 15-17 años
  "infantil", // 13-14 años
  "novicios", // principiantes adultos
  "absoluta", // categoría general
  "master", // +30 años
  "juvenil", // 18-20 años
  "senior" // 21+ años
];

export const AdminSports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState<SportFormData>({
    name: "",
    description: "",
    belts: [],
    genderCategories: {
      masculino: true,
      femenino: true,
      mixto: false
    },
    ageCategories: []
  });
  const [newBelt, setNewBelt] = useState("");
  const [newAgeCategory, setNewAgeCategory] = useState("");

  // Fetch sports
  const { data: sports = [], isLoading } = useQuery({
    queryKey: ["/api/sports"],
    queryFn: async () => {
      const response = await fetch("/api/sports");
      if (!response.ok) throw new Error("Failed to fetch sports");
      return response.json();
    }
  });

  // Create sport mutation
  const createSportMutation = useMutation({
    mutationFn: async (sportData: SportFormData) => {
      const response = await fetch("/api/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sportData)
      });
      if (!response.ok) throw new Error("Failed to create sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({ title: "Deporte creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear el deporte", variant: "destructive" });
    }
  });

  // Update sport mutation
  const updateSportMutation = useMutation({
    mutationFn: async ({ sportId, sportData }: { sportId: string; sportData: SportFormData }) => {
      const response = await fetch(`/api/sports/${sportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sportData)
      });
      if (!response.ok) throw new Error("Failed to update sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setEditingSport(null);
      resetForm();
      toast({ title: "Deporte actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar el deporte", variant: "destructive" });
    }
  });

  // Delete sport mutation
  const deleteSportMutation = useMutation({
    mutationFn: async (sportId: string) => {
      const response = await fetch(`/api/sports/${sportId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      toast({ title: "Deporte desactivado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al desactivar el deporte", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      belts: [],
      genderCategories: {
        masculino: true,
        femenino: true,
        mixto: false
      },
      ageCategories: []
    });
    setNewBelt("");
    setNewAgeCategory("");
  };

  const handleCreateSport = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEditSport = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description,
      belts: sport.belts,
      genderCategories: sport.genderCategories,
      ageCategories: sport.ageCategories
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "El nombre del deporte es requerido", variant: "destructive" });
      return;
    }

    if (formData.belts.length === 0) {
      toast({ title: "Debe seleccionar al menos un cinturón", variant: "destructive" });
      return;
    }

    if (formData.ageCategories.length === 0) {
      toast({ title: "Debe seleccionar al menos una categoría de edad", variant: "destructive" });
      return;
    }

    if (editingSport) {
      updateSportMutation.mutate({ sportId: editingSport.id, sportData: formData });
    } else {
      createSportMutation.mutate(formData);
    }
  };

  const handleAddBelt = () => {
    if (newBelt.trim() && !formData.belts.includes(newBelt.trim())) {
      setFormData(prev => ({
        ...prev,
        belts: [...prev.belts, newBelt.trim()]
      }));
      setNewBelt("");
    }
  };

  const handleRemoveBelt = (belt: string) => {
    setFormData(prev => ({
      ...prev,
      belts: prev.belts.filter(b => b !== belt)
    }));
  };

  const handleAddAgeCategory = () => {
    if (newAgeCategory.trim() && !formData.ageCategories.includes(newAgeCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        ageCategories: [...prev.ageCategories, newAgeCategory.trim()]
      }));
      setNewAgeCategory("");
    }
  };

  const handleRemoveAgeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      ageCategories: prev.ageCategories.filter(c => c !== category)
    }));
  };

  const handleBeltChange = (belt: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      belts: checked 
        ? [...prev.belts, belt]
        : prev.belts.filter(b => b !== belt)
    }));
  };

  const handleAgeCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ageCategories: checked 
        ? [...prev.ageCategories, category]
        : prev.ageCategories.filter(c => c !== category)
    }));
  };

  const SportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSport ? "Editar Deporte" : "Crear Nuevo Deporte"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Deporte</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej: Deportivo, Karate, JiuJitsu"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe las características principales del deporte..."
              rows={3}
            />
          </div>

          {/* Custom Belts */}
          <div className="space-y-3">
            <Label>Cinturones del Deporte</Label>
            <div className="flex gap-2">
              <Input
                value={newBelt}
                onChange={(e) => setNewBelt(e.target.value)}
                placeholder="Agregar nuevo cinturón (ej: blanco, negro, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBelt())}
              />
              <Button type="button" onClick={handleAddBelt} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.belts.map((belt) => (
                <Badge key={belt} variant="outline" className="flex items-center gap-1">
                  {belt}
                  <button
                    type="button"
                    onClick={() => handleRemoveBelt(belt)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Gender Categories */}
          <div className="space-y-3">
            <Label>Categorías por Género</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="masculino"
                  checked={formData.genderCategories.masculino}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      genderCategories: { ...prev.genderCategories, masculino: checked as boolean }
                    }))
                  }
                />
                <Label htmlFor="masculino">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="femenino"
                  checked={formData.genderCategories.femenino}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      genderCategories: { ...prev.genderCategories, femenino: checked as boolean }
                    }))
                  }
                />
                <Label htmlFor="femenino">Femenino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mixto"
                  checked={formData.genderCategories.mixto}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      genderCategories: { ...prev.genderCategories, mixto: checked as boolean }
                    }))
                  }
                />
                <Label htmlFor="mixto">Mixto</Label>
              </div>
            </div>
          </div>

          {/* Age Categories */}
          <div className="space-y-3">
            <Label>Categorías por Edad</Label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newAgeCategory}
                onChange={(e) => setNewAgeCategory(e.target.value)}
                placeholder="Agregar nueva categoría de edad (ej: cadete, master, etc.)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAgeCategory())}
              />
              <Button type="button" onClick={handleAddAgeCategory} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Categorías comunes disponibles:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {defaultAgeCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${category}`}
                      checked={formData.ageCategories.includes(category)}
                      onCheckedChange={(checked) => handleAgeCategoryChange(category, checked as boolean)}
                    />
                    <Label htmlFor={`age-${category}`} className="text-sm capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ageCategories.map((category) => (
                <Badge key={category} variant="outline" className="flex items-center gap-1">
                  {category}
                  <button
                    type="button"
                    onClick={() => handleRemoveAgeCategory(category)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createSportMutation.isPending || updateSportMutation.isPending}>
              {(createSportMutation.isPending || updateSportMutation.isPending) ? "Guardando..." : editingSport ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button onClick={handleCreateSport} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Nuevo Deporte
        </Button>
      </div>

      <div className="grid gap-6">
        {sports.map((sport: Sport) => (
          <Card key={sport.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {sport.name}
                    <Badge variant={sport.isActive ? "default" : "secondary"}>
                      {sport.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </CardTitle>
                  {sport.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {sport.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditSport(sport)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSportMutation.mutate(sport.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Cinturones</h4>
                  <div className="flex flex-wrap gap-1">
                    {sport.belts.map((belt) => (
                      <Badge key={belt} variant="outline" className="text-xs">
                        {belt}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Géneros</h4>
                  <div className="flex gap-1">
                    {sport.genderCategories.masculino && (
                      <Badge variant="outline" className="text-xs">Masculino</Badge>
                    )}
                    {sport.genderCategories.femenino && (
                      <Badge variant="outline" className="text-xs">Femenino</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Categorías de Edad</h4>
                  <div className="flex flex-wrap gap-1">
                    {sport.ageCategories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SportModal 
        isOpen={isCreateModalOpen || !!editingSport} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingSport(null);
          resetForm();
        }} 
      />
    </div>
  );
};