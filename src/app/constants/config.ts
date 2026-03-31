export const API_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
} as const;

export const PAYMENT_CONFIG = {
  TRANSACTION_PREFIX: 'HN',
  TIMEOUT_MINUTES: 30,
} as const;

export const QUERY_CONFIG = {
  STALE_TIME: 1000 * 60 * 5,
  RETRY_ATTEMPTS: 3,
  CACHE_TIME: 1000 * 60 * 10,
} as const;

export const AUTH_CONFIG = {
  SESSION_TIMEOUT: 1000 * 60 * 30,
  REMEMBER_ME_DAYS: 30,
} as const;
