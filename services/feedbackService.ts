import api from "@/lib/api"

export const feedbackService = {
  // Customer endpoints
  async submitFeedback(data: {
    providerId: string
    serviceId: string
    bookingId: string
    rating: number
    title: string
    comment: string
    isPublic: boolean
  }) {
    // Validate required fields
    if (!data.providerId || !data.serviceId || !data.bookingId) {
      throw new Error("Missing required fields: providerId, serviceId, and bookingId are required");
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Title is required");
    }
    
    console.log("Sending feedback data to API:", data);
    
    const response = await api.post("/api/feedback", data)
    return response
  },

  async getCustomerFeedback() {
    const response = await api.get("/api/feedback/customer")
    return response
  },

  async updateFeedback(id: string, data: {
    rating?: number
    title?: string
    comment?: string
    isPublic?: boolean
  }) {
    const response = await api.put(`/api/feedback/${id}`, data)
    return response
  },

  async deleteFeedback(id: string) {
    const response = await api.delete(`/api/feedback/${id}`)
    return response
  },

  // Provider endpoints
  async getProviderFeedback() {
    const response = await api.get("/api/feedback/provider")
    return response
  },

  // Public endpoints
  async getPublicFeedback(providerId: string) {
    const response = await api.get(`/api/feedback/provider/${providerId}`)
    return response
  },
  
  async getServiceFeedback(serviceId: string) {
    const response = await api.get(`/api/feedback/service/${serviceId}`)
    return response
  }
}