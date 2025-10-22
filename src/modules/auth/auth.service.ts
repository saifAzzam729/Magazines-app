import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, APP_CONSTANTS } from '../../utils/constants.js';
import { generateVerificationToken, generateResetToken } from '../../utils/tokens.js';
import { sendEmail, renderTemplate } from '../../utils/email.js';
import { 
  RegisterRequest, 
  LoginRequest, 
  RefreshRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  VerifyEmailRequest,
  AuthTokens 
} from './auth.model.js';

export interface AuthService {
  register(data: RegisterRequest): Promise<any>;
  login(email: string, password: string): Promise<{ tokens: AuthTokens; user: { id: string; email: string; name: string | null; role: UserRole } }>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
}

export class AuthServiceImpl implements AuthService {
  constructor(
    private prisma: PrismaClient,
    private createTokens: (userId: string, role: string) => Promise<AuthTokens>,
    private rotateRefreshToken: (oldToken: string, userId: string, role: string) => Promise<AuthTokens>,
    private revokeToken: (token: string) => Promise<void>
  ) {}

  async register(data: RegisterRequest): Promise<any> {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already registered');
    }
    
    const hashed = await bcrypt.hash(data.password, 10);
    const verificationToken = generateVerificationToken();
    
    const user = await this.prisma.user.create({
      data: { 
        email: data.email, 
        password: hashed, 
        name: data.name, 
        role: data.role ?? UserRole.SUBSCRIBER,
        emailVerificationToken: verificationToken
      }
    });
    
    // Send verification email
    await sendEmail(
      user.email, 
      'Verify your email', 
      renderTemplate('Email Verification', `Please verify your email by clicking this link: ${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`)
    );
    
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(email: string, password: string): Promise<{ tokens: AuthTokens; user: { id: string; email: string; name: string | null; role: UserRole } }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new Error('Invalid credentials');
    }
    
    const tokens = await this.createTokens(user.id, String(user.role));
    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role as unknown as UserRole };
    return { tokens, user: safeUser };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    
    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }
    
    return await this.rotateRefreshToken(refreshToken, refreshTokenRecord.userId, String(refreshTokenRecord.user.role));
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (user) {
      const resetToken = generateResetToken();
      const expiresAt = new Date(Date.now() + APP_CONSTANTS.EMAIL.PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: resetToken, passwordResetExpires: expiresAt }
      });
      
      await sendEmail(
        user.email,
        'Password Reset',
        renderTemplate('Password Reset', `Reset your password: ${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`)
      );
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    
    const hashed = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashed, 
        passwordResetToken: null, 
        passwordResetExpires: null 
      }
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null }
    });
  }
}
