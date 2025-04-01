// Ad network configuration for the BloxToken app
// Settings are saved to localStorage via the Ad Config page

export type AdNetworkType = 'adsense' | 'admob' | 'ezoic' | 'adsterra';

interface AdNetworkConfig {
  enabled: boolean;
  // Account IDs
  adsensePublisherId?: string; // Format: 'ca-pub-XXXXXXXXXXXXXXXX'
  admobAppId?: string;         // Format: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY'
  ezoicSiteId?: string;        // Format: Your Ezoic Site ID number
  adsterraSiteId?: string;     // Format: Your Adsterra Publisher ID
  
  // Ad unit IDs
  adsenseBannerTopId?: string;
  adsenseBannerBottomId?: string;
  admobRewardedVideoId?: string;
  adsterraInterstitialZoneId?: string;
  adsterraPopupZoneId?: string;
}

// Default configuration to start with
const defaultConfig: AdNetworkConfig = {
  enabled: false
};

// Function to load config from localStorage
function loadConfigFromStorage(): AdNetworkConfig {
  // Only access localStorage in browser environment
  if (typeof window === 'undefined') return defaultConfig;
  
  try {
    const savedConfig = localStorage.getItem('blox_ad_config');
    const productionMode = localStorage.getItem('blox_production_mode');
    
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      return {
        ...defaultConfig,
        enabled: productionMode === 'true',
        adsensePublisherId: parsedConfig.adsensePublisherId || undefined,
        admobAppId: parsedConfig.admobAppId || undefined,
        ezoicSiteId: parsedConfig.ezoicSiteId || undefined,
        adsterraSiteId: parsedConfig.adsterraSiteId || undefined,
        adsenseBannerTopId: parsedConfig.adsenseBannerTopId || undefined,
        adsenseBannerBottomId: parsedConfig.adsenseBannerBottomId || undefined,
        admobRewardedVideoId: parsedConfig.admobRewardedVideoId || undefined,
        adsterraInterstitialZoneId: parsedConfig.adsterraInterstitialZoneId || undefined,
        adsterraPopupZoneId: parsedConfig.adsterraPopupZoneId || undefined
      };
    }
  } catch (e) {
    console.error('Error loading ad configuration from localStorage:', e);
  }
  
  return defaultConfig;
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