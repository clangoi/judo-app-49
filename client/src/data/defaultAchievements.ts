import { AchievementBadge } from "@/hooks/useAchievements";

export const defaultAchievements: Omit<AchievementBadge, 'id' | 'createdAt'>[] = [
  // Training achievements
  {
    name: "Primer Entrenamiento",
    description: "Completa tu primera sesión de entrenamiento",
    category: "training",
    criteriaType: "count",
    criteriaValue: 1,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Guerrero del Tatami",
    description: "Completa 10 sesiones de entrenamiento",
    category: "training",
    criteriaType: "count",
    criteriaValue: 10,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Judoka Dedicado",
    description: "Completa 50 sesiones de entrenamiento",
    category: "training",
    criteriaType: "count",
    criteriaValue: 50,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Maestro del Entrenamiento",
    description: "Completa 100 sesiones de entrenamiento",
    category: "training",
    criteriaType: "count",
    criteriaValue: 100,
    isActive: true,
    iconUrl: undefined
  },

  // Technique achievements
  {
    name: "Primera Técnica",
    description: "Registra tu primera técnica de judo",
    category: "technique",
    criteriaType: "count",
    criteriaValue: 1,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Coleccionista de Técnicas",
    description: "Registra 10 técnicas diferentes",
    category: "technique",
    criteriaType: "count",
    criteriaValue: 10,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Enciclopedia Viviente",
    description: "Registra 25 técnicas diferentes",
    category: "technique",
    criteriaType: "count",
    criteriaValue: 25,
    isActive: true,
    iconUrl: undefined
  },

  // Consistency achievements
  {
    name: "Racha Iniciada",
    description: "Entrena 3 días seguidos",
    category: "consistency",
    criteriaType: "streak",
    criteriaValue: 3,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Constancia de Hierro",
    description: "Entrena 7 días seguidos",
    category: "consistency",
    criteriaType: "streak",
    criteriaValue: 7,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Disciplina de Samurai",
    description: "Entrena 30 días seguidos",
    category: "consistency",
    criteriaType: "streak",
    criteriaValue: 30,
    isActive: true,
    iconUrl: undefined
  },

  // Weight tracking achievements
  {
    name: "Primer Registro",
    description: "Registra tu peso por primera vez",
    category: "weight",
    criteriaType: "count",
    criteriaValue: 1,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Seguimiento Consistente",
    description: "Registra tu peso 10 veces",
    category: "weight",
    criteriaType: "count",
    criteriaValue: 10,
    isActive: true,
    iconUrl: undefined
  },
  {
    name: "Monitor de Peso",
    description: "Registra tu peso 30 veces",
    category: "weight",
    criteriaType: "count",
    criteriaValue: 30,
    isActive: true,
    iconUrl: undefined
  },


];