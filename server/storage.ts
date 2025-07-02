import { users, referrals, type User, type InsertUser, type UpdateUser, type Referral, type InsertReferral, type UpdateReferral } from "@shared/schema";

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
  
  // VIP management methods
  updateVIPStatus(username: string, isVIP: boolean, durationDays?: number): Promise<User | undefined>;
  checkAndUpdateVIPStatus(username: string): Promise<boolean>;
  
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
  
  // Referral system methods
  getUserByRobloxUserId(robloxUserId: number): Promise<User | undefined>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByInviteeUserId(inviteeUserId: number): Promise<Referral | undefined>;
  updateReferral(inviteeUserId: number, data: Partial<UpdateReferral>): Promise<Referral | undefined>;
  generateReferralCode(username: string): Promise<string>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  processReferralPayout(inviteeUserId: number, newTokenCount: number): Promise<{ regularPayout: boolean; vipPayout: number; inviterUsername?: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usersByUsername: Map<string, User>;
  private referrals: Map<number, Referral>; // keyed by inviteeUserId
  private usersByRobloxId: Map<number, User>;
  private usersByReferralCode: Map<string, User>;
  currentId: number;
  currentReferralId: number;

  constructor() {
    this.users = new Map();
    this.usersByUsername = new Map();
    this.referrals = new Map();
    this.usersByRobloxId = new Map();
    this.usersByReferralCode = new Map();
    this.currentId = 1;
    this.currentReferralId = 1;
    
    // Initialize with the default owner account
    const defaultOwner: User = {
      id: this.currentId++,
      username: "minecraftgamer523653",
      password: "Rafid@2009",
      role: "owner",
      gameCompleted: false,
      adsWatched: 0,
      tokenCount: 0,
      token: null,
      isTokenRedeemed: false,
      lastQuestCompletedAt: null,
      dailyQuestCount: 0,
      isVIP: true,
      vipExpiresAt: null, // Owner has permanent VIP
      createdAt: new Date(),
      robloxUserId: null,
      referralCode: null,
      referredBy: null,
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
      isVIP: false,
      vipExpiresAt: null,
      createdAt: new Date(),
      robloxUserId: null,
      referralCode: null,
      referredBy: null,
    };
    
    this.users.set(id, user);
    this.usersByUsername.set(username, user);
    return user;
  }

  async updateUser(username: string, data: Partial<UpdateUser>): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;

    // Remove old entries from lookup maps if they're being updated
    if (user.robloxUserId && data.robloxUserId !== undefined) {
      this.usersByRobloxId.delete(user.robloxUserId);
    }
    if (user.referralCode && data.referralCode !== undefined) {
      this.usersByReferralCode.delete(user.referralCode);
    }

    const updatedUser = { ...user, ...data };
    
    // Update all lookup maps
    this.users.set(user.id, updatedUser);
    this.usersByUsername.set(username, updatedUser);
    
    // Add new entries to lookup maps
    if (updatedUser.robloxUserId) {
      this.usersByRobloxId.set(updatedUser.robloxUserId, updatedUser);
    }
    if (updatedUser.referralCode) {
      this.usersByReferralCode.set(updatedUser.referralCode, updatedUser);
    }
    
    return updatedUser;
  }

  async generateTokenForUser(username: string): Promise<string | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    if (!user.gameCompleted || user.adsWatched < 15) {
      return undefined;
    }
    
    // Check if user has enough tokens for redemption
    const requiredTokens = user.isVIP ? 1 : 10;
    if (user.tokenCount < requiredTokens) {
      return undefined;
    }
    
    // Generate a unique token
    const token = `BLOX-${this.generateRandomString(4)}-${this.generateRandomString(4)}-${this.generateRandomString(4)}`;
    
    // Deduct the required tokens and update the user with the token
    const newTokenCount = user.tokenCount - requiredTokens;
    await this.updateUser(username, { 
      token,
      tokenCount: newTokenCount,
      isTokenRedeemed: true 
    });
    
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
    
    // VIP users can always complete quests, no daily limit
    if (user.isVIP) {
      // Check if VIP status is valid
      const isVIPValid = await this.checkAndUpdateVIPStatus(username);
      if (isVIPValid) {
        return true;
      }
      // If VIP has expired, continue with regular checks below
    }
    
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
   * Update a user's VIP status
   * @param username The username of the user to update
   * @param isVIP Whether the user should have VIP status
   * @param durationDays Number of days the VIP status should last (default 7)
   * @returns The updated user or undefined if not found
   */
  async updateVIPStatus(username: string, isVIP: boolean, durationDays: number = 7): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    let vipExpiresAt = null;
    
    if (isVIP) {
      // Set VIP expiration date to now + durationDays
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);
      vipExpiresAt = expiryDate;
    }
    
    return this.updateUser(username, { 
      isVIP, 
      vipExpiresAt 
    });
  }

  /**
   * Check and update a user's VIP status based on expiration date
   * @param username The username of the user to check
   * @returns Current VIP status after check
   */
  async checkAndUpdateVIPStatus(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    
    // If not a VIP, just return false
    if (!user.isVIP) return false;
    
    // If VIP with no expiration date, keep as VIP
    if (!user.vipExpiresAt) return true;
    
    // Check if VIP has expired
    const now = new Date();
    const expiryDate = new Date(user.vipExpiresAt);
    
    if (now > expiryDate) {
      // VIP has expired, update user
      await this.updateUser(username, { isVIP: false, vipExpiresAt: null });
      return false;
    }
    
    // VIP is still valid
    return true;
  }

  /**
   * Get all users in the system
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersByUsername.values());
  }

  // =================== REFERRAL SYSTEM METHODS ===================

  /**
   * Get a user by their Roblox UserId
   */
  async getUserByRobloxUserId(robloxUserId: number): Promise<User | undefined> {
    return this.usersByRobloxId.get(robloxUserId);
  }

  /**
   * Create a new referral relationship
   */
  async createReferral(referralData: InsertReferral): Promise<Referral> {
    const referral: Referral = {
      id: this.currentReferralId++,
      inviterUserId: referralData.inviterUserId,
      inviteeUserId: referralData.inviteeUserId,
      inviterUsername: referralData.inviterUsername,
      inviteeUsername: referralData.inviteeUsername,
      totalTokensEarnedByInvitee: 0,
      regularPaymentMade: false,
      vipTokensPaidOut: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.referrals.set(referralData.inviteeUserId, referral);
    return referral;
  }

  /**
   * Get referral data by invitee's Roblox UserId
   */
  async getReferralByInviteeUserId(inviteeUserId: number): Promise<Referral | undefined> {
    return this.referrals.get(inviteeUserId);
  }

  /**
   * Update referral data
   */
  async updateReferral(inviteeUserId: number, data: Partial<UpdateReferral>): Promise<Referral | undefined> {
    const referral = this.referrals.get(inviteeUserId);
    if (!referral) return undefined;

    const updatedReferral: Referral = {
      ...referral,
      ...data,
      updatedAt: new Date(),
    };

    this.referrals.set(inviteeUserId, updatedReferral);
    return updatedReferral;
  }

  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(username: string): Promise<string> {
    let referralCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      referralCode = `${username.toUpperCase()}-${this.generateRandomString(4)}`;
      attempts++;
    } while (this.usersByReferralCode.has(referralCode) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based code
      referralCode = `${username.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }

    // Update user with referral code
    const user = await this.getUserByUsername(username);
    if (user) {
      const updatedUser = await this.updateUser(username, { referralCode });
      if (updatedUser?.referralCode) {
        this.usersByReferralCode.set(updatedUser.referralCode, updatedUser);
      }
    }

    return referralCode;
  }

  /**
   * Get user by their referral code
   */
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return this.usersByReferralCode.get(referralCode);
  }

  /**
   * Process referral payouts based on invitee's token earnings
   * Returns information about payouts made
   */
  async processReferralPayout(inviteeUserId: number, newTokenCount: number): Promise<{ regularPayout: boolean; vipPayout: number; inviterUsername?: string }> {
    const referral = await this.getReferralByInviteeUserId(inviteeUserId);
    if (!referral) {
      return { regularPayout: false, vipPayout: 0 };
    }

    const inviter = await this.getUserByRobloxUserId(referral.inviterUserId);
    if (!inviter) {
      return { regularPayout: false, vipPayout: 0 };
    }

    let regularPayout = false;
    let vipPayout = 0;

    // Update total tokens earned by invitee
    const totalTokensEarned = newTokenCount;
    await this.updateReferral(inviteeUserId, { totalTokensEarnedByInvitee: totalTokensEarned });

    // Regular payout: 1 token when invitee redeems 10 tokens (only once)
    if (!referral.regularPaymentMade && totalTokensEarned >= 10) {
      await this.updateUser(inviter.username, { 
        tokenCount: (inviter.tokenCount || 0) + 1 
      });
      await this.updateReferral(inviteeUserId, { regularPaymentMade: true });
      regularPayout = true;
    }

    // VIP payout: 1 token for every 20 tokens earned by invitee (repeatable)
    if (inviter.isVIP) {
      const totalPossibleVIPPayouts = Math.floor(totalTokensEarned / 20);
      const unpaidVIPPayouts = totalPossibleVIPPayouts - referral.vipTokensPaidOut;
      
      if (unpaidVIPPayouts > 0) {
        await this.updateUser(inviter.username, { 
          tokenCount: (inviter.tokenCount || 0) + unpaidVIPPayouts 
        });
        await this.updateReferral(inviteeUserId, { 
          vipTokensPaidOut: totalPossibleVIPPayouts 
        });
        vipPayout = unpaidVIPPayouts;
      }
    }

    return { 
      regularPayout, 
      vipPayout, 
      inviterUsername: inviter.username 
    };
  }
}

export const storage = new MemStorage();
