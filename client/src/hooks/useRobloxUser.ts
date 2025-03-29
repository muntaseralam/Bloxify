import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RobloxUser {
  id: number;
  username: string;
  gameCompleted: boolean;
  adsWatched: number;
  token: string | null;
}

export function useRobloxUser() {
  const [user, setUser] = useState<RobloxUser | null>(null);
  const { toast } = useToast();

  const login = useCallback(async (username: string) => {
    if (!username || username.trim() === "") {
      toast({
        title: "Invalid username",
        description: "Please enter a valid Roblox username",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, check if the user already exists
      const checkResponse = await fetch(`/api/users/${username}`);
      
      let userData;
      if (checkResponse.ok) {
        userData = await checkResponse.json();
      } else if (checkResponse.status === 404) {
        // User doesn't exist, create a new one
        const createResponse = await apiRequest("POST", "/api/users", { username });
        userData = await createResponse.json();
      } else {
        throw new Error("Failed to check user");
      }

      setUser(userData);
      
      toast({
        title: "Logged in!",
        description: `Welcome ${userData.username}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "There was a problem logging in. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  }, [toast]);

  return { user, login, logout };
}
