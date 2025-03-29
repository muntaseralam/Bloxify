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
      
      if (user.adsWatched < 15) {
        return res.status(400).json({ 
          message: `You must watch all 15 ads (${user.adsWatched}/15 watched)`
        });
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
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
