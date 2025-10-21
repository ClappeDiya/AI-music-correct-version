import { api } from "@/lib/api";

export abstract class BaseService<T, CreateDTO = any, UpdateDTO = any> {
  protected constructor(protected readonly baseUrl: string) {}

  async list(params?: Record<string, any>): Promise<T[]> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async get(id: string): Promise<T> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateDTO): Promise<T> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}
