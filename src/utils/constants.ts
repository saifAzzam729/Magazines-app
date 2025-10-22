// Application constants and enums
export enum UserRole {
  ADMIN = 'ADMIN',
  PUBLISHER = 'PUBLISHER',
  SUBSCRIBER = 'SUBSCRIBER'
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// Application constants
export const APP_CONSTANTS = {
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY_DAYS: 7
  },
  EMAIL: {
    VERIFICATION_EXPIRY_HOURS: 24,
    PASSWORD_RESET_EXPIRY_HOURS: 1
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100
  }
} as const;

// Email template names
export const EMAIL_TEMPLATES = {
  VERIFICATION: 'emailVerification.html',
  PASSWORD_RESET: 'passwordReset.html',
  SUBSCRIPTION_REMINDER: 'subscriptionReminder.html',
  SUBSCRIPTION_ACTIVE: 'subscriptionActive.html',
  REPORT: 'reportTemplate.html'
} as const;
