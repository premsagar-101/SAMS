import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements ApiError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
    error = new CustomError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const value = Object.values((err as any).keyValue)[0];
    const message = `${field} '${value}' already exists`;
    error = new CustomError(message, 400);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new CustomError(message, 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new CustomError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new CustomError(message, 401);
  }

  // JWT errors from passport
  if (err.name === 'UnauthorizedError') {
    const message = 'Unauthorized access';
    error = new CustomError(message, 401);
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if ((err as any).code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
    } else if ((err as any).code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    } else if ((err as any).code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = new CustomError(message, 400);
  }

  // Request entity too large
  if (err.type === 'entity.too.large') {
    const message = 'Request entity too large';
    error = new CustomError(message, 413);
  }

  // Syntax error (JSON parsing)
  if (err instanceof SyntaxError && 'body' in err) {
    const message = 'Invalid JSON syntax';
    error = new CustomError(message, 400);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Operational errors: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // Programming errors: don't leak error details
    logger.error('Programming error:', error);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};