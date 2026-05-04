
// Simple in-memory rate limiter for Next.js API routes
// Note: In a production environment with multiple server instances, 
// you should use a distributed store like Redis (e.g., Upstash).

type RateLimitOptions = {
  interval: number; // milliseconds
  uniqueTokenPerInterval: number; // Max users per interval
};

export const rateLimit = (options: RateLimitOptions) => {
  const tokenCache = new Map();
  
  return {
    check: (res: Response | any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const tokenCount = tokenCache.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1, now]);
        } else {
          const [count, lastTime] = tokenCount;
          
          if (now - lastTime > options.interval) {
            tokenCache.set(token, [1, now]);
          } else {
            if (count >= limit) {
              return reject(new Error('Rate limit exceeded'));
            }
            tokenCache.set(token, [count + 1, lastTime]);
          }
        }
        
        // Periodic cleanup of the cache to prevent memory leaks
        if (tokenCache.size > options.uniqueTokenPerInterval) {
          const oldestEntry = Array.from(tokenCache.entries())[0];
          if (oldestEntry) tokenCache.delete(oldestEntry[0]);
        }
        
        resolve();
      }),
  };
};
