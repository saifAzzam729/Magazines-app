import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service.js';
import { UserRole } from '../../utils/constants.js';
import { userUpdateSchema } from './user.model.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import { ROLE_PERMISSIONS } from '../../utils/permissions.js';

export class UserController {
  constructor(private userService: UserService) {}

  getAllUsers = async (request: FastifyRequest, reply: FastifyReply) => {
    const { skip, take, page, pageSize } = getPagination(request.query);
    const { items, total } = await this.userService.getAllUsers(skip, take);
    return buildPaginationResponse(items, total, page, pageSize);
  };

  updateUserRole = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = userUpdateSchema.parse(request.body);
    
    const user = await this.userService.updateUserRole(id, body.role as UserRole);
    
    // Log activity - this will be handled by the activity plugin
    const userId = (request.user as any)?.sub;
    if (userId) {
      await (request.server as any).logActivity('admin.user.role.updated', userId, { 
        targetUserId: id, 
        role: body.role 
      });
    }
    
    return user;
  };

  listRoles = async (_request: FastifyRequest, _reply: FastifyReply) => {
    return {
      roles: ['ADMIN', 'PUBLISHER', 'SUBSCRIBER'],
      permissions: ROLE_PERMISSIONS
    };
  };

  getMyPermissions = async (request: FastifyRequest, _reply: FastifyReply) => {
    const user = request.user as { sub: string; role: 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER' };
    return { role: user.role, permissions: ROLE_PERMISSIONS[user.role] };
  };
}
