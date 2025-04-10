import { users, type User, type InsertUser, type UpdateUser } from "@shared/schema";

export interface StatisticsResult {
  totalAdsWatched: number;
  totalTokensEarned: number;
  totalCodesRedeemed: number;
}

export interface UserRegistrationStats {
  newUsersCount: number;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(username: string, data: Partial<UpdateUser>): Promise<User | undefined>;
  generateTokenForUser(username: string): Promise<string | undefined>;
  canUserCompleteQuestToday(username: string): Promise<boolean>;
  
  // Role management methods
  updateUserRole(username: string, role: "user" | "admin" | "owner"): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Statistics methods
  getStatisticsForToday(): Promise<StatisticsResult>;
  getStatisticsForDate(date: Date): Promise<StatisticsResult>;
  getStatisticsForMonth(year: number, month: number): Promise<StatisticsResult>;
  getStatisticsForYear(year: number): Promise<StatisticsResult>;
  
  // User Registration Statistics methods
  getUserRegistrationsForToday(): Promise<UserRegistrationStats>;
  getUserRegistrationsForDate(date: Date): Promise<UserRegistrationStats>;
  getUserRegistrationsForMonth(year: number, month: number): Promise<UserRegistrationStats>;
  getUserRegistrationsForYear(year: number): Promise<UserRegistrationStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usersByUsername: Map<string, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.usersByUsername = new Map();
    this.currentId = 1;
    
    // Initialize with the default owner account
    const defaultOwner: User = {
      id: this.currentId++,
      username: "RAFID",
      password: "Rafid@2009",
      role: "owner",
      gameCompleted: false,
      adsWatched: 0,
      tokenCount: 0,
      token: null,
      isTokenRedeemed: false,
      lastQuestCompletedAt: null,
      dailyQuestCount: 0,
      createdAt: new Date(),
    };
    
    this.users.set(defaultOwner.id, defaultOwner);
    this.usersByUsername.set(defaultOwner.username, defaultOwner);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const username = insertUser.username;
    const password = insertUser.password;
    // Always assign "user" role for new registrations, regardless of what's provided
    const role = "user";
    
    // Create a new user object
    const user: User = {
      id,
      username,
      password,
      role,
      gameCompleted: false,
      adsWatched: 0,
      tokenCount: 0,
      token: null,
      isTokenRedeemed: false,
      lastQuestCompletedAt: null,
      dailyQuestCount: 0,
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
    this.usersByUsername.set(username, updatedUser);
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

  public generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  async canUserCompleteQuestToday(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return true; // New users can always complete the quest
    
    // If user has no last completion date, they can complete the quest
    if (!user.lastQuestCompletedAt) return true;
    
    // Check if the last completion was today
    const lastCompleted = new Date(user.lastQuestCompletedAt);
    const now = new Date();
    
    // Reset quest count if it's a new day (compare year, month, day)
    const isNewDay = 
      lastCompleted.getFullYear() !== now.getFullYear() ||
      lastCompleted.getMonth() !== now.getMonth() ||
      lastCompleted.getDate() !== now.getDate();
    
    if (isNewDay) {
      // Reset the daily quest count to 0 if it's a new day
      await this.updateUser(username, { dailyQuestCount: 0 });
      return true;
    }
    
    // Check if the user has completed fewer than 5 quests today
    return (user.dailyQuestCount || 0) < 5;
  }

  /**
   * Helper method to check if a date is the same day as another date
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Helper method to check if a date is in the same month as another date
   */
  private isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  /**
   * Helper method to check if a date is in the same year as another date
   */
  private isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  }

  /**
   * Get statistics for today
   */
  async getStatisticsForToday(): Promise<StatisticsResult> {
    const today = new Date();
    return this.getStatisticsForDate(today);
  }

  /**
   * Get statistics for a specific date
   */
  async getStatisticsForDate(date: Date): Promise<StatisticsResult> {
    let totalAdsWatched = 0;
    let totalTokensEarned = 0;
    let totalCodesRedeemed = 0;

    // Iterate through all users and calculate statistics
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.lastQuestCompletedAt && this.isSameDay(new Date(user.lastQuestCompletedAt), date)) {
        totalAdsWatched += user.adsWatched || 0;
        
        // If user completed quest today
        if (user.dailyQuestCount) {
          totalTokensEarned += user.dailyQuestCount;
        }
        
        // Count redeemed tokens
        if (user.isTokenRedeemed && user.token) {
          totalCodesRedeemed++;
        }
      }
    });

    return { totalAdsWatched, totalTokensEarned, totalCodesRedeemed };
  }

  /**
   * Get statistics for a specific month of a year
   */
  async getStatisticsForMonth(year: number, month: number): Promise<StatisticsResult> {
    let totalAdsWatched = 0;
    let totalTokensEarned = 0;
    let totalCodesRedeemed = 0;

    const targetDate = new Date(year, month);

    // Iterate through all users and calculate statistics
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.lastQuestCompletedAt) {
        const lastQuestDate = new Date(user.lastQuestCompletedAt);
        
        if (this.isSameMonth(lastQuestDate, targetDate)) {
          totalAdsWatched += user.adsWatched || 0;
          
          // Add tokens earned this month
          if (user.tokenCount) {
            totalTokensEarned += user.tokenCount;
          }
          
          // Count redeemed tokens
          if (user.isTokenRedeemed && user.token) {
            totalCodesRedeemed++;
          }
        }
      }
    });

    return { totalAdsWatched, totalTokensEarned, totalCodesRedeemed };
  }

  /**
   * Get statistics for a specific year
   */
  async getStatisticsForYear(year: number): Promise<StatisticsResult> {
    let totalAdsWatched = 0;
    let totalTokensEarned = 0;
    let totalCodesRedeemed = 0;

    const targetDate = new Date(year, 0);

    // Iterate through all users and calculate statistics
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.lastQuestCompletedAt) {
        const lastQuestDate = new Date(user.lastQuestCompletedAt);
        
        if (this.isSameYear(lastQuestDate, targetDate)) {
          totalAdsWatched += user.adsWatched || 0;
          
          // Add tokens earned this year
          if (user.tokenCount) {
            totalTokensEarned += user.tokenCount;
          }
          
          // Count redeemed tokens
          if (user.isTokenRedeemed && user.token) {
            totalCodesRedeemed++;
          }
        }
      }
    });

    return { totalAdsWatched, totalTokensEarned, totalCodesRedeemed };
  }

  /**
   * Get user registrations for today
   */
  async getUserRegistrationsForToday(): Promise<UserRegistrationStats> {
    const today = new Date();
    return this.getUserRegistrationsForDate(today);
  }

  /**
   * Get user registrations for a specific date
   */
  async getUserRegistrationsForDate(date: Date): Promise<UserRegistrationStats> {
    let newUsersCount = 0;

    // Iterate through all users and count registrations for the specified date
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.createdAt && this.isSameDay(new Date(user.createdAt), date)) {
        newUsersCount++;
      }
    });

    return { newUsersCount };
  }

  /**
   * Get user registrations for a specific month
   */
  async getUserRegistrationsForMonth(year: number, month: number): Promise<UserRegistrationStats> {
    let newUsersCount = 0;
    const targetDate = new Date(year, month);

    // Iterate through all users and count registrations for the specified month
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        if (this.isSameMonth(createdDate, targetDate)) {
          newUsersCount++;
        }
      }
    });

    return { newUsersCount };
  }

  /**
   * Get user registrations for a specific year
   */
  async getUserRegistrationsForYear(year: number): Promise<UserRegistrationStats> {
    let newUsersCount = 0;
    const targetDate = new Date(year, 0);

    // Iterate through all users and count registrations for the specified year
    Array.from(this.usersByUsername.values()).forEach(user => {
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        if (this.isSameYear(createdDate, targetDate)) {
          newUsersCount++;
        }
      }
    });

    return { newUsersCount };
  }

  /**
   * Update a user's role
   * @param username The username of the user to update
   * @param role The new role to assign
   * @returns The updated user or undefined if not found
   */
  async updateUserRole(username: string, role: "user" | "admin" | "owner"): Promise<User | undefined> {
    return this.updateUser(username, { role });
  }

  /**
   * Get all users in the system
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersByUsername.values());
  }
}

export const storage = new MemStorage();
