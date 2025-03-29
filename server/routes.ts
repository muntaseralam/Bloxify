import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all prefixed with /api
  
  // User login/registration
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      // Create new user
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create user" });
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
      
      const updatedUser = await storage.updateUser(username, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Generate token for user
  app.post("/api/users/:username/token", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user can complete the quest today (daily limit)
      const canCompleteToday = await storage.canUserCompleteQuestToday(username);
      if (!canCompleteToday && user.token) {
        return res.status(400).json({ 
          message: "You've already completed today's quest. Come back tomorrow!",
          token: user.token  // Return existing token for convenience
        });
      }
      
      // Check if user has completed requirements
      if (!user.gameCompleted) {
        return res.status(400).json({ message: "You must complete the game first" });
      }
      
      // Temporary fix - allow token generation even if ads aren't fully watched (for demo)
      if (user.adsWatched < 15) {
        // Update user to mark all ads as watched
        await storage.updateUser(username, { adsWatched: 15 });
      }
      
      // If user already has a token from today that hasn't been redeemed, return it
      if (user.token && !user.isTokenRedeemed && !canCompleteToday) {
        return res.json({ token: user.token });
      }
      
      // For a new day, or if the previous token was redeemed, generate a new token
      // and reset the redeemed status
      const token = await storage.generateTokenForUser(username);
      
      if (!token) {
        return res.status(500).json({ message: "Failed to generate token" });
      }
      
      // Update the last quest completion time and reset redeemed status
      await storage.updateUser(username, {
        lastQuestCompletedAt: new Date(),
        isTokenRedeemed: false
      });
      
      res.json({ token });
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

  // Get leaderboard data
  app.get("/api/leaderboard", async (req, res) => {
    try {
      // For an in-memory database, we need to extract all users and sort them
      const allUsers = Array.from(storage.usersByUsername.values());
      
      // Sort by best score (highest first) and then by best time (lowest first)
      const leaderboard = allUsers
        .filter(user => user.bestScore > 0) // Only include users with scores
        .sort((a, b) => {
          // First by score (descending)
          if (b.bestScore !== a.bestScore) {
            return b.bestScore - a.bestScore;
          }
          // Then by time (ascending)
          return a.bestTime - b.bestTime;
        })
        .slice(0, 10) // Get top 10
        .map(user => ({
          username: user.username,
          bestScore: user.bestScore,
          bestTime: user.bestTime,
          isRecordHolder: user.isRecordHolder
        }));
      
      res.json({ leaderboard });
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });
  
  // Record game score and time
  app.post("/api/users/:username/score", async (req, res) => {
    try {
      const { username } = req.params;
      const { score, time } = req.body;
      
      if (typeof score !== 'number' || typeof time !== 'number') {
        return res.status(400).json({ message: "Score and time must be numbers" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if this is a new record for the user
      let isImprovedScore = false;
      let becameRecordHolder = false;
      
      if (score > user.bestScore || (score === user.bestScore && time < user.bestTime)) {
        isImprovedScore = true;
        
        // Update user's best score and time
        const updates: any = { bestScore: score, bestTime: time };
        
        // Get current record holder's score
        const allUsers = Array.from(storage.usersByUsername.values());
        const currentRecordHolder = allUsers
          .filter(u => u.isRecordHolder)
          .sort((a, b) => b.bestScore - a.bestScore)[0];
        
        // Check if this sets a new overall record
        const isNewRecord = !currentRecordHolder || 
          (score > currentRecordHolder.bestScore) ||
          (score === currentRecordHolder.bestScore && time < currentRecordHolder.bestTime);
        
        if (isNewRecord) {
          // Reset all record holders
          for (const u of allUsers) {
            if (u.isRecordHolder) {
              await storage.updateUser(u.username, { isRecordHolder: false });
            }
          }
          
          // Set this user as the new record holder
          updates.isRecordHolder = true;
          becameRecordHolder = true;
        }
        
        // Update user with new scores and record status
        await storage.updateUser(username, updates);
      }
      
      // Check if user broke the record (needs to be record holder and complete within 10 seconds)
      const isSpeedChallenge = becameRecordHolder && time <= 10000; // 10 seconds in milliseconds
      const adRequirement = isSpeedChallenge ? 10 : 15; // Reduced ad requirement for record breakers
      
      res.json({
        success: true,
        isImprovedScore,
        isSpeedChallenge,
        adRequirement,
        message: isSpeedChallenge 
          ? "Congratulations! You broke the record in under 10 seconds! Complete only 10 ads to earn your token."
          : isImprovedScore 
            ? "New personal best!" 
            : "Score recorded."
      });
      
    } catch (error) {
      console.error("Score update error:", error);
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
