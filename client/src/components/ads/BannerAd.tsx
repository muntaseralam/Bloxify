import { useState, useEffect } from "react";
import { Gift, Gamepad } from "lucide-react";

interface BannerAdProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

const BannerAd = ({ 
  className = "", 
  variant = "horizontal" 
}: BannerAdProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate ad loading
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Vertical banner ads
  if (variant === "vertical") {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shadow-md mb-4 ${className}`}>
        <div className="bg-blue-500 text-white text-xs px-2 py-1 text-center">ADVERTISEMENT</div>
        <div className="p-2 h-full">
          {isLoaded ? (
            <div className="flex flex-col items-center justify-between h-full bg-white p-2 rounded">
              <div className="text-center mb-2">
                <div className="h-24 w-24 mx-auto bg-gradient-to-br from-blue-200 to-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Gift className="h-10 w-10 text-blue-500" />
                </div>
                <h4 className="font-bold text-sm text-gray-800">SPECIAL OFFER</h4>
                <p className="text-xs text-gray-600">Limited time promotion!</p>
              </div>
              
              <div className="text-center my-2">
                <p className="text-xs text-gray-600">Get incredible deals on your favorite games</p>
              </div>
              
              <button className="bg-blue-500 text-white text-xs py-1 px-4 rounded-full w-full hover:bg-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between h-full bg-white p-2 rounded space-y-2">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Horizontal banner ads (default)
  return (
    <div className={`bg-gray-100 border border-gray-200 rounded-lg overflow-hidden shadow-md ${className}`}>
      <div className="bg-blue-500 text-white text-xs px-2 py-1 text-center">ADVERTISEMENT</div>
      <div className="p-2">
        {isLoaded ? (
          <div className="flex items-center justify-between bg-white p-2 rounded">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full flex items-center justify-center mr-3">
                <Gamepad className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-800">Game Promotion</h4>
                <p className="text-xs text-gray-600">Special rewards for players!</p>
              </div>
            </div>
            <button className="bg-blue-500 text-white text-xs py-1 px-3 rounded-full hover:bg-blue-600 transition-colors">
              Claim
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-2 rounded">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <div className="h-2 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerAd;