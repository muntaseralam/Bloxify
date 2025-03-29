declare module 'react-adsense' {
  import React from 'react';
  
  interface GoogleAdProps {
    client: string;
    slot: string;
    className?: string;
    style?: React.CSSProperties;
    format?: string;
    responsive?: string;
    layout?: string;
    layoutKey?: string;
    insClass?: string;
    dataAdRegion?: string;
    children?: React.ReactNode;
    width?: number | string;
    height?: number | string;
  }
  
  interface InArticleAdProps {
    className?: string;
    style?: React.CSSProperties;
    client: string;
    slot: string;
    layout?: string;
    layoutKey?: string;
    format?: string;
    responsive?: string;
  }
  
  interface InFeedAdProps {
    className?: string;
    style?: React.CSSProperties;
    client: string;
    slot: string;
    layout?: string;
    layoutKey?: string;
    format?: string;
    responsive?: string;
  }
  
  const AdSense: {
    Google: React.FC<GoogleAdProps>;
    InArticle: React.FC<InArticleAdProps>;
    InFeed: React.FC<InFeedAdProps>;
  };
  
  export default AdSense;
}

// Declaration for Google AdSense global object
interface Window {
  adsbygoogle?: any[];
}