import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  X, 
  Eye, 
  EyeOff, 
  Users, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import type { TrainerDashboardWidget } from "@shared/schema";
import { AthleteOverviewWidget } from "./widgets/AthleteOverviewWidget";
import { SessionStatsWidget } from "./widgets/SessionStatsWidget";
import { RecentActivitiesWidget } from "./widgets/RecentActivitiesWidget";
import { PerformanceChartsWidget } from "./widgets/PerformanceChartsWidget";
import { UpcomingSessionsWidget } from "./widgets/UpcomingSessionsWidget";
import { AthleteAlertsWidget } from "./widgets/AthleteAlertsWidget";

interface DashboardWidgetProps {
  widget: TrainerDashboardWidget;
  isCustomizing: boolean;
  onUpdateConfig: (config: any) => void;
  onRemove: () => void;
  onToggleVisibility: (isVisible: boolean) => void;
}

const widgetIcons = {
  athlete_overview: Users,
  session_stats: BarChart3,
  recent_activities: Activity,
  performance_charts: TrendingUp,
  upcoming_sessions: Calendar,
  athlete_alerts: AlertTriangle
};

const widgetTitles = {
  athlete_overview: 'Resumen de Deportistas',
  session_stats: 'Estadísticas de Sesiones',
  recent_activities: 'Actividades Recientes',
  performance_charts: 'Gráficos de Rendimiento',
  upcoming_sessions: 'Próximas Sesiones',
  athlete_alerts: 'Alertas de Deportistas'
};

export const DashboardWidget = ({
  widget,
  isCustomizing,
  onUpdateConfig,
  onRemove,
  onToggleVisibility
}: DashboardWidgetProps) => {
  const [showConfig, setShowConfig] = useState(false);
  
  const IconComponent = widgetIcons[widget.widgetType as keyof typeof widgetIcons];
  const title = widgetTitles[widget.widgetType as keyof typeof widgetTitles] || widget.widgetType;

  const renderWidgetContent = () => {
    const config = widget.config as any;
    
    switch (widget.widgetType) {
      case 'athlete_overview':
        return <AthleteOverviewWidget config={config} />;
      case 'session_stats':
        return <SessionStatsWidget config={config} />;
      case 'recent_activities':
        return <RecentActivitiesWidget config={config} />;
      case 'performance_charts':
        return <PerformanceChartsWidget config={config} />;
      case 'upcoming_sessions':
        return <UpcomingSessionsWidget config={config} />;
      case 'athlete_alerts':
        return <AthleteAlertsWidget config={config} />;
      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔧</div>
            <p className="text-muted-foreground">
              Widget type "{widget.widgetType}" not implemented yet
            </p>
          </div>
        );
    }
  };

  return (
    <Card className={`h-full transition-all duration-200 ${
      isCustomizing ? 'border-blue-300 shadow-lg' : ''
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {IconComponent && <IconComponent className="h-4 w-4" />}
          {title}
        </CardTitle>
        
        {isCustomizing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleVisibility(!widget.isVisible)}
              className="h-8 w-8 p-0"
            >
              {widget.isVisible ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {showConfig && isCustomizing && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-sm mb-2">Configuración del Widget</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{widget.widgetType}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Posición:</span>
                <span className="text-xs">
                  {JSON.stringify(widget.position)}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  // Open detailed config modal
                  console.log('Open detailed config for', widget.widgetType);
                }}
              >
                <Settings className="h-3 w-3" />
                Configurar
                <ChevronRight className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </div>
        )}
        
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};