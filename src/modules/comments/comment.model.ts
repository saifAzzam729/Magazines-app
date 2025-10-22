import { z } from 'zod';

export const createSchema = z.object({ 
  magazineId: z.string(), 
  content: z.string().min(1) 
});

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  magazineId: string;
  createdAt: Date;
  updatedAt: Date;
  approved: boolean;
}

export interface CreateCommentRequest {
  magazineId: string;
  content: string;
}
