// Ad network configuration for the BloxToken app
// Settings are saved to localStorage via the Ad Config page

export type AdNetworkType = 'adsense' | 'ezoic' | 'adsterra';

interface AdNetworkConfig {
  enabled: boolean;
  // Account IDs
  adsensePublisherId?: string; // Format: 'ca-pub-XXXXXXXXXXXXXXXX'
  ezoicSiteId?: string;        // Format: Your Ezoic Site ID number
  adsterraSiteId?: string;     // Format: Your Adsterra Publisher ID
  
  // Ad unit IDs
  adsenseBannerTopId?: string;
  adsenseBannerBottomId?: string;
  adsterraInterstitialZoneId?: string;
  adsterraPopupZoneId?: string;
  adsterraRewardedVideoZoneId?: string;
}

// Default configuration to start with  
const defaultConfig: AdNetworkConfig = {
  enabled: false,
  // Real AdSense configuration
  adsensePublisherId: 'ca-pub-6381797008244610',
  adsenseBannerTopId: '8073659347',
  adsenseBannerBottomId: '5489564891'
};

// Check if we're in production environment
function isProductionEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for manual production mode setting FIRST
  const manualMode = localStorage.getItem('blox_production_mode');
  if (manualMode === 'true') return true;
  
  // Auto-detect production based on domain
  const hostname = window.location.hostname;
  const isReplit = hostname.includes('replit.app') || hostname.includes('repl.co');
  const isCustomDomain = !hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !isReplit;
  
  return isCustomDomain || isReplit;
}

// Function to load config from localStorage
function loadConfigFromStorage(): AdNetworkConfig {
  // Only access localStorage in browser environment
  if (typeof window === 'undefined') return { ...defaultConfig, enabled: true };
  
  try {
    const savedConfig = localStorage.getItem('blox_ad_config');
    const isProduction = isProductionEnvironment();
    
    console.log('Loading ad config - isProduction:', isProduction);
    console.log('Manual production mode:', localStorage.getItem('blox_production_mode'));
    console.log('Hostname:', window.location.hostname);
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      console.log('Parsed saved config:', parsedConfig);
      
      // Filter out only the properties we need for our config
      const filteredConfig: AdNetworkConfig = {
        ...defaultConfig,
        enabled: isProduction && (!!defaultConfig.adsensePublisherId || !!parsedConfig.adsensePublisherId || !!parsedConfig.ezoicSiteId || !!parsedConfig.adsterraSiteId),
        adsensePublisherId: parsedConfig.adsensePublisherId || defaultConfig.adsensePublisherId,
        ezoicSiteId: parsedConfig.ezoicSiteId || undefined,
        adsterraSiteId: parsedConfig.adsterraSiteId || undefined,
        adsenseBannerTopId: parsedConfig.adsenseBannerTopId || defaultConfig.adsenseBannerTopId,
        adsenseBannerBottomId: parsedConfig.adsenseBannerBottomId || defaultConfig.adsenseBannerBottomId,
        adsterraInterstitialZoneId: parsedConfig.adsterraInterstitialZoneId || undefined,
        adsterraPopupZoneId: parsedConfig.adsterraPopupZoneId || undefined,
        adsterraRewardedVideoZoneId: parsedConfig.adsterraRewardedVideoZoneId || undefined
      };
      
      console.log('Final config:', filteredConfig);
      return filteredConfig;
    } else {
      // No saved config, use defaults with production check
      const finalConfig = { 
        ...defaultConfig, 
        enabled: isProduction && !!defaultConfig.adsensePublisherId 
      };
      console.log('Using default config:', finalConfig);
      return finalConfig;
    }
  } catch (e) {
    console.error('Error loading ad configuration from localStorage:', e);
  }
  
  return { ...defaultConfig, enabled: isProductionEnvironment() && !!defaultConfig.adsensePublisherId };
}

// Export the configuration
export const AD_CONFIG: AdNetworkConfig = loadConfigFromStorage();

// Function to load AdSense script
export function loadAdSenseScript() {
  if (!AD_CONFIG.enabled || !AD_CONFIG.adsensePublisherId) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.adsensePublisherId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// Function to load Ezoic script
export function loadEzoicScript() {
  if (!AD_CONFIG.enabled || !AD_CONFIG.ezoicSiteId) return;
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `//www.ezojs.com/ezoic/sa.min.js?ezuid=${AD_CONFIG.ezoicSiteId}`;
  document.head.appendChild(script);
}

// Function to load Adsterra script (base script)
export function loadAdsterraScript() {
  if (!AD_CONFIG.enabled || !AD_CONFIG.adsterraSiteId) return;
  
  // Adsterra typically provides custom scripts for each ad unit
  // This is just a placeholder for initialization
  const script = document.createElement('script');
  script.async = true;
  script.src = `//www.adsterra.com/script/${AD_CONFIG.adsterraSiteId}.js`;
  document.head.appendChild(script);
}