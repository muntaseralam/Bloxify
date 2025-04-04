import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast"; // Assuming a toast component exists

interface AuthSectionProps {
  isLoggedIn: boolean;
  username: string;
  onLogin: (username: string, password: string, isNewUser: boolean) => Promise<void>; // Added password and Promise
  onLogout: () => void;
}

const AuthSection = ({ isLoggedIn, username, onLogin, onLogout }: AuthSectionProps) => {
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleLogin = async () => {
    if (!inputUsername.trim() || !inputPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }
    if (onLogin) {
      try {
        await onLogin(inputUsername.trim(), inputPassword.trim(), isNewUser);
      } catch (error) {
        toast({
          title: "Login Failed",
          description: "Please check your username and password",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div id="authSection" className="mb-8 rounded-lg p-6 bg-gradient-to-br from-[#F2F2F2] to-white border-6 border-[#1A1A1A] shadow-inner">
      <h2 className="text-2xl font-bold mb-4 text-[#1A1A1A]">
        <i className="fas fa-user-astronaut mr-2"></i> Player Login
      </h2>

      {/* Login Form - Shows when not logged in */}
      {!isLoggedIn && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <p className="mb-4 text-lg">Choose any username to begin your adventure!</p>
          <div className="flex flex-col gap-3">
            <Input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              placeholder="Your Roblox Username"
              className="flex-grow px-4 py-3 rounded-lg border-4 border-[#1A1A1A] focus:border-[#00A2FF] focus:outline-none text-lg"
            />
            <Input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Enter Password"
              className="flex-grow px-4 py-3 rounded-lg border-4 border-[#1A1A1A] focus:border-[#00A2FF] focus:outline-none text-lg"
            />
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isNewUser}
                  onChange={(e) => setIsNewUser(e.target.checked)}
                  className="mr-2"
                />
                I'm a new user
              </label>
              <Button
                onClick={handleLogin}
                className="game-button bg-[#00A2FF] text-white font-bold py-3 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-blue-500 text-lg transition-all hover:-translate-y-1"
              >
                {isNewUser ? "Sign Up" : "Login"}
              </Button>
            </div>
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
            <div>
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