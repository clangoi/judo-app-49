import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievements } from "@/hooks/useAchievements";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, TrendingUp, Calendar } from "lucide-react";
import NavHeader from "@/components/NavHeader";

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    badges,
    userAchievements,
    isLoading,
    getAchievementStats,
    getRecentAchievements,
  } = useAchievements();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');



  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = getAchievementStats();
  const recentAchievements = getRecentAchievements();
  
  const categories = ['all', 'training', 'technique', 'consistency', 'weight', 'nutrition'];
  
  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const earnedBadgeIds = new Set(userAchievements.map(ua => ua.badge.id));

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <NavHeader 
        title="Logros y Insignias"
        subtitle="Desbloquea insignias completando entrenamientos y alcanzando metas"
      />
      <div className="container mx-auto py-6 space-y-6">


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.earnedBadges}</p>
                <p className="text-sm text-gray-600">Insignias obtenidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.completionRate)}%
                </p>
                <p className="text-sm text-gray-600">Progreso total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{recentAchievements.length}</p>
                <p className="text-sm text-gray-600">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Progreso general</p>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {stats.earnedBadges} de {stats.totalBadges} insignias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Logros Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAchievements.map(({ achievement, badge }) => (
                <AchievementBadge
                  key={achievement.id}
                  badge={badge}
                  isEarned={true}
                  earnedAt={achievement.earnedAt}
                  level={achievement.level}
                  userEmail={user?.email || undefined}
                  showSocialShare={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Insignias</CardTitle>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'Todas' : category}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge) => {
              const userAchievement = userAchievements.find(ua => ua.badge.id === badge.id);
              const isEarned = earnedBadgeIds.has(badge.id);
              
              return (
                <AchievementBadge
                  key={badge.id}
                  badge={badge}
                  isEarned={isEarned}
                  earnedAt={userAchievement?.achievement.earnedAt}
                  level={userAchievement?.achievement.level}
                  userEmail={user?.email || undefined}
                  showSocialShare={isEarned}
                />
              );
            })}
          </div>
          
          {filteredBadges.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay insignias en esta categoría.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};