import { FastifyInstance } from 'fastify';
import { ActivityServiceImpl } from '../modules/activities/activity.service.js';

export async function registerActivity(app: FastifyInstance) {
  const activityService = new ActivityServiceImpl(app.prisma);

  app.decorate('logActivity', async (action: string, actorId?: string, meta?: unknown) => {
    try {
      await activityService.logActivity(action, actorId, meta);
    } catch (err) {
      app.log.error({ err }, 'Failed to write activity');
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    logActivity: (action: string, actorId?: string, meta?: unknown) => Promise<void>;
  }
}

