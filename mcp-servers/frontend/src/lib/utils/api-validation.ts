import { z } from "zod";
import { ValidationError } from "./error-handling";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

export class APIValidator<T> {
  constructor(private schema: z.ZodSchema<T>) {}

  validate(data: unknown): ValidationResult<T> {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error,
      };
    }
    return {
      success: true,
      data: result.data,
    };
  }

  validateOrThrow(data: unknown): T {
    const result = this.validate(data);
    if (!result.success) {
      throw new ValidationError("Validation failed", {
        errors: this.formatErrors(result.errors!),
      });
    }
    return result.data!;
  }

  validateArray(data: unknown): ValidationResult<T[]> {
    const arraySchema = z.array(this.schema);
    const result = arraySchema.safeParse(data);
    if (!result.success) {
      return {
        success: false,
        errors: result.error,
      };
    }
    return {
      success: true,
      data: result.data,
    };
  }

  private formatErrors(error: z.ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });
    return errors;
  }
}

export function createAPIValidator<T>(schema: z.ZodSchema<T>): APIValidator<T> {
  return new APIValidator(schema);
}
