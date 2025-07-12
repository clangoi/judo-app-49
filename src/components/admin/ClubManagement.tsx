
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
import { Plus, Edit, Trash2, Building } from "lucide-react";

const clubSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

type ClubFormValues = z.infer<typeof clubSchema>;

const ClubManagement = () => {
  const { clubs, isLoading, createClubMutation, updateClubMutation, deleteClubMutation } = useClubs();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<any>(null);

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
        ...values,
      });
      setEditingClub(null);
    } else {
      await createClubMutation.mutateAsync(values);
      setIsCreateModalOpen(false);
    }
    form.reset();
  };

  const handleEdit = (club: any) => {
    setEditingClub(club);
    form.setValue('name', club.name);
    form.setValue('description', club.description || '');
  };

  const handleDelete = async (clubId: string) => {
    await deleteClubMutation.mutateAsync(clubId);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingClub(null);
    form.reset();
  };

  if (isLoading) {
    return <div>Cargando clubes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Gestión de Clubes</h2>
          <p className="text-[#575757]">Administra los clubes del sistema</p>
        </div>
        
        <Dialog open={isCreateModalOpen || !!editingClub} onOpenChange={handleCloseModal}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Club
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
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
                      <FormLabel>Nombre del Club</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del club..." {...field} />
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
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción del club..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createClubMutation.isPending || updateClubMutation.isPending}
                    className="bg-[#C5A46C] hover:bg-[#A08B5A] text-white"
                  >
                    {editingClub ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Card key={club.id} className="bg-white border-[#C5A46C]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
                  <Building className="h-5 w-5 text-[#C5A46C]" />
                  {club.name}
                </CardTitle>
                <Badge variant="secondary">Club</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {club.description && (
                <p className="text-sm text-[#575757]">{club.description}</p>
              )}
              
              <div className="text-xs text-[#575757]">
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar club?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. El club será eliminado permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(club.id)}
                        className="bg-red-600 hover:bg-red-700"
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
        <Card className="bg-white border-[#C5A46C]">
          <CardContent className="p-8 text-center">
            <Building className="h-12 w-12 mx-auto text-[#575757] mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              No hay clubes registrados
            </h3>
            <p className="text-[#575757] mb-4">
              Crea el primer club para comenzar a organizar a los deportistas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClubManagement;
