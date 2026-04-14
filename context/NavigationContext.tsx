import React, { createContext, ReactNode, startTransition, useContext, useState } from 'react';
import { Page } from '../types';

interface NavigationContextType {
  activePage: Page;
  navigate: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<Page>(Page.LEARN);

  const navigate = (page: Page) => {
    startTransition(() => {
      setActivePage(page);
    });
    window.scrollTo(0, 0);
  };

  return (
    <NavigationContext.Provider value={{ activePage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
