// Rate limiter with in-memory store
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests } = config;

  return {
    checkLimit: (key: string): { allowed: boolean; remaining: number; resetTime: number } => {
      const now = Date.now();
      const record = rateLimitStore[key];

      if (!record || now > record.resetTime) {
        // Create new record
        rateLimitStore[key] = {
          count: 1,
          resetTime: now + windowMs,
        };
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime: rateLimitStore[key].resetTime,
        };
      }

      if (record.count < maxRequests) {
        record.count++;
        return {
          allowed: true,
          remaining: maxRequests - record.count,
          resetTime: record.resetTime,
        };
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    },

    reset: (key: string) => {
      delete rateLimitStore[key];
    },

    resetAll: () => {
      Object.keys(rateLimitStore).forEach((key) => {
        delete rateLimitStore[key];
      });
    },
  };
}

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (now > rateLimitStore[key].resetTime) {
      delete rateLimitStore[key];
    }
  });
}, 3600000); // 1 hour
