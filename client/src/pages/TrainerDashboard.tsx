import { useState } from "react";
import { useTrainerDashboardWidgets } from "@/hooks/useTrainerDashboardWidgets";
import { DashboardGrid } from "@/components/trainer/DashboardGrid";
import { WidgetCustomizer } from "@/components/trainer/WidgetCustomizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Layout, Plus, BarChart3 } from "lucide-react";

const TrainerDashboard = () => {
  const {
    widgets,
    isLoading,
    updateWidgetPosition,
    updateWidgetConfig,
    addWidget,
    removeWidget,
    toggleWidgetVisibility
  } = useTrainerDashboardWidgets();
  
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard del Entrenador</h1>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Entrenador</h1>
          <p className="text-muted-foreground">
            Personaliza tu vista para gestionar mejor a tus deportistas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isCustomizing ? 'Guardar' : 'Personalizar'}
          </Button>
          
          <Button
            onClick={() => setSelectedWidgetType('add')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Widget
          </Button>
        </div>
      </div>

      {isCustomizing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Layout className="h-4 w-4" />
              <span className="font-medium">Modo de personalización activado</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Arrastra los widgets para reorganizarlos, cambia su tamaño desde las esquinas, 
              o haz clic en el ícono de configuración para ajustar cada widget.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardGrid
            widgets={widgets}
            isCustomizing={isCustomizing}
            onUpdatePosition={updateWidgetPosition}
            onUpdateConfig={updateWidgetConfig}
            onRemoveWidget={removeWidget}
            onToggleVisibility={toggleWidgetVisibility}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Deportistas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Análisis detallado del progreso de tus deportistas próximamente...
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Entrenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Estadísticas de sesiones y mejoras próximamente...
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Widget Customizer Modal */}
      {selectedWidgetType && (
        <WidgetCustomizer
          isOpen={!!selectedWidgetType}
          widgetType={selectedWidgetType}
          onClose={() => setSelectedWidgetType(null)}
          onAddWidget={addWidget}
        />
      )}
    </div>
  );
};

export default TrainerDashboard;