import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  profiles, userRoles, clubs, trainerAssignments, trainingSessions, 
  exercises, exerciseRecords, weightEntries, nutritionEntries, 
  techniques, tacticalNotes, randoriSessions,
  insertProfileSchema, insertUserRoleSchema, insertClubSchema,
  insertTrainerAssignmentSchema, insertTrainingSessionSchema,
  insertExerciseSchema, insertExerciseRecordSchema, insertWeightEntrySchema,
  insertNutritionEntrySchema, insertTechniqueSchema, insertTacticalNoteSchema,
  insertRandoriSessionSchema
} from "@shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication and User Management
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await db.select().from(profiles).where(eq(profiles.id, userId));
      const userWithRoles = await db
        .select({
          profile: profiles,
          role: userRoles.role
        })
        .from(profiles)
        .leftJoin(userRoles, eq(profiles.id, userRoles.userId))
        .where(eq(profiles.id, userId));

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: user[0],
        session: { user: user[0] },
        roles: userWithRoles.map(r => r.role).filter(Boolean)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // User Profiles
  app.get("/api/profiles", async (req, res) => {
    try {
      const result = await db.select().from(profiles);
      res.json(result);
    } catch (error) {
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
        .leftJoin(profiles, eq(userRoles.userId, profiles.id));
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

  // File Upload (for Supabase Storage replacement)
  app.post("/api/upload", async (req, res) => {
    try {
      // This would typically integrate with a file storage service
      // For now, return a placeholder response
      res.json({ 
        message: "File upload endpoint - integrate with your preferred storage service",
        url: "/api/placeholder-file-url"
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
