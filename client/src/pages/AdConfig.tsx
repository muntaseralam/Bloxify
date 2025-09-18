
import React from 'react';

export default function AdConfig() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Ads are Active!</h1>
      <p className="text-lg">
        Your AdSense ads are now running in production mode with:
      </p>
      <ul className="mt-4 space-y-2">
        <li>• Publisher ID: ca-pub-6381797008244610</li>
        <li>• Top Banner ID: 8073659347</li>
        <li>• Bottom Banner ID: 5489564891</li>
      </ul>
      <p className="mt-6 text-green-600 font-bold">
        ✅ No configuration needed - ads are automatically active!
      </p>
    </div>
  );
}
