
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Eye, Edit, Trash2, ChevronDown, ChevronUp, Target, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoJudo {
  id: string;
  fecha: string;
  tipo: string;
  duracion: number;
  tecnicasPracticadas: string;
  queFunciono: string;
  queNoFunciono: string;
  comentarios?: string;
  randory?: RandoryInfo;
  videoUrl?: string;
}

interface JudoSessionCardProps {
  entrenamiento: EntrenamientoJudo;
  onView: (entrenamiento: EntrenamientoJudo) => void;
  onEdit: (entrenamiento: EntrenamientoJudo) => void;
  onDelete: (entrenamiento: EntrenamientoJudo) => void;
  isDeleting?: boolean;
}

const JudoSessionCard = ({ entrenamiento, onView, onEdit, onDelete, isDeleting }: JudoSessionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md">
      <CardHeader 
        className="cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{entrenamiento.tipo}</CardTitle>
              {entrenamiento.randory && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  Randory
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{entrenamiento.fecha}</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {entrenamiento.duracion} min
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onView(entrenamiento);
              }}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entrenamiento);
              }}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entrenamiento);
              }}
              variant="destructive"
              size="sm"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {entrenamiento.videoUrl && (
              <div className="bg-black rounded-lg overflow-hidden">
                <video 
                  controls 
                  className="w-full h-64 object-contain"
                  preload="metadata"
                >
                  <source src={entrenamiento.videoUrl} type="video/mp4" />
                  Tu navegador no soporta videos HTML5.
                </video>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-sm text-slate-700 mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Técnicas Practicadas:
              </h4>
              <p className="text-slate-600 text-sm">{entrenamiento.tecnicasPracticadas}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-sm text-green-800">Qué funcionó:</h4>
                </div>
                <p className="text-green-700 text-sm">{entrenamiento.queFunciono}</p>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-sm text-red-800">A mejorar:</h4>
                </div>
                <p className="text-red-700 text-sm">{entrenamiento.queNoFunciono}</p>
              </div>
            </div>
            
            {entrenamiento.randory && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Randory vs {entrenamiento.randory.oponente}</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Técnicas intentadas:</span>
                    <p className="text-blue-600">{entrenamiento.randory.tecnicasIntentadas}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Funcionaron:</span>
                    <p className="text-green-600">{entrenamiento.randory.tecnicasFuncionaron}</p>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">No funcionaron:</span>
                    <p className="text-red-600">{entrenamiento.randory.tecnicasNoFuncionaron}</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-700">Me hicieron:</span>
                    <p className="text-orange-600">{entrenamiento.randory.tecnicasQueRecibio}</p>
                  </div>
                </div>
              </div>
            )}
            
            {entrenamiento.comentarios && (
              <div>
                <h4 className="font-medium text-sm text-slate-700 mb-1">Comentarios:</h4>
                <p className="text-slate-600 text-sm">{entrenamiento.comentarios}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default JudoSessionCard;
