import api from "@/lib/api"
import type { Work } from "@/types/api"
import { getToken, getUser } from "@/lib/auth"

export const workService = {
  async create(data: Omit<Work, "_id" | "providerId" | "createdAt">) {
    try {
      // Check if user is authenticated
      const token = getToken()
      const user = getUser()
      
      console.log("workService.create - Token from auth:", token)
      console.log("workService.create - User from auth:", user)
      
      if (!token || !user) {
        throw new Error("User not authenticated")
      }

      // Prepare the data to send - only include fields that should be sent
      const workData = {
        title: data.title,
        description: data.description,
        images: data.images,
        ...(data.date && { date: new Date(data.date).toISOString() }),
        ...(data.serviceId && { serviceId: data.serviceId })
      };
      
      console.log("workService.create - Sending data:", JSON.stringify(workData, null, 2));
      console.log("workService.create - API Base URL:", api.defaults.baseURL);
      console.log("workService.create - Token in axios defaults:", api.defaults.headers?.common?.Authorization);
      
      const response = await api.post("/api/providers/works", workData)
      console.log("workService.create - Response:", response);
      return response
    } catch (error: any) {
      console.error("workService.create - Error:", error);
      console.error("workService.create - Error code:", error.code);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("workService.create - Error status:", error.response.status);
        console.error("workService.create - Error headers:", error.response.headers);
        console.error("workService.create - Error data:", error.response.data);
      } else {
        console.error("workService.create - No response object in error");
        // Check if there's a request object
        if (error.request) {
          console.error("workService.create - Request was made but no response received");
          console.error("workService.create - Request details:", error.request);
        }
      }
      
      // Re-throw the error so it can be handled by the calling function
      throw error;
    }
  },

  async getAll(): Promise<Work[]> {
    try {
      const response = await api.get("/api/providers/works")
      // Ensure we return an array even if response is not what we expect
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error("workService.getAll - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("workService.getAll - Error status:", error.response.status);
        console.error("workService.getAll - Error data:", error.response.data);
      } else {
        console.error("workService.getAll - No response object in error");
      }
      
      // Return empty array on error
      return []
    }
  },

  async update(id: string, data: Partial<Omit<Work, "providerId" | "createdAt">>) {
    try {
      const response = await api.put(`/api/providers/works/${id}`, data)
      return response
    } catch (error: any) {
      console.error(`workService.update - Error updating work ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`workService.update - Error status:`, error.response.status);
        console.error(`workService.update - Error data:`, error.response.data);
      } else {
        console.error(`workService.update - No response object in error`);
      }
      
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const response = await api.delete(`/api/providers/works/${id}`)
      return response
    } catch (error: any) {
      console.error(`workService.delete - Error deleting work ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`workService.delete - Error status:`, error.response.status);
        console.error(`workService.delete - Error data:`, error.response.data);
      } else {
        console.error(`workService.delete - No response object in error`);
      }
      
      throw error;
    }
  },
}