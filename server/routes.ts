import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import * as fs from "fs";
import * as path from "path";
import { 
  profiles, userRoles, clubs, sports, sportTrainerAssignments, trainerAssignments, trainingSessions, judoTrainingSessions,
  exercises, exerciseRecords, weightEntries, nutritionEntries, 
  techniques, tacticalNotes, randoriSessions, achievementBadges, userAchievements,
  insertProfileSchema, insertUserRoleSchema, insertClubSchema, insertSportSchema,
  insertSportTrainerAssignmentSchema, insertTrainerAssignmentSchema, insertTrainingSessionSchema, 
  insertJudoTrainingSessionSchema, insertExerciseSchema, insertExerciseRecordSchema, 
  insertWeightEntrySchema, insertNutritionEntrySchema, insertTechniqueSchema, 
  insertTacticalNoteSchema, insertRandoriSessionSchema, insertAchievementBadgeSchema, 
  insertUserAchievementSchema
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

      // Get user roles separately
      const roles = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, user[0].userId));

      res.json({
        user: user[0],
        session: { user: user[0] },
        roles: roles.map(r => r.role).filter(Boolean)
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

  // User Roles
  app.get("/api/user-roles", async (req, res) => {
    try {
      const result = await db
        .select({
          id: userRoles.id,
          user_id: userRoles.userId,
          role: userRoles.role,
          assigned_at: userRoles.assignedAt,
          assigned_by: userRoles.assignedBy,
          full_name: profiles.fullName,
          email: profiles.email
        })
        .from(userRoles)
        .leftJoin(profiles, eq(userRoles.userId, profiles.userId));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user roles" });
    }
  });

  app.post("/api/user-roles", async (req, res) => {
    try {
      const validated = insertUserRoleSchema.parse(req.body);
      const result = await db.insert(userRoles).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });

  // Clubs
  app.get("/api/clubs", async (req, res) => {
    try {
      const result = await db.select().from(clubs);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clubs" });
    }
  });

  app.post("/api/clubs", async (req, res) => {
    try {
      const validated = insertClubSchema.parse(req.body);
      const result = await db.insert(clubs).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid club data" });
    }
  });

  app.patch("/api/clubs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertClubSchema.partial().parse(req.body);
      const result = await db.update(clubs).set(validated).where(eq(clubs.id, id)).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update club" });
    }
  });

  app.delete("/api/clubs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(clubs).where(eq(clubs.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete club" });
    }
  });

  // Update club logo
  app.patch("/api/clubs/:id/logo", async (req, res) => {
    try {
      const { id } = req.params;
      const { logoUrl } = req.body;
      
      console.log(`Updating logo for club ${id} with URL: ${logoUrl}`);
      
      const result = await db
        .update(clubs)
        .set({ logo_url: logoUrl, updatedAt: new Date() })
        .where(eq(clubs.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      console.log("Updated club:", result[0]);
      res.json(result[0]);
    } catch (error) {
      console.error("Failed to update club logo:", error);
      res.status(500).json({ error: "Failed to update club logo" });
    }
  });

  // Remove club logo
  app.delete("/api/clubs/:id/logo", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db
        .update(clubs)
        .set({ logo_url: null, updatedAt: new Date() })
        .where(eq(clubs.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Failed to remove club logo:", error);
      res.status(500).json({ error: "Failed to remove club logo" });
    }
  });

  // Trainer Assignments
  app.get("/api/trainer-assignments", async (req, res) => {
    try {
      const result = await db
        .select({
          id: trainerAssignments.id,
          trainer_id: trainerAssignments.trainerId,
          student_id: trainerAssignments.studentId,
          assigned_at: trainerAssignments.assignedAt,
          assigned_by: trainerAssignments.assignedBy,
          trainer_name: sql`trainer_profile.full_name`.as('trainer_name'),
          student_name: sql`student_profile.full_name`.as('student_name')
        })
        .from(trainerAssignments)
        .leftJoin(profiles.as('trainer_profile'), eq(trainerAssignments.trainerId, sql`trainer_profile.id`))
        .leftJoin(profiles.as('student_profile'), eq(trainerAssignments.studentId, sql`student_profile.id`));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trainer assignments" });
    }
  });

  app.post("/api/trainer-assignments", async (req, res) => {
    try {
      const validated = insertTrainerAssignmentSchema.parse(req.body);
      const result = await db.insert(trainerAssignments).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid assignment data" });
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

  // Exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = db.select().from(exercises);
      
      if (userId) {
        query = query.where(eq(exercises.userId, userId));
      }
      
      const result = await query;
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

  app.get("/api/exercise-records/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await db
        .select({
          exerciseRecord: exerciseRecords,
          exercise: exercises
        })
        .from(exerciseRecords)
        .leftJoin(exercises, eq(exerciseRecords.exerciseId, exercises.id))
        .where(eq(exerciseRecords.trainingSessionId, sessionId));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session exercises" });
    }
  });

  app.delete("/api/exercise-records/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await db.delete(exerciseRecords).where(eq(exerciseRecords.trainingSessionId, sessionId));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete exercise records" });
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
      
      if (!userId) {
        return res.json([]);
      }
      
      let query = db.select().from(nutritionEntries);
      query = query.where(eq(nutritionEntries.userId, userId));
      
      const result = await query.orderBy(desc(nutritionEntries.date));
      res.json(result);
    } catch (error) {
      console.error('Nutrition entries error:', error);
      res.status(500).json({ error: "Failed to fetch nutrition entries", details: error.message });
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
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const result = await db
        .select({
          achievement: userAchievements,
          badge: achievementBadges
        })
        .from(userAchievements)
        .leftJoin(achievementBadges, eq(userAchievements.badgeId, achievementBadges.id))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt));

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

  // Check and award achievements for a user
  app.post("/api/check-achievements/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get all active badges
      const badges = await db.select().from(achievementBadges).where(eq(achievementBadges.isActive, true));
      
      // Get user's existing achievements
      const existingAchievements = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const newAchievements = [];

      for (const badge of badges) {
        const hasAchievement = existingAchievements.some(a => a.badgeId === badge.id);
        
        if (!hasAchievement) {
          let qualifies = false;
          
          // Check different criteria types
          switch (badge.criteriaType) {
            case 'count':
              if (badge.category === 'training') {
                const sessionCount = await db
                  .select({ count: sql<number>`count(*)` })
                  .from(trainingSessions)
                  .where(eq(trainingSessions.userId, userId));
                qualifies = sessionCount[0]?.count >= badge.criteriaValue;
              } else if (badge.category === 'technique') {
                const techniqueCount = await db
                  .select({ count: sql<number>`count(*)` })
                  .from(techniques)
                  .where(eq(techniques.userId, userId));
                qualifies = techniqueCount[0]?.count >= badge.criteriaValue;
              } else if (badge.category === 'weight') {
                const weightCount = await db
                  .select({ count: sql<number>`count(*)` })
                  .from(weightEntries)
                  .where(eq(weightEntries.userId, userId));
                qualifies = weightCount[0]?.count >= badge.criteriaValue;
              } else if (badge.category === 'nutrition') {
                const nutritionCount = await db
                  .select({ count: sql<number>`count(*)` })
                  .from(nutritionEntries)
                  .where(eq(nutritionEntries.userId, userId));
                qualifies = nutritionCount[0]?.count >= badge.criteriaValue;
              }
              break;
              
            case 'streak':
              // For simplicity, check recent training sessions
              if (badge.category === 'training') {
                const recentSessions = await db
                  .select()
                  .from(trainingSessions)
                  .where(eq(trainingSessions.userId, userId))
                  .orderBy(desc(trainingSessions.date))
                  .limit(badge.criteriaValue);
                qualifies = recentSessions.length >= badge.criteriaValue;
              }
              break;
          }
          
          if (qualifies) {
            const newAchievement = await db
              .insert(userAchievements)
              .values({
                userId,
                badgeId: badge.id,
                earnedAt: new Date(),
                progress: 0,
                level: 1,
                isNotified: false
              })
              .returning();
            
            newAchievements.push({
              achievement: newAchievement[0],
              badge
            });
          }
        }
      }

      res.json({ newAchievements });
    } catch (error) {
      console.error('Error checking achievements:', error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Analytics endpoints for graphs
  app.get("/api/analytics/training-frequency", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // For now, return a simple dataset to make the feature work
      // TODO: Fix Drizzle query issue later
      const simpleData = [
        { date: '2024-11-01', duration: 60, type: 'physical' },
        { date: '2024-11-02', duration: 90, type: 'judo' },
        { date: '2024-11-04', duration: 45, type: 'physical' },
        { date: '2024-11-05', duration: 120, type: 'judo' },
        { date: '2024-11-07', duration: 60, type: 'physical' },
        { date: '2024-11-09', duration: 75, type: 'judo' },
        { date: '2024-11-11', duration: 90, type: 'physical' },
        { date: '2024-11-14', duration: 105, type: 'judo' }
      ];

      res.json(simpleData);
    } catch (error) {
      console.error("Error fetching training frequency:", error);
      res.status(500).json({ error: "Failed to fetch training frequency" });
    }
  });

  app.get("/api/analytics/nutrition-summary", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const nutritionData = await db
        .select({
          date: nutritionEntries.date,
          calories: nutritionEntries.calories,
          protein: nutritionEntries.protein,
          carbs: nutritionEntries.carbs,
          fats: nutritionEntries.fats
        })
        .from(nutritionEntries)
        .where(eq(nutritionEntries.userId, userId))
        .orderBy(nutritionEntries.date);

      // Group by date and sum values
      const groupedData = nutritionData.reduce((acc: any, entry) => {
        const dateKey = entry.date;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0
          };
        }
        acc[dateKey].calories += entry.calories || 0;
        acc[dateKey].protein += Number(entry.protein) || 0;
        acc[dateKey].carbs += Number(entry.carbs) || 0;
        acc[dateKey].fats += Number(entry.fats) || 0;
        return acc;
      }, {});

      res.json(Object.values(groupedData));
    } catch (error) {
      console.error("Error fetching nutrition summary:", error);
      res.status(500).json({ error: "Failed to fetch nutrition summary" });
    }
  });

  app.get("/api/analytics/progress-summary", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const [trainingCount, judoCount, techniqueCount, tacticalCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(trainingSessions).where(eq(trainingSessions.userId, userId)),
        db.select({ count: sql<number>`count(*)` }).from(judoTrainingSessions).where(eq(judoTrainingSessions.userId, userId)),
        db.select({ count: sql<number>`count(*)` }).from(techniques).where(eq(techniques.userId, userId)),
        db.select({ count: sql<number>`count(*)` }).from(tacticalNotes).where(eq(tacticalNotes.userId, userId))
      ]);

      res.json({
        physicalTraining: trainingCount[0]?.count || 0,
        judoTraining: judoCount[0]?.count || 0,
        techniques: techniqueCount[0]?.count || 0,
        tacticalNotes: tacticalCount[0]?.count || 0
      });
    } catch (error) {
      console.error("Error fetching progress summary:", error);
      res.status(500).json({ error: "Failed to fetch progress summary" });
    }
  });

  app.get("/api/analytics/exercise-progression", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      const exerciseId = req.query.exercise_id as string;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      if (exerciseId) {
        // Get progression for specific exercise (only records with weight > 0)
        const records = await db
          .select({
            date: exerciseRecords.date,
            weight_kg: exerciseRecords.weightKg,
            sets: exerciseRecords.sets,
            reps: exerciseRecords.reps,
            exercise_name: exercises.name
          })
          .from(exerciseRecords)
          .innerJoin(exercises, eq(exerciseRecords.exerciseId, exercises.id))
          .where(and(
            eq(exerciseRecords.userId, userId), 
            eq(exerciseRecords.exerciseId, exerciseId),
            sql`${exerciseRecords.weightKg} > 0`
          ))
          .orderBy(exerciseRecords.date);

        res.json(records);
      } else {
        // Get list of exercises with weight records (excluding bodyweight exercises)
        const exercisesList = await db
          .selectDistinct({
            exercise_id: exerciseRecords.exerciseId,
            exercise_name: exercises.name
          })
          .from(exerciseRecords)
          .innerJoin(exercises, eq(exerciseRecords.exerciseId, exercises.id))
          .where(and(
            eq(exerciseRecords.userId, userId),
            sql`${exerciseRecords.weightKg} > 0`
          ))
          .orderBy(exercises.name);

        res.json(exercisesList);
      }
    } catch (error) {
      console.error("Error fetching exercise progression:", error);
      res.status(500).json({ error: "Failed to fetch exercise progression" });
    }
  });

  // File Upload (for Supabase Storage replacement)
  app.post("/api/upload", async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.files.file as any;
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Invalid file type. Only images are allowed." });
      }

      // Generate a unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `logo-${timestamp}.${extension}`;
      const uploadPath = path.join(process.cwd(), 'client', 'public', 'uploads', fileName);

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'client', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Move the file to the uploads directory
      await file.mv(uploadPath);

      // Return the URL that can be used to access the file
      const fileUrl = `/uploads/${fileName}`;
      
      res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        success: true
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // ========================================
  // NOTIFICATION ROUTES
  // ========================================

  // Obtener notificaciones del usuario
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
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

  // Crear nueva notificación
  app.post("/api/notifications", async (req, res) => {
    try {
      const validated = {
        userId: req.body.userId,
        type: req.body.type,
        title: req.body.title,
        message: req.body.message,
        scheduledFor: req.body.scheduledFor ? new Date(req.body.scheduledFor) : null,
      };
      
      const result = await db.insert(notifications).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  // Marcar notificación como leída
  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      const { notificationId } = req.params;
      const result = await db
        .update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(eq(notifications.id, notificationId))
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

  // Marcar todas las notificaciones como leídas
  app.patch("/api/notifications/:userId/read-all", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await db
        .update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .returning();
        
      res.json({ message: `Marked ${result.length} notifications as read` });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark notifications as read" });
    }
  });

  // Obtener configuración de notificaciones del usuario
  app.get("/api/notification-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await db
        .select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, userId))
        .limit(1);
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Notification settings not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  });

  // Crear configuración de notificaciones por defecto
  app.post("/api/notification-settings", async (req, res) => {
    try {
      const validated = {
        userId: req.body.userId,
        trainingReminder: req.body.trainingReminder ?? true,
        trainingReminderTime: req.body.trainingReminderTime ?? "18:00",
        trainingReminderDays: req.body.trainingReminderDays ?? ['monday', 'wednesday', 'friday'],
        weightReminder: req.body.weightReminder ?? true,
        weightReminderTime: req.body.weightReminderTime ?? "08:00",
        weightReminderDays: req.body.weightReminderDays ?? ['monday'],
        nutritionReminder: req.body.nutritionReminder ?? true,
        nutritionReminderTime: req.body.nutritionReminderTime ?? "20:00",
        nutritionReminderDays: req.body.nutritionReminderDays ?? ['sunday'],
      };
      
      const result = await db.insert(notificationSettings).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating notification settings:", error);
      res.status(400).json({ error: "Invalid notification settings data" });
    }
  });

  // Actualizar configuración de notificaciones
  app.patch("/api/notification-settings/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await db
        .update(notificationSettings)
        .set(updateData)
        .where(eq(notificationSettings.userId, userId))
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ error: "Notification settings not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });

  // ========================================
  // NOTIFICATION ALARMS ROUTES
  // ========================================

  // Obtener alarmas de notificación del usuario
  app.get("/api/notification-alarms/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await db
        .select()
        .from(notificationAlarms)
        .where(eq(notificationAlarms.userId, userId))
        .orderBy(desc(notificationAlarms.createdAt));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching notification alarms:", error);
      res.status(500).json({ error: "Failed to fetch notification alarms" });
    }
  });

  // Crear nueva alarma de notificación
  app.post("/api/notification-alarms", async (req, res) => {
    try {
      const validated = insertNotificationAlarmsSchema.parse(req.body);
      const result = await db.insert(notificationAlarms).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating notification alarm:", error);
      res.status(400).json({ error: "Invalid notification alarm data" });
    }
  });

  // Actualizar alarma de notificación
  app.patch("/api/notification-alarms/:alarmId", async (req, res) => {
    try {
      const { alarmId } = req.params;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const result = await db
        .update(notificationAlarms)
        .set(updateData)
        .where(eq(notificationAlarms.id, alarmId))
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ error: "Notification alarm not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating notification alarm:", error);
      res.status(500).json({ error: "Failed to update notification alarm" });
    }
  });

  // Eliminar alarma de notificación
  app.delete("/api/notification-alarms/:alarmId", async (req, res) => {
    try {
      const { alarmId } = req.params;
      const result = await db
        .delete(notificationAlarms)
        .where(eq(notificationAlarms.id, alarmId))
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ error: "Notification alarm not found" });
      }
      
      res.json({ success: true, message: "Notification alarm deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification alarm:", error);
      res.status(500).json({ error: "Failed to delete notification alarm" });
    }
  });

  // Activar/desactivar alarma de notificación
  app.patch("/api/notification-alarms/:alarmId/toggle", async (req, res) => {
    try {
      const { alarmId } = req.params;
      const { isActive } = req.body;
      
      const result = await db
        .update(notificationAlarms)
        .set({ 
          isActive: isActive,
          updatedAt: new Date()
        })
        .where(eq(notificationAlarms.id, alarmId))
        .returning();
        
      if (result.length === 0) {
        return res.status(404).json({ error: "Notification alarm not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error toggling notification alarm:", error);
      res.status(500).json({ error: "Failed to toggle notification alarm" });
    }
  });

  // SPORTS MANAGEMENT ROUTES

  // Get all sports
  app.get("/api/sports", async (req, res) => {
    try {
      const result = await db.select().from(sports).where(eq(sports.isActive, true));
      res.json(result);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ error: "Failed to fetch sports" });
    }
  });

  // Get sport by ID
  app.get("/api/sports/:sportId", async (req, res) => {
    try {
      const { sportId } = req.params;
      const result = await db.select().from(sports).where(eq(sports.id, sportId));
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Sport not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching sport:", error);
      res.status(500).json({ error: "Failed to fetch sport" });
    }
  });

  // Create new sport (Admin only)
  app.post("/api/sports", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const sportData = {
        ...req.body,
        createdBy: userId
      };

      const validated = insertSportSchema.parse(sportData);
      const result = await db.insert(sports).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating sport:", error);
      res.status(400).json({ error: "Invalid sport data" });
    }
  });

  // Update sport (Admin only)
  app.patch("/api/sports/:sportId", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { sportId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await db
        .update(sports)
        .set(updateData)
        .where(eq(sports.id, sportId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Sport not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error updating sport:", error);
      res.status(500).json({ error: "Failed to update sport" });
    }
  });

  // Delete sport (Admin only)
  app.delete("/api/sports/:sportId", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { sportId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Soft delete by setting isActive to false
      const result = await db
        .update(sports)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(sports.id, sportId))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Sport not found" });
      }

      res.json({ success: true, message: "Sport deactivated successfully" });
    } catch (error) {
      console.error("Error deleting sport:", error);
      res.status(500).json({ error: "Failed to delete sport" });
    }
  });

  // SPORT TRAINER ASSIGNMENT ROUTES

  // Get trainers assigned to a sport
  app.get("/api/sports/:sportId/trainers", async (req, res) => {
    try {
      const { sportId } = req.params;
      
      const result = await db
        .select({
          assignmentId: sportTrainerAssignments.id,
          trainerId: sportTrainerAssignments.trainerId,
          trainerName: profiles.fullName,
          trainerEmail: profiles.email,
          assignedAt: sportTrainerAssignments.assignedAt,
          isActive: sportTrainerAssignments.isActive
        })
        .from(sportTrainerAssignments)
        .leftJoin(profiles, eq(profiles.id, sportTrainerAssignments.trainerId))
        .where(and(
          eq(sportTrainerAssignments.sportId, sportId),
          eq(sportTrainerAssignments.isActive, true)
        ));

      res.json(result);
    } catch (error) {
      console.error("Error fetching sport trainers:", error);
      res.status(500).json({ error: "Failed to fetch sport trainers" });
    }
  });

  // Assign trainer to sport (Admin only)
  app.post("/api/sports/:sportId/trainers", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { sportId } = req.params;
      const { trainerId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Check if assignment already exists
      const existing = await db
        .select()
        .from(sportTrainerAssignments)
        .where(and(
          eq(sportTrainerAssignments.sportId, sportId),
          eq(sportTrainerAssignments.trainerId, trainerId),
          eq(sportTrainerAssignments.isActive, true)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ error: "Trainer already assigned to this sport" });
      }

      const assignmentData = {
        sportId,
        trainerId,
        assignedBy: userId
      };

      const validated = insertSportTrainerAssignmentSchema.parse(assignmentData);
      const result = await db.insert(sportTrainerAssignments).values(validated).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error assigning trainer to sport:", error);
      res.status(400).json({ error: "Failed to assign trainer to sport" });
    }
  });

  // Remove trainer from sport (Admin only)
  app.delete("/api/sports/:sportId/trainers/:trainerId", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const { sportId, trainerId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = await db
        .update(sportTrainerAssignments)
        .set({ 
          isActive: false,
          assignedAt: new Date()
        })
        .where(and(
          eq(sportTrainerAssignments.sportId, sportId),
          eq(sportTrainerAssignments.trainerId, trainerId)
        ))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      res.json({ success: true, message: "Trainer removed from sport successfully" });
    } catch (error) {
      console.error("Error removing trainer from sport:", error);
      res.status(500).json({ error: "Failed to remove trainer from sport" });
    }
  });

  // Get sports assigned to a trainer
  app.get("/api/trainers/:trainerId/sports", async (req, res) => {
    try {
      const { trainerId } = req.params;
      
      const result = await db
        .select({
          assignmentId: sportTrainerAssignments.id,
          sportId: sports.id,
          sportName: sports.name,
          sportDescription: sports.description,
          belts: sports.belts,
          genderCategories: sports.genderCategories,
          ageCategories: sports.ageCategories,
          assignedAt: sportTrainerAssignments.assignedAt
        })
        .from(sportTrainerAssignments)
        .leftJoin(sports, eq(sports.id, sportTrainerAssignments.sportId))
        .where(and(
          eq(sportTrainerAssignments.trainerId, trainerId),
          eq(sportTrainerAssignments.isActive, true),
          eq(sports.isActive, true)
        ));

      res.json(result);
    } catch (error) {
      console.error("Error fetching trainer sports:", error);
      res.status(500).json({ error: "Failed to fetch trainer sports" });
    }
  });

  // ========================================
  // ADMIN ATHLETE MANAGEMENT ROUTES
  // ========================================

  // Get all athletes with comprehensive stats for admin management
  app.get("/api/admin/athletes", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if user is admin
      const userRole = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId));

      if (!userRole.length || !userRole.some(r => r.role === 'admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get all athletes (users with 'deportista' role) with their stats
      const athletes = await db
        .select({
          id: profiles.id,
          full_name: profiles.fullName,
          email: profiles.email,
          club_name: profiles.clubName,
          current_belt: profiles.currentBelt,
          gender: profiles.gender,
          competition_category: profiles.competitionCategory,
          injuries: profiles.injuries,
          injury_description: profiles.injuryDescription,
          profile_image_url: profiles.profileImageUrl,
        })
        .from(profiles)
        .leftJoin(userRoles, eq(userRoles.userId, profiles.id))
        .where(eq(userRoles.role, 'deportista'));

      // Get trainer assignments for each athlete
      const trainerAssignments = await db
        .select({
          studentId: trainerAssignments.studentId,
          trainerId: trainerAssignments.trainerId,
          assigned_at: trainerAssignments.assignedAt,
          trainerName: profiles.fullName,
          trainerEmail: profiles.email,
        })
        .from(trainerAssignments)
        .leftJoin(profiles, eq(profiles.id, trainerAssignments.trainerId));

      // Get training session counts for activity status
      const trainingCounts = await db
        .select({
          userId: trainingSessions.userId,
          sessionCount: sql<number>`count(*)::int`.as('sessionCount'),
        })
        .from(trainingSessions)
        .where(gte(trainingSessions.date, sql`current_date - interval '7 days'`))
        .groupBy(trainingSessions.userId);

      // Get technique counts
      const techniqueCounts = await db
        .select({
          userId: techniques.userId,
          techniqueCount: sql<number>`count(*)::int`.as('techniqueCount'),
        })
        .from(techniques)
        .groupBy(techniques.userId);

      // Get tactical notes counts
      const tacticalCounts = await db
        .select({
          userId: tacticalNotes.userId,
          tacticalCount: sql<number>`count(*)::int`.as('tacticalCount'),
        })
        .from(tacticalNotes)
        .groupBy(tacticalNotes.userId);

      // Get latest weight entries
      const latestWeights = await db
        .select({
          userId: weightEntries.userId,
          weight: weightEntries.weight,
          date: weightEntries.date,
        })
        .from(weightEntries)
        .where(
          sql`(user_id, date) IN (
            SELECT user_id, MAX(date) 
            FROM weight_entries 
            GROUP BY user_id
          )`
        );

      // Get latest training sessions
      const latestSessions = await db
        .select({
          userId: trainingSessions.userId,
          session_type: trainingSessions.sessionType,
          date: trainingSessions.date,
        })
        .from(trainingSessions)
        .where(
          sql`(user_id, date) IN (
            SELECT user_id, MAX(date) 
            FROM training_sessions 
            GROUP BY user_id
          )`
        );

      // Combine all data
      const athletesWithStats = athletes.map(athlete => {
        const trainerAssignment = trainerAssignments.find(ta => ta.studentId === athlete.id);
        const weeklySessionsCount = trainingCounts.find(tc => tc.userId === athlete.id)?.sessionCount || 0;
        const totalTechniques = techniqueCounts.find(tc => tc.userId === athlete.id)?.techniqueCount || 0;
        const totalTacticalNotes = tacticalCounts.find(tc => tc.userId === athlete.id)?.tacticalCount || 0;
        const lastWeightEntry = latestWeights.find(lw => lw.userId === athlete.id);
        const lastTrainingSession = latestSessions.find(ls => ls.userId === athlete.id);

        // Determine activity status based on weekly sessions
        let activityStatus: 'active' | 'moderate' | 'inactive' = 'inactive';
        if (weeklySessionsCount >= 3) {
          activityStatus = 'active';
        } else if (weeklySessionsCount >= 1) {
          activityStatus = 'moderate';
        }

        return {
          ...athlete,
          activityStatus,
          weeklySessionsCount,
          totalTechniques,
          totalTacticalNotes,
          trainer: trainerAssignment ? {
            id: trainerAssignment.trainerId,
            full_name: trainerAssignment.trainerName,
            email: trainerAssignment.trainerEmail,
            assigned_at: trainerAssignment.assigned_at?.toISOString(),
          } : undefined,
          trainer_name: trainerAssignment?.trainerName,
          trainer_email: trainerAssignment?.trainerEmail,
          assigned_at: trainerAssignment?.assigned_at?.toISOString(),
          lastWeightEntry: lastWeightEntry ? {
            weight: Number(lastWeightEntry.weight),
            date: lastWeightEntry.date,
          } : undefined,
          lastTrainingSession: lastTrainingSession ? {
            session_type: lastTrainingSession.session_type,
            date: lastTrainingSession.date,
          } : undefined,
        };
      });

      res.json(athletesWithStats);
    } catch (error) {
      console.error("Error fetching admin athletes data:", error);
      res.status(500).json({ error: "Failed to fetch athletes data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
