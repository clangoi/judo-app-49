import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import * as fs from "fs";
import * as path from "path";
import { 
  profiles, trainingSessions, judoTrainingSessions, sportsTrainingSessions,
  exercises, exerciseRecords, weightEntries, nutritionEntries, 
  techniques, tacticalNotes, randoriSessions, achievementBadges, userAchievements, moodEntries,
  insertProfileSchema, insertTrainingSessionSchema, 
  insertJudoTrainingSessionSchema, insertSportsTrainingSessionSchema, insertExerciseSchema, insertExerciseRecordSchema, 
  insertWeightEntrySchema, insertNutritionEntrySchema, insertTechniqueSchema, 
  insertTacticalNoteSchema, insertRandoriSessionSchema, insertAchievementBadgeSchema, 
  insertUserAchievementSchema, insertMoodEntrySchema, stressEntries, insertStressEntrySchema
} from "@shared/schema";
import { eq, and, desc, sql, isNull, gte, lte } from "drizzle-orm";

// Import notification tables
import { notifications, notificationSettings, notificationAlarms, insertNotificationAlarmsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication and User Management
  
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Get user profile
      const user = await db.select().from(profiles).where(eq(profiles.id, userId));
      
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: user[0],
        session: { user: user[0] }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // User Profiles
  app.get("/api/profiles", async (req, res) => {
    try {
      const result = await db.select().from(profiles);
      res.json(result);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ error: "Failed to fetch profiles" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validated = insertProfileSchema.parse(req.body);
      const result = await db.insert(profiles).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data" });
    }
  });

  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
      if (result.length === 0) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertProfileSchema.partial().parse(req.body);
      const result = await db.update(profiles).set(validated).where(eq(profiles.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Training Sessions
  app.get("/api/training-sessions", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(trainingSessions);
      
      if (userId) {
        query = query.where(eq(trainingSessions.userId, userId));
      }
      
      const result = await query.orderBy(desc(trainingSessions.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  app.post("/api/training-sessions", async (req, res) => {
    try {
      const validated = insertTrainingSessionSchema.parse(req.body);
      const result = await db.insert(trainingSessions).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid training session data" });
    }
  });

  app.patch("/api/training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertTrainingSessionSchema.partial().parse(req.body);
      const result = await db.update(trainingSessions).set(validated).where(eq(trainingSessions.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update training session" });
    }
  });

  app.delete("/api/training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(trainingSessions).where(eq(trainingSessions.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete training session" });
    }
  });

  // Judo Training Sessions (separate from physical preparation)
  app.get("/api/judo-training-sessions", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(judoTrainingSessions);
      
      if (userId) {
        query = query.where(eq(judoTrainingSessions.userId, userId));
      }
      
      const result = await query.orderBy(desc(judoTrainingSessions.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch judo training sessions" });
    }
  });

  app.post("/api/judo-training-sessions", async (req, res) => {
    try {
      const validated = insertJudoTrainingSessionSchema.parse(req.body);
      const result = await db.insert(judoTrainingSessions).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Judo training session validation error:", error);
      res.status(400).json({ error: "Invalid judo training session data" });
    }
  });

  app.patch("/api/judo-training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertJudoTrainingSessionSchema.partial().parse(req.body);
      const result = await db.update(judoTrainingSessions).set(validated).where(eq(judoTrainingSessions.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update judo training session" });
    }
  });

  app.delete("/api/judo-training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(judoTrainingSessions).where(eq(judoTrainingSessions.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete judo training session" });
    }
  });

  // Sports Training Sessions (separate from physical preparation)
  app.get("/api/sports-training-sessions", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(sportsTrainingSessions);
      
      if (userId) {
        query = query.where(eq(sportsTrainingSessions.userId, userId));
      }
      
      const result = await query.orderBy(desc(sportsTrainingSessions.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sports training sessions" });
    }
  });

  app.post("/api/sports-training-sessions", async (req, res) => {
    try {
      const validated = insertSportsTrainingSessionSchema.parse(req.body);
      const result = await db.insert(sportsTrainingSessions).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Sports training session validation error:", error);
      res.status(400).json({ error: "Invalid sports training session data" });
    }
  });

  app.patch("/api/sports-training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertSportsTrainingSessionSchema.partial().parse(req.body);
      const result = await db.update(sportsTrainingSessions).set(validated).where(eq(sportsTrainingSessions.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update sports training session" });
    }
  });

  app.delete("/api/sports-training-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(sportsTrainingSessions).where(eq(sportsTrainingSessions.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sports training session" });
    }
  });

  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(exercises);
      
      if (userId) {
        query = query.where(eq(exercises.userId, userId));
      }
      
      const result = await query.orderBy(desc(exercises.name));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const validated = insertExerciseSchema.parse(req.body);
      const result = await db.insert(exercises).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid exercise data" });
    }
  });

  // Exercise Records
  app.get("/api/exercise-records", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(exerciseRecords);
      
      if (userId) {
        query = query.where(eq(exerciseRecords.userId, userId));
      }
      
      const result = await query.orderBy(desc(exerciseRecords.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercise records" });
    }
  });

  app.post("/api/exercise-records", async (req, res) => {
    try {
      const validated = insertExerciseRecordSchema.parse(req.body);
      const result = await db.insert(exerciseRecords).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid exercise record data" });
    }
  });

  app.patch("/api/exercise-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertExerciseRecordSchema.partial().parse(req.body);
      const result = await db.update(exerciseRecords).set(validated).where(eq(exerciseRecords.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update exercise record" });
    }
  });

  app.delete("/api/exercise-records/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(exerciseRecords).where(eq(exerciseRecords.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete exercise record" });
    }
  });

  // Weight Entries
  app.get("/api/weight-entries", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(weightEntries);
      
      if (userId) {
        query = query.where(eq(weightEntries.userId, userId));
      }
      
      const result = await query.orderBy(desc(weightEntries.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weight entries" });
    }
  });

  app.post("/api/weight-entries", async (req, res) => {
    try {
      const validated = insertWeightEntrySchema.parse(req.body);
      const result = await db.insert(weightEntries).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid weight entry data" });
    }
  });

  app.patch("/api/weight-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertWeightEntrySchema.partial().parse(req.body);
      const result = await db.update(weightEntries).set(validated).where(eq(weightEntries.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update weight entry" });
    }
  });

  app.delete("/api/weight-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(weightEntries).where(eq(weightEntries.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete weight entry" });
    }
  });

  // Nutrition Entries
  app.get("/api/nutrition-entries", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(nutritionEntries);
      
      if (userId) {
        query = query.where(eq(nutritionEntries.userId, userId));
      }
      
      const result = await query.orderBy(desc(nutritionEntries.date));
      res.json(result);
    } catch (error) {
      console.error("Error fetching nutrition entries:", error);
      res.status(500).json({ error: "Failed to fetch nutrition entries" });
    }
  });

  app.post("/api/nutrition-entries", async (req, res) => {
    try {
      const validated = insertNutritionEntrySchema.parse(req.body);
      const result = await db.insert(nutritionEntries).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid nutrition entry data" });
    }
  });

  app.patch("/api/nutrition-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertNutritionEntrySchema.partial().parse(req.body);
      const result = await db.update(nutritionEntries).set(validated).where(eq(nutritionEntries.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update nutrition entry" });
    }
  });

  app.delete("/api/nutrition-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(nutritionEntries).where(eq(nutritionEntries.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete nutrition entry" });
    }
  });

  // Techniques
  app.get("/api/techniques", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(techniques);
      
      if (userId) {
        query = query.where(eq(techniques.userId, userId));
      }
      
      const result = await query.orderBy(desc(techniques.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch techniques" });
    }
  });

  app.post("/api/techniques", async (req, res) => {
    try {
      const validated = insertTechniqueSchema.parse(req.body);
      const result = await db.insert(techniques).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid technique data" });
    }
  });

  app.patch("/api/techniques/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertTechniqueSchema.partial().parse(req.body);
      const result = await db.update(techniques).set(validated).where(eq(techniques.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update technique" });
    }
  });

  app.delete("/api/techniques/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(techniques).where(eq(techniques.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete technique" });
    }
  });

  // Tactical Notes
  app.get("/api/tactical-notes", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(tacticalNotes);
      
      if (userId) {
        query = query.where(eq(tacticalNotes.userId, userId));
      }
      
      const result = await query.orderBy(desc(tacticalNotes.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tactical notes" });
    }
  });

  app.post("/api/tactical-notes", async (req, res) => {
    try {
      const validated = insertTacticalNoteSchema.parse(req.body);
      const result = await db.insert(tacticalNotes).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid tactical note data" });
    }
  });

  app.patch("/api/tactical-notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertTacticalNoteSchema.partial().parse(req.body);
      const result = await db.update(tacticalNotes).set(validated).where(eq(tacticalNotes.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update tactical note" });
    }
  });

  app.delete("/api/tactical-notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(tacticalNotes).where(eq(tacticalNotes.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tactical note" });
    }
  });

  // Randori Sessions
  app.get("/api/randori-sessions", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(randoriSessions);
      
      if (userId) {
        query = query.where(eq(randoriSessions.userId, userId));
      }
      
      const result = await query.orderBy(desc(randoriSessions.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch randori sessions" });
    }
  });

  app.post("/api/randori-sessions", async (req, res) => {
    try {
      const validated = insertRandoriSessionSchema.parse(req.body);
      const result = await db.insert(randoriSessions).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid randori session data" });
    }
  });

  app.patch("/api/randori-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertRandoriSessionSchema.partial().parse(req.body);
      const result = await db.update(randoriSessions).set(validated).where(eq(randoriSessions.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update randori session" });
    }
  });

  app.delete("/api/randori-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(randoriSessions).where(eq(randoriSessions.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete randori session" });
    }
  });

  // Achievement Badges
  app.get("/api/achievement-badges", async (req, res) => {
    try {
      const result = await db.select().from(achievementBadges).where(eq(achievementBadges.isActive, true));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievement badges" });
    }
  });

  app.post("/api/achievement-badges", async (req, res) => {
    try {
      const validated = insertAchievementBadgeSchema.parse(req.body);
      const result = await db.insert(achievementBadges).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid achievement badge data" });
    }
  });

  // User Achievements
  app.get("/api/user-achievements", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db
        .select({
          id: userAchievements.id,
          userId: userAchievements.userId,
          badgeId: userAchievements.badgeId,
          earnedAt: userAchievements.earnedAt,
          progress: userAchievements.progress,
          level: userAchievements.level,
          isNotified: userAchievements.isNotified,
          badgeName: achievementBadges.name,
          badgeDescription: achievementBadges.description,
          badgeIconUrl: achievementBadges.iconUrl,
          badgeCategory: achievementBadges.category
        })
        .from(userAchievements)
        .leftJoin(achievementBadges, eq(userAchievements.badgeId, achievementBadges.id));
      
      if (userId) {
        query = query.where(eq(userAchievements.userId, userId));
      }
      
      const result = await query.orderBy(desc(userAchievements.earnedAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  app.post("/api/user-achievements", async (req, res) => {
    try {
      const validated = insertUserAchievementSchema.parse(req.body);
      const result = await db.insert(userAchievements).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid user achievement data" });
    }
  });

  // File uploads
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: "No files were uploaded" });
      }

      const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
      
      if (!file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "client/public/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = path.join(uploadsDir, fileName);

      // Move the file
      await file.mv(filePath);

      // Return the URL path
      const fileUrl = `/uploads/${fileName}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Notification system
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      res.json(result);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.get("/api/notification-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, userId))
        .limit(1);

      if (result.length === 0) {
        // Return default settings if none exist
        res.json({
          userId,
          trainingReminder: true,
          trainingReminderTime: "18:00",
          trainingReminderDays: ["monday", "wednesday", "friday"],
          weightReminder: true,
          weightReminderTime: "08:00",
          weightReminderDays: ["monday"],
          nutritionReminder: true,
          nutritionReminderTime: "20:00",
          nutritionReminderDays: ["sunday"]
        });
      } else {
        res.json(result[0]);
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  });

  app.get("/api/notification-alarms/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await db
        .select()
        .from(notificationAlarms)
        .where(eq(notificationAlarms.userId, userId))
        .orderBy(notificationAlarms.time);

      res.json(result);
    } catch (error) {
      console.error("Error fetching notification alarms:", error);
      res.status(500).json({ error: "Failed to fetch notification alarms" });
    }
  });

  app.post("/api/notification-alarms", async (req, res) => {
    try {
      const validated = insertNotificationAlarmsSchema.parse(req.body);
      const result = await db.insert(notificationAlarms).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating notification alarm:", error);
      res.status(400).json({ error: "Invalid alarm data" });
    }
  });

  // Mood Entries API Routes
  app.get("/api/mood-entries", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(moodEntries);
      
      if (userId) {
        query = query.where(eq(moodEntries.userId, userId));
      }
      
      const result = await query.orderBy(desc(moodEntries.date));
      res.json(result);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood-entries", async (req, res) => {
    try {
      const validated = insertMoodEntrySchema.parse(req.body);
      const result = await db.insert(moodEntries).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  });

  app.get("/api/mood-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.select().from(moodEntries).where(eq(moodEntries.id, id)).limit(1);
      if (result.length === 0) {
        return res.status(404).json({ error: "Mood entry not found" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching mood entry:", error);
      res.status(500).json({ error: "Failed to fetch mood entry" });
    }
  });

  app.patch("/api/mood-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertMoodEntrySchema.partial().parse(req.body);
      const result = await db.update(moodEntries).set(validated).where(eq(moodEntries.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ error: "Mood entry not found" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating mood entry:", error);
      res.status(400).json({ error: "Failed to update mood entry" });
    }
  });

  app.delete("/api/mood-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.delete(moodEntries).where(eq(moodEntries.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ error: "Mood entry not found" });
      }
      res.json({ message: "Mood entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      res.status(500).json({ error: "Failed to delete mood entry" });
    }
  });

  // Stress Entries API Routes
  app.get("/api/stress-entries", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(stressEntries);
      
      if (userId) {
        query = query.where(eq(stressEntries.userId, userId));
      }
      
      const result = await query.orderBy(desc(stressEntries.date));
      res.json(result);
    } catch (error) {
      console.error("Error fetching stress entries:", error);
      res.status(500).json({ error: "Failed to fetch stress entries" });
    }
  });

  app.post("/api/stress-entries", async (req, res) => {
    try {
      const validated = insertStressEntrySchema.parse(req.body);
      const result = await db.insert(stressEntries).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating stress entry:", error);
      res.status(400).json({ error: "Invalid stress entry data" });
    }
  });

  app.get("/api/stress-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.select().from(stressEntries).where(eq(stressEntries.id, id)).limit(1);
      if (result.length === 0) {
        return res.status(404).json({ error: "Stress entry not found" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching stress entry:", error);
      res.status(500).json({ error: "Failed to fetch stress entry" });
    }
  });

  app.patch("/api/stress-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertStressEntrySchema.partial().parse(req.body);
      const result = await db.update(stressEntries).set(validated).where(eq(stressEntries.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ error: "Stress entry not found" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating stress entry:", error);
      res.status(400).json({ error: "Failed to update stress entry" });
    }
  });

  app.delete("/api/stress-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.delete(stressEntries).where(eq(stressEntries.id, id)).returning();
      if (result.length === 0) {
        return res.status(404).json({ error: "Stress entry not found" });
      }
      res.json({ message: "Stress entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting stress entry:", error);
      res.status(500).json({ error: "Failed to delete stress entry" });
    }
  });

  const server = createServer(app);
  return server;
}