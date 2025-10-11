import api from "@/lib/api"
import type { Booking } from "@/types/api"

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const response = await api.get("/api/bookings")
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },

  async getById(id: string) {
    const response = await api.get(`/api/bookings/${id}`)
    return response
  },

  async create(data: { serviceId: string; date: string; address: string; notes?: string; customerName: string; customerPhone: string }) {
    const response = await api.post("/api/bookings", data)
    return response
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/api/bookings/${id}/status`, { status })
    return response
  },

  async delete(id: string) {
    const response = await api.delete(`/api/bookings/${id}`)
    return response
  },
}