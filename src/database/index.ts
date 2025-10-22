// Database utilities and exports
export { PrismaClient } from '@prisma/client';

// Re-export Prisma types for convenience
export type {
  User,
  Magazine,
  Subscription,
  Comment,
  ActivityLog,
  RefreshToken,
  BlacklistedToken,
  UserRole,
  SubscriptionStatus
} from '@prisma/client';
