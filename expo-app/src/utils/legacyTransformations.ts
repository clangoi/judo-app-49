/**
 * Legacy data transformation functions for migrating old data structures to new ones
 */

// Physical exercises legacy transformation
export function transformLegacyPhysicalExercise(legacyItem: any) {
  return {
    ...legacyItem,
    // Ensure all required fields exist with defaults
    exerciseName: legacyItem.exerciseName || legacyItem.name || 'Ejercicio',
    sets: legacyItem.sets || 0,
    reps: legacyItem.reps || 0,
    weight: legacyItem.weight || 0,
    duration: legacyItem.duration || 0,
    intensity: legacyItem.intensity || 'medio',
    notes: legacyItem.notes || '',
    restTime: legacyItem.restTime || 0,
    // Migration might include legacy date field
    date: legacyItem.date || new Date().toISOString()
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
    description: legacyItem.description || '',
    duration: legacyItem.duration || 0,
    intensity: legacyItem.intensity || 'medio',
    equipment: legacyItem.equipment || [],
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