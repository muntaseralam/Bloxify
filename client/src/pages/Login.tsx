import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useRobloxUser } from "@/hooks/useRobloxUser";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { login } = useRobloxUser();
  
  // Check if user was redirected from signup page with success flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signupSuccess') === 'true') {
      setShowSignupSuccess(true);
      
      // Clear the URL parameter after 5 seconds
      const timer = setTimeout(() => {
        setShowSignupSuccess(false);
        // Update URL without page refresh
        window.history.replaceState({}, '', '/login');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Using the login function from useRobloxUser hook
      const loginSuccess = await login(username.trim(), password.trim(), false);
      
      // Only redirect to home page on successful login
      if (loginSuccess) {
        // Add a short delay to allow the state update to propagate
        toast({
          title: "Success!",
          description: "Logged in successfully! Redirecting to your quest...",
        });
        
        // Add a longer delay to ensure the user object and game state are loaded
        setTimeout(() => {
          setLocation("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {showSignupSuccess && (
        <Alert className="mb-4 w-full max-w-md bg-green-100 border-green-500 text-green-800">
          <AlertDescription>
            Account created successfully! You can now log in with your credentials.
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Log in to your account to continue your adventure
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Your Roblox Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}