import { UserRole } from './constants.js';

export type Permission =
  | 'health:read'
  | 'auth:register'
  | 'auth:login'
  | 'auth:refresh'
  | 'auth:logout'
  | 'magazine:list'
  | 'magazine:create'
  | 'magazine:update'
  | 'magazine:delete'
  | 'comment:list'
  | 'comment:create'
  | 'comment:approve'
  | 'subscription:list'
  | 'subscription:create'
  | 'subscription:activate'
  | 'subscription:cancel'
  | 'user:list'
  | 'user:updateRole';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'health:read',
    'auth:register', 'auth:login', 'auth:refresh', 'auth:logout',
    'magazine:list', 'magazine:create', 'magazine:update', 'magazine:delete',
    'comment:list', 'comment:create', 'comment:approve',
    'subscription:list', 'subscription:create', 'subscription:activate', 'subscription:cancel',
    'user:list', 'user:updateRole'
  ],
  [UserRole.PUBLISHER]: [
    'health:read',
    'auth:register', 'auth:login', 'auth:refresh', 'auth:logout',
    'magazine:list', 'magazine:create', 'magazine:update', 'magazine:delete',
    'comment:list', 'comment:create',
    'subscription:list', 'subscription:activate',
  ],
  [UserRole.SUBSCRIBER]: [
    'health:read',
    'auth:register', 'auth:login', 'auth:refresh', 'auth:logout',
    'magazine:list',
    'comment:list', 'comment:create',
    'subscription:create', 'subscription:cancel'
  ]
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}



