import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Types
interface WeightCategory {
  name: string;
  minWeight?: number;
  maxWeight?: number;
}

interface GenderCategories {
  masculino: boolean;
  femenino: boolean;
  mixto: boolean;
}

interface WeightCategories {
  [ageCategory: string]: {
    masculino: WeightCategory[];
    femenino: WeightCategory[];
    mixto: WeightCategory[];
  };
}

interface Sport {
  id: string;
  name: string;
  description: string;
  belts: string[];
  genderCategories: GenderCategories;
  ageCategories: string[];
  weightCategories?: WeightCategories;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SportFormData {
  name: string;
  description: string;
  belts: string[];
  genderCategories: GenderCategories;
  ageCategories: string[];
  weightCategories: WeightCategories;
}

// Default age categories available for selection
const defaultAgeCategories = [
  "Infantil", "Cadete", "Juvenil", "Senior", "Master", 
  "Sub-15", "Sub-18", "Sub-21", "Adulto", "Veterano"
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
    ageCategories: [],
    weightCategories: {}
  });
  const [newBelt, setNewBelt] = useState("");
  const [newAgeCategory, setNewAgeCategory] = useState("");
  const [selectedAgeCategory, setSelectedAgeCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState<"masculino" | "femenino" | "mixto">("masculino");
  const [newWeightCategory, setNewWeightCategory] = useState({ name: "", minWeight: "", maxWeight: "" });

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
      ageCategories: [],
      weightCategories: {}
    });
    setNewBelt("");
    setNewAgeCategory("");
    setSelectedAgeCategory("");
    setSelectedGender("masculino");
    setNewWeightCategory({ name: "", minWeight: "", maxWeight: "" });
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
      ageCategories: sport.ageCategories,
      weightCategories: sport.weightCategories || {}
    });
  };

  const handleSubmit = () => {
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

  const handleAgeCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => {
      const newAgeCategories = checked 
        ? [...prev.ageCategories, category]
        : prev.ageCategories.filter(c => c !== category);
      
      // Inicializar categorías de peso para nueva categoría de edad
      const newWeightCategories = { ...prev.weightCategories };
      if (checked && !newWeightCategories[category]) {
        newWeightCategories[category] = {
          masculino: [],
          femenino: [],
          mixto: []
        };
      } else if (!checked) {
        delete newWeightCategories[category];
      }
      
      return {
        ...prev,
        ageCategories: newAgeCategories,
        weightCategories: newWeightCategories
      };
    });
  };

  // Función para agregar categoría de peso
  const handleAddWeightCategory = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!selectedAgeCategory || !newWeightCategory.name.trim()) return;
    
    const weightCat: WeightCategory = {
      name: newWeightCategory.name.trim(),
      minWeight: newWeightCategory.minWeight ? parseFloat(newWeightCategory.minWeight) : undefined,
      maxWeight: newWeightCategory.maxWeight ? parseFloat(newWeightCategory.maxWeight) : undefined
    };

    setFormData(prev => {
      const updatedWeightCategories = { ...prev.weightCategories };
      if (!updatedWeightCategories[selectedAgeCategory]) {
        updatedWeightCategories[selectedAgeCategory] = {
          masculino: [],
          femenino: [],
          mixto: []
        };
      }
      
      // Verificar que no exista ya una categoría con el mismo nombre
      const existingCategories = updatedWeightCategories[selectedAgeCategory][selectedGender];
      if (!existingCategories.some(cat => cat.name === weightCat.name)) {
        updatedWeightCategories[selectedAgeCategory][selectedGender].push(weightCat);
      }
      
      return {
        ...prev,
        weightCategories: updatedWeightCategories
      };
    });

    setNewWeightCategory({ name: "", minWeight: "", maxWeight: "" });
  };

  // Función para remover categoría de peso
  const handleRemoveWeightCategory = (ageCategory: string, gender: "masculino" | "femenino" | "mixto", categoryName: string) => {
    setFormData(prev => {
      const updatedWeightCategories = { ...prev.weightCategories };
      if (updatedWeightCategories[ageCategory]) {
        updatedWeightCategories[ageCategory][gender] = 
          updatedWeightCategories[ageCategory][gender].filter(cat => cat.name !== categoryName);
      }
      
      return {
        ...prev,
        weightCategories: updatedWeightCategories
      };
    });
  };

  const SportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSport ? "Editar Deporte" : "Crear Nuevo Deporte"}
          </DialogTitle>
          <DialogDescription>
            {editingSport ? "Modifica los datos del deporte seleccionado" : "Completa la información para crear un nuevo deporte"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Deporte</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="ej: Deportivo, Karate, JiuJitsu"
                required
                autoFocus={false}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBelt();
                  }
                }}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAgeCategory();
                  }
                }}
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
                    <Label htmlFor={`age-${category}`} className="text-sm">
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

          {/* Weight Categories Configuration - Separado del formulario principal */}
          {formData.ageCategories.length > 0 && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Configuración de Categorías de Peso</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Configura las categorías de peso para cada categoría de edad y género
                </p>
              </div>

              {/* Selector de categoría de edad y género */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría de Edad</Label>
                  <Select value={selectedAgeCategory} onValueChange={setSelectedAgeCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.ageCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agregar nueva categoría de peso */}
              {selectedAgeCategory && (
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Agregar Categoría de Peso para {selectedAgeCategory} - {selectedGender}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Nombre de la Categoría</Label>
                      <Input
                        value={newWeightCategory.name}
                        onChange={(e) => setNewWeightCategory(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="ej: -60kg, +100kg, ligero"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso Mínimo (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newWeightCategory.minWeight}
                        onChange={(e) => setNewWeightCategory(prev => ({ ...prev, minWeight: e.target.value }))}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Peso Máximo (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newWeightCategory.maxWeight}
                        onChange={(e) => setNewWeightCategory(prev => ({ ...prev, maxWeight: e.target.value }))}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={(e) => handleAddWeightCategory(e)}
                    disabled={!newWeightCategory.name.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Categoría de Peso
                  </Button>
                </div>
              )}

              {/* Mostrar categorías de peso existentes */}
              {Object.keys(formData.weightCategories).length > 0 && (
                <div className="space-y-3">
                  <Label className="font-medium">Categorías de Peso Configuradas</Label>
                  {Object.entries(formData.weightCategories).map(([ageCategory, genderCategories]) => (
                    <div key={ageCategory} className="border rounded-lg p-3">
                      <h4 className="font-medium mb-3 text-primary">{ageCategory}</h4>
                      {Object.entries(genderCategories).map(([gender, categories]) => (
                        categories.length > 0 && (
                          <div key={gender} className="mb-3">
                            <span className="text-sm font-medium text-muted-foreground mb-2 block capitalize">
                              {gender}:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {categories.map((category) => (
                                <Badge key={category.name} variant="secondary" className="flex items-center gap-1">
                                  {category.name}
                                  {(category.minWeight !== undefined || category.maxWeight !== undefined) && (
                                    <span className="text-xs">
                                      ({category.minWeight || ''}
                                      {category.minWeight !== undefined && category.maxWeight !== undefined ? '-' : ''}
                                      {category.maxWeight || ''}kg)
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveWeightCategory(ageCategory, gender as "masculino" | "femenino" | "mixto", category.name)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createSportMutation.isPending || updateSportMutation.isPending}
            >
              {createSportMutation.isPending || updateSportMutation.isPending ? "Guardando..." : 
               editingSport ? "Actualizar Deporte" : "Crear Deporte"}
            </Button>
          </div>
        </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Deportes</h2>
          <p className="text-muted-foreground">
            Configura los deportes, sus cinturones, categorías de edad y peso
          </p>
        </div>
        <Button onClick={handleCreateSport}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Deporte
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
                    {sport.genderCategories.mixto && (
                      <Badge variant="outline" className="text-xs">Mixto</Badge>
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

              {/* Mostrar categorías de peso si existen */}
              {sport.weightCategories && Object.keys(sport.weightCategories).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Categorías de Peso Configuradas</h4>
                  <div className="space-y-2">
                    {Object.entries(sport.weightCategories).map(([ageCategory, genderCategories]) => (
                      <div key={ageCategory} className="text-sm">
                        <span className="font-medium text-primary">{ageCategory}:</span>
                        <div className="ml-4 mt-1">
                          {Object.entries(genderCategories).map(([gender, categories]) => (
                            categories.length > 0 && (
                              <div key={gender} className="mb-1">
                                <span className="text-muted-foreground capitalize">{gender}: </span>
                                <span className="text-xs">
                                  {categories.map(cat => cat.name).join(', ')}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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