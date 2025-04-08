import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient"; // Removed as it's not fully defined and causes errors.


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
    try {
      // We now only support direct login through the login endpoint
      // The isNewUser parameter is kept for backward compatibility
      const loginResponse = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (loginResponse.ok) {
        const data = await loginResponse.json();
        setUser(data);
        toast({
          title: "Success!",
          description: "Logged in successfully!",
        });
        return;
      } else {
        const errorData = await loginResponse.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
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