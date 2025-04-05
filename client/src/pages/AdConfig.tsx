import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AD_CONFIG } from '@/lib/adConfig';
import { useAdProvider } from '@/context/AdProviderContext';

// Define a type for our ad network configuration form data
interface AdFormData {
  enabled: boolean;
  
  // Account IDs
  adsensePublisherId: string;
  admobAppId: string;
  ezoicSiteId: string;
  adsterraSiteId: string;
  
  // Ad unit IDs
  adsenseBannerTopId: string;
  adsenseBannerBottomId: string;
  admobRewardedVideoId: string;
  adsterraInterstitialZoneId: string;
  adsterraPopupZoneId: string;
}

export default function AdConfig() {
  const { toast } = useToast();
  const { config, updateConfig } = useAdProvider();
  
  // Initialize form state from the current AD_CONFIG
  const [formData, setFormData] = useState<AdFormData>({
    enabled: AD_CONFIG.enabled,
    adsensePublisherId: AD_CONFIG.adsensePublisherId || '',
    admobAppId: AD_CONFIG.admobAppId || '',
    ezoicSiteId: AD_CONFIG.ezoicSiteId || '',
    adsterraSiteId: AD_CONFIG.adsterraSiteId || '',
    adsenseBannerTopId: AD_CONFIG.adsenseBannerTopId || '',
    adsenseBannerBottomId: AD_CONFIG.adsenseBannerBottomId || '',
    admobRewardedVideoId: AD_CONFIG.admobRewardedVideoId || '',
    adsterraInterstitialZoneId: AD_CONFIG.adsterraInterstitialZoneId || '',
    adsterraPopupZoneId: AD_CONFIG.adsterraPopupZoneId || '',
  });

  // State for production mode toggle
  const [productionMode, setProductionMode] = useState(config.isProduction);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to local storage for persistence
    localStorage.setItem('blox_ad_config', JSON.stringify(formData));
    localStorage.setItem('blox_production_mode', String(productionMode));
    
    // Update the context
    updateConfig({
      isProduction: productionMode,
      provider: getActiveProvider(formData)
    });
    
    toast({
      title: "Ad Configuration Saved",
      description: "Your ad network settings have been updated. Reload the page for changes to take effect.",
    });
  };

  // Determine the active provider based on which fields are filled
  const getActiveProvider = (data: AdFormData) => {
    if (data.adsensePublisherId) return 'adsense';
    if (data.admobAppId) return 'admob';
    if (data.ezoicSiteId) return 'ezoic';
    if (data.adsterraSiteId) return 'adsterra';
    return 'simulated';
  };

  // Load saved configuration on initial load
  useEffect(() => {
    const savedConfig = localStorage.getItem('blox_ad_config');
    const savedProductionMode = localStorage.getItem('blox_production_mode');
    
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setFormData(parsedConfig);
      } catch (error) {
        console.error('Failed to parse saved ad configuration:', error);
      }
    }
    
    if (savedProductionMode) {
      setProductionMode(savedProductionMode === 'true');
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Ad Network Configuration</h1>
      <p className="mb-6 text-muted-foreground">
        Configure your ad network details below. These settings will be saved for future sessions.
        When you're ready to use real ads, toggle "Production Mode" on.
      </p>
      
      <div className="flex items-center space-x-2 mb-6">
        <Switch 
          id="production-mode" 
          checked={productionMode} 
          onCheckedChange={setProductionMode} 
        />
        <Label htmlFor="production-mode" className="font-bold">
          Production Mode 
          {productionMode ? 
            <Badge className="ml-2 bg-green-500">Active</Badge> : 
            <Badge className="ml-2 bg-amber-500">Disabled - Using Simulated Ads</Badge>
          }
        </Label>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="adsense">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="adsense">Google AdSense</TabsTrigger>
            <TabsTrigger value="admob">Google AdMob</TabsTrigger>
            <TabsTrigger value="ezoic">Ezoic</TabsTrigger>
            <TabsTrigger value="adsterra">Adsterra</TabsTrigger>
          </TabsList>
          
          {/* Google AdSense Configuration */}
          <TabsContent value="adsense">
            <Card>
              <CardHeader>
                <CardTitle>Google AdSense Configuration</CardTitle>
                <CardDescription>
                  Configure your Google AdSense publisher ID and ad unit IDs for banner ads.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adsensePublisherId">Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)</Label>
                  <Input 
                    id="adsensePublisherId"
                    name="adsensePublisherId"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={formData.adsensePublisherId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adsenseBannerTopId">Top Banner Ad Unit ID</Label>
                  <Input 
                    id="adsenseBannerTopId"
                    name="adsenseBannerTopId"
                    placeholder="XXXXXXXXXX"
                    value={formData.adsenseBannerTopId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adsenseBannerBottomId">Bottom Banner Ad Unit ID</Label>
                  <Input 
                    id="adsenseBannerBottomId"
                    name="adsenseBannerBottomId"
                    placeholder="XXXXXXXXXX"
                    value={formData.adsenseBannerBottomId}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Google AdMob Configuration */}
          <TabsContent value="admob">
            <Card>
              <CardHeader>
                <CardTitle>Google AdMob Configuration</CardTitle>
                <CardDescription>
                  Configure your Google AdMob app ID and rewarded video ad unit ID.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admobAppId">App ID (ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY)</Label>
                  <Input 
                    id="admobAppId"
                    name="admobAppId"
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
                    value={formData.admobAppId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admobRewardedVideoId">Rewarded Video Ad Unit ID</Label>
                  <Input 
                    id="admobRewardedVideoId"
                    name="admobRewardedVideoId"
                    placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ"
                    value={formData.admobRewardedVideoId}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Ezoic Configuration */}
          <TabsContent value="ezoic">
            <Card>
              <CardHeader>
                <CardTitle>Ezoic Configuration</CardTitle>
                <CardDescription>
                  Configure your Ezoic site ID for AI-powered ad placement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ezoicSiteId">Ezoic Site ID</Label>
                  <Input 
                    id="ezoicSiteId"
                    name="ezoicSiteId"
                    placeholder="123456"
                    value={formData.ezoicSiteId}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Adsterra Configuration */}
          <TabsContent value="adsterra">
            <Card>
              <CardHeader>
                <CardTitle>Adsterra Configuration</CardTitle>
                <CardDescription>
                  Configure your Adsterra publisher ID and zone IDs for interstitial and popup ads.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adsterraSiteId">Publisher ID</Label>
                  <Input 
                    id="adsterraSiteId"
                    name="adsterraSiteId"
                    placeholder="XXXXXXXXX"
                    value={formData.adsterraSiteId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adsterraInterstitialZoneId">Interstitial Zone ID</Label>
                  <Input 
                    id="adsterraInterstitialZoneId"
                    name="adsterraInterstitialZoneId"
                    placeholder="XXXXXXXXX"
                    value={formData.adsterraInterstitialZoneId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adsterraPopupZoneId">Popup Zone ID</Label>
                  <Input 
                    id="adsterraPopupZoneId"
                    name="adsterraPopupZoneId"
                    placeholder="XXXXXXXXX"
                    value={formData.adsterraPopupZoneId}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adsterraRewardedVideoZoneId">Rewarded Video Zone ID</Label>
                  <Input 
                    id="adsterraRewardedVideoZoneId"
                    name="adsterraRewardedVideoZoneId"
                    placeholder="XXXXXXXXX"
                    value={formData.adsterraRewardedVideoZoneId}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <Button type="submit" size="lg" className="w-full">
            Save Ad Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}