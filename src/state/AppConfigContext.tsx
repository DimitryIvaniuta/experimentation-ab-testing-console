import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { DEFAULT_ADMIN_TOKEN, DEFAULT_API_BASE_URL, normalizeApiBaseUrl } from '../config/runtime';

interface AppConfigState {
  apiBaseUrl: string;
  adminToken: string;
  setApiBaseUrl: (value: string) => void;
  setAdminToken: (value: string) => void;
}

const AppConfigContext = createContext<AppConfigState | null>(null);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(DEFAULT_API_BASE_URL);
  const [adminToken, setAdminToken] = useState(DEFAULT_ADMIN_TOKEN);

  const value = useMemo<AppConfigState>(
    () => ({
      apiBaseUrl,
      adminToken,
      setApiBaseUrl: (nextValue: string) => setApiBaseUrlState(normalizeApiBaseUrl(nextValue)),
      setAdminToken
    }),
    [apiBaseUrl, adminToken]
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfigState {
  const value = useContext(AppConfigContext);
  if (!value) {
    throw new Error('useAppConfig must be used inside AppConfigProvider');
  }
  return value;
}
