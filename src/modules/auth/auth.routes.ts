import { FastifyInstance } from 'fastify';
import { AuthServiceImpl } from './auth.service.js';
import { AuthController } from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthServiceImpl(
    app.prisma,
    app.createTokens,
    app.rotateRefreshToken,
    app.revokeToken
  );
  const authController = new AuthController(authService);

  app.post('/register', {
    schema: { 
      summary: 'Register a new user',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string', minLength: 2 },
          role: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] }
        },
        required: ['email', 'password', 'name'],
        examples: [{
          email: 'newuser@example.com',
          password: 'password123',
          name: 'John Doe',
          role: 'SUBSCRIBER'
        }]
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
                email: { type: 'string', format: 'email' },
                name: { type: 'string' },
                role: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] }
              }
            },
            timestamp: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      }
    }
  }, authController.register);

  app.post('/login', {
    schema: { 
      summary: 'Login and receive JWT tokens',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        },
        required: ['email', 'password'],
        examples: [
          {
            email: 'admin@example.com',
            password: 'admin123'
          },
          {
            email: 'publisher@example.com',
            password: 'publisher123'
          },
          {
            email: 'subscriber@example.com',
            password: 'subscriber123'
          }
        ]
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
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' }
                  }
                },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string', nullable: true },
                    role: { type: 'string', enum: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'] }
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
  }, authController.login);

  app.post('/refresh', {
    schema: { 
      summary: 'Refresh access token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' }
        },
        required: ['refreshToken']
      }
    }
  }, authController.refresh);

  app.post('/logout', {
    schema: { 
      summary: 'Logout and revoke tokens',
      tags: ['Authentication']
    }
  }, authController.logout);

  app.post('/forgot-password', {
    schema: { 
      summary: 'Request password reset',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' }
        },
        required: ['email']
      }
    }
  }, authController.forgotPassword);

  app.post('/reset-password', {
    schema: { 
      summary: 'Reset password with token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 8 }
        },
        required: ['token', 'password']
      }
    }
  }, authController.resetPassword);

  app.post('/verify-email', {
    schema: { 
      summary: 'Verify email with token',
      tags: ['Authentication'],
      body: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        },
        required: ['token']
      }
    }
  }, authController.verifyEmail);
}
