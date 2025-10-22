import { FastifyInstance } from 'fastify';
import { ResponseWrapper } from '../utils/response.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      summary: 'Health check',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' }
              }
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    ResponseWrapper.success(reply, { status: 'ok' }, 'Service is healthy');
  });
}

