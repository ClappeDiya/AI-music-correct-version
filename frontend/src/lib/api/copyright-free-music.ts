import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

const BASE_URL = `${API_BASE_URL}/copyright_free_music`;

// Types
export interface Track {
  id: string;
  title: string;
  file_url: string;
  user: any;
  license: any;
  pricing: any;
  metadata: any;
  published_at: string;
}

export interface LicenseTerm {
  id: string;
  license_name: string;
  description: string;
  base_conditions: any;
  created_at: string;
}

// API Functions
export const tracksApi = {
  list: async (filters?: any) => {
    const response = await axios.get(`${BASE_URL}/tracks/`, {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/tracks/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Track>) => {
    const response = await axios.post(`${BASE_URL}/tracks/`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Track>) => {
    const response = await axios.put(`${BASE_URL}/tracks/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axios.delete(`${BASE_URL}/tracks/${id}/`);
  },
};

export const licenseTermsApi = {
  list: async (filters?: any) => {
    const response = await axios.get(`${BASE_URL}/license-terms/`, {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string) => {
    const response = await axios.get(`${BASE_URL}/license-terms/${id}/`);
    return response.data;
  },

  create: async (data: Partial<LicenseTerm>) => {
    const response = await axios.post(`${BASE_URL}/license-terms/`, data);
    return response.data;
  },
};

// Add other API endpoints as needed
