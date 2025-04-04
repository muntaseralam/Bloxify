import { useState } from "react";
import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

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
import { useRobloxUser } from "./hooks/useRobloxUser";
import { useGameProgress } from "./hooks/useGameProgress";
import { AdProviderProvider } from "./context/AdProviderContext";
import { AdminAuthProvider, useAdmin } from "./hooks/useAdmin";

function BloxifyApp() {
  const { user, login, logout } = useRobloxUser();
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
    if (!user) return;
    // Reset ads watched and set current step to 1 (minigame)
    updateGameStatus(1, false, 0);
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
                onStartNewQuest={dailyQuestCount < 5 ? startQuest : undefined}
                generateToken={generateToken}
              />
            )}
            
            {currentStep === 0 && (
              <WaitlistSection onStartQuest={startQuest} />
            )}
          </>
        )}
        
        {!user && (
          <WaitlistSection onStartQuest={() => {}} />
        )}
      </div>
      
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdProviderProvider initialConfig={{ provider: 'simulated', isProduction: false }}>
          <div className="min-h-screen bg-[#F2F2F2] font-['Nunito',sans-serif] bg-gradient-to-br from-[#F2F2F2] to-[#E0E0E0]">
            <MainNavigation />
            
            <Switch>
              <Route path="/" component={BloxifyApp} />
              <Route path="/admin-login" component={AdminLogin} />
              <AdminProtectedRoute path="/admin" component={AdminDashboard} />
              <AdminProtectedRoute path="/docs" component={Docs} />
              <AdminProtectedRoute path="/ad-config" component={AdConfig} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </AdProviderProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

function MainNavigation() {
  const { isAdmin } = useAdmin();
  
  return (
    <nav className="bg-[#1A1A1A] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link href="/">
            <span className="cursor-pointer">BloxToken</span>
          </Link>
        </div>
        <div className="flex space-x-4">
          {isAdmin && (
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
          {!isAdmin && (
            <Link href="/admin-login">
              <span className="cursor-pointer hover:text-blue-400 transition-colors">
                Admin
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default App;
