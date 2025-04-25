import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/useAdmin";
import { Link } from "wouter";

interface AuthSectionProps {
  isLoggedIn: boolean;
  username: string;
  onLogin: (username: string, password: string, isNewUser: boolean) => void;
  onLogout: () => void;
}

const AuthSection = ({ isLoggedIn, username, onLogin, onLogout }: AuthSectionProps) => {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const { isAdmin } = useAdmin();

  const handleLogin = () => {
    if (inputUsername.trim() && inputPassword.trim()) {
      // Always set isNewUser to false for quick login
      onLogin(inputUsername.trim(), inputPassword.trim(), false);
    }
  };

  return (
    <div id="authSection" className="mb-8 rounded-lg p-6 bg-gradient-to-br from-[#F2F2F2] to-white border-6 border-[#1A1A1A] shadow-inner">
      <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">
        <i className="fas fa-user-astronaut mr-2"></i> Player Account
      </h2>
      
      {/* Login Form - Shows when not logged in */}
      {!isLoggedIn && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <p className="mb-4 text-lg">Please log in or create an account to play:</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a href="/login" className="w-full">
                <Button className="w-full game-button bg-[#00A2FF] text-white font-bold py-3 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-blue-500 text-lg transition-all hover:-translate-y-1">
                  Log In
                </Button>
              </a>
              <a href="/signup" className="w-full">
                <Button variant="outline" className="w-full game-button bg-white text-[#00A2FF] font-bold py-3 px-6 rounded-lg border-4 border-[#00A2FF] hover:bg-blue-50 text-lg transition-all hover:-translate-y-1">
                  Create Account
                </Button>
              </a>
            </div>
            <p className="text-sm text-center text-gray-600 mt-2">
              Log in to continue your progress or create a new account to start
            </p>
          </div>
        </div>
      )}
      
      {/* User info - Shows when logged in */}
      {isLoggedIn && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-[#FFD800] rounded-full flex items-center justify-center text-2xl font-bold mr-4 border-4 border-[#1A1A1A]">
                <span>{username[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-lg">Welcome, <span className="font-bold text-[#00A2FF]">{username}</span>!</p>
                <p className="text-sm text-gray-600">Ready to complete your quest?</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button 
                onClick={onLogout}
                className="text-[#FF4500] hover:underline font-semibold"
              >
                <i className="fas fa-door-open mr-1"></i> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
