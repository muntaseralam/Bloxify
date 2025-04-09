import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient"; // Removed as it's not fully defined and causes errors.


interface RobloxUser {
  id: number;
  username: string;
  gameCompleted: boolean;
  adsWatched: number;
  token: string | null;
  tokenCount?: number;
  dailyQuestCount?: number;
}

// Key for localStorage
const USER_STORAGE_KEY = 'bloxify_user';

export function useRobloxUser() {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<RobloxUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      return null;
    }
  });
  
  const { toast } = useToast();
  
  // Check if user is already logged in when the component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      // First try to load from localStorage (already done in useState initialization)
      if (user) {
        console.log("User loaded from localStorage:", user);
        
        // Verify the user with the server if needed
        try {
          // Optionally verify user with server 
          const response = await fetch(`/api/users/${user.username}`);
          if (response.ok) {
            const userData = await response.json();
            console.log("User validated:", userData);
            // Update with latest user data
            setUser(userData);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          } else {
            console.warn("Stored user is invalid, clearing local storage");
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
          }
        } catch (error) {
          console.error("Error validating stored user:", error);
        }
        return;
      }
      
      // Fallback to session-based login
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          console.log("User logged in from session:", userData);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    
    checkLoginStatus();
  }, [user?.username]);

  const login = useCallback(async (username: string, password: string, isNewUser: boolean) => {
    try {
      console.log("Login attempt for:", username);
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
        
        // Store user in localStorage for persistence
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
        
        // Update state
        setUser(data);
        
        console.log("Login successful, user data:", data);
        toast({
          title: "Success!",
          description: "Logged in successfully!",
        });
        return true; // Return true to indicate successful login
      } else {
        const errorData = await loginResponse.json();
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid username or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const logout = useCallback(() => {
    setUser(null);
    // Clear user from localStorage
    localStorage.removeItem(USER_STORAGE_KEY);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  }, [toast]);

  return { user, login, logout };
}