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
      
      // Check if user has completed requirements
      if (!user.gameCompleted) {
        return res.status(400).json({ message: "You must complete the game first" });
      }
      
      // Temporary fix - allow token generation even if ads aren't fully watched (for demo)
      if (user.adsWatched < 15) {
        // Update user to mark all ads as watched
        await storage.updateUser(username, { adsWatched: 15 });
      }
      
      // If user already has a token, return it
      if (user.token) {
        return res.json({ token: user.token });
      }
      
      // Generate token
      const token = await storage.generateTokenForUser(username);
      
      if (!token) {
        return res.status(500).json({ message: "Failed to generate token" });
      }
      
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
        // Here you could optionally mark the token as redeemed
        // by setting it to null or adding a "redeemed" flag
        
        return res.json({ 
          success: true, 
          message: "Token verified successfully",
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
