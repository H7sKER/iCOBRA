import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ShizukuStatus = 'checking' | 'not_granted' | 'granted';

interface ShizukuContextType {
  status: ShizukuStatus;
  grantPermission: () => Promise<void>;
}

const ShizukuContext = createContext<ShizukuContextType>({
  status: 'checking',
  grantPermission: async () => {},
});

const STORAGE_KEY = 'icobra_shizuku_granted';

export function ShizukuProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ShizukuStatus>('checking');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      setStatus(val === 'true' ? 'granted' : 'not_granted');
    });
  }, []);

  const grantPermission = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setStatus('granted');
  }, []);

  return (
    <ShizukuContext.Provider value={{ status, grantPermission }}>
      {children}
    </ShizukuContext.Provider>
  );
}

export function useShizuku() {
  return useContext(ShizukuContext);
}
