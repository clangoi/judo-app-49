
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search } from "lucide-react";

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
}

const EmptyState = ({ type }: EmptyStateProps) => {
  if (type === 'no-data') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No hay técnicas registradas aún</p>
          <p className="text-sm text-slate-500">Agrega tu primera técnica</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Search className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-600">No se encontraron técnicas con los filtros aplicados</p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
