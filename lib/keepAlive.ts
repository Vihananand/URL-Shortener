interface PingRecord {
  lastPing: number;
  pingCount: number;
  errors: number;
}
const pingRecords: { [key: string]: PingRecord } = {};
const PING_INTERVAL_MS = 5 * 60 * 1000; 
const MAX_PINGS_PER_HOUR = 12; 
const ERROR_THRESHOLD = 3; 
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
  if (!pingRecords[key]) {
    pingRecords[key] = {
      lastPing: 0,
      pingCount: 0,
      errors: 0,
    };
  }
  const record = pingRecords[key];
  return {
    shouldPing: (): boolean => {
      const now = Date.now();
      if (record.errors >= ERROR_THRESHOLD) {
        console.warn(
          `⚠️ [KeepAlive] Too many errors for ${key}, stopping pings`
        );
        return false;
      }
      if (now - record.lastPing < pingIntervalMs) {
        return false;
      }
      const hourAgo = now - 60 * 60 * 1000;
      if (record.pingCount >= maxPingsPerHour) {
        console.warn(
          `⚠️ [KeepAlive] Hourly limit reached for ${key} (${record.pingCount}/${maxPingsPerHour})`
        );
        return false;
      }
      return true;
    },
    recordPing: (): void => {
      record.lastPing = Date.now();
      record.pingCount++;
      record.errors = 0; 
      console.log(
        `✓ [KeepAlive] Database ping #${record.pingCount} for ${key}`
      );
    },
    recordError: (): void => {
      record.errors++;
      console.error(
        `✗ [KeepAlive] Ping error for ${key} (${record.errors}/${ERROR_THRESHOLD})`
      );
    },
    getStatus: () => ({
      lastPing: new Date(record.lastPing).toISOString(),
      pingCount: record.pingCount,
      errors: record.errors,
      hitsLimit: record.pingCount >= maxPingsPerHour,
    }),
    resetHourly: (): void => {
      record.pingCount = 0;
      console.log(`↻ [KeepAlive] Hourly counter reset for ${key}`);
    },
  };
}
setInterval(() => {
  const now = Date.now();
  Object.keys(pingRecords).forEach((key) => {
    const record = pingRecords[key];
    if (now - record.lastPing > 24 * 60 * 60 * 1000) {
      delete pingRecords[key];
    }
  });
}, 60 * 60 * 1000);
