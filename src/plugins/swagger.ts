import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Magazine Subscriptions API',
        version: '0.1.0',
        description: 'A comprehensive API for managing digital magazine subscriptions with RBAC, comments, and activity logging'
      },
      servers: [{ url: 'http://localhost:3000/v1' }],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Authentication', description: 'User authentication and authorization' },
        { name: 'Magazines', description: 'Magazine management (CRUD operations)' },
        { name: 'Comments', description: 'Comment management and moderation' },
        { name: 'Subscriptions', description: 'Subscription management' },
        { name: 'Admin', description: 'Administrative operations' }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        examples: {
          LoginExample: {
            summary: 'Login Request',
            value: {
              email: 'user@example.com',
              password: 'password123'
            }
          },
          RegisterExample: {
            summary: 'Registration Request',
            value: {
              email: 'newuser@example.com',
              password: 'password123',
              name: 'John Doe',
              role: 'SUBSCRIBER'
            }
          },
          SubscriptionExample: {
            summary: 'Create Subscription',
            value: {
              magazineId: 'magazine_id_here'
            }
          },
          CommentExample: {
            summary: 'Create Comment',
            value: {
              magazineId: 'magazine_id_here',
              content: 'This is a great article!'
            }
          }
        }
      }
    }
  });
  // Add route to expose OpenAPI spec
  app.get('/openapi.json', { schema: { hide: true } }, async (request, reply) => {
    return app.swagger();
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    },
    staticCSP: false,
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    }
  });
}

