import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function createRateLimiter(config: RateLimitConfig) {
  // Convert windowMs to seconds
  const windowSecs = Math.max(1, Math.floor(config.windowMs / 1000));
  
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSecs} s`),
    ephemeralCache: new Map(),
    analytics: true,
  });

  return {
    checkLimit: async (key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
      try {
        const { success, remaining, reset } = await ratelimit.limit(key);
        return {
          allowed: success,
          remaining,
          resetTime: reset, // timestamp in ms
        };
      } catch (err) {
        console.error("Rate Limiter Error:", err);
        // Fail open if Redis is down
        return {
          allowed: true,
          remaining: 1,
          resetTime: Date.now() + config.windowMs,
        };
      }
    }
  };
}
