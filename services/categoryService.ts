import api from "@/lib/api"
import type { Category } from "@/types/api"

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get("/api/services/categories")
    console.log("Category service response:", response);
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },

  async getById(id: string) {
    const response = await api.get(`/api/services/categories/${id}`)
    return response
  },

  async create(data: Partial<Category>) {
    const response = await api.post("/api/services/categories", data)
    return response
  },

  async update(id: string, data: Partial<Category>) {
    const response = await api.put(`/api/services/categories/${id}`, data)
    return response
  },

  async delete(id: string) {
    const response = await api.delete(`/api/services/categories/${id}`)
    return response
  },
}