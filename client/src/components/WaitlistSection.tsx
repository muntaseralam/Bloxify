import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface WaitlistSectionProps {
  onStartQuest: () => void;
}

const WaitlistSection = ({ onStartQuest }: WaitlistSectionProps) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Safely handle start quest
  const handleStartQuest = () => {
    try {
      onStartQuest();
    } catch (error) {
      console.error("Error starting quest:", error);
      // Fallback in case the passed callback fails
      toast({
        title: "Login Required",
        description: "Please login or create an account to start your quest",
        variant: "default",
      });
      setLocation("/login");
    }
  };

  return (
    <div>
      <div className="bg-[#F2F2F2] p-6 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <h3 className="text-2xl font-bold mb-3 text-[#1A1A1A]">
          <i className="fas fa-star-half-alt mr-2 text-[#FFD800]"></i> Join the Waitlist
        </h3>
        
        <div className="bg-white p-6 rounded-lg shadow-inner">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#00A2FF] rounded-lg flex items-center justify-center text-white text-xl mr-4">
              <i className="fas fa-rocket"></i>
            </div>
            <div>
              <h4 className="text-lg font-bold">Be the First to Experience Bloxify</h4>
              <p className="text-gray-600">Complete the challenges to secure your spot!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#F2F2F2] p-4 rounded-lg flex items-start">
              <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                <i className="fas fa-gamepad"></i>
              </div>
              <div>
                <h5 className="font-bold">Play Mini-Game</h5>
                <p className="text-sm text-gray-600">Show your skills in our custom mini-game</p>
              </div>
            </div>
            
            <div className="bg-[#F2F2F2] p-4 rounded-lg flex items-start">
              <div className="w-10 h-10 bg-[#FFD800] rounded-full flex items-center justify-center text-[#1A1A1A] mr-3 flex-shrink-0">
                <i className="fas fa-ad"></i>
              </div>
              <div>
                <h5 className="font-bold">Watch Ads</h5>
                <p className="text-sm text-gray-600">Support our development by viewing ads</p>
              </div>
            </div>
            
            <div className="bg-[#F2F2F2] p-4 rounded-lg flex items-start">
              <div className="w-10 h-10 bg-[#00A2FF] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div>
                <h5 className="font-bold">Get Your Token</h5>
                <p className="text-sm text-gray-600">Receive an exclusive access token</p>
              </div>
            </div>
            
            <div className="bg-[#F2F2F2] p-4 rounded-lg flex items-start">
              <div className="w-10 h-10 bg-[#4CAF50] rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                <i className="fas fa-check-circle"></i>
              </div>
              <div>
                <h5 className="font-bold">Redeem in Roblox</h5>
                <p className="text-sm text-gray-600">Use your token to claim your spot</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleStartQuest}
              className="game-button bg-[#00A2FF] text-white font-bold py-3 px-8 rounded-lg border-b-4 border-[#1A1A1A] hover:bg-blue-500 text-lg inline-flex items-center transition-all hover:-translate-y-1"
            >
              <i className="fas fa-play-circle mr-2"></i> Start Your Quest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSection;
