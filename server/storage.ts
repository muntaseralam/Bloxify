import { users, type User, type InsertUser, type UpdateUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(username: string, data: Partial<UpdateUser>): Promise<User | undefined>;
  generateTokenForUser(username: string): Promise<string | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usersByUsername: Map<string, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.usersByUsername = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const username = insertUser.username.toLowerCase();
    
    // Create a new user object
    const user: User = {
      id,
      username,
      gameCompleted: false,
      adsWatched: 0,
      token: null,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    this.usersByUsername.set(username, user);
    return user;
  }

  async updateUser(username: string, data: Partial<UpdateUser>): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(user.id, updatedUser);
    this.usersByUsername.set(username.toLowerCase(), updatedUser);
    return updatedUser;
  }

  async generateTokenForUser(username: string): Promise<string | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    if (!user.gameCompleted || user.adsWatched < 15) {
      return undefined;
    }
    
    // Generate a unique token
    const token = `BLOX-${this.generateRandomString(4)}-${this.generateRandomString(4)}-${this.generateRandomString(4)}`;
    
    // Update the user with the token
    await this.updateUser(username, { token });
    
    return token;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const storage = new MemStorage();
