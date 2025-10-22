import { FastifyInstance } from 'fastify';
import { UserRole } from '../../utils/constants.js';
import { CommentServiceImpl } from './comment.service.js';
import { CommentController } from './comment.controller.js';

export async function commentRoutes(app: FastifyInstance) {
  const commentService = new CommentServiceImpl(app.prisma);
  const commentController = new CommentController(commentService);

  app.get('/', {
    schema: {
      summary: 'List approved comments',
      tags: ['Comments'],
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
                  content: { type: 'string' },
                  magazineId: { type: 'string' },
                  authorId: { type: 'string' },
                  approved: { type: 'boolean' },
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
  }, commentController.getApprovedComments);

  app.post('/', { 
    preHandler: app.authorize([String(UserRole.SUBSCRIBER), String(UserRole.ADMIN)]),
    schema: {
      summary: 'Create a new comment',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          magazineId: { type: 'string' },
          content: { type: 'string', minLength: 1 }
        },
        required: ['magazineId', 'content']
      }
    }
  }, commentController.createComment);

  app.get('/pending', { 
    preHandler: app.authorize([String(UserRole.ADMIN)]),
    schema: {
      summary: 'List pending comments (Admin only)',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }]
    }
  }, commentController.getPendingComments);

  app.post('/:id/approve', { 
    preHandler: app.authorize([String(UserRole.ADMIN)]),
    schema: {
      summary: 'Approve a comment (Admin only)',
      tags: ['Comments'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, commentController.approveComment);
}
