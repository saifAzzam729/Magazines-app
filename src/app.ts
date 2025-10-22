import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import cors from '@fastify/cors';
import { registerSwagger } from './plugins/swagger.js';
import { registerPrisma } from './plugins/prisma.js';
import { registerAuth } from './plugins/auth.js';
import { registerRoutes } from './routes/index.js';
import { registerActivity } from './plugins/activity.js';
import { registerJobs } from './scheduler/index.js';
import { logger } from './utils/logger.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Set up logger instance
  logger.setFastifyInstance(app);

  await app.register(sensible);
  await app.register(cors, { origin: true });
  await registerSwagger(app);
  await registerPrisma(app);
  await registerAuth(app);
  await registerActivity(app);
  // Add root route
  app.get('/', async (request, reply) => {
    return reply.redirect('/docs');
  });

  await app.register(registerRoutes, { prefix: '/v1' });
  registerJobs(app);

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'Unhandled error');
    const statusCode = (error as any).statusCode ?? 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal Server Error';
    if ((error as any).issues && Array.isArray((error as any).issues)) {
      code = 'VALIDATION_ERROR';
      message = 'Invalid request payload';
      return reply.status(400).send({ code, message, issues: (error as any).issues });
    }
    const err: any = error;
    if (err.code === 'P2002') {
      code = 'UNIQUE_CONSTRAINT';
      message = 'Duplicate value violates unique constraint';
      return reply.status(409).send({ code, message, target: err.meta?.target });
    }
    message = statusCode === 500 ? 'Internal Server Error' : error.message;
    reply.status(statusCode).send({ code, message });
  });

  return app;
}

