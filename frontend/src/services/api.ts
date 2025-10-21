import { VRService } from "./vr/api";
import { NeuralService } from "./neural/api";
import { PluginService } from "./plugins/api";
import { AnalyticsService } from "./analytics/api";

export class API {
  public vr: VRService;
  public neural: NeuralService;
  public plugins: PluginService;
  public analytics: AnalyticsService;
  private baseURL: string;

  constructor() {
    this.vr = new VRService();
    this.neural = new NeuralService();
    this.plugins = new PluginService();
    this.analytics = new AnalyticsService();
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private getFullUrl(url: string): string {
    return url.startsWith('http') ? url : `${this.baseURL}${url}`;
  }

  private getHeaders(options?: RequestInit): Headers {
    const headers = new Headers(options?.headers || {
      'Content-Type': 'application/json'
    });
    
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  }

  async get(url: string, options?: RequestInit): Promise<any> {
    const fullUrl = this.getFullUrl(url);
    const headers = this.getHeaders(options);
    
    try {
      const response = await fetch(fullUrl, { 
        method: 'GET', 
        headers,
        ...options 
      });
      
      if (!response.ok) {
        throw new Error(`GET request to ${url} failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error fetching ${fullUrl}:`, error);
      throw error;
    }
  }

  async post(url: string, data?: any, options?: RequestInit): Promise<any> {
    const fullUrl = this.getFullUrl(url);
    const headers = this.getHeaders(options);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`POST request to ${url} failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error posting to ${fullUrl}:`, error);
      throw error;
    }
  }

  async patch(url: string, data?: any, options?: RequestInit): Promise<any> {
    const fullUrl = this.getFullUrl(url);
    const headers = this.getHeaders(options);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`PATCH request to ${url} failed with status ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error patching ${fullUrl}:`, error);
      throw error;
    }
  }

  async delete(url: string, options?: RequestInit): Promise<any> {
    const fullUrl = this.getFullUrl(url);
    const headers = this.getHeaders(options);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers,
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`DELETE request to ${url} failed with status ${response.status}`);
      }
      
      if (response.status === 204) {
        return null; // No content
      }
      
      return response.json();
    } catch (error) {
      console.error(`Error deleting ${fullUrl}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const api = new API();

// Export individual services for direct use if needed
export { VRService, NeuralService, PluginService, AnalyticsService };
