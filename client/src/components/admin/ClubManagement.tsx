import { useState } from "react";
import { useClubs } from "@/hooks/useClubs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Building, Upload, Image } from "lucide-react";
import type { Club } from "@/hooks/useClubs";
import DragDropLogoUploader from "./DragDropLogoUploader";

const clubSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

type ClubFormValues = z.infer<typeof clubSchema>;

const ClubManagement = () => {
  const { clubs, isLoading, createClubMutation, updateClubMutation, deleteClubMutation, uploadClubLogoMutation } = useClubs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);

  const [uploadingClubs, setUploadingClubs] = useState<Set<string>>(new Set());

  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: ClubFormValues) => {
    if (editingClub) {
      await updateClubMutation.mutateAsync({
        id: editingClub.id,
        name: values.name,
        description: values.description,
      });
      setEditingClub(null);
    } else {
      const newClub = await createClubMutation.mutateAsync({
        name: values.name,
        description: values.description,
      });
      // Logo se puede subir después usando la opción editar
    }
    form.reset();
    setIsModalOpen(false);
  };

  const handleCreateClub = () => {
    setEditingClub(null);
    form.reset();
    setIsModalOpen(true);
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    form.setValue('name', club.name);
    form.setValue('description', club.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (clubId: string) => {
    await deleteClubMutation.mutateAsync(clubId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClub(null);
    form.reset();
  };

  const handleUploadLogo = async (file: File, clubId: string) => {
    setUploadingClubs(prev => new Set(prev).add(clubId));
    try {
      await uploadClubLogoMutation.mutateAsync({ file, clubId });
    } finally {
      setUploadingClubs(prev => {
        const newSet = new Set(prev);
        newSet.delete(clubId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return <div className="text-foreground">Cargando clubes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Clubes</h2>
          <p className="text-muted-foreground">Administra los clubes del sistema</p>
        </div>
        
        <Button 
          onClick={handleCreateClub}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Club
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingClub ? 'Editar Club' : 'Crear Nuevo Club'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Nombre del Club</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del club..." {...field} className="bg-background border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción del club..."
                        className="min-h-[100px] bg-background border-border text-foreground"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload Section - Solo para edición */}
              {editingClub && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Logo del Club</label>
                  <DragDropLogoUploader
                    clubId={editingClub.id}
                    currentLogoUrl={editingClub.logo_url}
                    onUpload={handleUploadLogo}
                    isUploading={uploadingClubs.has(editingClub.id)}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createClubMutation.isPending || updateClubMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {editingClub ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Card key={club.id} className="bg-background border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Building className="h-5 w-5 text-primary" />
                  {club.name}
                </CardTitle>
                <Badge variant="secondary">Club</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {club.logo_url && (
                <div className="flex justify-center">
                  <img 
                    src={club.logo_url} 
                    alt={`Logo de ${club.name}`}
                    className="h-16 w-16 object-contain rounded"
                  />
                </div>
              )}
              
              {club.description && (
                <p className="text-sm text-muted-foreground">{club.description}</p>
              )}
              
              <div className="text-xs text-muted-foreground">
                Creado: {new Date(club.created_at).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(club)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">¿Eliminar club?</AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        Esta acción no se puede deshacer. El club será eliminado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(club.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clubs.length === 0 && (
        <Card className="bg-background border-border">
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay clubes registrados
            </h3>
            <p className="text-muted-foreground mb-4">
              Crea el primer club para comenzar a organizar a los deportistas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClubManagement;
