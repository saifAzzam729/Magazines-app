import { PrismaClient } from '@prisma/client';
import { CreateCommentRequest, Comment } from './comment.model.js';

export interface CommentService {
  getApprovedComments(skip: number, take: number): Promise<{ items: Comment[]; total: number }>;
  createComment(data: CreateCommentRequest, authorId: string): Promise<Comment>;
  getPendingComments(): Promise<Comment[]>;
  approveComment(id: string): Promise<Comment>;
}

export class CommentServiceImpl implements CommentService {
  constructor(private prisma: PrismaClient) {}

  async getApprovedComments(skip: number, take: number): Promise<{ items: Comment[]; total: number }> {
    const where = { approved: true } as const;
    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({ 
        where, 
        skip, 
        take, 
        orderBy: { createdAt: 'desc' } 
      }),
      this.prisma.comment.count({ where })
    ]);
    return { items, total };
  }

  async createComment(data: CreateCommentRequest, authorId: string): Promise<Comment> {
    return this.prisma.comment.create({ 
      data: { 
        content: data.content, 
        magazineId: data.magazineId, 
        authorId 
      } 
    });
  }

  async getPendingComments(): Promise<Comment[]> {
    return this.prisma.comment.findMany({ 
      where: { approved: false } 
    });
  }

  async approveComment(id: string): Promise<Comment> {
    return this.prisma.comment.update({ 
      where: { id }, 
      data: { approved: true } 
    });
  }
}
