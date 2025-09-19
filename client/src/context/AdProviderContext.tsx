import { createContext, useContext, ReactNode } from 'react';

interface AdConfigType {
  isProduction: boolean;
  provider?: 'adsense' | 'ezoic' | 'adsterra' | 'simulated';
}

interface AdContextType {
  config: AdConfigType;
}

const AdProviderContext = createContext<AdContextType>({
  config: { isProduction: true, provider: 'adsense' }
});

export const useAdProvider = () => useContext(AdProviderContext);

interface AdProviderProviderProps {
  children: ReactNode;
  initialConfig?: AdConfigType;
}

export const AdProviderProvider: React.FC<AdProviderProviderProps> = ({ children, initialConfig }) => {
  const config = initialConfig || { isProduction: true, provider: 'adsense' };

  return (
    <AdProviderContext.Provider value={{ config }}>
      {children}
    </AdProviderContext.Provider>
  );
};

export const SimulatedAdNotice: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};