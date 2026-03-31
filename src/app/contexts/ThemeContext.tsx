import React, { createContext, useContext } from 'react';

interface ThemeContextType {
  // Theme is now fixed to Modern Vibrant
  theme: 'modern-vibrant';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value: ThemeContextType = {
    theme: 'modern-vibrant',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}