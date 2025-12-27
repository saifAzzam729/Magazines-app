import { FastifyRequest, FastifyReply } from 'fastify';
import { MagazineService } from './magazine.service.js';
import { upsertSchema } from './magazine.model.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import { ResponseWrapper } from '../../utils/response.js';

export class MagazineController {
  constructor(private magazineService: MagazineService) {}

  getAllMagazines = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { skip, take, page, pageSize } = getPagination(request.query);
      const { items, total } = await this.magazineService.getAllMagazines(skip, take);
      
      const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      const pagination = {
        page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage,
        hasPrevPage
      };
      
      ResponseWrapper.paginated(
        reply, 
        items, 
        pagination, 
        'Magazines retrieved successfully'
      );
    } catch (error) {
      ResponseWrapper.internalError(reply, error instanceof Error ? error.message : 'Failed to retrieve magazines');
    }
  };

  createMagazine = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = upsertSchema.parse(request.body);
      const user = request.user as { sub: string; role: string };
      
      const magazine = await this.magazineService.createMagazine(body, user.sub);
      
      // Log activity
      await (request.server as any).logActivity('magazine.created', user.sub, { 
        magazineId: magazine.id 
      });
      
      ResponseWrapper.created(reply, magazine, 'Magazine created successfully');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Failed to create magazine');
    }
  };

  updateMagazine = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = upsertSchema.parse(request.body);
      const { id } = request.params as { id: string };
      const user = request.user as { sub: string; role: string };
      
      const magazine = await this.magazineService.updateMagazine(id, body, user.sub, user.role);
      
      // Log activity
      await (request.server as any).logActivity('magazine.updated', user.sub, { 
        magazineId: id 
      });
      
      ResponseWrapper.success(reply, magazine, 'Magazine updated successfully');
    } catch (error) {

      
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Failed to update magazine');
    }
  };

  deleteMagazine = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { sub: string; role: string };
      
      await this.magazineService.deleteMagazine(id, user.sub, user.role);
      
      // Log activity
      await (request.server as any).logActivity('magazine.deleted', user.sub, { 
        magazineId: id 
      });
      
      ResponseWrapper.success(reply, { ok: true }, 'Magazine deleted successfully');
    } catch (error) {
      ResponseWrapper.badRequest(reply, error instanceof Error ? error.message : 'Failed to delete magazine');
    }
  };
}
