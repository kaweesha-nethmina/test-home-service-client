import api from "@/lib/api"
import type { Payment } from "@/types/api"

export const paymentService = {
  async create(data: { bookingId: string; amount: number; paymentMethod: string }) {
    const response = await api.post("/api/payments", data)
    return response
  },

  async getAll(): Promise<Payment[]> {
    const response = await api.get("/api/payments")
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },
}