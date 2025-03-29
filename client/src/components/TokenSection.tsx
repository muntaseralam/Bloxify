import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AlertTriangle, Clock } from "lucide-react";

interface TokenSectionProps {
  token: string;
  username: string;
}

const TokenSection = ({ token, username }: TokenSectionProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopyToken = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      toast({
        title: "Token copied!",
        description: "Your access token has been copied to clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "Please try selecting and copying manually.",
        variant: "destructive"
      });
    });
  };
  
  const handleRedeemToken = () => {
    toast({
      title: "Redeem Token",
      description: `Token ${token} would be redeemed in Roblox for username: ${username}`,
    });
    // In a real implementation, this would redirect to Roblox or invoke their API
  };
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-[#FFD800] to-[#FF4500] p-4 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <h3 className="text-xl font-bold mb-3 text-white">
          <i className="fas fa-trophy mr-2"></i> Congratulations, Quest Completed!
        </h3>
        
        <div className="bg-white p-6 rounded-lg text-center">
          <div className="w-20 h-20 mx-auto bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-ticket-alt text-[#FFD800] text-3xl"></i>
          </div>
          
          <h4 className="text-xl font-bold mb-2">Your Access Token</h4>
          <p className="text-sm text-gray-600 mb-4">Use this token to redeem your exclusive product access</p>
          
          <div className="bg-[#F2F2F2] p-4 rounded-lg mb-4 relative">
            <p className="font-mono text-lg break-all">{token}</p>
            <button 
              onClick={handleCopyToken}
              className="absolute top-2 right-2 text-[#00A2FF] hover:text-[#1A1A1A]"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleCopyToken}
              className="game-button bg-[#00A2FF] text-white font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-blue-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
            >
              <i className={`${copied ? 'fas fa-check' : 'fas fa-copy'} mr-2`}></i> 
              {copied ? 'Copied!' : 'Copy Token'}
            </Button>
            
            <Link href="/docs">
              <Button 
                className="game-button bg-[#4CAF50] text-white font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-green-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
              >
                <i className="fas fa-check-circle mr-2"></i> Redeem in Roblox
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-4 bg-black bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm">
            <i className="fas fa-info-circle mr-1"></i> 
            Your token has been linked to your Roblox account: 
            <span className="font-bold ml-1">{username}</span>
          </p>
        </div>
        
        <div className="mt-2 bg-blue-600 bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" /> 
            This token can only be redeemed once for 1 in-game currency.
          </p>
        </div>
        
        <div className="mt-2 bg-blue-600 bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-400" /> 
            Daily quest: You can earn one token per day. Come back tomorrow for another token!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenSection;
