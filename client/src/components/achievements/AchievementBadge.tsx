import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Dumbbell, Apple, BookOpen } from "lucide-react";
import { AchievementBadge as BadgeType } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  badge: BadgeType;
  isEarned?: boolean;
  earnedAt?: string;
  level?: number;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'training':
      return <Dumbbell className="w-6 h-6" />;
    case 'technique':
      return <BookOpen className="w-6 h-6" />;
    case 'consistency':
      return <Flame className="w-6 h-6" />;
    case 'weight':
      return <Target className="w-6 h-6" />;
    case 'nutrition':
      return <Apple className="w-6 h-6" />;
    default:
      return <Trophy className="w-6 h-6" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'training':
      return 'bg-blue-500';
    case 'technique':
      return 'bg-green-500';
    case 'consistency':
      return 'bg-orange-500';
    case 'weight':
      return 'bg-purple-500';
    case 'nutrition':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'training':
      return 'Entrenamiento';
    case 'technique':
      return 'Técnica';
    case 'consistency':
      return 'Consistencia';
    case 'weight':
      return 'Peso';
    case 'nutrition':
      return 'Nutrición';
    default:
      return 'General';
  }
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  isEarned = false,
  earnedAt,
  level = 1,
  className
}) => {
  const categoryIcon = getCategoryIcon(badge.category);
  const categoryColor = getCategoryColor(badge.category);
  const categoryName = getCategoryName(badge.category);

  return (
    <Card className={cn(
      "relative transition-all duration-200 hover:shadow-lg",
      isEarned 
        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md" 
        : "bg-gray-50 border-gray-200 opacity-75",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Badge Icon */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full text-white shrink-0",
            categoryColor,
            !isEarned && "grayscale opacity-50"
          )}>
            {badge.iconUrl ? (
              <img 
                src={badge.iconUrl} 
                alt={badge.name}
                className="w-8 h-8 object-contain"
              />
            ) : (
              categoryIcon
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-sm truncate",
                isEarned ? "text-gray-900" : "text-gray-500"
              )}>
                {badge.name}
              </h3>
              {level > 1 && (
                <Badge variant="secondary" className="text-xs">
                  Nivel {level}
                </Badge>
              )}
            </div>

            <p className={cn(
              "text-xs mb-2 line-clamp-2",
              isEarned ? "text-gray-700" : "text-gray-400"
            )}>
              {badge.description}
            </p>

            <div className="flex items-center justify-between text-xs">
              <Badge variant="outline" className="text-xs">
                {categoryName}
              </Badge>
              
              {earnedAt && (
                <span className="text-gray-500">
                  {new Date(earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Progress indicator for criteria */}
            <div className="mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {badge.criteriaType === 'count' && (
                  <span>Meta: {badge.criteriaValue}</span>
                )}
                {badge.criteriaType === 'streak' && (
                  <span>Racha: {badge.criteriaValue} días</span>
                )}
                {badge.criteriaType === 'milestone' && (
                  <span>Hito especial</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Earned indicator */}
        {isEarned && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Trophy className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};