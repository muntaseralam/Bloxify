import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useGameProgress(username: string | undefined) {
  const [currentStep, setCurrentStep] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [dailyQuestCount, setDailyQuestCount] = useState(0);
  const totalAds = 15;
  const { toast } = useToast();
  const initialized = useRef(false);

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
          // For users who haven't started their quest yet, either:
          // - Show the waitlist first time (step 0)
          // - Or directly start the minigame (step 1) on subsequent logins
          
          // Check if the user has any progress
          if (userData.adsWatched > 0 || userData.gameCompleted) {
            step = 1; // Continue minigame where they left off
          } else if (!initialized.current) {
            // First time login with no progress - show waitlist
            step = 0;
            initialized.current = true;
          } else {
            // They've seen the waitlist already, start the game
            step = 1;
          }
        }
        
        setCurrentStep(step);
        setGameCompleted(userData.gameCompleted);
        setAdsWatched(userData.adsWatched);
        setTokenCount(userData.tokenCount || 0);
        setToken(userData.token);
        setDailyQuestCount(userData.dailyQuestCount || 0);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, [username, totalAds]);

  // Update game status function
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
      const previousTokenCount = tokenCount;
      setCurrentStep(step);
      setGameCompleted(updatedUser.gameCompleted);
      setAdsWatched(updatedUser.adsWatched);
      setTokenCount(updatedUser.tokenCount || 0);
      setDailyQuestCount(updatedUser.dailyQuestCount || 0);
      
      // Show notification when user earns a token
      if ((updatedUser.tokenCount || 0) > previousTokenCount) {
        toast({
          title: "Token Earned!",
          description: `You've earned a token! You now have ${updatedUser.tokenCount} token${updatedUser.tokenCount === 1 ? '' : 's'}.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error updating game status:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your progress",
        variant: "destructive",
      });
    }
  }, [username, toast, tokenCount]);

  // Increment ad count
  const incrementAdCount = useCallback(async (newCount: number) => {
    if (!username) return;

    try {
      const response = await apiRequest("PATCH", `/api/users/${username}`, {
        adsWatched: newCount
      });

      if (!response.ok) throw new Error("Failed to update ad count");

      const updatedUser = await response.json();
      const previousTokenCount = tokenCount;
      setAdsWatched(updatedUser.adsWatched);
      setTokenCount(updatedUser.tokenCount || 0);
      setDailyQuestCount(updatedUser.dailyQuestCount || 0);
      
      // Show notification when user earns a token
      if ((updatedUser.tokenCount || 0) > previousTokenCount) {
        toast({
          title: "Token Earned!",
          description: `You've earned a token! You now have ${updatedUser.tokenCount} token${updatedUser.tokenCount === 1 ? '' : 's'}.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error incrementing ad count:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your ad progress",
        variant: "destructive",
      });
    }
  }, [username, toast, tokenCount]);

  // Generate token
  const generateToken = useCallback(async () => {
    if (!username) return;

    try {
      // First, fetch the updated user data to ensure we have the latest token count
      const userResponse = await fetch(`/api/users/${username}`);
      if (!userResponse.ok) {
        throw new Error("Failed to fetch latest user data");
      }
      
      const userData = await userResponse.json();
      setTokenCount(userData.tokenCount || 0);
      
      // Only proceed if user has enough tokens
      if ((userData.tokenCount || 0) < 10) {
        toast({
          title: "Not Enough Tokens",
          description: `You need at least 10 tokens to generate a code. You currently have ${userData.tokenCount || 0}.`,
          variant: "destructive",
        });
        return;
      }
      
      // Now try to generate the token
      const response = await apiRequest("POST", `/api/users/${username}/token`, {});
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If the user already has an active token
        if (response.status === 400 && errorData.token) {
          setToken(errorData.token);
          toast({
            title: "Active Token",
            description: errorData.message || "You already have an active token.",
          });
          return;
        }
        
        // If user doesn't have enough tokens
        if (response.status === 400 && errorData.tokensNeeded) {
          toast({
            title: "Not Enough Tokens",
            description: errorData.message || "You need more tokens to redeem.",
            variant: "destructive",
          });
          return;
        }
        
        throw new Error(errorData.message || "Failed to generate token");
      }

      const data = await response.json();
      setToken(data.token);
      setTokenCount(data.remainingTokens || 0);
      
      toast({
        title: "Redemption Code Generated!",
        description: data.message || "Your redemption code has been created successfully",
      });
    } catch (error) {
      console.error("Error generating token:", error);
      toast({
        title: "Token generation failed",
        description: error instanceof Error ? error.message : "There was a problem generating your token",
        variant: "destructive",
      });
    }
  }, [username, toast]);

  return {
    currentStep,
    gameCompleted,
    adsWatched,
    totalAds,
    tokenCount,
    token,
    dailyQuestCount,
    updateGameStatus,
    incrementAdCount,
    generateToken
  };
}
