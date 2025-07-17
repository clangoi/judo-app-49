
import { useState } from "react";
import { useTrainerAssignments } from "@/hooks/useTrainerAssignments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Loader2 } from "lucide-react";

const TrainerAssignmentManagement = () => {
  const {
    trainers,
    students,
    isLoadingTrainers,
    isLoadingStudents,
    assignStudentMutation,
    unassignStudentMutation,
  } = useTrainerAssignments();
  
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const handleAssignStudent = () => {
    if (selectedTrainer && selectedStudent) {
      assignStudentMutation.mutate({
        trainerId: selectedTrainer,
        studentId: selectedStudent,
      });
      setSelectedStudent("");
    }
  };

  const TrainerStudentsList = ({ trainerId }: { trainerId: string }) => {
    const trainer = trainers.find(t => t.user_id === trainerId);
    const { getTrainerStudents } = useTrainerAssignments();
    const trainerStudents = getTrainerStudents(trainerId);

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-[#1A1A1A]">
          Estudiantes de {trainer?.full_name || 'Entrenador'}:
        </h4>
        {trainerStudents.length === 0 ? (
          <p className="text-sm text-[#575757]">No hay estudiantes asignados</p>
        ) : (
          <div className="space-y-2">
            {trainerStudents.map((student) => (
              <div key={student.student_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{student.full_name}</p>
                  <p className="text-xs text-[#575757]">{student.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unassignStudentMutation.mutate({
                    trainerId,
                    studentId: student.student_id
                  })}
                  disabled={unassignStudentMutation.isPending}
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoadingTrainers || isLoadingStudents) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#C5A46C]" />
          <p className="text-[#575757]">Cargando datos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#C5A46C]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-[#1A1A1A]">
          <Users className="h-5 w-5 text-[#C5A46C]" />
          Asignación de Practicantes a Entrenadores
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulario de asignación */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium text-[#1A1A1A]">Nueva Asignación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Seleccionar Entrenador
              </label>
              <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir entrenador..." />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.user_id} value={trainer.user_id}>
                      {trainer.full_name || trainer.email || 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Seleccionar Practicante
              </label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir deportista..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.full_name || student.email || 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAssignStudent}
            disabled={!selectedTrainer || !selectedStudent || assignStudentMutation.isPending}
            className="bg-[#C5A46C] hover:bg-[#B8956A] text-white"
          >
            {assignStudentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Asignar Practicante
          </Button>
        </div>

        {/* Lista de entrenadores y sus estudiantes */}
        <div className="space-y-4">
          <h3 className="font-medium text-[#1A1A1A]">Asignaciones Actuales</h3>
          
          {trainers.length === 0 ? (
            <p className="text-[#575757]">No hay entrenadores registrados</p>
          ) : (
            <div className="grid gap-4">
              {trainers.map((trainer) => (
                <Card key={trainer.user_id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-[#1A1A1A]">
                          {trainer.full_name || 'Sin nombre'}
                        </h4>
                        <p className="text-sm text-[#575757]">{trainer.email}</p>
                      </div>
                      <Badge variant="default" className="bg-[#C5A46C] text-white">
                        Entrenador
                      </Badge>
                    </div>
                    
                    <TrainerStudentsList trainerId={trainer.user_id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerAssignmentManagement;
