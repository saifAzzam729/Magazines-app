import { PrismaClient, SubscriptionStatus } from '@prisma/client';
import { CreateSubscriptionRequest, Subscription } from './subscription.model.js';

export interface SubscriptionService {
  getAllSubscriptions(skip: number, take: number): Promise<{ items: Subscription[]; total: number }>;
  createSubscription(data: CreateSubscriptionRequest, userId: string): Promise<Subscription>;
  activateSubscription(id: string): Promise<Subscription>;
  cancelSubscription(id: string): Promise<Subscription>;
}

export class SubscriptionServiceImpl implements SubscriptionService {
  constructor(private prisma: PrismaClient) {}

  async getAllSubscriptions(skip: number, take: number): Promise<{ items: Subscription[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({ 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' } 
      }),
      this.prisma.subscription.count()
    ]);
    return { items, total };
  }

  async createSubscription(data: CreateSubscriptionRequest, userId: string): Promise<Subscription> {
    return this.prisma.subscription.upsert({
      where: { userId_magazineId: { userId, magazineId: data.magazineId } },
      update: {},
      create: { 
        userId, 
        magazineId: data.magazineId, 
        status: SubscriptionStatus.PENDING 
      }
    });
  }

  async activateSubscription(id: string): Promise<Subscription> {
    return this.prisma.subscription.update({ 
      where: { id }, 
      data: { 
        status: SubscriptionStatus.ACTIVE, 
        startDate: new Date() 
      } 
    });
  }

  async cancelSubscription(id: string): Promise<Subscription> {
    return this.prisma.subscription.update({ 
      where: { id }, 
      data: { 
        status: SubscriptionStatus.CANCELLED, 
        endDate: new Date() 
      } 
    });
  }
}
