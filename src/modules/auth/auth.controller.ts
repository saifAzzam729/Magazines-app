import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { ResponseWrapper } from '../../utils/response.js';
import { 
  registerSchema, 
  loginSchema, 
  refreshSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  verifyEmailSchema 
} from './auth.model.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = registerSchema.parse(request.body);
      const result = await this.authService.register(body);
      ResponseWrapper.created(reply, result, 'User registered successfully');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Registration failed');
    }
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = loginSchema.parse(request.body);
      const result = await this.authService.login(body.email, body.password);
      
      // Log activity
      const user = await (request.server as any).prisma.user.findUnique({ 
        where: { email: body.email } 
      });
      if (user) {
        await (request.server as any).logActivity('auth.login', user.id);
      }
      
      ResponseWrapper.success(reply, result, 'Login successful');
    } catch (error) {
      ResponseWrapper.unauthorized(reply, error instanceof Error ? error.message : 'Login failed');
    }
  };

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = refreshSchema.parse(request.body);
      const tokens = await this.authService.refresh(body.refreshToken);
      
      // Log activity
      const refreshTokenRecord = await (request.server as any).prisma.refreshToken.findUnique({
        where: { token: body.refreshToken },
        include: { user: true }
      });
      if (refreshTokenRecord) {
        await (request.server as any).logActivity('auth.refresh', refreshTokenRecord.userId);
      }
      
      ResponseWrapper.success(reply, tokens, 'Token refreshed successfully');
    } catch (error) {
      ResponseWrapper.unauthorized(reply, error instanceof Error ? error.message : 'Token refresh failed');
    }
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await (request.server as any).revokeToken(token);
      }
      ResponseWrapper.success(reply, null, 'Logged out successfully');
    } catch (error) {
      ResponseWrapper.internalError(reply, error instanceof Error ? error.message : 'Logout failed');
    }
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = forgotPasswordSchema.parse(request.body);
      await this.authService.forgotPassword(body.email);
      ResponseWrapper.success(reply, null, 'If the email exists, a reset link has been sent');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Password reset request failed');
    }
  };

  resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = resetPasswordSchema.parse(request.body);
      await this.authService.resetPassword(body.token, body.password);
      
      // Log activity
      const user = await (request.server as any).prisma.user.findFirst({
        where: {
          passwordResetToken: body.token,
          passwordResetExpires: { gt: new Date() }
        }
      });
      if (user) {
        await (request.server as any).logActivity('auth.password_reset', user.id);
      }
      
      ResponseWrapper.success(reply, null, 'Password reset successfully');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Password reset failed');
    }
  };

  verifyEmail = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = verifyEmailSchema.parse(request.body);
      await this.authService.verifyEmail(body.token);
      
      // Log activity
      const user = await (request.server as any).prisma.user.findFirst({
        where: { emailVerificationToken: body.token }
      });
      if (user) {
        await (request.server as any).logActivity('auth.email_verified', user.id);
      }
      
      ResponseWrapper.success(reply, null, 'Email verified successfully');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Email verification failed');
    }
  };
}
