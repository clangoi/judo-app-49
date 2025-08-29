import { pgTable, text, uuid, timestamp, integer, numeric, boolean, jsonb, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums - Simplified for deportista only
export const genderTypeEnum = pgEnum('gender_type', ['male', 'female']);
export const beltLevelEnum = pgEnum('belt_level', ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']);

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  genderPreference: text("gender_preference"),
  currentBelt: beltLevelEnum("current_belt"),
  gender: genderTypeEnum("gender"),
  competitionCategory: text("competition_category"),
  injuries: text("injuries").array(),
  injuryDescription: text("injury_description"),
  profileImageUrl: text("profile_image_url"),
  birthDate: date("birth_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});






// Training sessions table
export const trainingSessions = pgTable("training_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  sessionType: text("session_type").notNull(),
  durationMinutes: integer("duration_minutes"),
  intensity: integer("intensity"),
  notes: text("notes"),
  trainingCategory: text("training_category"),
  createdAt: timestamp("created_at").defaultNow()
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Exercise records table
export const exerciseRecords = pgTable("exercise_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  exerciseId: uuid("exercise_id").notNull(),
  trainingSessionId: uuid("training_session_id"),
  sets: integer("sets"),
  reps: integer("reps"),
  weightKg: numeric("weight_kg"),
  durationMinutes: integer("duration_minutes"),
  restSeconds: integer("rest_seconds"),
  notes: text("notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Weight entries table
export const weightEntries = pgTable("weight_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  weight: numeric("weight").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Nutrition entries table
export const nutritionEntries = pgTable("nutrition_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  mealDescription: text("meal_description").notNull(),
  calories: integer("calories"),
  protein: numeric("protein"),
  carbs: numeric("carbs"),
  fats: numeric("fats"),
  createdAt: timestamp("created_at").defaultNow()
});

// Techniques table
export const techniques = pgTable("techniques", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  beltLevel: beltLevelEnum("belt_level").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  youtubeUrl: text("youtube_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Tactical notes table
export const tacticalNotes = pgTable("tactical_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  imageUrls: text("image_urls").array(),
  videoUrl: text("video_url"),
  youtubeUrl: text("youtube_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Judo training sessions table (separate from physical preparation)
export const judoTrainingSessions = pgTable("judo_training_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  sessionType: text("session_type").notNull(), // tipo de entrenamiento
  durationMinutes: integer("duration_minutes"),
  techniquesPracticed: text("techniques_practiced"), // tecnicasPracticadas
  whatWorked: text("what_worked"), // queFunciono
  whatDidntWork: text("what_didnt_work"), // queNoFunciono
  notes: text("notes"), // comentarios
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Sports training sessions table (separate from physical preparation)
export const sportsTrainingSessions = pgTable("sports_training_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  date: date("date").notNull(),
  sessionType: text("session_type").notNull(), // tipo de entrenamiento
  durationMinutes: integer("duration_minutes"),
  techniquesPracticed: text("techniques_practiced"), // tecnicasPracticadas
  whatWorked: text("what_worked"), // queFunciono
  whatDidntWork: text("what_didnt_work"), // queNoFunciono
  notes: text("notes"), // comentarios
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow()
});

// Randori sessions table (linked to sports training sessions)
export const randoriSessions = pgTable("randori_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  sportsTrainingSessionId: uuid("sports_training_session_id"),
  opponentName: text("opponent_name").notNull(),
  techniquesAttempted: text("techniques_attempted").array(),
  techniquesSuccessful: text("techniques_successful").array(),
  techniquesFailed: text("techniques_failed").array(),
  techniquesReceived: text("techniques_received").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Achievement badges table
export const achievementBadges = pgTable("achievement_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  category: text("category").notNull(), // 'training', 'technique', 'consistency', 'weight', 'nutrition'
  criteriaType: text("criteria_type").notNull(), // 'count', 'streak', 'milestone', 'achievement'
  criteriaValue: integer("criteria_value").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// User achievements table
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  badgeId: uuid("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // Current progress towards next level
  level: integer("level").default(1), // Achievement level (for repeatable badges)
  isNotified: boolean("is_notified").default(false)
});

// Mood entries table - Estado de ánimo
export const moodEntries = pgTable("mood_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  moodLevel: integer("mood_level").notNull(), // 1-5 scale (1 = muy malo, 5 = excelente)
  energyLevel: integer("energy_level").notNull(), // 1-5 scale
  stressLevel: integer("stress_level").notNull(), // 1-5 scale (1 = muy relajado, 5 = muy estresado)
  sleepQuality: integer("sleep_quality").notNull(), // 1-5 scale
  motivation: integer("motivation").notNull(), // 1-5 scale
  notes: text("notes"), // Notas adicionales del usuario
  factors: text("factors").array(), // Factores que afectaron el estado de ánimo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stress entries table - Niveles de estrés
export const stressEntries = pgTable("stress_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  stressLevel: integer("stress_level").notNull(), // 1-5 scale (1 = muy relajado, 5 = muy estresado)
  stressType: text("stress_type"), // físico, mental, emocional
  triggers: text("triggers").array(), // Desencadenantes del estrés
  copingStrategies: text("coping_strategies").array(), // Estrategias de afrontamiento utilizadas
  effectiveness: integer("effectiveness"), // 1-5 qué tan efectivas fueron las estrategias
  notes: text("notes"), // Notas adicionales
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Mental wellness entries table - Bienestar mental
export const mentalWellnessEntries = pgTable("mental_wellness_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  overallWellness: integer("overall_wellness").notNull(), // 1-10 scale
  lifesatisfaction: integer("life_satisfaction").notNull(), // 1-10 scale
  selfEsteem: integer("self_esteem").notNull(), // 1-10 scale
  socialConnection: integer("social_connection").notNull(), // 1-10 scale
  purposeMeaning: integer("purpose_meaning").notNull(), // 1-10 scale
  emotionalRegulation: integer("emotional_regulation").notNull(), // 1-10 scale
  anxietyLevel: integer("anxiety_level").notNull(), // 1-10 scale (1 = nada ansioso, 10 = muy ansioso)
  positiveThoughts: text("positive_thoughts").array(), // Pensamientos positivos del día
  challengesOvercome: text("challenges_overcome").array(), // Desafíos superados
  gratitudeItems: text("gratitude_items").array(), // Cosas por las que está agradecido
  notes: text("notes"), // Reflexiones adicionales
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Concentration entries table - Concentración
export const concentrationEntries = pgTable("concentration_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  focusLevel: integer("focus_level").notNull(), // 1-10 scale (1 = muy distraído, 10 = muy concentrado)
  attentionSpan: integer("attention_span").notNull(), // 1-10 scale (duración de la concentración)
  mentalClarity: integer("mental_clarity").notNull(), // 1-10 scale (claridad mental)
  distractionLevel: integer("distraction_level").notNull(), // 1-10 scale (1 = sin distracciones, 10 = muy distraído)
  concentrationTechniques: text("concentration_techniques").array(), // Técnicas de concentración utilizadas
  distractionSources: text("distraction_sources").array(), // Fuentes de distracción
  taskCompleted: integer("task_completed"), // 1-10 qué tan bien completó las tareas
  environment: text("environment"), // ambiente donde se concentró
  timeOfDay: text("time_of_day"), // momento del día (mañana, tarde, noche)
  exerciseDuration: integer("exercise_duration"), // minutos de ejercicio de concentración
  notes: text("notes"), // Reflexiones adicionales
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deep assessment entries table - Evaluación profunda integrada
export const deepAssessmentEntries = pgTable("deep_assessment_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  
  // Estado de ánimo
  moodLevel: integer("mood_level").notNull(), // 1-5 scale
  energyLevel: integer("energy_level").notNull(), // 1-5 scale
  sleepQuality: integer("sleep_quality").notNull(), // 1-5 scale
  motivation: integer("motivation").notNull(), // 1-5 scale
  moodFactors: text("mood_factors").array(), // Factores que afectaron el estado de ánimo
  
  // Niveles de estrés
  stressLevel: integer("stress_level").notNull(), // 1-5 scale
  stressType: text("stress_type"), // físico, mental, emocional
  stressTriggers: text("stress_triggers").array(), // Desencadenantes del estrés
  copingStrategies: text("coping_strategies").array(), // Estrategias de afrontamiento
  copingEffectiveness: integer("coping_effectiveness"), // 1-5 qué tan efectivas fueron
  
  // Concentración
  focusLevel: integer("focus_level").notNull(), // 1-10 scale
  attentionSpan: integer("attention_span").notNull(), // 1-10 scale
  mentalClarity: integer("mental_clarity").notNull(), // 1-10 scale
  distractionLevel: integer("distraction_level").notNull(), // 1-10 scale
  concentrationTechniques: text("concentration_techniques").array(),
  distractionSources: text("distraction_sources").array(),
  taskCompleted: integer("task_completed"), // 1-10
  
  // Evaluación del día (bienestar mental)
  overallWellness: integer("overall_wellness").notNull(), // 1-10 scale
  lifeSatisfaction: integer("life_satisfaction").notNull(), // 1-10 scale
  selfEsteem: integer("self_esteem").notNull(), // 1-10 scale
  socialConnection: integer("social_connection").notNull(), // 1-10 scale
  purposeMeaning: integer("purpose_meaning").notNull(), // 1-10 scale
  emotionalRegulation: integer("emotional_regulation").notNull(), // 1-10 scale
  anxietyLevel: integer("anxiety_level").notNull(), // 1-10 scale
  
  // Reflexiones integradas
  positiveThoughts: text("positive_thoughts").array(),
  challengesOvercome: text("challenges_overcome").array(), 
  gratitudeItems: text("gratitude_items").array(),
  notes: text("notes"), // Reflexiones generales del día
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quick check-in entries table - Check-in rápido de 30 segundos
export const quickCheckInEntries = pgTable("quick_checkin_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(), // Momento exacto del check-in
  
  // Evaluación rápida (solo 3 preguntas esenciales)
  currentMood: integer("current_mood").notNull(), // 1-5 scale (😰 😔 😐 😊 😄)
  energyLevel: integer("energy_level").notNull(), // 1-5 scale (🔋 Low to High)
  stressLevel: integer("stress_level").notNull(), // 1-5 scale (😌 to 😵‍💫)
  
  // Contexto del momento (opcional pero rápido)
  currentActivity: text("current_activity"), // ¿Qué estás haciendo?
  location: text("location"), // ¿Dónde estás?
  quickNote: text("quick_note"), // Una reflexión rápida (max 100 chars)
  
  // Metadatos para análisis
  timeOfDay: text("time_of_day").notNull(), // morning, afternoon, evening, night
  dayOfWeek: text("day_of_week").notNull(), // monday, tuesday, etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crisis management sessions table - Manejo de crisis para momentos de alta ansiedad
export const crisisManagementSessions = pgTable("crisis_management_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Evaluación inicial de crisis
  anxietyLevel: integer("anxiety_level").notNull(), // 1-10 scale
  panicLevel: integer("panic_level").notNull(), // 1-10 scale  
  stressIntensity: integer("stress_intensity").notNull(), // 1-10 scale
  emotionalControl: integer("emotional_control").notNull(), // 1-10 scale
  
  // Técnicas utilizadas (array de técnicas seleccionadas)
  techniquesUsed: text("techniques_used").array(), // breathing, grounding, etc.
  
  // Efectividad de las técnicas
  breathingEffectiveness: integer("breathing_effectiveness"), // 1-5 if used
  groundingEffectiveness: integer("grounding_effectiveness"), // 1-5 if used
  visualizationEffectiveness: integer("visualization_effectiveness"), // 1-5 if used
  movementEffectiveness: integer("movement_effectiveness"), // 1-5 if used
  
  // Contexto de la crisis
  crisisTrigger: text("crisis_trigger"), // ¿Qué desencadenó la crisis?
  location: text("location"), // ¿Dónde ocurrió?
  duration: integer("duration"), // Duración en minutos
  
  // Evaluación post-crisis
  postAnxietyLevel: integer("post_anxiety_level"), // 1-10 después de las técnicas
  postPanicLevel: integer("post_panic_level"), // 1-10 después
  postStressIntensity: integer("post_stress_intensity"), // 1-10 después
  postEmotionalControl: integer("post_emotional_control"), // 1-10 después
  
  // Reflexiones
  whatHelped: text("what_helped"), // ¿Qué fue lo que más ayudó?
  whatDidntHelp: text("what_didnt_help"), // ¿Qué no funcionó?
  lessonsLearned: text("lessons_learned"), // Aprendizajes para el futuro
  notes: text("notes"), // Notas adicionales
  
  // Metadatos
  timeOfDay: text("time_of_day").notNull(), // morning, afternoon, evening, night
  dayOfWeek: text("day_of_week").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sistema de notificaciones
export const notificationTypeEnum = pgEnum('notification_type', [
  'training_reminder', 
  'weight_reminder', 
  'nutrition_reminder', 
  'technique_reminder',
  'achievement',
  'general'
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Individual notification alarms/reminders
export const notificationAlarms = pgTable("notification_alarms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // Custom alarm title
  category: text("category").notNull(), // 'training', 'weight', 'nutrition'
  time: text("time").notNull(), // HH:MM format
  days: text("days").array().notNull(), // ['monday', 'tuesday', etc.]
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationSettings = pgTable("notification_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }).unique(),
  trainingReminder: boolean("training_reminder").default(true).notNull(),
  trainingReminderTime: text("training_reminder_time").default("18:00").notNull(), // HH:MM format
  trainingReminderDays: text("training_reminder_days").array().default(['monday', 'wednesday', 'friday']).notNull(),
  weightReminder: boolean("weight_reminder").default(true).notNull(),
  weightReminderTime: text("weight_reminder_time").default("08:00").notNull(),
  weightReminderDays: text("weight_reminder_days").array().default(['monday']).notNull(),
  nutritionReminder: boolean("nutrition_reminder").default(true).notNull(),
  nutritionReminderTime: text("nutrition_reminder_time").default("20:00").notNull(),
  nutritionReminderDays: text("nutrition_reminder_days").array().default(['sunday']).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles);
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions);
export const insertJudoTrainingSessionSchema = createInsertSchema(judoTrainingSessions);
export const insertSportsTrainingSessionSchema = createInsertSchema(sportsTrainingSessions);
export const insertExerciseSchema = createInsertSchema(exercises);
export const insertExerciseRecordSchema = createInsertSchema(exerciseRecords);
export const insertWeightEntrySchema = createInsertSchema(weightEntries);
export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries);
export const insertTechniqueSchema = createInsertSchema(techniques);
export const insertTacticalNoteSchema = createInsertSchema(tacticalNotes);
export const insertRandoriSessionSchema = createInsertSchema(randoriSessions);
export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);
export const insertMoodEntrySchema = createInsertSchema(moodEntries);
export const insertStressEntrySchema = createInsertSchema(stressEntries);
export const insertMentalWellnessEntrySchema = createInsertSchema(mentalWellnessEntries);
export const insertConcentrationEntrySchema = createInsertSchema(concentrationEntries);
export const insertDeepAssessmentEntrySchema = createInsertSchema(deepAssessmentEntries);
export const insertQuickCheckInEntrySchema = createInsertSchema(quickCheckInEntries);
export const insertCrisisManagementSessionSchema = createInsertSchema(crisisManagementSessions);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertNotificationAlarmsSchema = createInsertSchema(notificationAlarms);
export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings);

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type SportsTrainingSession = typeof sportsTrainingSessions.$inferSelect;
export type InsertSportsTrainingSession = z.infer<typeof insertSportsTrainingSessionSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type ExerciseRecord = typeof exerciseRecords.$inferSelect;
export type InsertExerciseRecord = z.infer<typeof insertExerciseRecordSchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;
export type InsertNutritionEntry = z.infer<typeof insertNutritionEntrySchema>;
export type Technique = typeof techniques.$inferSelect;
export type InsertTechnique = z.infer<typeof insertTechniqueSchema>;
export type TacticalNote = typeof tacticalNotes.$inferSelect;
export type InsertTacticalNote = z.infer<typeof insertTacticalNoteSchema>;
export type RandoriSession = typeof randoriSessions.$inferSelect;
export type InsertRandoriSession = z.infer<typeof insertRandoriSessionSchema>;
export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type StressEntry = typeof stressEntries.$inferSelect;
export type InsertStressEntry = z.infer<typeof insertStressEntrySchema>;
export type MentalWellnessEntry = typeof mentalWellnessEntries.$inferSelect;
export type InsertMentalWellnessEntry = z.infer<typeof insertMentalWellnessEntrySchema>;
export type ConcentrationEntry = typeof concentrationEntries.$inferSelect;
export type InsertConcentrationEntry = z.infer<typeof insertConcentrationEntrySchema>;
export type DeepAssessmentEntry = typeof deepAssessmentEntries.$inferSelect;
export type InsertDeepAssessmentEntry = z.infer<typeof insertDeepAssessmentEntrySchema>;
export type QuickCheckInEntry = typeof quickCheckInEntries.$inferSelect;
export type InsertQuickCheckInEntry = z.infer<typeof insertQuickCheckInEntrySchema>;
export type CrisisManagementSession = typeof crisisManagementSessions.$inferSelect;
export type InsertCrisisManagementSession = z.infer<typeof insertCrisisManagementSessionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationAlarm = typeof notificationAlarms.$inferSelect;
export type InsertNotificationAlarm = z.infer<typeof insertNotificationAlarmsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;



// Legacy exports for compatibility
export const users = profiles;
export const insertUserSchema = insertProfileSchema;
export type InsertUser = InsertProfile;
export type User = Profile;
