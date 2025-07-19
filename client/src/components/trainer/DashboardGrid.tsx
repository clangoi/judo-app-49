import { useState } from "react";
import { DashboardWidget } from "./DashboardWidget";
import type { TrainerDashboardWidget } from "@shared/schema";

interface DashboardGridProps {
  widgets: TrainerDashboardWidget[];
  isCustomizing: boolean;
  onUpdatePosition: (data: { widgetId: string; position: any }) => void;
  onUpdateConfig: (data: { widgetId: string; config: any }) => void;
  onRemoveWidget: (widgetId: string) => void;
  onToggleVisibility: (data: { widgetId: string; isVisible: boolean }) => void;
}

export const DashboardGrid = ({
  widgets,
  isCustomizing,
  onUpdatePosition,
  onUpdateConfig,
  onRemoveWidget,
  onToggleVisibility
}: DashboardGridProps) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Filter visible widgets and sort by position
  const visibleWidgets = widgets
    .filter(widget => widget.isVisible)
    .sort((a, b) => {
      const posA = a.position as any;
      const posB = b.position as any;
      return (posA.y - posB.y) || (posA.x - posB.x);
    });

  const handleDragStart = (widgetId: string) => {
    if (isCustomizing) {
      setDraggedWidget(widgetId);
    }
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (draggedWidget && draggedWidget !== targetWidgetId && isCustomizing) {
      // Swap positions logic would go here
      // For now, we'll just implement basic grid positioning
    }
  };

  return (
    <div className="space-y-6">
      {visibleWidgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No hay widgets configurados</h3>
          <p className="text-muted-foreground mb-4">
            Agrega widgets para personalizar tu dashboard
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
          {visibleWidgets.map((widget) => {
            const position = widget.position as any;
            const gridColumn = `span ${Math.min(position.w || 1, 4)}`;
            const minHeight = `${(position.h || 1) * 200}px`;
            
            return (
              <div
                key={widget.id}
                style={{
                  gridColumn,
                  minHeight
                }}
                className={`transition-all duration-200 ${
                  isCustomizing ? 'cursor-move' : ''
                } ${draggedWidget === widget.id ? 'opacity-50' : ''}`}
                draggable={isCustomizing}
                onDragStart={() => handleDragStart(widget.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, widget.id)}
              >
                <DashboardWidget
                  widget={widget}
                  isCustomizing={isCustomizing}
                  onUpdateConfig={(config) => onUpdateConfig({ widgetId: widget.id, config })}
                  onRemove={() => onRemoveWidget(widget.id)}
                  onToggleVisibility={(isVisible) => 
                    onToggleVisibility({ widgetId: widget.id, isVisible })
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};