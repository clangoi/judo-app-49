
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Shield, AlertTriangle, Award } from "lucide-react";

interface ProfileSummaryStatsProps {
  profileStats: {
    totalAthletes: number;
    genderDistribution: { male: number; female: number; unspecified: number };
    clubDistribution: Record<string, number>;
    injuryStats: { withInjuries: number; withoutInjuries: number };
    categoryDistribution: Record<string, number>;
  };
}

export const ProfileSummaryStats = ({ profileStats }: ProfileSummaryStatsProps) => {
  const injuryRate = Math.round((profileStats.injuryStats.withInjuries / profileStats.totalAthletes) * 100);
  
  return (
    <div className="space-y-6">
      {/* Distribución por Género */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribución por Género
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Masculino</span>
              <Badge variant="secondary">{profileStats.genderDistribution.male}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Femenino</span>
              <Badge variant="secondary">{profileStats.genderDistribution.female}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Sin especificar</span>
              <Badge variant="outline">{profileStats.genderDistribution.unspecified}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Lesiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Estado de Lesiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Con lesiones reportadas</span>
              <span className="text-lg font-bold text-orange-600">{injuryRate}%</span>
            </div>
            <Progress value={injuryRate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Con lesiones: {profileStats.injuryStats.withInjuries}</span>
              <span>Sin lesiones: {profileStats.injuryStats.withoutInjuries}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Club */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Distribución por Club
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(profileStats.clubDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([club, count]) => (
                <div key={club} className="flex justify-between items-center">
                  <span className="text-sm">{club || 'Sin club'}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorías de Competencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Categorías de Competencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(profileStats.categoryDistribution)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm truncate">{category || 'Sin categoría'}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            {Object.keys(profileStats.categoryDistribution).length > 5 && (
              <p className="text-xs text-muted-foreground mt-2">
                Y {Object.keys(profileStats.categoryDistribution).length - 5} categorías más...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
