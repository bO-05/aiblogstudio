import { RateLimitStatus } from '../types';

const RATE_LIMIT_KEY = 'ai-blog-studio-rate-limit';
const MAX_REQUESTS = parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_HOUR || '10');
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const rateLimiter = {
  checkLimit: (): RateLimitStatus => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      const now = Date.now();
      
      if (!stored) {
        return { remaining: MAX_REQUESTS, resetTime: now + WINDOW_MS, isLimited: false };
      }

      const { requests, resetTime } = JSON.parse(stored);
      
      // Reset if window has passed
      if (now > resetTime) {
        return { remaining: MAX_REQUESTS, resetTime: now + WINDOW_MS, isLimited: false };
      }

      const remaining = Math.max(0, MAX_REQUESTS - requests.length);
      return { 
        remaining, 
        resetTime, 
        isLimited: remaining === 0 
      };
    } catch {
      return { remaining: MAX_REQUESTS, resetTime: Date.now() + WINDOW_MS, isLimited: false };
    }
  },

  recordRequest: () => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      const now = Date.now();
      const newResetTime = now + WINDOW_MS;
      
      if (!stored) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          requests: [now],
          resetTime: newResetTime
        }));
        return;
      }

      const { requests, resetTime } = JSON.parse(stored);
      
      // Reset if window has passed
      if (now > resetTime) {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
          requests: [now],
          resetTime: newResetTime
        }));
        return;
      }

      // Add new request
      requests.push(now);
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({
        requests,
        resetTime
      }));
    } catch (error) {
      console.error('Rate limiter error:', error);
    }
  }
};