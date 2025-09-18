import { createContext, useContext, ReactNode } from 'react';

interface AdConfigType {
  isProduction: boolean;
}

interface AdContextType {
  config: AdConfigType;
}

const AdProviderContext = createContext<AdContextType>({
  config: { isProduction: true }
});

export const useAdProvider = () => useContext(AdProviderContext);

interface AdProviderProviderProps {
  children: ReactNode;
}

export const AdProviderProvider: React.FC<AdProviderProviderProps> = ({ children }) => {
  const config = { isProduction: true };

  return (
    <AdProviderContext.Provider value={{ config }}>
      {children}
    </AdProviderContext.Provider>
  );
};

export const SimulatedAdNotice: React.FC<{ children?: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};