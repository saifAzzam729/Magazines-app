import cron from 'node-cron';
import { FastifyInstance } from 'fastify';
import { sendEmail, renderTemplate } from '../utils/email.js';

export function checkSubscriptionsJob(app: FastifyInstance) {
  // Every day at 01:00 check subscriptions and update expired ones
  cron.schedule('0 1 * * *', async () => {
    app.log.info('Running subscription expiry check');
    const now = new Date();
    
    // First, get the subscriptions that will be expired
    const subscriptionsToExpire = await app.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now }
      },
      include: { user: true, magazine: true }
    });
    
    // Update them to expired status
    const expired = await app.prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now }
      },
      data: { status: 'EXPIRED' }
    });
    
    if (expired.count > 0) {
      await app.logActivity('subscriptions.expired.batch', undefined, { count: expired.count });
      app.log.info(`Updated ${expired.count} expired subscriptions`);
      
      // Send expiry notification emails to affected users
      for (const subscription of subscriptionsToExpire) {
        try {
          await sendEmail(
            subscription.user.email,
            'Subscription Expired',
            renderTemplate(
              'Subscription Expired',
              `Your subscription to "${subscription.magazine.title}" has expired. Please renew if you wish to continue access.`
            )
          );
        } catch (err) {
          app.log.error({ err, userId: subscription.user.id }, 'Failed to send expiry email');
        }
      }
    }
  });
}
