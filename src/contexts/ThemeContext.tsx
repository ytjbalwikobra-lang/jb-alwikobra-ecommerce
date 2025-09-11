import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type Theme = 'dark' | 'light';
type ThemeMode = Theme | 'auto';
type ThemeContextValue = {
  theme: Theme;           // currently applied theme
  mode: ThemeMode;        // persisted user preference
  toggle: () => void;     // toggles between light/dark (sets mode to explicit)
  set: (t: Theme) => void; // sets explicit theme (mode to t)
  setMode: (m: ThemeMode) => void; // sets mode (auto/light/dark)
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  mode: 'dark',
  toggle: () => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ThemeProvider is not mounted; toggle() is a no-op');
    }
    return; // explicit no-op
  },
  set: () => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ThemeProvider is not mounted; set() is a no-op');
    }
    return; // explicit no-op
  },
  setMode: () => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('ThemeProvider is not mounted; setMode() is a no-op');
    }
    return; // explicit no-op
  },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemMedia = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null,
  []);

  const getInitialMode = (): ThemeMode => {
    const stored = (typeof localStorage !== 'undefined' ? localStorage.getItem('themeMode') : null) as ThemeMode | null;
    return stored || 'dark';
  };

  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const computeTheme = (m: ThemeMode): Theme => (m === 'auto' ? (systemMedia?.matches ? 'dark' : 'light') : m);
  const [theme, setTheme] = useState<Theme>(computeTheme(getInitialMode()));
  const mediaListenerAttached = useRef(false);

  // Apply theme to DOM
  const applyTheme = (t: Theme) => {
    try {
      const root = document.documentElement;
      if (t === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
      root.style.backgroundColor = t === 'dark' ? '#000' : '#fff';
      if (document.body) document.body.style.backgroundColor = root.style.backgroundColor;
    } catch (err) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') console.debug('applyTheme skipped (no DOM)');
    }
  };

  useEffect(() => {
    // persist mode
    try { localStorage.setItem('themeMode', mode); } catch (err) {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV !== 'production') console.debug('persist themeMode failed');
    }

    // update theme derived from mode
    const next = computeTheme(mode);
    setTheme(next);

    // attach/detach media listener for auto
    const handleChange = () => {
      if (mode === 'auto') {
        setTheme(computeTheme('auto'));
      }
    };
    if (mode === 'auto' && systemMedia && !mediaListenerAttached.current) {
      systemMedia.addEventListener?.('change', handleChange as EventListener);
      // Fallback for older Safari
      systemMedia.addListener?.(handleChange as any);
      mediaListenerAttached.current = true;
      return () => {
        systemMedia.removeEventListener?.('change', handleChange as EventListener);
        systemMedia.removeListener?.(handleChange as any);
        mediaListenerAttached.current = false;
      };
    }
  }, [mode, systemMedia]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    mode,
    toggle: () => setModeState(theme === 'dark' ? 'light' : 'dark'),
    set: (t: Theme) => setModeState(t),
    setMode: (m: ThemeMode) => setModeState(m),
  }), [theme, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
