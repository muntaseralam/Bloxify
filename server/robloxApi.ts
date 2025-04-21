import axios from 'axios';

/**
 * VIP Gamepass configuration
 */
export const ROBLOX_VIP_GAMEPASS_ID = 23557114; // Replace with your actual VIP gamepass ID

/**
 * Class to handle interactions with the Roblox API
 */
export class RobloxAPI {
  /**
   * Check if a user owns a specific gamepass
   * @param username Roblox username
   * @param gamepassId The ID of the gamepass to check
   * @returns Boolean indicating if the user owns the gamepass
   */
  async hasGamepass(username: string, gamepassId: number): Promise<boolean> {
    try {
      // First, get the user's ID from their username
      const userId = await this.getUserIdFromUsername(username);
      if (!userId) {
        console.error(`Could not find Roblox user ID for username: ${username}`);
        return false;
      }
      
      // Then check if they own the gamepass
      return await this.userOwnsGamepass(userId, gamepassId);
    } catch (error) {
      console.error('Error checking gamepass ownership:', error);
      return false;
    }
  }

  /**
   * Get a Roblox user ID from their username
   * @param username Roblox username
   * @returns User ID or null if not found
   */
  private async getUserIdFromUsername(username: string): Promise<number | null> {
    try {
      const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username],
        excludeBannedUsers: true
      });
      
      const data = response.data;
      if (data.data && data.data.length > 0) {
        return data.data[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Roblox user ID:', error);
      return null;
    }
  }

  /**
   * Check if a user owns a specific gamepass
   * @param userId Roblox user ID
   * @param gamepassId Gamepass ID to check
   * @returns Boolean indicating if the user owns the gamepass
   */
  private async userOwnsGamepass(userId: number, gamepassId: number): Promise<boolean> {
    try {
      const response = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gamepassId}`);
      
      // If the user owns the gamepass, the response will contain data
      return response.data && response.data.data && response.data.data.length > 0;
    } catch (error) {
      // If there's an error (like 404), the user doesn't own the gamepass
      return false;
    }
  }

  /**
   * Check if a user owns the VIP gamepass
   * @param username Roblox username
   * @returns Boolean indicating if the user owns the VIP gamepass
   */
  async hasVIPGamepass(username: string): Promise<boolean> {
    return this.hasGamepass(username, ROBLOX_VIP_GAMEPASS_ID);
  }
  
  /**
   * Get the VIP gamepass ID
   * @returns The VIP gamepass ID
   */
  get vipGamepassId(): number {
    return ROBLOX_VIP_GAMEPASS_ID;
  }
}

// Export a singleton instance of the API
export const robloxApi = new RobloxAPI();