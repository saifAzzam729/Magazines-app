import { z } from 'zod';
import { UserRole } from '../../utils/constants.js';

export const userUpdateSchema = z.object({ 
  role: z.nativeEnum(UserRole).or(z.string()) 
});

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserUpdateRequest {
  role: UserRole;
}
