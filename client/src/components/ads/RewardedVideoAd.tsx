import React, { useEffect, useState } from 'react';
import { useAdProvider } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '../ui/button';

interface RewardedVideoAdProps {
  onComplete?: () => void;
  onClose?: () => void;
}

const RewardedVideoAd: React.FC<RewardedVideoAdProps> = ({ onComplete, onClose }) => {
  const { config } = useAdProvider();
  const [adDismissed, setAdDismissed] = useState(false);

  // For development/testing
  const handleSimulatedComplete = () => {
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  // In development, show a simulated ad
  if (!config.isProduction) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 text-center">
          <h3 className="text-lg font-bold mb-4">Simulated Rewarded Video Ad</h3>
          <p className="mb-4 text-sm text-gray-600">In production, this will be replaced with a real Adsterra rewarded video ad.</p>
          <Button onClick={handleSimulatedComplete}>Complete Ad (Test)</Button>
        </div>
      </div>
    );
  }

  // Production Adsterra ad
  return (
    <div id="adsterra-rewarded-container" className="fixed inset-0 z-50 bg-black">
      {/* Adsterra script will populate this container */}
      <script async type="text/javascript">
        {`
          atOptions = {
            'key': '${AD_CONFIG.adsterraRewardedVideoZoneId}',
            'format': 'rewarded',
            'height': '100%',
            'width': '100%',
            'params': { onComplete: ${onComplete}, onClose: ${onClose} }
          };
          document.write('<scr' + 'ipt type="text/javascript" src="//www.profitablecreativeformat.com/' + atOptions.key + '/invoke.js"></scr' + 'ipt>');
        `}
      </script>
    </div>
  );
};

export default RewardedVideoAd;