// Database keep-alive system to prevent idle suspension
interface PingRecord {
  lastPing: number;
  pingCount: number;
  errors: number;
}

const pingRecords: { [key: string]: PingRecord } = {};

// Configuration
const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (safe interval)
const MAX_PINGS_PER_HOUR = 12; // 60 min / 5 min = 12 pings/hour (well within limits)
const ERROR_THRESHOLD = 3; // Stop pinging after 3 consecutive errors

export interface KeepAliveConfig {
  key: string;
  maxPingsPerHour?: number;
  pingIntervalMs?: number;
}

export function createKeepAlive(config: KeepAliveConfig) {
  const {
    key,
    maxPingsPerHour = MAX_PINGS_PER_HOUR,
    pingIntervalMs = PING_INTERVAL_MS,
  } = config;

  // Initialize record if not exists
  if (!pingRecords[key]) {
    pingRecords[key] = {
      lastPing: 0,
      pingCount: 0,
      errors: 0,
    };
  }

  const record = pingRecords[key];

  return {
    /**
     * Check if we should ping now
     */
    shouldPing: (): boolean => {
      const now = Date.now();

      // Check if we've exceeded error threshold
      if (record.errors >= ERROR_THRESHOLD) {
        console.warn(
          `⚠️ [KeepAlive] Too many errors for ${key}, stopping pings`
        );
        return false;
      }

      // Check if enough time has passed since last ping
      if (now - record.lastPing < pingIntervalMs) {
        return false;
      }

      // Check if we've exceeded hourly limit
      const hourAgo = now - 60 * 60 * 1000;
      if (record.pingCount >= maxPingsPerHour) {
        console.warn(
          `⚠️ [KeepAlive] Hourly limit reached for ${key} (${record.pingCount}/${maxPingsPerHour})`
        );
        return false;
      }

      return true;
    },

    /**
     * Record a successful ping
     */
    recordPing: (): void => {
      record.lastPing = Date.now();
      record.pingCount++;
      record.errors = 0; // Reset error counter on success
      console.log(
        `✓ [KeepAlive] Database ping #${record.pingCount} for ${key}`
      );
    },

    /**
     * Record a ping error
     */
    recordError: (): void => {
      record.errors++;
      console.error(
        `✗ [KeepAlive] Ping error for ${key} (${record.errors}/${ERROR_THRESHOLD})`
      );
    },

    /**
     * Get current status
     */
    getStatus: () => ({
      lastPing: new Date(record.lastPing).toISOString(),
      pingCount: record.pingCount,
      errors: record.errors,
      hitsLimit: record.pingCount >= maxPingsPerHour,
    }),

    /**
     * Reset counters (call this when hourly limit resets)
     */
    resetHourly: (): void => {
      record.pingCount = 0;
      console.log(`↻ [KeepAlive] Hourly counter reset for ${key}`);
    },
  };
}

// Cleanup old records every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(pingRecords).forEach((key) => {
    const record = pingRecords[key];
    // Clean up records that haven't pinged in 24 hours
    if (now - record.lastPing > 24 * 60 * 60 * 1000) {
      delete pingRecords[key];
    }
  });
}, 60 * 60 * 1000);
