export const API_CONFIG = {
  BASE_URL: "http://localhost:8000/api/v1",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login/",
      REGISTER: "/auth/register/",
      LOGOUT: "/auth/logout/",
      ME: "/auth/me/",
      CSRF: "/auth/csrf/",
      REFRESH: "/auth/refresh/",
    },
  },
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
