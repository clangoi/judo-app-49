/**
 * Legacy data transformation functions for migrating old data structures to new ones
 */

// Physical workout session legacy transformation
export function transformLegacyWorkoutSession(legacyItem: any) {
  return {
    ...legacyItem,
    date: legacyItem.date || new Date().toISOString(),
    type: legacyItem.type || 'full',
    exercises: legacyItem.exercises || [],
    duration: legacyItem.duration || 0,
    intensity: legacyItem.intensity || 3,
    notes: legacyItem.notes || ''
  };
}

// Sports sessions legacy transformation
export function transformLegacySportsSession(legacyItem: any) {
  return {
    ...legacyItem,
    sessionType: legacyItem.sessionType || legacyItem.type || 'randori',
    duration: legacyItem.duration || 0,
    intensity: legacyItem.intensity || 'medio',
    drills: legacyItem.drills || [],
    sparringResults: legacyItem.sparringResults || [],
    notes: legacyItem.notes || '',
    date: legacyItem.date || new Date().toISOString()
  };
}

// Techniques legacy transformation
export function transformLegacyTechnique(legacyItem: any) {
  return {
    ...legacyItem,
    name: legacyItem.name || 'Técnica sin nombre',
    category: legacyItem.category || 'nage-waza',
    difficulty: legacyItem.difficulty || 'principiante',
    description: legacyItem.description || '',
    steps: legacyItem.steps || [],
    tips: legacyItem.tips || [],
    videoUrl: legacyItem.videoUrl || '',
    isDefault: legacyItem.isDefault || false, // Protect existing default techniques
    progress: legacyItem.progress || 0
  };
}

// Tactical plans legacy transformation
export function transformLegacyTacticalPlan(legacyItem: any) {
  return {
    ...legacyItem,
    name: legacyItem.name || 'Plan táctico',
    description: legacyItem.description || '',
    objectives: legacyItem.objectives || [],
    strategies: legacyItem.strategies || [],
    isActive: legacyItem.isActive !== undefined ? legacyItem.isActive : true
  };
}

// Opponent analysis legacy transformation
export function transformLegacyOpponentAnalysis(legacyItem: any) {
  return {
    ...legacyItem,
    name: legacyItem.name || 'Oponente',
    height: legacyItem.height || '',
    weight: legacyItem.weight || '',
    style: legacyItem.style || '',
    strengths: legacyItem.strengths || [],
    weaknesses: legacyItem.weaknesses || [],
    notes: legacyItem.notes || '',
    isFavorite: legacyItem.isFavorite || false
  };
}

// Training drills legacy transformation
export function transformLegacyTrainingDrill(legacyItem: any) {
  return {
    ...legacyItem,
    name: legacyItem.name || 'Ejercicio táctico',
    category: legacyItem.category || 'tactical',
    description: legacyItem.description || '',
    duration: legacyItem.duration || 0,
    intensity: legacyItem.intensity || 3,
    equipment: legacyItem.equipment || legacyItem.materials || [],
    instructions: legacyItem.instructions || [],
    notes: legacyItem.notes || ''
  };
}

// Weight entries legacy transformation
export function transformLegacyWeightEntry(legacyItem: any) {
  return {
    ...legacyItem,
    date: legacyItem.date || new Date().toISOString(),
    weight: legacyItem.weight || 0,
    bodyFat: legacyItem.bodyFat || undefined,
    muscleMass: legacyItem.muscleMass || undefined,
    notes: legacyItem.notes || ''
  };
}

// Weight goals legacy transformation
export function transformLegacyWeightGoal(legacyItem: any) {
  return {
    ...legacyItem,
    targetWeight: legacyItem.targetWeight || 0,
    targetDate: legacyItem.targetDate || new Date().toISOString().split('T')[0],
    reason: legacyItem.reason || '',
    isActive: legacyItem.isActive !== undefined ? legacyItem.isActive : false
  };
}

// Nutrition entries legacy transformation
export function transformLegacyNutritionEntry(legacyItem: any) {
  return {
    ...legacyItem,
    date: legacyItem.date || new Date().toISOString(),
    calories: legacyItem.calories || 0,
    protein: legacyItem.protein || 0,
    carbs: legacyItem.carbs || 0,
    fats: legacyItem.fats || 0,
    water: legacyItem.water || 0,
    notes: legacyItem.notes || ''
  };
}