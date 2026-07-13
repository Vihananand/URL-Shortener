import { useEffect } from 'react';
export function useKeepAlive() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/keep-alive', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.warn('[Keep-Alive] Ping failed:', err);
      }
    }, 5 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);
}
