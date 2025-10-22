import { FastifyInstance } from 'fastify';
import { UserRole } from '../../utils/constants.js';
import { MagazineServiceImpl } from './magazine.service.js';
import { MagazineController } from './magazine.controller.js';

export async function magazineRoutes(app: FastifyInstance) {
  const magazineService = new MagazineServiceImpl(app.prisma);
  const magazineController = new MagazineController(magazineService);

  app.get('/', {
    schema: {
      summary: 'List magazines',
      tags: ['Magazines'],
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
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      publisherId: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                pagination: {
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
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, magazineController.getAllMagazines);

  app.post('/', { 
    preHandler: app.authorize([String(UserRole.ADMIN), String(UserRole.PUBLISHER)]),
    schema: {
      summary: 'Create a new magazine',
      tags: ['Magazines'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 2 },
          description: { type: 'string', minLength: 2 }
        },
        required: ['title', 'description']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                publisherId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, magazineController.createMagazine);

  app.put('/:id', { 
    preHandler: app.authorize([String(UserRole.ADMIN), String(UserRole.PUBLISHER)]),
    schema: {
      summary: 'Update a magazine',
      tags: ['Magazines'],
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
          title: { type: 'string', minLength: 2 },
          description: { type: 'string', minLength: 2 }
        },
        required: ['title', 'description']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                publisherId: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, magazineController.updateMagazine);

  app.delete('/:id', { 
    preHandler: app.authorize([String(UserRole.ADMIN), String(UserRole.PUBLISHER)]),
    schema: {
      summary: 'Delete a magazine',
      tags: ['Magazines'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                ok: { type: 'boolean' }
              }
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, magazineController.deleteMagazine);
}
