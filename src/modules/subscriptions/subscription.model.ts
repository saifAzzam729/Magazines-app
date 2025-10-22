import { z } from 'zod';
import { SubscriptionStatus as PrismaSubscriptionStatus } from '@prisma/client';

export const subscribeSchema = z.object({ 
  magazineId: z.string().min(1) 
});

export interface Subscription {
  id: string;
  userId: string;
  magazineId: string;
  status: PrismaSubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  magazineId: string;
}
