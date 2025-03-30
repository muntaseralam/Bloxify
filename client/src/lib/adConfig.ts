// Ad network configuration for the BloxToken app
// When publishing, update these values with your actual account information

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

// In development mode, this will use simulated ads
// In production, set this to true and uncomment the relevant IDs
export const AD_CONFIG: AdNetworkConfig = {
  enabled: false, // Set to true in production
  
  // Google AdSense
  // adsensePublisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
  // adsenseBannerTopId: 'XXXXXXXXXX',
  // adsenseBannerBottomId: 'XXXXXXXXXX',
  
  // Google AdMob
  // admobAppId: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY',
  // admobRewardedVideoId: 'ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ',
  
  // Ezoic
  // ezoicSiteId: '123456',
  
  // Adsterra
  // adsterraSiteId: 'XXXXXXXXX',
  // adsterraInterstitialZoneId: 'XXXXXXXXX',
  // adsterraPopupZoneId: 'XXXXXXXXX',
};

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