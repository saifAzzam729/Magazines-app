import { PrismaClient } from '@prisma/client';
import { CreateMagazineRequest, UpdateMagazineRequest, Magazine } from './magazine.model.js';

export interface MagazineService {
  getAllMagazines(skip: number, take: number): Promise<{ items: Magazine[]; total: number }>;
  createMagazine(data: CreateMagazineRequest, publisherId: string): Promise<Magazine>;
  updateMagazine(id: string, data: UpdateMagazineRequest, userId: string, userRole: string): Promise<Magazine>;
  deleteMagazine(id: string, userId: string, userRole: string): Promise<void>;
}

export class MagazineServiceImpl implements MagazineService {
  constructor(private prisma: PrismaClient) {}

  async getAllMagazines(skip: number, take: number): Promise<{ items: Magazine[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.magazine.findMany({ 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' } 
      }),
      this.prisma.magazine.count()
    ]);
    return { items, total };
  }

  async createMagazine(data: CreateMagazineRequest, publisherId: string): Promise<Magazine> {
    return this.prisma.magazine.create({
      data: { 
        title: data.title, 
        description: data.description, 
        publisherId 
      }
    });
  }

  async updateMagazine(id: string, data: UpdateMagazineRequest, userId: string, userRole: string): Promise<Magazine> {
    const existing = await this.prisma.magazine.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Magazine not found');
    }
    
    if (userRole !== 'ADMIN' && existing.publisherId !== userId) {
      throw new Error('Forbidden');
    }
    
    return this.prisma.magazine.update({ 
      where: { id }, 
      data 
    });
  }

  async deleteMagazine(id: string, userId: string, userRole: string): Promise<void> {
    const existing = await this.prisma.magazine.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Magazine not found');
    }
    
    if (userRole !== 'ADMIN' && existing.publisherId !== userId) {
      throw new Error('Forbidden');
    }
    
    await this.prisma.magazine.delete({ where: { id } });
  }
}
