import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { magazineRoutes } from '../modules/magazines/magazine.routes.js';
import { subscriptionRoutes } from '../modules/subscriptions/subscription.routes.js';
import { commentRoutes } from '../modules/comments/comment.routes.js';
import { userRoutes } from '../modules/users/user.routes.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(magazineRoutes, { prefix: '/magazines' });
  await app.register(subscriptionRoutes, { prefix: '/subscriptions' });
  await app.register(commentRoutes, { prefix: '/comments' });
  await app.register(userRoutes, { prefix: '/admin' });
}

