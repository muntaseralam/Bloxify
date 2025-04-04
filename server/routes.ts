import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists (case-insensitive match)
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        // If user exists and this is a login attempt, validate password
        if (existingUser.password === userData.password) {
          return res.status(200).json(existingUser);
        }
        return res.status(401).json({ message: "Invalid username or password" });
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

  const httpServer = createServer(app);
  return httpServer;
}