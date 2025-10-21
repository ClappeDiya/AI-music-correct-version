import axios from "axios";
import type { AxiosResponse, AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const API_TIMEOUT = 15000; // 15 second timeout for API requests

// Debug logging for API requests in development
const enableDebugLogs = process.env.NODE_ENV === 'development';

// Helper function to log API requests in development
const logApiCall = (method: string, url: string, data?: any) => {
  if (enableDebugLogs) {
    console.log(`🌐 API ${method}:`, url, data ? data : '');
  }
};

// Helper function to log API responses in development
const logApiResponse = (method: string, url: string, status: number, data: any) => {
  if (enableDebugLogs) {
    console.log(`✅ API ${method} Response (${status}):`, url, data);
  }
};

// Helper function to log API errors in development
const logApiError = (method: string, url: string, error: any) => {
  if (enableDebugLogs) {
    console.error(`❌ API ${method} Error:`, url, error);
  }
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for cookies
  timeout: API_TIMEOUT,
});

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  config: any;
  request?: any;
}

// Function to handle API errors
const handleApiError = (error: AxiosError): ApiError => {
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;

  if (error.response) {
    // Server responded with a status code outside of 2xx range
    statusCode = error.response.status;
    
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (typeof error.response.data === 'object') {
        errorMessage = 
          error.response.data.error || 
          error.response.data.message || 
          error.response.data.detail || 
          JSON.stringify(error.response.data);
      }
    } else {
      // Map common status codes to messages
      switch (statusCode) {
        case 400: errorMessage = "Bad request"; break;
        case 401: errorMessage = "Unauthorized - Please log in"; break;
        case 403: errorMessage = "Access denied"; break;
        case 404: errorMessage = "Resource not found"; break;
        case 500: errorMessage = "Server error"; break;
        default: errorMessage = `Server responded with status code ${statusCode}`;
      }
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage = "No response from server. Please check your connection.";
    statusCode = 0;
  } else if (error.message) {
    // Something happened in setting up the request
    errorMessage = error.message;
    
    // Special handling for timeout errors
    if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timed out. Please try again later.";
      statusCode = 408;
    }
  }

  // Special handling for genre_mixing endpoints
  if (error.config && typeof error.config.url === 'string' && error.config.url.includes('genre_mixing')) {
    errorMessage = `Genre Mixing API Error: ${errorMessage}. Try refreshing the page.`;
  }

  return {
    message: errorMessage,
    status: statusCode,
    response: error.response?.data,
  };
};

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    logApiResponse(response.config.method?.toUpperCase() || 'UNKNOWN', 
               response.config.url || '', 
               response.status, 
               response.data);
    return response;
  },
  (error) => {
    // Log error in development
    logApiError(error.config?.method?.toUpperCase() || 'UNKNOWN', 
             error.config?.url || '', 
             error);
    
    const apiError = handleApiError(error);
    return Promise.reject(apiError);
  },
);

export type ApiError = {
  message: string;
  status?: number;
  response?: any;
};

// Add request interceptor to log requests in development
api.interceptors.request.use(
  (config) => {
    logApiCall(config.method?.toUpperCase() || 'UNKNOWN', 
            config.url || '', 
            config.data);
    return config;
  },
  (error) => {
    console.error('Request preparation error:', error);
    return Promise.reject(error);
  }
);

// Enhanced get and post methods with better error handling
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

export const apiPut = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

export const apiPatch = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  } catch (error) {
    throw handleApiError(error as AxiosError);
  }
};

// Function to get CSRF token
export async function getCsrfToken(): Promise<string> {
  try {
    const response = await api.get("/api/v1/auth/csrf/");
    const data = await response.data;
    return data.csrfToken;
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    return ""; // Return empty string if CSRF fetch fails
  }
}

// Add request interceptor to include CSRF token
api.interceptors.request.use(async (config) => {
  if (config.method !== "GET") {
    try {
      const token = await getCsrfToken();
      if (token) {
        config.headers["X-CSRFToken"] = token;
      }
    } catch (error) {
      console.error("Failed to set CSRF token:", error);
    }
  }
  return config;
});

export default api;
