import { FastifyInstance } from 'fastify';
import { UserRole } from '../../utils/constants.js';
import { SubscriptionServiceImpl } from './subscription.service.js';
import { SubscriptionController } from './subscription.controller.js';

export async function subscriptionRoutes(app: FastifyInstance) {
  const subscriptionService = new SubscriptionServiceImpl(app.prisma);
  const subscriptionController = new SubscriptionController(subscriptionService);

  app.get('/', { 
    preHandler: app.authorize([String(UserRole.ADMIN)]),
    schema: {
      summary: 'List all subscriptions (Admin only)',
      tags: ['Subscriptions'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          pageSize: { type: 'number', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  userId: { type: 'string' },
                  magazineId: { type: 'string' },
                  status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED'] },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                pageSize: { type: 'number' },
                totalItems: { type: 'number' },
                totalPages: { type: 'number' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, subscriptionController.getAllSubscriptions);

  app.post('/', { 
    preHandler: app.authorize([String(UserRole.SUBSCRIBER), String(UserRole.ADMIN)]),
    schema: {
      summary: 'Create a new subscription',
      tags: ['Subscriptions'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          magazineId: { type: 'string' }
        },
        required: ['magazineId']
      }
    }
  }, subscriptionController.createSubscription);

  app.post('/:id/activate', { 
    preHandler: app.authorize([String(UserRole.ADMIN), String(UserRole.PUBLISHER)]),
    schema: {
      summary: 'Activate a subscription',
      tags: ['Subscriptions'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, subscriptionController.activateSubscription);

  app.post('/:id/cancel', { 
    preHandler: app.authorize([String(UserRole.ADMIN), String(UserRole.SUBSCRIBER)]),
    schema: {
      summary: 'Cancel a subscription',
      tags: ['Subscriptions'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, subscriptionController.cancelSubscription);
}
