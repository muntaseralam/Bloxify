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

// Simplified ad configuration - production ready
export const AD_CONFIG = {
  enabled: true,
  adsensePublisherId: 'ca-pub-6381797008244610',
  adsenseBannerTopId: '5489564891',
  adsenseBannerBottomId: '8073659347'
};

// Always production mode
export const isProductionMode = () => true;

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