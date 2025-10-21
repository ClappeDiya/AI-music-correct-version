import { axiosInstance } from "@/lib/axios";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  message: string;
}

class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/auth/register",
      data,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const { data, status } = error.response;

      if (status === 400 && data.details) {
        throw new AuthError(
          "Validation failed",
          "VALIDATION_ERROR",
          data.details,
        );
      }

      if (status === 409) {
        throw new AuthError("Email already registered", "EMAIL_EXISTS");
      }

      throw new AuthError(data.error || "Registration failed");
    }

    throw new AuthError("Network error. Please try again later.");
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post<AuthResponse>(
      "/api/auth/login",
      data,
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const { data, status } = error.response;

      if (status === 401) {
        throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
      }

      throw new AuthError(data.error || "Login failed");
    }

    throw new AuthError("Network error. Please try again later.");
  }
};
