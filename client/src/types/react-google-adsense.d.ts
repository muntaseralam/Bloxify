declare module 'react-google-adsense' {
  import React from 'react';
  
  interface GoogleAdProps {
    client: string;
    slot: string;
    className?: string;
    style?: React.CSSProperties;
    format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal' | string;
    responsive?: string | boolean;
    layout?: string;
    layoutKey?: string;
    insClass?: string;
    dataAdRegion?: string;
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
  }
  
  const AdSense: {
    Google: React.FC<GoogleAdProps>;
  };
  
  export default AdSense;
}