export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, any>,
  ) {
    super(message, "API_ERROR", statusCode, details);
    this.name = "APIError";
  }
}

export function handleError(error: unknown): AppError {
  if (AppError.isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR");
  }

  return new AppError("An unknown error occurred", "UNKNOWN_ERROR");
}
