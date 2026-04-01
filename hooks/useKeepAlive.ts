import { useEffect } from 'react';

/**
 * Hook to keep database connection alive
 * Sends a ping to the server every 5 minutes to prevent idle timeout
 */
export function useKeepAlive() {
  useEffect(() => {
    // Start keep-alive interval
    const interval = setInterval(async () => {
      try {
        await fetch('/api/keep-alive', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        console.warn('[Keep-Alive] Ping failed:', err);
        // Silently fail - don't disrupt user experience
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);
}
