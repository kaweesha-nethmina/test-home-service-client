import api from "@/lib/api"

export const supportService = {
  async raiseComplaint(data: { subject: string; description: string }) {
    const response = await api.post("/api/support/complaints", data)
    return response
  },

  async getComplaints() {
    const response = await api.get("/api/support/complaints")
    return response
  },

  async updateComplaintStatus(complaintId: string, status: string) {
    const response = await api.put(`/api/support/complaints/${complaintId}`, { status })
    return response
  },

  async submitRating(data: { serviceId: string; rating: number; comment: string }) {
    const response = await api.post("/api/support/ratings", data)
    return response
  },

  async getMyRatings() {
    const response = await api.get("/api/support/ratings/me")
    return response
  },

  async getProviderRatings(providerId: string) {
    const response = await api.get(`/api/support/ratings/provider/${providerId}`)
    return response
  },

  async getNotifications() {
    const response = await api.get("/api/support/notifications")
    return response
  },

  async markAllNotificationsAsRead() {
    const response = await api.patch("/api/support/notifications/read-all")
    return response
  },
}