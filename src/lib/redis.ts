import { Redis } from '@upstash/redis';

// Initialize Redis client
// Uses environment variables: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
// You can set these in Vercel project settings or .env.local

// Silently fail if not configured (for local dev without Redis)
let redis: Redis | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (e) {
    console.warn('[Redis] Failed to initialize Upstash Redis client');
}

export { redis };

// Analytics-specific keys
export const REDIS_KEYS = {
    VISITORS: 'analytics:visitors',      // Hash of active visitors
    DAILY_STATS: 'analytics:daily',      // Hash for daily stats
    HISTORICAL: 'analytics:historical',  // List of historical visits
};
