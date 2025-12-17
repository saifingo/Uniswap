// Base URLs for different environments
const BASE_URLS = {
  development: 'https://api-testnet.example.com/v1',
  production: 'https://api.example.com/v1',
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    NONCE: '/auth/nonce',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  
  // Token Related
  TOKENS: {
    LIST: '/tokens',
    PRICE: '/tokens/price',
    BALANCE: '/tokens/balance',
  },
  
  // Transactions
  TRANSACTIONS: {
    HISTORY: '/transactions',
    STATUS: '/transactions/status',
  },
  
  // Market Data
  MARKET: {
    CHART: '/market/chart',
    STATS: '/market/stats',
  },
  
  // User Related
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
  },
};

export const getBaseUrl = () => {
  return process.env.NODE_ENV === 'development' ? BASE_URLS.development : BASE_URLS.production;
};
