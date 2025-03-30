import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { AlertTriangle, Clock } from "lucide-react";

interface TokenSectionProps {
  token: string | null;
  username: string;
  tokenCount?: number;
  onStartNewQuest?: () => void;
  dailyQuestCount?: number;
  generateToken?: () => void;
}

const TokenSection = ({ token, username, tokenCount = 0, onStartNewQuest, dailyQuestCount = 1, generateToken }: TokenSectionProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const handleCopyToken = () => {
    if (!token) return;
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
    if (generateToken) {
      generateToken();
    } else {
      toast({
        title: "Generate Token",
        description: "Attempting to generate a new redemption code...",
      });
    }
  };
  
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-[#FFD800] to-[#FF4500] p-4 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <h3 className="text-xl font-bold mb-3 text-white">
          <i className="fas fa-trophy mr-2"></i> Congratulations, Quest Completed!
        </h3>

        {/* Token Balance */}
        <div className="bg-[#1A1A1A] p-3 rounded-lg mb-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-2 rounded-full mr-2">
              <i className="fas fa-coins text-[#1A1A1A]"></i>
            </div>
            <span className="text-white font-bold">Your Token Balance</span>
          </div>
          <div className="bg-blue-600 text-white font-bold py-1 px-3 rounded-full">
            {tokenCount}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg text-center">
          {tokenCount >= 10 ? (
            // Redemption UI when user has enough tokens
            <>
              <div className="w-20 h-20 mx-auto bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-ticket-alt text-[#FFD800] text-3xl"></i>
              </div>
              
              {token ? (
                // Show the redemption code if we have one
                <>
                  <h4 className="text-xl font-bold mb-2">Your Blux Redemption Code</h4>
                  <p className="text-sm text-gray-600 mb-4">Use this code in the Roblox game to receive Blux</p>
                  
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
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                    
                    <Link href="/docs">
                      <Button 
                        className="game-button bg-[#4CAF50] text-white font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-green-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
                      >
                        <i className="fas fa-check-circle mr-2"></i> Redeem in Roblox
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-4 bg-green-100 p-3 rounded-lg text-green-800 border border-green-300">
                    <p className="flex items-center">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span className="text-sm">10 tokens were deducted from your balance for this redemption code.</span>
                    </p>
                  </div>
                </>
              ) : (
                // Show the Generate Token button
                <>
                  <h4 className="text-xl font-bold mb-2">Ready to Redeem!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You have enough tokens to generate a Blux redemption code.
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6 border border-yellow-200">
                    <p className="text-sm text-yellow-800 mb-2">
                      <i className="fas fa-info-circle mr-1"></i> 
                      You have {tokenCount} tokens. Generating a code will use 10 tokens.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleRedeemToken}
                    className="game-button bg-[#FF4500] text-white font-bold py-3 px-8 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-orange-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
                  >
                    <i className="fas fa-ticket-alt mr-2"></i> Generate Redemption Code
                  </Button>
                </>
              )}
            </>
          ) : (
            // UI when user doesn't have enough tokens yet
            <>
              <div className="w-20 h-20 mx-auto bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-coins text-[#FFD800] text-3xl"></i>
              </div>
              
              <h4 className="text-xl font-bold mb-2">Keep Collecting Tokens!</h4>
              <p className="text-sm text-gray-600 mb-4">
                You need 10 tokens to redeem for a Blux code. You have {tokenCount} so far.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Redemption Progress</span>
                  <span className="text-sm font-medium">{tokenCount}/10</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.min((tokenCount / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  Complete daily quests to earn tokens. Each quest earns you 1 token.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {dailyQuestCount < 5 && onStartNewQuest ? (
                  <Button 
                    className="game-button bg-[#4CAF50] text-white font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-green-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
                    onClick={onStartNewQuest}
                  >
                    <i className="fas fa-play mr-2"></i> 
                    Start New Quest
                  </Button>
                ) : (
                  <Button 
                    className="game-button bg-[#00A2FF] text-white font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-blue-500 inline-flex items-center justify-center transition-all hover:-translate-y-1"
                    onClick={() => {
                      if (dailyQuestCount >= 5) {
                        toast({
                          title: "Daily Quest Limit",
                          description: "You've completed all your quests for today. Come back tomorrow for more!",
                        });
                      } else if (!onStartNewQuest) {
                        toast({
                          title: "Quest Unavailable",
                          description: "Unable to start a new quest. Please try logging out and back in.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <i className="fas fa-redo-alt mr-2"></i> 
                    {dailyQuestCount >= 5 ? "Return Tomorrow" : "Refresh Page"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 bg-black bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm">
            <i className="fas fa-info-circle mr-1"></i> 
            Your tokens are linked to your Roblox account: 
            <span className="font-bold ml-1">{username}</span>
          </p>
        </div>
        
        <div className="mt-2 bg-blue-600 bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" /> 
            Each redemption code can only be used once and costs 10 tokens.
          </p>
        </div>
        
        <div className="mt-2 bg-blue-600 bg-opacity-20 p-3 rounded-lg text-white">
          <p className="text-sm flex items-center">
            <Clock className="h-4 w-4 mr-2 text-blue-400" /> 
            Daily quests: You've completed {dailyQuestCount}/5 quests today. Each quest earns 1 token.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenSection;
