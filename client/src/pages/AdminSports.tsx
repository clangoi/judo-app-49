import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface WeightCategory {
  name: string;
  minWeight?: number;
  maxWeight?: number;
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
  weightCategories: {
    [ageCategory: string]: {
      masculino: WeightCategory[];
      femenino: WeightCategory[];
      mixto: WeightCategory[];
    };
  };
}

interface Sport extends SportFormData {
  id: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Default age categories for sports
const defaultAgeCategories = [
  "Infantil", "Cadete", "Juvenil", "Senior", "Master", 
  "Sub-15", "Sub-18", "Sub-21", "Adulto", "Veterano"
];

export const AdminSports = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<SportFormData>({
    name: "",
    description: "",
    belts: [],
    genderCategories: { masculino: true, femenino: true, mixto: false },
    ageCategories: [],
    weightCategories: {}
  });
  
  // Form helpers
  const [newBelt, setNewBelt] = useState("");
  const [newAgeCategory, setNewAgeCategory] = useState("");
  const [selectedAgeCategory, setSelectedAgeCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState<"masculino" | "femenino" | "mixto">("masculino");
  const [newWeightCategory, setNewWeightCategory] = useState({ name: "", minWeight: "", maxWeight: "" });

  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      belts: [],
      genderCategories: { masculino: true, femenino: true, mixto: false },
      ageCategories: [],
      weightCategories: {}
    });
    setNewBelt("");
    setNewAgeCategory("");
    setSelectedAgeCategory("");
    setSelectedGender("masculino");
    setNewWeightCategory({ name: "", minWeight: "", maxWeight: "" });
  };

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
  const createMutation = useMutation({
    mutationFn: async (data: SportFormData) => {
      const response = await fetch("/api/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setModalOpen(false);
      resetForm();
      setEditingId(null);
      toast({ title: "Deporte creado exitosamente" });
    },
    onError: () => toast({ title: "Error al crear el deporte", variant: "destructive" })
  });

  // Update sport mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SportFormData }) => {
      const response = await fetch(`/api/sports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      setModalOpen(false);
      resetForm();
      setEditingId(null);
      toast({ title: "Deporte actualizado exitosamente" });
    },
    onError: () => toast({ title: "Error al actualizar el deporte", variant: "destructive" })
  });

  // Delete sport mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sports/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete sport");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sports"] });
      toast({ title: "Deporte desactivado exitosamente" });
    },
    onError: () => toast({ title: "Error al desactivar el deporte", variant: "destructive" })
  });

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setEditingId(null);
    setModalOpen(true);
  };

  const openEditModal = (sport: Sport) => {
    setFormData({
      name: sport.name,
      description: sport.description,
      belts: sport.belts,
      genderCategories: sport.genderCategories,
      ageCategories: sport.ageCategories,
      weightCategories: sport.weightCategories || {}
    });
    setEditingId(sport.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  // Form submission
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

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Belt handlers
  const addBelt = () => {
    if (newBelt.trim() && !formData.belts.includes(newBelt.trim())) {
      setFormData(prev => ({ ...prev, belts: [...prev.belts, newBelt.trim()] }));
      setNewBelt("");
    }
  };

  const removeBelt = (belt: string) => {
    setFormData(prev => ({ ...prev, belts: prev.belts.filter(b => b !== belt) }));
  };

  // Age category handlers
  const addAgeCategory = () => {
    if (newAgeCategory.trim() && !formData.ageCategories.includes(newAgeCategory.trim())) {
      setFormData(prev => ({ ...prev, ageCategories: [...prev.ageCategories, newAgeCategory.trim()] }));
      setNewAgeCategory("");
    }
  };

  const removeAgeCategory = (category: string) => {
    setFormData(prev => ({ ...prev, ageCategories: prev.ageCategories.filter(c => c !== category) }));
  };

  const toggleAgeCategory = (category: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, ageCategories: [...prev.ageCategories, category] }));
    } else {
      removeAgeCategory(category);
    }
  };

  // Weight category handlers
  const addWeightCategory = () => {
    if (!selectedAgeCategory || !newWeightCategory.name.trim()) return;
    
    const weightCat: WeightCategory = {
      name: newWeightCategory.name.trim(),
      minWeight: newWeightCategory.minWeight ? parseFloat(newWeightCategory.minWeight) : undefined,
      maxWeight: newWeightCategory.maxWeight ? parseFloat(newWeightCategory.maxWeight) : undefined
    };

    setFormData(prev => {
      const updated = { ...prev.weightCategories };
      if (!updated[selectedAgeCategory]) {
        updated[selectedAgeCategory] = { masculino: [], femenino: [], mixto: [] };
      }
      
      const existing = updated[selectedAgeCategory][selectedGender];
      if (!existing.some(cat => cat.name === weightCat.name)) {
        updated[selectedAgeCategory][selectedGender].push(weightCat);
      }
      
      return { ...prev, weightCategories: updated };
    });

    setNewWeightCategory({ name: "", minWeight: "", maxWeight: "" });
  };

  const removeWeightCategory = (ageCategory: string, gender: "masculino" | "femenino" | "mixto", categoryName: string) => {
    setFormData(prev => {
      const updated = { ...prev.weightCategories };
      if (updated[ageCategory]) {
        updated[ageCategory][gender] = updated[ageCategory][gender].filter(cat => cat.name !== categoryName);
      }
      return { ...prev, weightCategories: updated };
    });
  };

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
        <Button onClick={openCreateModal}>
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
                    onClick={() => openEditModal(sport)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(sport.id)}
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
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(sport.genderCategories).map(([gender, enabled]) => (
                      enabled && (
                        <Badge key={gender} variant="outline" className="text-xs capitalize">
                          {gender}
                        </Badge>
                      )
                    ))}
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

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Deporte" : "Crear Nuevo Deporte"}
            </DialogTitle>
            <DialogDescription>
              {editingId ? "Modifica los datos del deporte seleccionado" : "Completa la información para crear un nuevo deporte"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Deporte</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ej: Judo, Karate, JiuJitsu"
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

            {/* Belts */}
            <div className="space-y-3">
              <Label>Cinturones del Deporte</Label>
              <div className="flex gap-2">
                <Input
                  value={newBelt}
                  onChange={(e) => setNewBelt(e.target.value)}
                  placeholder="Agregar nuevo cinturón"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBelt())}
                />
                <Button type="button" onClick={addBelt} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.belts.map((belt) => (
                  <Badge key={belt} variant="outline" className="flex items-center gap-1">
                    {belt}
                    <button
                      type="button"
                      onClick={() => removeBelt(belt)}
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
              <Label>Categorías de Género</Label>
              <div className="space-y-2">
                {Object.entries(formData.genderCategories).map(([gender, enabled]) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <Checkbox
                      id={gender}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          genderCategories: { ...prev.genderCategories, [gender]: !!checked }
                        }))
                      }
                    />
                    <Label htmlFor={gender} className="capitalize">
                      {gender}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Categories */}
            <div className="space-y-3">
              <Label>Categorías de Edad</Label>
              <div className="flex gap-2">
                <Input
                  value={newAgeCategory}
                  onChange={(e) => setNewAgeCategory(e.target.value)}
                  placeholder="Agregar nueva categoría de edad"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAgeCategory())}
                />
                <Button type="button" onClick={addAgeCategory} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {defaultAgeCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={formData.ageCategories.includes(category)}
                        onCheckedChange={(checked) => toggleAgeCategory(category, !!checked)}
                      />
                      <Label htmlFor={category} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.ageCategories.map((category) => (
                    <Badge key={category} variant="outline" className="flex items-center gap-1">
                      {category}
                      <button
                        type="button"
                        onClick={() => removeAgeCategory(category)}
                        className="ml-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Weight Categories */}
            {formData.ageCategories.length > 0 && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Configuración de Categorías de Peso</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configura las categorías de peso para cada edad y género
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría de Edad</Label>
                    <Select value={selectedAgeCategory} onValueChange={setSelectedAgeCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría de edad" />
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
                    <Select value={selectedGender} onValueChange={(value: "masculino" | "femenino" | "mixto") => setSelectedGender(value)}>
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

                {selectedAgeCategory && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label>Nombre de la Categoría</Label>
                        <Input
                          value={newWeightCategory.name}
                          onChange={(e) => setNewWeightCategory(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ej: Ligero, Pesado, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Peso Mínimo (kg)</Label>
                        <Input
                          type="number"
                          value={newWeightCategory.minWeight}
                          onChange={(e) => setNewWeightCategory(prev => ({ ...prev, minWeight: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Peso Máximo (kg)</Label>
                        <Input
                          type="number"
                          value={newWeightCategory.maxWeight}
                          onChange={(e) => setNewWeightCategory(prev => ({ ...prev, maxWeight: e.target.value }))}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={addWeightCategory}
                      disabled={!newWeightCategory.name.trim()}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Categoría de Peso
                    </Button>

                    {/* Display existing weight categories */}
                    <div className="space-y-3">
                      {Object.entries(formData.weightCategories).map(([ageCategory, genderCategories]) => (
                        <div key={ageCategory}>
                          <h4 className="font-medium text-sm mb-2">{ageCategory}</h4>
                          {Object.entries(genderCategories).map(([gender, categories]) => (
                            categories.length > 0 && (
                              <div key={gender} className="ml-4 mb-2">
                                <span className="text-sm font-medium capitalize text-muted-foreground">{gender}:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {categories.map((category) => (
                                    <Badge key={category.name} variant="outline" className="flex items-center gap-1 text-xs">
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
                                        onClick={() => removeWeightCategory(ageCategory, gender as "masculino" | "femenino" | "mixto", category.name)}
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
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Guardando..." : 
                 editingId ? "Actualizar Deporte" : "Crear Deporte"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};