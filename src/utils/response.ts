import { FastifyReply } from 'fastify';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  statusCode: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  timestamp: string;
  statusCode: number;
}

export class ResponseWrapper {
  static success<T>(reply: FastifyReply, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
    reply.status(statusCode).send(response);
  }

  static error(reply: FastifyReply, message: string = 'Error', statusCode: number = 500, data: any = null): void {
    const response: ApiResponse = {
      success: false,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode
    };
    reply.status(statusCode).send(response);
  }

  static paginated<T>(
    reply: FastifyReply, 
    items: T[], 
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data: {
        items,
        pagination
      },
      timestamp: new Date().toISOString(),
      statusCode
    };
    reply.status(statusCode).send(response);
  }

  static created<T>(reply: FastifyReply, data: T, message: string = 'Created'): void {
    this.success(reply, data, message, 201);
  }

  static notFound(reply: FastifyReply, message: string = 'Not Found'): void {
    this.error(reply, message, 404);
  }

  static badRequest(reply: FastifyReply, message: string = 'Bad Request', data: any = null): void {
    this.error(reply, message, 400, data);
  }

  static unauthorized(reply: FastifyReply, message: string = 'Unauthorized'): void {
    this.error(reply, message, 401);
  }

  static forbidden(reply: FastifyReply, message: string = 'Forbidden'): void {
    this.error(reply, message, 403);
  }

  static conflict(reply: FastifyReply, message: string = 'Conflict', data: any = null): void {
    this.error(reply, message, 409, data);
  }

  static internalError(reply: FastifyReply, message: string = 'Internal Server Error', data: any = null): void {
    this.error(reply, message, 500, data);
  }
}
