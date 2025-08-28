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
