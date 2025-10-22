import { FastifyInstance } from 'fastify';

// Logger utility for centralized logging configuration
export class Logger {
  private static instance: Logger;
  private fastifyInstance: FastifyInstance | null = null;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setFastifyInstance(instance: FastifyInstance): void {
    this.fastifyInstance = instance;
  }

  info(message: string, meta?: any): void {
    if (this.fastifyInstance) {
      this.fastifyInstance.log.info(meta || {}, message);
    } else {
      console.log(`[INFO] ${message}`, meta || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.fastifyInstance) {
      this.fastifyInstance.log.error(error || {}, message);
    } else {
      console.error(`[ERROR] ${message}`, error || '');
    }
  }

  warn(message: string, meta?: any): void {
    if (this.fastifyInstance) {
      this.fastifyInstance.log.warn(meta || {}, message);
    } else {
      console.warn(`[WARN] ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any): void {
    if (this.fastifyInstance) {
      this.fastifyInstance.log.debug(meta || {}, message);
    } else {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
