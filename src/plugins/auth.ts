import { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { loadEnv } from '../config/env.js';
import { generateToken } from '../utils/tokens.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: string; type?: 'access' | 'refresh' };
    user: { sub: string; role: string; type?: 'access' | 'refresh' };
  }
}

export async function registerAuth(app: FastifyInstance) {
  const env = loadEnv();
  await app.register(fastifyJwt, { secret: env.JWT_SECRET });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { sub: string; role: string; type?: string };
      
      // Check if token is blacklisted
      const blacklisted = await app.prisma.blacklistedToken.findUnique({
        where: { token: request.headers.authorization?.replace('Bearer ', '') }
      });
      if (blacklisted) {
        return reply.unauthorized('Token has been revoked');
      }
      
      // Ensure access token (not refresh token)
      if (payload.type === 'refresh') {
        return reply.unauthorized('Invalid token type');
      }
    } catch (err) {
      return reply.unauthorized('Invalid token');
    }
  });

  app.decorate('authorize', (roles: string[]) => {
    return async (request: any, reply: any) => {
      await (app as any).authenticate(request, reply);
      const user = request.user as { sub: string; role: string };
      if (!roles.includes(user.role)) {
        return reply.forbidden('Insufficient role');
      }
    };
  });

  app.decorate('createTokens', async (userId: string, role: string) => {
    const accessToken = app.jwt.sign({ sub: userId, role, type: 'access' }, { expiresIn: '15m' });
    const refreshToken = generateToken();
    
    // Store refresh token in DB
    await app.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    return { accessToken, refreshToken };
  });

  app.decorate('revokeToken', async (token: string) => {
    // Add to blacklist
    await app.prisma.blacklistedToken.create({ data: { token } });
    
    // Remove from refresh tokens
    await app.prisma.refreshToken.deleteMany({ where: { token } });
  });

  app.decorate('rotateRefreshToken', async (oldToken: string, userId: string, role: string) => {
    // Revoke old token
    await (app as any).revokeToken(oldToken);
    
    // Create new tokens
    return await (app as any).createTokens(userId, role);
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
    authorize: (roles: string[]) => (request: any, reply: any) => Promise<void>;
    createTokens: (userId: string, role: string) => Promise<{ accessToken: string; refreshToken: string }>;
    revokeToken: (token: string) => Promise<void>;
    rotateRefreshToken: (oldToken: string, userId: string, role: string) => Promise<{ accessToken: string; refreshToken: string }>;
  }
}

