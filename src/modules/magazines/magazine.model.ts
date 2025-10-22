import { z } from 'zod';

export const upsertSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2)
});

export interface Magazine {
  id: string;
  title: string;
  description: string;
  publisherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMagazineRequest {
  title: string;
  description: string;
}

export interface UpdateMagazineRequest {
  title: string;
  description: string;
}
