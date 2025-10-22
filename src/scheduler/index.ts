import { FastifyInstance } from 'fastify';
import { checkSubscriptionsJob } from './checkSubscriptions.job.js';
import { sendReportsJob } from './sendReports.job.js';

export function registerJobs(app: FastifyInstance) {
  app.log.info('Registering scheduled jobs');
  
  // Register all jobs
  checkSubscriptionsJob(app);
  sendReportsJob(app);
  
  app.log.info('All scheduled jobs registered');
}
