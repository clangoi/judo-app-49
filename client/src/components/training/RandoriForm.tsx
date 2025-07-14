
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RandoryInfo {
  oponente: string;
  tecnicasIntentadas: string;
  tecnicasFuncionaron: string;
  tecnicasNoFuncionaron: string;
  tecnicasQueRecibio: string;
}

interface RandoriFormProps {
  randoryData: RandoryInfo;
  onRandoryDataChange: (data: RandoryInfo) => void;
}

const RandoriForm = ({ randoryData, onRandoryDataChange }: RandoriFormProps) => {
  const updateRandoryData = (field: keyof RandoryInfo, value: string) => {
    onRandoryDataChange({
      ...randoryData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-800">Randory</h3>
      <div>
        <Label htmlFor="oponente">Oponente</Label>
        <Input
          id="oponente"
          placeholder="Nombre del oponente..."
          value={randoryData.oponente}
          onChange={(e) => updateRandoryData('oponente', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tecnicas-intentadas">Técnicas Intentadas</Label>
        <Textarea
          id="tecnicas-intentadas"
          placeholder="Técnicas que intentaste usar..."
          value={randoryData.tecnicasIntentadas}
          onChange={(e) => updateRandoryData('tecnicasIntentadas', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tecnicas-funcionaron">Técnicas que Funcionaron</Label>
        <Textarea
          id="tecnicas-funcionaron"
          placeholder="Técnicas que ejecutaste exitosamente..."
          value={randoryData.tecnicasFuncionaron}
          onChange={(e) => updateRandoryData('tecnicasFuncionaron', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tecnicas-no-funcionaron">Técnicas que No Funcionaron</Label>
        <Textarea
          id="tecnicas-no-funcionaron"
          placeholder="Técnicas que no pudiste ejecutar..."
          value={randoryData.tecnicasNoFuncionaron}
          onChange={(e) => updateRandoryData('tecnicasNoFuncionaron', e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="tecnicas-recibio">Técnicas que te Hicieron</Label>
        <Textarea
          id="tecnicas-recibio"
          placeholder="Técnicas que el oponente te aplicó..."
          value={randoryData.tecnicasQueRecibio}
          onChange={(e) => updateRandoryData('tecnicasQueRecibio', e.target.value)}
        />
      </div>
    </div>
  );
};

export default RandoriForm;
