import cron from 'node-cron';
import { FastifyInstance } from 'fastify';
import { sendEmail } from '../utils/email.js';

export function sendReportsJob(app: FastifyInstance) {
  // Every day at 01:30 send daily reports
  cron.schedule('30 1 * * *', async () => {
    app.log.info('Generating daily reports');
    
    // Get subscription statistics
    const totalSubscriptions = await app.prisma.subscription.count();
    const activeSubscriptions = await app.prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });
    const pendingSubscriptions = await app.prisma.subscription.count({
      where: { status: 'PENDING' }
    });
    const expiredSubscriptions = await app.prisma.subscription.count({
      where: { status: 'EXPIRED' }
    });
    
    // Get comment statistics
    const totalComments = await app.prisma.comment.count();
    const pendingComments = await app.prisma.comment.count({
      where: { approved: false }
    });
    
    // Get user statistics
    const totalUsers = await app.prisma.user.count();
    const newUsersToday = await app.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    
    const reportData = {
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        pending: pendingSubscriptions,
        expired: expiredSubscriptions
      },
      comments: {
        total: totalComments,
        pending: pendingComments
      },
      users: {
        total: totalUsers,
        newToday: newUsersToday
      },
      generatedAt: new Date().toISOString()
    };
    
    // Log the report as activity
    await app.logActivity('daily.report.generated', undefined, reportData);
    
    app.log.info({ reportData }, 'Daily report generated');
    
    // Send email to admin if configured
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        const reportHtml = `
          <h2>Daily Report - ${new Date().toLocaleDateString()}</h2>
          <h3>Subscriptions</h3>
          <ul>
            <li>Total: ${reportData.subscriptions.total}</li>
            <li>Active: ${reportData.subscriptions.active}</li>
            <li>Pending: ${reportData.subscriptions.pending}</li>
            <li>Expired: ${reportData.subscriptions.expired}</li>
          </ul>
          <h3>Comments</h3>
          <ul>
            <li>Total: ${reportData.comments.total}</li>
            <li>Pending Approval: ${reportData.comments.pending}</li>
          </ul>
          <h3>Users</h3>
          <ul>
            <li>Total: ${reportData.users.total}</li>
            <li>New Today: ${reportData.users.newToday}</li>
          </ul>
          <p><small>Generated at: ${reportData.generatedAt}</small></p>
        `;
        await sendEmail(adminEmail, 'Daily Report', reportHtml);
        app.log.info('Daily report email sent to admin');
      } catch (err) {
        app.log.error({ err }, 'Failed to send daily report email');
      }
    }
  });
}
