import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '@/theme';
import { storage } from '@/services/storage';
import { useAppStore } from '@/store/useAppStore';

const ThemeCtx = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const userDark = useAppStore((s) => s.darkMode);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    storage.getTheme().then(setThemeMode);
  }, []);

  const effectiveDark = userDark || (themeMode === 'system' && systemScheme === 'dark');
  const theme = effectiveDark ? darkTheme : lightTheme;
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}
