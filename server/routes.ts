import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, StatisticsResult } from "./storage";
import { insertUserSchema, updateUserSchema, User, UserRole } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Middleware to check if the user has the required role
const requireRole = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the authenticated user from request (you might need to adjust this based on how you handle authentication)
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Extract username from auth header (Basic Auth format: "Basic username:password")
      const encodedCredentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
      const [username] = decodedCredentials.split(':');
      
      // Get the user from storage
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and has the required role
      if (!user || !roles.includes(user.role as UserRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Attach the user to the request for later use
      (req as any).user = user;
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current logged-in user (session check)
  app.get("/api/users/me", async (req, res) => {
    // In a real app, this would check session/cookie data for current user
    // For now, we'll simulate "no session" behavior as we're using client state
    res.status(404).json({ message: "User not found" });
  });
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        // If user exists, prevent registration and suggest login
        return res.status(409).json({ 
          message: "Account already exists. Please log in instead." 
        });
      }

      // Create new user
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Login endpoint
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Reset quest state when user logs in
      const canCompleteToday = await storage.canUserCompleteQuestToday(username);

      if (user) {
        // Check daily quest count with null safety
        const dailyQuestCount = user.dailyQuestCount ?? 0;

        // If user has already completed their quests for today, just return the existing user
        if (!canCompleteToday && dailyQuestCount >= 5) {
          return res.json(user);
        }

        // Otherwise, allow them to start fresh quests with game state reset
        const updatedUser = await storage.updateUser(username, {
          gameCompleted: false,
          adsWatched: 0
        });

        return res.json(updatedUser || user);
      }

      res.status(404).json({ message: "User not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get user by username
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  // Update user progress (game completion, ads watched)
  app.patch("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const updateData = updateUserSchema.partial().parse(req.body);

      // Get current user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has completed the quest requirements for a new token
      if (user.gameCompleted && 
          updateData.adsWatched !== undefined && 
          updateData.adsWatched >= 15 && 
          user.adsWatched < 15) {

        const canCompleteToday = await storage.canUserCompleteQuestToday(username);

        if (canCompleteToday) {
          // Add a token to their count
          updateData.tokenCount = (user.tokenCount || 0) + 1;
          updateData.lastQuestCompletedAt = new Date();
          updateData.dailyQuestCount = (user.dailyQuestCount || 0) + 1;
        }
      }
      // Also handle case where game completion is the last step
      else if (updateData.gameCompleted === true && 
               !user.gameCompleted && 
               user.adsWatched >= 15) {

        const canCompleteToday = await storage.canUserCompleteQuestToday(username);

        if (canCompleteToday) {
          // Add a token to their count
          updateData.tokenCount = (user.tokenCount || 0) + 1;
          updateData.lastQuestCompletedAt = new Date();
          updateData.dailyQuestCount = (user.dailyQuestCount || 0) + 1;
        }
      }

      const updatedUser = await storage.updateUser(username, updateData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Generate token for user when they redeem their accumulated tokens
  app.post("/api/users/:username/token", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has the minimum token count required (10)
      if ((user.tokenCount || 0) < 10) {
        return res.status(400).json({ 
          message: `You need at least 10 tokens to redeem. You currently have ${user.tokenCount || 0} tokens.`,
          tokensNeeded: 10 - (user.tokenCount || 0)
        });
      }

      // If user already has a token that hasn't been redeemed, return it
      if (user.token && !user.isTokenRedeemed) {
        return res.json({ 
          token: user.token,
          message: "You already have an active redemption code."
        });
      }

      // Generate a unique token
      const token = `BLUX-${storage.generateRandomString(4)}-${storage.generateRandomString(4)}-${storage.generateRandomString(4)}`;

      // Update user with the redemption token and reset token count
      await storage.updateUser(username, {
        token,
        isTokenRedeemed: false,
        tokenCount: (user.tokenCount || 0) - 10 // Deduct 10 tokens for redemption
      });

      res.json({ 
        token,
        message: "Successfully generated redemption code for 10 tokens.",
        remainingTokens: (user.tokenCount || 0) - 10
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Verify token (for Roblox game integration)
  app.post("/api/verify-token", async (req, res) => {
    try {
      const { username, token } = req.body;

      if (!username || !token) {
        return res.status(400).json({ 
          success: false, 
          message: "Username and token are required" 
        });
      }

      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Check if the token matches and is valid
      if (user.token === token) {
        // Check if the token has been redeemed already
        if (user.isTokenRedeemed === true) {
          return res.status(400).json({
            success: false,
            message: "Token has already been redeemed"
          });
        }

        // Mark the token as redeemed
        await storage.updateUser(username, { isTokenRedeemed: true });

        return res.json({ 
          success: true, 
          message: "Token verified and redeemed successfully",
          username: user.username
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid token" 
        });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to verify token" 
      });
    }
  });

  // Role-based User Management API Endpoints
  
  // Get all users (admin and owner only)
  app.get("/api/admin/users", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Return user data without sensitive information
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        tokenCount: user.tokenCount,
        adsWatched: user.adsWatched,
        gameCompleted: user.gameCompleted,
        dailyQuestCount: user.dailyQuestCount,
        lastQuestCompletedAt: user.lastQuestCompletedAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user role (owner only can change to any role, admin can only promote to admin)
  app.patch("/api/admin/users/:username/role", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      console.log("Role update request received");
      const { username } = req.params;
      console.log("Request params:", req.params);
      console.log("Request body:", req.body);
      const { role } = req.body;
      
      // Type validation for role
      if (!role || !["user", "admin", "owner"].includes(role)) {
        console.log("Invalid role:", role);
        return res.status(400).json({ message: "Invalid role. Must be 'user', 'admin', or 'owner'." });
      }
      
      // Get current authenticated user
      const authUser = (req as any).user as User;
      console.log("Auth user:", authUser.username, "with role:", authUser.role);
      
      // Only owner can promote to owner role
      if (role === "owner" && authUser.role !== "owner") {
        console.log("Permission denied: Non-owner trying to set owner role");
        return res.status(403).json({ message: "Only owners can promote users to owner role" });
      }
      
      // Admin can only promote to admin, not owner
      if (authUser.role === "admin" && role === "owner") {
        console.log("Permission denied: Admin trying to set owner role");
        return res.status(403).json({ message: "Admins cannot promote users to owner role" });
      }
      
      // Get user before update to check current role
      const userBeforeUpdate = await storage.getUserByUsername(username);
      console.log("User before update:", userBeforeUpdate?.username, "with role:", userBeforeUpdate?.role);
      
      if (!userBeforeUpdate) {
        console.log("User not found:", username);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the role change
      console.log(`Updating user ${username} role from ${userBeforeUpdate.role} to ${role}`);
      
      // Update the user's role
      const updatedUser = await storage.updateUserRole(username, role as UserRole);
      
      if (!updatedUser) {
        console.log("Update failed, user not found after update");
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Role update successful:", updatedUser.username, "new role:", updatedUser.role);
      
      res.json({ 
        message: `User ${username} role updated to ${role}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Check current authenticated user role
  app.get("/api/auth/role", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ 
          isAuthenticated: false, 
          message: "Authentication required" 
        });
      }
      
      // Extract username and password from auth header
      const encodedCredentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
      const [username, password] = decodedCredentials.split(':');
      
      // Get the user from storage
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and password matches
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          isAuthenticated: false, 
          message: "Invalid credentials" 
        });
      }
      
      // Return the user's role
      res.json({
        isAuthenticated: true,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ 
        isAuthenticated: false, 
        message: "Authentication error" 
      });
    }
  });
  
  // Admin Statistics API Endpoints
  
  // Get statistics for today
  app.get("/api/admin/statistics/today", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const stats = await storage.getStatisticsForToday();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's statistics:", error);
      res.status(500).json({ message: "Failed to fetch statistics for today" });
    }
  });

  // Get statistics for a specific date
  app.get("/api/admin/statistics/date/:date", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const stats = await storage.getStatisticsForDate(date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics for specific date:", error);
      res.status(500).json({ message: "Failed to fetch statistics for the specified date" });
    }
  });

  // Get statistics for a specific month
  app.get("/api/admin/statistics/month/:year/:month", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // Adjust for 0-based months in JavaScript
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid year or month format. Month should be 1-12" });
      }
      
      const stats = await storage.getStatisticsForMonth(year, month);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics for specific month:", error);
      res.status(500).json({ message: "Failed to fetch statistics for the specified month" });
    }
  });

  // Get statistics for a specific year
  app.get("/api/admin/statistics/year/:year", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      
      if (isNaN(year)) {
        return res.status(400).json({ message: "Invalid year format" });
      }
      
      const stats = await storage.getStatisticsForYear(year);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics for specific year:", error);
      res.status(500).json({ message: "Failed to fetch statistics for the specified year" });
    }
  });

  // User Registration Statistics API Endpoints
  
  // Get user registrations for today
  app.get("/api/admin/registrations/today", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const stats = await storage.getUserRegistrationsForToday();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's user registrations:", error);
      res.status(500).json({ message: "Failed to fetch user registrations for today" });
    }
  });

  // Get user registrations for a specific date
  app.get("/api/admin/registrations/date/:date", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const dateStr = req.params.date;
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
      }
      
      const stats = await storage.getUserRegistrationsForDate(date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user registrations for specific date:", error);
      res.status(500).json({ message: "Failed to fetch user registrations for the specified date" });
    }
  });

  // Get user registrations for a specific month
  app.get("/api/admin/registrations/month/:year/:month", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month) - 1; // Adjust for 0-based months in JavaScript
      
      if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
        return res.status(400).json({ message: "Invalid year or month format. Month should be 1-12" });
      }
      
      const stats = await storage.getUserRegistrationsForMonth(year, month);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user registrations for specific month:", error);
      res.status(500).json({ message: "Failed to fetch user registrations for the specified month" });
    }
  });

  // Get user registrations for a specific year
  app.get("/api/admin/registrations/year/:year", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      
      if (isNaN(year)) {
        return res.status(400).json({ message: "Invalid year format" });
      }
      
      const stats = await storage.getUserRegistrationsForYear(year);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user registrations for specific year:", error);
      res.status(500).json({ message: "Failed to fetch user registrations for the specified year" });
    }
  });

  // User Management API Endpoints
  
  // Get all users
  app.get("/api/admin/users", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get a specific user by ID
  app.get("/api/admin/users/:id", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // This duplicate route handler was removed to fix the issue with role updates
  // The primary handler is already defined at the beginning of the file

  const httpServer = createServer(app);
  return httpServer;
}