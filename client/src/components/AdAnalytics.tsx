
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdProvider } from '@/context/AdProviderContext';

interface AdMetrics {
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
}

export const AdAnalytics = () => {
  const { config } = useAdProvider();
  const [metrics, setMetrics] = useState<AdMetrics>({
    impressions: 0,
    clicks: 0,
    revenue: 0,
    ctr: 0
  });

  // Simulate ad metrics (in production, you'd get these from ad networks)
  useEffect(() => {
    if (config.isProduction) {
      // Load actual metrics from ad networks APIs
      // This is just simulated data for demo
      const interval = setInterval(() => {
        setMetrics(prev => ({
          impressions: prev.impressions + Math.floor(Math.random() * 5),
          clicks: prev.clicks + Math.floor(Math.random() * 2),
          revenue: prev.revenue + (Math.random() * 0.50),
          ctr: prev.clicks > 0 ? (prev.clicks / prev.impressions) * 100 : 0
        }));
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [config.isProduction]);

  if (!config.isProduction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ad analytics will appear here in production mode.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.impressions.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.clicks.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${metrics.revenue.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.ctr.toFixed(2)}%</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdAnalytics;
