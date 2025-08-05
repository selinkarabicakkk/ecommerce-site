/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Bad Request error (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Validation error (422)
 */
export class ValidationError extends ApiError {
  errors: Record<string, string>;
  
  constructor(message: string = 'Validation error', errors: Record<string, string> = {}) {
    super(message, 422);
    this.errors = errors;
  }
} 