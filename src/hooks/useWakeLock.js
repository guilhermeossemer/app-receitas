import { useEffect, useRef } from 'react';

export function useWakeLock(enabled) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    async function requestWakeLock() {
      if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') {
        return;
      }

      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        wakeLockRef.current.addEventListener('release', () => {
          wakeLockRef.current = null;
        });
      } catch (error) {
        console.error('Wake lock request failed:', error);
      }
    }

    function handleVisibilityChange() {
      if (!cancelled && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch((error) => {
          console.error('Wake lock release failed:', error);
        });
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
}
