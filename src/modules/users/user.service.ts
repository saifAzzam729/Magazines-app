import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../utils/constants.js';

export interface UserService {
  getAllUsers(skip: number, take: number): Promise<{ items: any[]; total: number }>;
  updateUserRole(userId: string, role: UserRole): Promise<any>;
}

export class UserServiceImpl implements UserService {
  constructor(private prisma: PrismaClient) {}

  async getAllUsers(skip: number, take: number): Promise<{ items: any[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      }),
      this.prisma.user.count()
    ]);
    return { items, total };
  }

  async updateUserRole(userId: string, role: UserRole): Promise<any> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
  }
}
