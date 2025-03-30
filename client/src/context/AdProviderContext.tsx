import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AD_CONFIG, loadAdSenseScript, loadEzoicScript, loadAdsterraScript } from '@/lib/adConfig';

// Types of ad providers supported
type AdProvider = 'adsense' | 'admob' | 'ezoic' | 'adsterra' | 'simulated';

interface AdConfigType {
  provider: AdProvider;
  adsenseClientId?: string;
  admobAppId?: string;
  ezoicSiteId?: string;
  adsterraAccountId?: string;
  isProduction: boolean;
}

interface AdContextType {
  config: AdConfigType;
  isAdblockDetected: boolean;
  updateConfig: (newConfig: Partial<AdConfigType>) => void;
}

// Default configuration - simulated ads for development
const defaultConfig: AdConfigType = {
  provider: 'simulated',
  isProduction: false
};

// Create context with default values
const AdProviderContext = createContext<AdContextType>({
  config: defaultConfig,
  isAdblockDetected: false,
  updateConfig: () => {}
});

// Custom hook to use the ad provider context
export const useAdProvider = () => useContext(AdProviderContext);

// Provider component
interface AdProviderProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AdConfigType>;
}

export const AdProviderProvider: React.FC<AdProviderProviderProps> = ({ 
  children,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<AdConfigType>({
    ...defaultConfig,
    ...initialConfig
  });
  
  const [isAdblockDetected, setIsAdblockDetected] = useState(false);
  
  // Function to update config
  const updateConfig = (newConfig: Partial<AdConfigType>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  };
  
  // Load ad scripts when in production mode
  useEffect(() => {
    if (config.isProduction) {
      // Load appropriate ad scripts based on provider
      if (config.provider === 'adsense' || AD_CONFIG.adsensePublisherId) {
        loadAdSenseScript();
      }
      
      if (config.provider === 'ezoic' || AD_CONFIG.ezoicSiteId) {
        loadEzoicScript();
      }
      
      if (config.provider === 'adsterra' || AD_CONFIG.adsterraSiteId) {
        loadAdsterraScript();
      }
      
      // AdMob is typically used in mobile apps, not directly loaded in web
      
      // Simple adblock detection
      setTimeout(() => {
        const adBlockDetected = document.getElementById('ad-block-test');
        if (!adBlockDetected) {
          setIsAdblockDetected(true);
        }
      }, 1000);
      
      // Create a hidden dummy ad element to test for ad blockers
      const testAd = document.createElement('div');
      testAd.id = 'ad-block-test';
      testAd.className = 'ad-unit';
      testAd.style.display = 'none';
      document.body.appendChild(testAd);
      
      return () => {
        if (testAd && testAd.parentNode) {
          testAd.parentNode.removeChild(testAd);
        }
      };
    }
  }, [config.isProduction, config.provider]);
  
  return (
    <AdProviderContext.Provider value={{ config, isAdblockDetected, updateConfig }}>
      {children}
    </AdProviderContext.Provider>
  );
};

// Component to display a notice about simulated ads in development mode
interface SimulatedAdNoticeProps {
  children?: React.ReactNode;
}

export const SimulatedAdNotice: React.FC<SimulatedAdNoticeProps> = ({ children }) => {
  const { config } = useAdProvider();
  
  if (config.isProduction) return <>{children}</>;
  
  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 mb-2 text-xs">
      <p className="font-bold">Simulated Ad</p>
      <p>Real ads will appear here when published.</p>
      {children}
    </div>
  );
};