
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const cinturones = [
  { value: "blanco", label: "Blanco", color: "bg-white border-gray-300" },
  { value: "amarillo", label: "Amarillo", color: "bg-yellow-400" },
  { value: "naranja", label: "Naranja", color: "bg-orange-400" },
  { value: "verde", label: "Verde", color: "bg-green-400" },
  { value: "azul", label: "Azul", color: "bg-blue-400" },
  { value: "marron", label: "Marrón", color: "bg-amber-700" },
  { value: "negro", label: "Negro", color: "bg-black" }
];

interface TecnicaFiltersProps {
  busqueda: string;
  setBusqueda: (value: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (value: string) => void;
  filtroCinturon: string;
  setFiltroCinturon: (value: string) => void;
  categorias: string[];
  onClearFilters: () => void;
}

const TecnicaFilters = ({
  busqueda,
  setBusqueda,
  filtroCategoria,
  setFiltroCategoria,
  filtroCinturon,
  setFiltroCinturon,
  categorias,
  onClearFilters
}: TecnicaFiltersProps) => {
  return (
    <>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar técnicas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {categorias.map(categoria => (
              <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroCinturon} onValueChange={setFiltroCinturon}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cinturón" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los cinturones</SelectItem>
            {cinturones.map(cinturon => (
              <SelectItem key={cinturon.value} value={cinturon.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${cinturon.color} border`}></div>
                  {cinturon.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filtroCategoria || filtroCinturon) && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
          >
            <Filter className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </>
  );
};

export default TecnicaFilters;
