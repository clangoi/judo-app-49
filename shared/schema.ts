import { pgTable, text, uuid, timestamp, integer, numeric, boolean, jsonb, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const appRoleEnum = pgEnum('app_role', ['deportista', 'entrenador', 'admin']);
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
  clubId: uuid("club_id"),
  clubName: text("club_name"),
  currentBelt: beltLevelEnum("current_belt"),
  gender: genderTypeEnum("gender"),
  competitionCategory: text("competition_category"),
  injuries: text("injuries").array(),
  injuryDescription: text("injury_description"),
  profileImageUrl: text("profile_image_url"),
  selectedClubLogoId: uuid("selected_club_logo_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User roles table
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  role: appRoleEnum("role").notNull().default('deportista'),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: uuid("assigned_by")
});

// Clubs table
export const clubs = pgTable("clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Trainer assignments table
export const trainerAssignments = pgTable("trainer_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").notNull(),
  studentId: uuid("student_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: uuid("assigned_by")
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

// Randori sessions table
export const randoriSessions = pgTable("randori_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  trainingSessionId: uuid("training_session_id"),
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

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles);
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertClubSchema = createInsertSchema(clubs);
export const insertTrainerAssignmentSchema = createInsertSchema(trainerAssignments);
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions);
export const insertExerciseSchema = createInsertSchema(exercises);
export const insertExerciseRecordSchema = createInsertSchema(exerciseRecords);
export const insertWeightEntrySchema = createInsertSchema(weightEntries);
export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries);
export const insertTechniqueSchema = createInsertSchema(techniques);
export const insertTacticalNoteSchema = createInsertSchema(tacticalNotes);
export const insertRandoriSessionSchema = createInsertSchema(randoriSessions);
export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges);
export const insertUserAchievementSchema = createInsertSchema(userAchievements);

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Club = typeof clubs.$inferSelect;
export type InsertClub = z.infer<typeof insertClubSchema>;
export type TrainerAssignment = typeof trainerAssignments.$inferSelect;
export type InsertTrainerAssignment = z.infer<typeof insertTrainerAssignmentSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
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

// Legacy exports for compatibility
export const users = profiles;
export const insertUserSchema = insertProfileSchema;
export type InsertUser = InsertProfile;
export type User = Profile;
