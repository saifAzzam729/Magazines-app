import { PrismaClient } from '@prisma/client';
import { CreateActivityRequest, ActivityLog } from './activity.model.js';

export interface ActivityService {
  logActivity(action: string, actorId?: string, meta?: any): Promise<ActivityLog>;
}

export class ActivityServiceImpl implements ActivityService {
  constructor(private prisma: PrismaClient) {}

  async logActivity(action: string, actorId?: string, meta?: any): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        action,
        actorId: actorId || null,
        meta: meta || null
      }
    });
  }
}
