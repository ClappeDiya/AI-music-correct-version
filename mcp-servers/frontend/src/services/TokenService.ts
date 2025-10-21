import axios from "axios";
import { encrypt, decrypt } from "@/utils/encryption";

interface TokenResponse {
  success: boolean;
  error?: string;
}

interface TokenValidationResponse {
  valid: boolean;
}

interface TokenStatusResponse {
  status: string;
}

class TokenService {
  private readonly baseUrl: string;
  private readonly tokenKey = "llm_token";
  private readonly configKey = "llm_config";

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  }

  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post<TokenValidationResponse>(
        `${this.baseUrl}/llm/validate-token`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return response.data.valid;
    } catch {
      return false;
    }
  }

  public async setLLMToken(
    token: string,
    provider: string,
  ): Promise<TokenResponse> {
    try {
      // Validate token before storing
      const isValid = await this.validateToken(token);
      if (!isValid) {
        return {
          success: false,
          error: "Invalid API token",
        };
      }

      // Encrypt token before storing
      const encryptedToken = encrypt(token);

      // Store encrypted token
      localStorage.setItem(this.tokenKey, encryptedToken);

      // Store provider config
      const config = {
        provider,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(this.configKey, JSON.stringify(config));

      // Update backend with token status (not the token itself)
      await axios.post<TokenStatusResponse>(
        `${this.baseUrl}/llm/token-status`,
        { provider, status: "configured" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return { success: true };
    } catch (error) {
      console.error("Error setting LLM token:", error);
      return {
        success: false,
        error: "Failed to set API token",
      };
    }
  }

  public async getLLMToken(): Promise<string | null> {
    try {
      const encryptedToken = localStorage.getItem(this.tokenKey);
      if (!encryptedToken) return null;

      // Decrypt token
      return decrypt(encryptedToken);
    } catch {
      return null;
    }
  }

  public getLLMConfig() {
    try {
      const config = localStorage.getItem(this.configKey);
      return config ? JSON.parse(config) : null;
    } catch {
      return null;
    }
  }

  public async clearLLMToken(): Promise<void> {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.configKey);

      // Update backend about token removal
      await axios.post<TokenStatusResponse>(
        `${this.baseUrl}/llm/token-status`,
        { status: "removed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
    } catch (error) {
      console.error("Error clearing LLM token:", error);
    }
  }

  public async validateCurrentToken(): Promise<boolean> {
    try {
      const token = await this.getLLMToken();
      if (!token) return false;
      return this.validateToken(token);
    } catch {
      return false;
    }
  }
}

export default new TokenService();
