
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface EntrenamientoDeportivo {
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

interface JudoTrainingDetailsProps {
  entrenamiento: EntrenamientoDeportivo | null;
  onClose: () => void;
}

const JudoTrainingDetails = ({ entrenamiento, onClose }: JudoTrainingDetailsProps) => {
  return (
    <Dialog open={!!entrenamiento} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Detalles del Entrenamiento
          </DialogTitle>
        </DialogHeader>
        {entrenamiento && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {entrenamiento.tipo}
                    </h3>
                    <p className="text-slate-600">{entrenamiento.fecha}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {entrenamiento.duracion} min
                  </div>
                </div>
                
                {entrenamiento.videoUrl && (
                  <div className="bg-black rounded-lg overflow-hidden mb-4">
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
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2">Técnicas Practicadas:</h4>
                    <p className="text-slate-600">{entrenamiento.tecnicasPracticadas}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Qué funcionó:</h4>
                      <p className="text-green-700 text-sm">{entrenamiento.queFunciono}</p>
                    </div>
                    
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">A mejorar:</h4>
                      <p className="text-red-700 text-sm">{entrenamiento.queNoFunciono}</p>
                    </div>
                  </div>
                  
                  {entrenamiento.randory && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-3">
                        Randory vs {entrenamiento.randory.oponente}
                      </h4>
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
                      <h4 className="font-medium text-slate-700 mb-2">Comentarios:</h4>
                      <p className="text-slate-600">{entrenamiento.comentarios}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JudoTrainingDetails;
