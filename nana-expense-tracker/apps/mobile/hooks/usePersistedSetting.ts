import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Boolean app setting persisted in AsyncStorage (localStorage on web).
 */
export function usePersistedSetting(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!cancelled && stored !== null) {
          setValue(stored === 'true');
        }
      })
      .catch(() => {
        // keep the default on read failure
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    (next: boolean) => {
      setValue(next);
      AsyncStorage.setItem(key, String(next)).catch(() => {});
    },
    [key]
  );

  return [value, update] as const;
}
