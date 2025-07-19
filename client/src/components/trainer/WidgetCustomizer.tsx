import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  Plus
} from "lucide-react";

interface WidgetCustomizerProps {
  isOpen: boolean;
  widgetType: string;
  onClose: () => void;
  onAddWidget: (widgetData: any) => void;
}

const availableWidgets = [
  {
    type: 'athlete_overview',
    name: 'Resumen de Deportistas',
    description: 'Vista general de todos tus deportistas asignados',
    icon: Users,
    defaultSize: { w: 2, h: 2 },
    color: 'bg-blue-50 border-blue-200'
  },
  {
    type: 'session_stats',
    name: 'Estadísticas de Sesiones',
    description: 'Métricas de entrenamientos y sesiones',
    icon: BarChart3,
    defaultSize: { w: 2, h: 1 },
    color: 'bg-green-50 border-green-200'
  },
  {
    type: 'recent_activities',
    name: 'Actividades Recientes',
    description: 'Últimas actividades de tus deportistas',
    icon: Activity,
    defaultSize: { w: 1, h: 2 },
    color: 'bg-purple-50 border-purple-200'
  },
  {
    type: 'performance_charts',
    name: 'Gráficos de Rendimiento',
    description: 'Visualización del progreso de deportistas',
    icon: TrendingUp,
    defaultSize: { w: 2, h: 2 },
    color: 'bg-orange-50 border-orange-200'
  },
  {
    type: 'upcoming_sessions',
    name: 'Próximas Sesiones',
    description: 'Calendario de entrenamientos programados',
    icon: Calendar,
    defaultSize: { w: 1, h: 1 },
    color: 'bg-cyan-50 border-cyan-200'
  },
  {
    type: 'athlete_alerts',
    name: 'Alertas de Deportistas',
    description: 'Notificaciones importantes sobre deportistas',
    icon: AlertTriangle,
    defaultSize: { w: 1, h: 1 },
    color: 'bg-red-50 border-red-200'
  }
];

export const WidgetCustomizer = ({
  isOpen,
  widgetType,
  onClose,
  onAddWidget
}: WidgetCustomizerProps) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const handleAddWidget = (widget: typeof availableWidgets[0]) => {
    const newWidget = {
      widgetType: widget.type,
      position: {
        x: 0,
        y: 0,
        w: widget.defaultSize.w,
        h: widget.defaultSize.h
      },
      config: {},
      isVisible: true
    };

    onAddWidget(newWidget);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Widget al Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Selecciona un widget para agregarlo a tu dashboard personalizado
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableWidgets.map((widget) => {
              const IconComponent = widget.icon;
              
              return (
                <Card 
                  key={widget.type}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${widget.color} ${
                    selectedWidget === widget.type ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedWidget(widget.type)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconComponent className="h-5 w-5" />
                      {widget.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {widget.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Tamaño: {widget.defaultSize.w}x{widget.defaultSize.h}
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddWidget(widget);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {selectedWidget && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Widget Seleccionado</h3>
                  <p className="text-sm text-muted-foreground">
                    {availableWidgets.find(w => w.type === selectedWidget)?.name}
                  </p>
                </div>
                
                <Button
                  onClick={() => {
                    const widget = availableWidgets.find(w => w.type === selectedWidget);
                    if (widget) handleAddWidget(widget);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Confirmar y Agregar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};