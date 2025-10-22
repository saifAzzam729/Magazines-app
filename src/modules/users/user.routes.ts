import { FastifyInstance } from 'fastify';
import { UserRole } from '../../utils/constants.js';
import { UserServiceImpl } from './user.service.js';
import { UserController } from './user.controller.js';

export async function userRoutes(app: FastifyInstance) {
  const userService = new UserServiceImpl(app.prisma);
  const userController = new UserController(userService);
  
  const guard = app.authorize([String(UserRole.ADMIN)]);

  app.get('/users', { 
    preHandler: guard,
    schema: {
      summary: 'List all users (Admin only)',
      tags: ['Admin'],
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
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' }
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
  }, userController.getAllUsers);

  app.get('/roles', {
    preHandler: guard,
    schema: {
      summary: 'List available roles and their permissions (Admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            roles: {
              type: 'array',
              items: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] }
            },
            permissions: { type: 'object' }
          }
        }
      }
    }
  }, userController.listRoles);

  app.get('/me/permissions', {
    preHandler: app.authenticate,
    schema: {
      summary: 'Get current user permissions',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] },
            permissions: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  }, userController.getMyPermissions);

  app.patch('/users/:id/role', { 
    preHandler: guard,
    schema: {
      summary: 'Update user role (Admin only)',
      tags: ['Admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] }
        },
        required: ['role']
      }
    }
  }, userController.updateUserRole);
}
