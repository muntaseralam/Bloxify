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

  const login = useCallback(async (username: string, password: string, isNewUser: boolean) => {
    if (!username || username.trim() === "") {
      toast({
        title: "Invalid username",
        description: "Please enter a valid Roblox username",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isNewUser) {
        const createResponse = await apiRequest("POST", "/api/users", { username, password });
        if (!createResponse.ok) {
          throw new Error("Username already taken");
        }
        userData = await createResponse.json();
      } else {
        const loginResponse = await apiRequest("POST", "/api/users/login", { username, password });
        if (!loginResponse.ok) {
          throw new Error("Invalid username or password");
        }
        userData = await loginResponse.json();
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
