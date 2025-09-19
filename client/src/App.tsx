import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthSection from "./components/AuthSection";
import ProgressTracker from "./components/ProgressTracker";
import MinigameSection from "./components/MinigameSection";
import AdViewingSection from "./components/AdViewingSection";
import TokenSection from "./components/TokenSection";
import WaitlistSection from "./components/WaitlistSection";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import NotFound from "@/pages/not-found";
import Docs from "@/pages/Docs";
import AdConfig from "@/pages/AdConfig";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { useRobloxUser } from "./hooks/useRobloxUser";
import { useGameProgress } from "./hooks/useGameProgress";
import { AdProviderProvider } from "./context/AdProviderContext";
import { AdminAuthProvider, useAdmin } from "./hooks/useAdmin";
import GoogleAdSense from "@/components/ads/GoogleAdSense";
import InterstitialAd from "@/components/ads/InterstitialAd";

function BloxifyApp() {
  const { user, login, logout, checkVIPStatus } = useRobloxUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { 
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
  } = useGameProgress(user?.username);

  // Handler to start the quest journey
  const startQuest = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or create an account to start your quest",
        variant: "default",
      });
      setLocation("/login");
      return;
    }

    // Reset ads watched and set current step to 1 (minigame)
    updateGameStatus(1, false, 0);

    toast({
      title: "Quest Started!",
      description: "Your quest has begun! Complete the minigame to continue.",
      variant: "default",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Header />

      <div className="game-container bg-white rounded-xl p-4 md:p-8 max-w-5xl mx-auto mb-12 border-8 border-[#1A1A1A] shadow-[0_0_0_4px_#FF4500,0_10px_20px_rgba(0,0,0,0.2)]">
        <AuthSection 
          isLoggedIn={!!user} 
          username={user?.username || ''} 
          onLogin={login} 
          onLogout={logout} 
        />

        {user && (
          <>
            {currentStep >= 1 && (
              <ProgressTracker 
                currentStep={currentStep} 
                totalSteps={3} 
                gameCompleted={gameCompleted}
                adsWatched={adsWatched}
                totalAds={totalAds}
                tokenCount={tokenCount}
                hasToken={!!token}
                dailyQuestCount={dailyQuestCount}
              />
            )}

            {currentStep === 1 && (
              <MinigameSection 
                onGameComplete={() => {
                  updateGameStatus(2, true, adsWatched);
                }} 
              />
            )}

            {currentStep === 2 && (
              <AdViewingSection 
                adsWatched={adsWatched} 
                totalAds={totalAds} 
                onAdWatched={() => {
                  const newCount = adsWatched + 1;
                  incrementAdCount(newCount);
                  if (newCount >= totalAds) {
                    updateGameStatus(3, gameCompleted, newCount);
                    generateToken();
                  }
                }} 
              />
            )}

            {currentStep === 3 && (
              <TokenSection 
                token={token} 
                username={user.username}
                tokenCount={tokenCount}
                dailyQuestCount={dailyQuestCount}
                onStartNewQuest={dailyQuestCount < 5 || user.isVIP ? startQuest : undefined}
                generateToken={generateToken}
                isVIP={user.isVIP}
                vipExpiresAt={user.vipExpiresAt}
                onCheckVIPStatus={checkVIPStatus}
              />
            )}

            {currentStep === 0 && (
              <WaitlistSection onStartQuest={startQuest} />
            )}
          </>
        )}

        {!user && (
          <WaitlistSection onStartQuest={() => {
            // Redirect to login page - the toast will be handled in WaitlistSection component
            setLocation("/login");
          }} />
        )}
      </div>

      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Show interstitial ad occasionally for engagement
  useEffect(() => {
    const showInterstitialChance = Math.random() < 0.15; // 15% chance
    const hasShownToday = localStorage.getItem('interstitial_shown_today');
    const today = new Date().toDateString();

    if (showInterstitialChance && hasShownToday !== today) {
      setTimeout(() => {
        setShowInterstitial(true);
        localStorage.setItem('interstitial_shown_today', today);
      }, 5000); // Show after 5 seconds
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdProviderProvider initialConfig={{ provider: 'adsense', isProduction: true }}>
          <div className="min-h-screen bg-[#F2F2F2] font-['Nunito',sans-serif] bg-gradient-to-br from-[#F2F2F2] to-[#E0E0E0]">
            <MainNavigation />

            {/* Top banner ad */}
            <div className="container mx-auto px-4 pt-4">
              <GoogleAdSense position="top" />
            </div>

            <Switch>
              <Route path="/" component={BloxifyApp} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/admin-login" component={AdminLogin} />
              <AdminProtectedRoute path="/admin" component={AdminDashboard} />
              <AdminProtectedRoute path="/docs" component={Docs} />
              <AdminProtectedRoute path="/ad-config" component={AdConfig} />
              <Route component={NotFound} />
            </Switch>

            {/* Bottom banner ad */}
            <div className="container mx-auto px-4 pb-4">
              <GoogleAdSense position="bottom" />
            </div>

            <Footer />
            <Toaster />

            {/* Interstitial ad overlay */}
            {showInterstitial && (
              <InterstitialAd 
                onClose={() => setShowInterstitial(false)}
                autoCloseDelay={8000}
              />
            )}
          </div>
        </AdProviderProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

function MainNavigation() {
  const { isAdmin, isOwner } = useAdmin();
  const { user } = useRobloxUser();

  // Define if the user should see admin content
  // Only admins and the owner (minecraftgamer523653) can see admin content
  const showAdminContent = isAdmin || isOwner || (user?.username === "minecraftgamer523653");

  return (
    <nav className="bg-[#1A1A1A] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link href="/">
            <span className="cursor-pointer">BloxToken</span>
          </Link>
        </div>
        <div className="flex space-x-4">
          {!user && (
            <>
              <Link href="/login">
                <span className="cursor-pointer hover:text-blue-400 transition-colors">
                  Login
                </span>
              </Link>
              <Link href="/signup">
                <span className="cursor-pointer hover:text-blue-400 transition-colors">
                  Sign Up
                </span>
              </Link>
            </>
          )}

          {showAdminContent && (
            <>
              <Link href="/admin">
                <span className="cursor-pointer hover:text-blue-400 transition-colors">
                  Admin Dashboard
                </span>
              </Link>
              <Link href="/docs">
                <span className="cursor-pointer hover:text-blue-400 transition-colors">
                  Developer Guide
                </span>
              </Link>
              <Link href="/ad-config">
                <span className="cursor-pointer hover:text-blue-400 transition-colors">
                  Ad Config
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default App;