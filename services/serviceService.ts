import api from "@/lib/api"
import type { Service } from "@/types/api"

export const serviceService = {
  async getAll(): Promise<Service[]> {
    const response = await api.get("/api/services")
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },

  async getById(id: string) {
    const response = await api.get(`/api/services/${id}`)
    return response
  },

  async getByProvider(providerId: string): Promise<Service[]> {
    // First try to get all services and filter on client side
    // since the backend API might not support provider filtering
    try {
      console.log("Fetching all services to filter by provider:", providerId);
      const allServices: Service[] = await this.getAll()
      console.log("All services fetched:", allServices.length);
      const filteredServices = allServices.filter((service: Service) => {
        // The service might have provider as an object or as a string ID
        const serviceProviderId = service.providerId || (service.provider as any)?._id || service.provider;
        const isMatch = serviceProviderId === providerId
        console.log(`Service ${service._id}: provider ${serviceProviderId} === ${providerId} = ${isMatch}`);
        return isMatch
      })
      console.log("Filtered services count:", filteredServices.length);
      return filteredServices
    } catch (error) {
      console.error("Error getting services by provider:", error)
      // Fallback to return empty array
      return []
    }
  },

  async create(data: Partial<Service>) {
    console.log("Creating service with data:", data);
    const response = await api.post("/api/services", data);
    console.log("Service creation response:", response);
    return response;
  },

  async update(id: string, data: Partial<Service>) {
    const response = await api.put(`/api/services/${id}`, data)
    return response
  },

  async delete(id: string) {
    const response = await api.delete(`/api/services/${id}`)
    return response
  },

  async getByCategory(categoryId: string): Promise<Service[]> {
    const response = await api.get(`/api/services?category=${categoryId}`)
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },

  // Future method to get services with provider information
  async getByCategoryWithProviders(categoryId: string): Promise<Service[]> {
    const response = await api.get(`/api/services?category=${categoryId}&expand=provider`)
    // Ensure we return an array even if response is not what we expect
    return Array.isArray(response) ? response : []
  },

  // Future method to get all providers for a service
  async getProvidersForService(serviceId: string) {
    const response = await api.get(`/api/services/${serviceId}/providers`)
    return response
  },
}