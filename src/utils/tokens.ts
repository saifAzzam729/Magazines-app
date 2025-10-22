import { randomBytes } from 'crypto';

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateVerificationToken(): string {
  return randomBytes(16).toString('hex');
}

export function generateResetToken(): string {
  return randomBytes(16).toString('hex');
}
