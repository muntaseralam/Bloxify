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
      // First try to login if not a new user
      if (!isNewUser) {
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
        }
      }

      // If login failed or it's a new user, try to create account
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
        toast({
          title: "Success!",
          description: "Account created successfully!",
        });
      } else {
        console.log("Login error:", data);
        toast({
          title: "Error",
          description: data.message || "Failed to log in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to log in",
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