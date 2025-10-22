import { FastifyRequest, FastifyReply } from 'fastify';
import { CommentService } from './comment.service.js';
import { createSchema } from './comment.model.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';

export class CommentController {
  constructor(private commentService: CommentService) {}

  getApprovedComments = async (request: FastifyRequest, reply: FastifyReply) => {
    const { skip, take, page, pageSize } = getPagination(request.query);
    const { items, total } = await this.commentService.getApprovedComments(skip, take);
    return buildPaginationResponse(items, total, page, pageSize);
  };

  createComment = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSchema.parse(request.body);
    const user = request.user as { sub: string; role: string };
    
    const comment = await this.commentService.createComment(body, user.sub);
    
    // Log activity
    await (request.server as any).logActivity('comment.created', user.sub, { 
      commentId: comment.id 
    });
    
    return comment;
  };

  getPendingComments = async (request: FastifyRequest, reply: FastifyReply) => {
    const comments = await this.commentService.getPendingComments();
    return comments;
  };

  approveComment = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const comment = await this.commentService.approveComment(id);
    
    // Log activity
    const userId = (request.user as any)?.sub;
    if (userId) {
      await (request.server as any).logActivity('comment.approved', userId, { 
        commentId: id 
      });
    }
    
    return comment;
  };
}
