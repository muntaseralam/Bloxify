import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, StatisticsResult } from "./storage";
import { insertUserSchema, updateUserSchema, insertReferralSchema, updateReferralSchema, User, UserRole, Referral } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { robloxApi } from "./robloxApi";

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
          message: "Account already exists. Please log in." 
        });
      }
      
      // Skip Roblox username validation for the owner account
      if (userData.username !== "minecraftgamer523653") {
        // Verify that the Roblox username exists for regular users
        const isValidRobloxUsername = await robloxApi.isValidRobloxUsername(userData.username);
        
        if (!isValidRobloxUsername) {
          return res.status(400).json({ 
            message: "Roblox username does not exist." 
          });
        }
      }

      // Create new user
      const newUser = await storage.createUser(userData);
      
      // Check if the user has a VIP gamepass
      try {
        const hasVIPGamepass = await robloxApi.hasVIPGamepass(userData.username);
        
        // If they have the gamepass, grant VIP status
        if (hasVIPGamepass) {
          const updatedUser = await storage.updateVIPStatus(userData.username, true, 7);
          console.log(`VIP status granted to new user ${userData.username} from gamepass ownership`);
          return res.status(201).json(updatedUser || newUser);
        }
      } catch (error) {
        console.error(`Error checking VIP gamepass for new user ${userData.username}:`, error);
        // Continue with registration even if gamepass check fails
      }
      
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
      
      // Check if username exists in our database
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Skip Roblox username validation for the owner account
      if (user.role !== "owner") {
        // Verify that the Roblox username still exists for regular users
        const isValidRobloxUsername = await robloxApi.isValidRobloxUsername(username);
        
        if (!isValidRobloxUsername) {
          return res.status(401).json({ 
            message: "Roblox username no longer exists. Please contact support." 
          });
        }
      }

      // Check VIP status (update if expired)
      await storage.checkAndUpdateVIPStatus(username);

      // Check for Roblox VIP gamepass ownership
      try {
        const hasVIPGamepass = await robloxApi.hasVIPGamepass(username);
        
        // If they have the gamepass but aren't marked as VIP, grant VIP status
        if (hasVIPGamepass && !user.isVIP) {
          await storage.updateVIPStatus(username, true, 7);
          console.log(`VIP status granted to ${username} from gamepass ownership`);
        }
      } catch (error) {
        console.error(`Error checking VIP gamepass for ${username}:`, error);
        // Continue with login even if gamepass check fails
      }

      // Reset quest state when user logs in
      const canCompleteToday = await storage.canUserCompleteQuestToday(username);

      // Get the latest user after potential VIP status update
      const updatedUser = await storage.getUserByUsername(username);
      
      if (updatedUser) {
        // Check daily quest count with null safety
        const dailyQuestCount = updatedUser.dailyQuestCount ?? 0;
        const isVIP = updatedUser.isVIP || false;
        
        // If user has already completed their quests for today and they're not VIP, just return the existing user
        // VIP users get unlimited daily quests
        if (!canCompleteToday && dailyQuestCount >= 5 && !isVIP) {
          return res.json(updatedUser);
        }

        // Otherwise, allow them to start fresh quests with game state reset
        const refreshedUser = await storage.updateUser(username, {
          gameCompleted: false,
          adsWatched: 0
        });

        return res.json(refreshedUser || updatedUser);
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

      // First, check and update VIP status
      await storage.checkAndUpdateVIPStatus(username);
      
      // Get fresh user data after VIP check
      const updatedUser = await storage.getUserByUsername(username);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Determine minimum token requirement based on VIP status
      const minTokensRequired = updatedUser.isVIP ? 1 : 10;

      // Check if user has the minimum token count required
      if ((updatedUser.tokenCount || 0) < minTokensRequired) {
        return res.status(400).json({ 
          message: `You need at least ${minTokensRequired} tokens to redeem. You currently have ${updatedUser.tokenCount || 0} tokens.`,
          tokensNeeded: minTokensRequired - (updatedUser.tokenCount || 0),
          isVIP: updatedUser.isVIP || false
        });
      }

      // If user already has a token that hasn't been redeemed, return it
      if (updatedUser.token && !updatedUser.isTokenRedeemed) {
        return res.json({ 
          token: updatedUser.token,
          message: "You already have an active redemption code.",
          isVIP: updatedUser.isVIP || false
        });
      }

      // Generate a unique token
      const token = `BLUX-${storage.generateRandomString(4)}-${storage.generateRandomString(4)}-${storage.generateRandomString(4)}`;

      // Update user with the redemption token and reset token count
      await storage.updateUser(username, {
        token,
        isTokenRedeemed: false,
        tokenCount: (updatedUser.tokenCount || 0) - minTokensRequired // Deduct tokens for redemption
      });

      res.json({ 
        token,
        message: `Successfully generated redemption code for ${minTokensRequired} tokens.`,
        remainingTokens: (updatedUser.tokenCount || 0) - minTokensRequired,
        isVIP: updatedUser.isVIP || false
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Check VIP gamepass ownership
  app.post("/api/users/:username/check-vip", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Verify user exists
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if the user has the VIP gamepass
      const hasVIPGamepass = await robloxApi.hasVIPGamepass(username);
      
      // If they have the gamepass but aren't marked as VIP, update their status
      if (hasVIPGamepass && !user.isVIP) {
        // Grant VIP for 7 days
        const updatedUser = await storage.updateVIPStatus(username, true, 7);
        
        return res.json({
          hasVIP: true,
          message: "VIP status granted from gamepass ownership!",
          vipExpiresAt: updatedUser?.vipExpiresAt
        });
      } 
      // If they don't have the gamepass but are marked as VIP, check if it's from another source
      else if (!hasVIPGamepass && user.isVIP) {
        // Check if VIP has expired
        const isStillVIP = await storage.checkAndUpdateVIPStatus(username);
        
        // Get the latest user data
        const updatedUser = await storage.getUserByUsername(username);
        
        return res.json({
          hasVIP: isStillVIP,
          message: isStillVIP ? "VIP status is active from another source." : "VIP status has expired.",
          vipExpiresAt: updatedUser?.vipExpiresAt
        });
      }
      // Return appropriate status
      else {
        return res.json({
          hasVIP: user.isVIP || false,
          message: hasVIPGamepass ? "VIP status is active." : "User does not have VIP status.",
          vipExpiresAt: user.vipExpiresAt
        });
      }
    } catch (error) {
      console.error("Error checking VIP status:", error);
      res.status(500).json({ message: "Failed to check VIP status" });
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
        lastQuestCompletedAt: user.lastQuestCompletedAt,
        isVIP: user.isVIP,
        vipExpiresAt: user.vipExpiresAt
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
      
      // Check VIP status before returning
      await storage.checkAndUpdateVIPStatus(username);
      
      // Get latest user data
      const updatedUser = await storage.getUserByUsername(username);
      if (!updatedUser) {
        return res.status(404).json({ 
          isAuthenticated: false, 
          message: "User not found" 
        });
      }
      
      // Return the user's role and VIP status
      res.json({
        isAuthenticated: true,
        username: updatedUser.username,
        role: updatedUser.role,
        isVIP: updatedUser.isVIP || false,
        vipExpiresAt: updatedUser.vipExpiresAt
      });
    } catch (error) {
      res.status(500).json({ 
        isAuthenticated: false, 
        message: "Authentication error" 
      });
    }
  });
  
  // Check user VIP status from Roblox gamepass
  app.post("/api/users/:username/check-vip", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Get the current user
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if the user owns the VIP gamepass in Roblox
      const hasVIPGamepass = await robloxApi.hasVIPGamepass(username);
      
      console.log(`Checked VIP status for ${username}: Roblox gamepass=${hasVIPGamepass}, Current VIP=${user.isVIP || false}`);
      
      // Update the user's VIP status if needed
      let updatedUser = user;
      
      if (hasVIPGamepass && !user.isVIP) {
        // User has VIP gamepass but not VIP status - update it
        const updatedUserData = await storage.updateVIPStatus(username, true);
        
        if (!updatedUserData) {
          return res.status(404).json({ message: "Failed to update user VIP status" });
        }
        
        updatedUser = updatedUserData;
        
        console.log(`Updated VIP status for ${username} to true. Expires: ${updatedUser?.vipExpiresAt}`);
        
        return res.json({
          hasVIP: true,
          vipExpiresAt: updatedUser?.vipExpiresAt,
          message: "VIP status activated based on your Roblox gamepass!"
        });
      } else if (!hasVIPGamepass && user.isVIP) {
        // User doesn't have VIP gamepass but has VIP status - this could be admin granted,
        // but we'll leave it as is since admins can grant VIP status separately
        return res.json({
          hasVIP: true,
          vipExpiresAt: user.vipExpiresAt,
          message: "You have VIP status, but no VIP gamepass detected. Your VIP may be admin granted."
        });
      } else {
        // Status is already correct
        return res.json({
          hasVIP: user.isVIP || false,
          vipExpiresAt: user.vipExpiresAt,
          message: user.isVIP 
            ? "Your VIP status is active!" 
            : "You don't have VIP status. Purchase the VIP gamepass to unlock benefits!"
        });
      }
    } catch (error) {
      console.error("Error checking VIP status:", error);
      res.status(500).json({ message: "Failed to check VIP status" });
    }
  });

  // Update user VIP status (admin and owner only)
  app.patch("/api/admin/users/:username/vip", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const { username } = req.params;
      const { isVIP, durationDays } = req.body;
      
      // Input validation
      if (typeof isVIP !== 'boolean') {
        return res.status(400).json({ message: "isVIP parameter must be a boolean value" });
      }
      
      if (durationDays !== undefined && (typeof durationDays !== 'number' || durationDays <= 0)) {
        return res.status(400).json({ message: "durationDays must be a positive number" });
      }
      
      // Get user before update
      const userBeforeUpdate = await storage.getUserByUsername(username);
      
      if (!userBeforeUpdate) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log the VIP status change
      console.log(`Updating user ${username} VIP status from ${userBeforeUpdate.isVIP} to ${isVIP}${durationDays ? ` for ${durationDays} days` : ''}`);
      
      // Update the user's VIP status
      const updatedUserData = await storage.updateVIPStatus(username, isVIP, durationDays);
      
      if (!updatedUserData) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = updatedUserData;
      
      res.json({ 
        message: `User ${username} VIP status updated to ${isVIP}${isVIP ? ` (expires: ${updatedUser.vipExpiresAt})` : ''}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          isVIP: updatedUser.isVIP,
          vipExpiresAt: updatedUser.vipExpiresAt
        }
      });
    } catch (error) {
      console.error("Error updating user VIP status:", error);
      res.status(500).json({ message: "Failed to update user VIP status" });
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

  // Test endpoint for Roblox API integration (temporary, for testing only)
  app.get("/api/test/roblox-gamepass/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Test the Roblox API integration
      const hasVIPGamepass = await robloxApi.hasVIPGamepass(username);
      
      res.json({
        username,
        hasVIPGamepass,
        gamepassId: robloxApi.vipGamepassId
      });
    } catch (error) {
      console.error("Roblox API test error:", error);
      res.status(500).json({ 
        message: "Failed to test Roblox API integration",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // =================== REFERRAL SYSTEM API ENDPOINTS ===================

  // Create a referral when a new player uses someone's referral code
  app.post("/api/referrals/create", async (req, res) => {
    try {
      const { inviterUserId, inviteeUserId, inviterUsername, inviteeUsername, referralCode } = req.body;

      // Validate required fields
      if (!inviterUserId || !inviteeUserId || !inviterUsername || !inviteeUsername || !referralCode) {
        return res.status(400).json({ 
          message: "Missing required fields: inviterUserId, inviteeUserId, inviterUsername, inviteeUsername, referralCode" 
        });
      }

      // Check if inviter exists by referral code
      const inviter = await storage.getUserByReferralCode(referralCode);
      if (!inviter) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Verify inviter UserId matches
      if (inviter.robloxUserId !== inviterUserId) {
        return res.status(400).json({ message: "Inviter UserId mismatch" });
      }

      // Check if this invitee already has a referral record
      const existingReferral = await storage.getReferralByInviteeUserId(inviteeUserId);
      if (existingReferral) {
        return res.status(409).json({ message: "Player has already been referred" });
      }

      // Create the referral record
      const referral = await storage.createReferral({
        inviterUserId,
        inviteeUserId,
        inviterUsername,
        inviteeUsername,
      });

      // Update the invitee's user record with referral info
      const invitee = await storage.getUserByRobloxUserId(inviteeUserId);
      if (invitee) {
        await storage.updateUser(invitee.username, { 
          robloxUserId: inviteeUserId,
          referredBy: referralCode 
        });
      }

      res.status(201).json({
        success: true,
        message: "Referral created successfully",
        referral: {
          id: referral.id,
          inviterUsername: referral.inviterUsername,
          inviteeUsername: referral.inviteeUsername,
          createdAt: referral.createdAt
        }
      });
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // Update invitee's token count and trigger payout logic
  app.post("/api/referrals/update-tokens", async (req, res) => {
    try {
      const { inviteeUserId, newTokenCount } = req.body;

      if (!inviteeUserId || newTokenCount === undefined) {
        return res.status(400).json({ 
          message: "Missing required fields: inviteeUserId, newTokenCount" 
        });
      }

      // Process referral payouts
      const payoutResult = await storage.processReferralPayout(inviteeUserId, newTokenCount);

      res.json({
        success: true,
        message: "Token count updated and payouts processed",
        payouts: {
          regularPayout: payoutResult.regularPayout,
          vipPayout: payoutResult.vipPayout,
          inviterUsername: payoutResult.inviterUsername
        }
      });
    } catch (error) {
      console.error("Error updating tokens and processing payouts:", error);
      res.status(500).json({ message: "Failed to update tokens and process payouts" });
    }
  });

  // Generate or get referral code for a user
  app.post("/api/referrals/generate-code", async (req, res) => {
    try {
      const { username, robloxUserId } = req.body;

      if (!username || !robloxUserId) {
        return res.status(400).json({ 
          message: "Missing required fields: username, robloxUserId" 
        });
      }

      // Get or create user
      let user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user with Roblox UserId if not set
      if (!user.robloxUserId) {
        await storage.updateUser(username, { robloxUserId });
        user = await storage.getUserByUsername(username);
      }

      // Generate referral code if user doesn't have one
      let referralCode = user?.referralCode;
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(username);
      }

      res.json({
        success: true,
        referralCode,
        message: "Referral code generated successfully"
      });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  // Get referral statistics for a user
  app.get("/api/referrals/stats/:robloxUserId", async (req, res) => {
    try {
      const robloxUserId = parseInt(req.params.robloxUserId);

      if (isNaN(robloxUserId)) {
        return res.status(400).json({ message: "Invalid Roblox UserId" });
      }

      const user = await storage.getUserByRobloxUserId(robloxUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get referral stats if this user is an invitee
      const referralAsInvitee = await storage.getReferralByInviteeUserId(robloxUserId);

      // Count referrals where this user is the inviter
      const allReferrals = Array.from((storage as any).referrals.values()) as any[];
      const referralsAsInviter = allReferrals.filter(r => r.inviterUserId === robloxUserId);

      res.json({
        success: true,
        user: {
          username: user.username,
          robloxUserId: user.robloxUserId,
          referralCode: user.referralCode,
          isVIP: user.isVIP
        },
        referralStats: {
          asInvitee: referralAsInvitee ? {
            inviterUsername: referralAsInvitee.inviterUsername,
            totalTokensEarned: referralAsInvitee.totalTokensEarnedByInvitee,
            regularPaymentMade: referralAsInvitee.regularPaymentMade
          } : null,
          asInviter: {
            totalReferrals: referralsAsInviter.length,
            totalTokensEarnedByReferrals: referralsAsInviter.reduce((sum, r) => sum + r.totalTokensEarnedByInvitee, 0),
            totalRegularPayouts: referralsAsInviter.filter(r => r.regularPaymentMade).length,
            totalVIPPayouts: referralsAsInviter.reduce((sum, r) => sum + r.vipTokensPaidOut, 0)
          }
        }
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral statistics" });
    }
  });

  // Process manual payout (admin endpoint)
  app.post("/api/admin/referrals/process-payout", requireRole(["admin", "owner"]), async (req, res) => {
    try {
      const { inviteeUserId, tokenCount } = req.body;

      if (!inviteeUserId || !tokenCount) {
        return res.status(400).json({ 
          message: "Missing required fields: inviteeUserId, tokenCount" 
        });
      }

      const payoutResult = await storage.processReferralPayout(inviteeUserId, tokenCount);

      res.json({
        success: true,
        message: "Manual payout processed successfully",
        payouts: payoutResult
      });
    } catch (error) {
      console.error("Error processing manual payout:", error);
      res.status(500).json({ message: "Failed to process manual payout" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}