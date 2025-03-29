import React, { createContext, useContext, useState, useEffect } from 'react';

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

const defaultConfig: AdConfigType = {
  provider: 'simulated', // Default to simulated ads in development
  isProduction: false,   // Set to true when publishing
};

const AdProviderContext = createContext<AdContextType>({
  config: defaultConfig,
  isAdblockDetected: false,
  updateConfig: () => {},
});

export const useAdProvider = () => useContext(AdProviderContext);

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
    ...initialConfig,
  });
  const [isAdblockDetected, setIsAdblockDetected] = useState(false);
  
  // Update config
  const updateConfig = (newConfig: Partial<AdConfigType>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
    }));
  };
  
  // Check for adblocker on component mount
  useEffect(() => {
    const detectAdblock = async () => {
      try {
        // Simple adblock detection by trying to load a fake ad script
        const testAdElement = document.createElement('div');
        testAdElement.className = 'adsbygoogle';
        testAdElement.style.position = 'absolute';
        testAdElement.style.left = '-999px';
        testAdElement.style.top = '-999px';
        testAdElement.style.height = '1px';
        testAdElement.style.width = '1px';
        document.body.appendChild(testAdElement);
        
        // Wait a short time to allow adblockers to act
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if the element has been hidden or removed by adblocker
        const adblockDetected = testAdElement.offsetHeight === 0 || 
                               !document.body.contains(testAdElement);
        
        // Clean up test element
        if (document.body.contains(testAdElement)) {
          document.body.removeChild(testAdElement);
        }
        
        setIsAdblockDetected(adblockDetected);
        
        if (adblockDetected && config.isProduction) {
          console.warn('Adblock detected: Some features may not work correctly.');
        }
      } catch (error) {
        console.error('Error detecting adblock:', error);
      }
    };
    
    // Only run detection in production mode or if specifically enabled
    if (config.isProduction) {
      detectAdblock();
    }
  }, [config.isProduction]);
  
  // Inject ad scripts based on selected providers when in production
  useEffect(() => {
    if (!config.isProduction) return;
    
    // Helper to add script to head
    const addScript = (src: string, id: string, async = true, attributes: Record<string, string> = {}) => {
      // Avoid adding duplicate scripts
      if (document.getElementById(id)) return;
      
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = async;
      
      // Add any additional attributes
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      
      document.head.appendChild(script);
      return script;
    };
    
    // Clean up helper
    const cleanup: (() => void)[] = [];
    
    // Add the appropriate scripts based on config
    if (config.provider === 'adsense' || config.provider === 'simulated') {
      if (config.adsenseClientId) {
        const script = addScript(
          `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adsenseClientId}`,
          'google-adsense-script',
          true,
          { 'crossorigin': 'anonymous' }
        );
        if (script) cleanup.push(() => document.head.removeChild(script));
      }
    }
    
    if (config.provider === 'admob' || config.provider === 'simulated') {
      // Typically AdMob is used in mobile apps via a native SDK
      // For web, it would be a custom implementation
      // This is a placeholder for future AdMob web implementation
    }
    
    if (config.provider === 'ezoic' || config.provider === 'simulated') {
      if (config.ezoicSiteId) {
        const script = addScript(
          `//www.ezojs.com/ezoic/sa.min.js?ezuid=${config.ezoicSiteId}`,
          'ezoic-script'
        );
        if (script) cleanup.push(() => document.head.removeChild(script));
      }
    }
    
    if (config.provider === 'adsterra' || config.provider === 'simulated') {
      if (config.adsterraAccountId) {
        // Adsterra typically provides custom script urls for each zone/placement
        // This is just a placeholder for the account-level script if needed
        const script = addScript(
          `//www.adsterra.com/script/${config.adsterraAccountId}.js`,
          'adsterra-base-script'
        );
        if (script) cleanup.push(() => document.head.removeChild(script));
      }
    }
    
    // Clean up scripts on unmount
    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [config.provider, config.isProduction, config.adsenseClientId, config.admobAppId, config.ezoicSiteId, config.adsterraAccountId]);
  
  return (
    <AdProviderContext.Provider 
      value={{
        config,
        isAdblockDetected,
        updateConfig,
      }}
    >
      {children}
    </AdProviderContext.Provider>
  );
};

interface SimulatedAdNoticeProps {
  children?: React.ReactNode;
}

// Use for simulating ads in development
export const SimulatedAdNotice: React.FC<SimulatedAdNoticeProps> = ({ children }) => {
  const { config } = useAdProvider();
  
  if (config.isProduction) return <>{children}</>;
  
  return (
    <div className="simulated-ad-notice bg-yellow-100 text-yellow-800 text-xs p-1 rounded">
      <p className="font-medium">Simulated Ad (Development Mode)</p>
      {children}
    </div>
  );
};

export default AdProviderContext;