import { AppError, APIError } from "./error-handling";

export interface APIErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export class APIErrorHandler {
  static isAPIErrorResponse(error: unknown): error is APIErrorResponse {
    if (typeof error !== "object" || error === null) return false;
    const response = error as Record<string, unknown>;
    return typeof response.message === "string";
  }

  static handleAPIError(error: unknown): AppError {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Response) {
      return new APIError("API request failed", error.status, {
        statusText: error.statusText,
      });
    }

    if (this.isAPIErrorResponse(error)) {
      return new APIError(error.message, 400, error.details);
    }

    if (error instanceof Error) {
      return new APIError(error.message, 500);
    }

    return new APIError("An unknown error occurred", 500);
  }

  static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || response.statusText,
        response.status,
        errorData.details,
      );
    }

    return response.json();
  }
}
