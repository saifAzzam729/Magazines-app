import { FastifyRequest, FastifyReply } from 'fastify';
import { SubscriptionService } from './subscription.service.js';
import { subscribeSchema } from './subscription.model.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import { renderTemplate, sendEmail, loadEmailTemplate } from '../../utils/email.js';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  getAllSubscriptions = async (request: FastifyRequest, reply: FastifyReply) => {
    const { skip, take, page, pageSize } = getPagination(request.query);
    const { items, total } = await this.subscriptionService.getAllSubscriptions(skip, take);
    return buildPaginationResponse(items, total, page, pageSize);
  };

  createSubscription = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = subscribeSchema.parse(request.body);
    const user = request.user as { sub: string; role: string };
    
    const subscription = await this.subscriptionService.createSubscription(body, user.sub);
    
    // Log activity
    await (request.server as any).logActivity('subscription.created', user.sub, { 
      subscriptionId: subscription.id 
    });
    
    // Send email notification
    const userRow = await (request.server as any).prisma.user.findUnique({ 
      where: { id: user.sub } 
    });
    if (userRow) {
      await sendEmail(
        userRow.email, 
        'Subscription Created', 
        renderTemplate('Subscription Created', 'Your subscription request is pending.')
      );
    }
    
    return subscription;
  };

  activateSubscription = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const subscription = await this.subscriptionService.activateSubscription(id);
    
    // Log activity
    const userId = (request.user as any)?.sub;
    if (userId) {
      await (request.server as any).logActivity('subscription.activated', userId, { 
        subscriptionId: id 
      });
    }
    
    // Send email notification
    const userRow = await (request.server as any).prisma.user.findUnique({ 
      where: { id: subscription.userId } 
    });
    const magazineRow = await (request.server as any).prisma.magazine.findUnique({
      where: { id: subscription.magazineId }
    });
    if (userRow && magazineRow) {
      const html = loadEmailTemplate('subscriptionActive.html', {
        userName: userRow.name || 'User',
        magazineTitle: magazineRow.title,
        magazineLink: `${process.env.BASE_URL || 'http://localhost:3000'}/magazines/${magazineRow.id}`
      });
      await sendEmail(userRow.email, 'Subscription Active', html);
    }
    
    return subscription;
  };

  cancelSubscription = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const subscription = await this.subscriptionService.cancelSubscription(id);
    
    // Log activity
    const userId = (request.user as any)?.sub;
    if (userId) {
      await (request.server as any).logActivity('subscription.cancelled', userId, { 
        subscriptionId: id 
      });
    }
    
    return subscription;
  };
}
