import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useGameProgress(username: string | undefined) {
  const [currentStep, setCurrentStep] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const totalAds = 15;
  const { toast } = useToast();

  // Fetch initial user progress
  useEffect(() => {
    if (!username) return;

    const fetchUserProgress = async () => {
      try {
        const response = await fetch(`/api/users/${username}`);
        if (!response.ok) throw new Error("Failed to fetch user progress");

        const userData = await response.json();
        
        // Determine current step based on user progress
        let step = 0;
        if (userData.gameCompleted && userData.adsWatched >= totalAds && userData.token) {
          step = 3; // Token generation
        } else if (userData.gameCompleted) {
          step = 2; // Ad viewing
        } else if (userData.id) {
          step = 1; // Minigame
        }
        
        setCurrentStep(step);
        setGameCompleted(userData.gameCompleted);
        setAdsWatched(userData.adsWatched);
        setToken(userData.token);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, [username]);

  // Update game status
  const updateGameStatus = useCallback(async (
    step: number, 
    completed: boolean, 
    ads: number
  ) => {
    if (!username) return;

    try {
      const response = await apiRequest("PATCH", `/api/users/${username}`, {
        gameCompleted: completed,
        adsWatched: ads
      });

      if (!response.ok) throw new Error("Failed to update game status");

      const updatedUser = await response.json();
      setCurrentStep(step);
      setGameCompleted(updatedUser.gameCompleted);
      setAdsWatched(updatedUser.adsWatched);
    } catch (error) {
      console.error("Error updating game status:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your progress",
        variant: "destructive",
      });
    }
  }, [username, toast]);

  // Increment ad count
  const incrementAdCount = useCallback(async (newCount: number) => {
    if (!username) return;

    try {
      const response = await apiRequest("PATCH", `/api/users/${username}`, {
        adsWatched: newCount
      });

      if (!response.ok) throw new Error("Failed to update ad count");

      const updatedUser = await response.json();
      setAdsWatched(updatedUser.adsWatched);
    } catch (error) {
      console.error("Error incrementing ad count:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your ad progress",
        variant: "destructive",
      });
    }
  }, [username, toast]);

  // Generate token
  const generateToken = useCallback(async () => {
    if (!username) return;

    try {
      const response = await apiRequest("POST", `/api/users/${username}/token`, {});
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If the user has already completed the quest today
        if (response.status === 400 && errorData.token) {
          setToken(errorData.token);
          toast({
            title: "Daily Limit Reached",
            description: errorData.message || "You already completed today's quest.",
          });
          return;
        }
        
        throw new Error(errorData.message || "Failed to generate token");
      }

      const data = await response.json();
      setToken(data.token);
      
      toast({
        title: "Token Generated!",
        description: "Your access token has been created successfully",
      });
    } catch (error) {
      console.error("Error generating token:", error);
      toast({
        title: "Token generation failed",
        description: error instanceof Error ? error.message : "There was a problem generating your access token",
        variant: "destructive",
      });
    }
  }, [username, toast]);

  return {
    currentStep,
    gameCompleted,
    adsWatched,
    totalAds,
    token,
    updateGameStatus,
    incrementAdCount,
    generateToken
  };
}
