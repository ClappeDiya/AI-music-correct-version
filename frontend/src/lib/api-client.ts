import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = "/api") {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      // Add withCredentials to send cookies in cross-origin requests
      withCredentials: true,
    });
    // Add request interceptor for authentication
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // Try to get token from multiple possible sources
      let token = localStorage.getItem("auth_token") || 
                  localStorage.getItem("token") || 
                  sessionStorage.getItem("auth_token");
                  
      // Check if token exists and format properly if needed
      if (token) {
        // If token doesn't start with Bearer, add it
        if (token && !token.startsWith('Bearer ') && !token.startsWith('JWT ')) {
          token = `Bearer ${token}`;
        }
        
        if (config.headers) {
          config.headers.Authorization = token;
        }
      }
      
      // Handle URL paths correctly to prevent redirect loops
      if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
        config.url = `${config.url}/`;
      }
      
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        
        if (error.response) {
          const { status, data } = error.response;
          
          // Handle authentication errors
          if (status === 401) {
            console.warn("Authentication error, token may be invalid or expired");
            // Optional: Redirect to login or attempt token refresh
            
            // For development purposes, log the current token
            const token = localStorage.getItem("auth_token") || 
                          localStorage.getItem("token") || 
                          sessionStorage.getItem("auth_token");
            console.log("Current token:", token ? "Exists" : "Not found");
          }
          
          throw new ApiError(
            status,
            data.code || "unknown_error",
            data.message || "An unknown error occurred",
            data.details,
          );
        }
        throw error;
      },
    );
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(path, config);
    return response.data;
  }

  async post<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      path,
      data,
      config,
    );
    return response.data;
  }

  async put<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(
      path,
      data,
      config,
    );
    return response.data;
  }

  async patch<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      path,
      data,
      config,
    );
    return response.data;
  }

  async delete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(path, config);
    return response.data;
  }
}
