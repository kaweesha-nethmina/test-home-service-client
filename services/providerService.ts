import api from "@/lib/api"
import type { User, Service, Booking } from "@/types/api"

export const providerService = {
  async getPublicProfile(id: string) {
    try {
      console.log(`providerService.getPublicProfile - Fetching profile for ${id}`);
      const response = await api.get(`/api/providers/${id}/profile`)
      console.log(`providerService.getPublicProfile - Response for ${id}:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.getPublicProfile - Error fetching profile for ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.getPublicProfile - Error status:`, error.response.status);
        console.error(`providerService.getPublicProfile - Error data:`, error.response.data);
      } else {
        console.error(`providerService.getPublicProfile - No response object in error`);
      }
      
      throw error;
    }
  },

  async getProfile() {
    try {
      console.log("providerService.getProfile - Fetching profile");
      const response = await api.get("/api/providers/profile")
      console.log("providerService.getProfile - Response:", response);
      return response
    } catch (error: any) {
      console.error("providerService.getProfile - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.getProfile - Error status:", error.response.status);
        console.error("providerService.getProfile - Error data:", error.response.data);
      } else {
        console.error("providerService.getProfile - No response object in error");
      }
      
      throw error;
    }
  },

  async updateProfile(data: Partial<User>) {
    try {
      console.log("providerService.updateProfile - Updating profile with data:", data);
      const response = await api.put("/api/providers/profile", data)
      console.log("providerService.updateProfile - Response:", response);
      return response
    } catch (error: any) {
      console.error("providerService.updateProfile - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.updateProfile - Error status:", error.response.status);
        console.error("providerService.updateProfile - Error data:", error.response.data);
      } else {
        console.error("providerService.updateProfile - No response object in error");
      }
      
      throw error;
    }
  },

  async getServices(): Promise<Service[]> {
    try {
      console.log("providerService.getServices - Fetching services");
      const response = await api.get("/api/providers/works")
      console.log("providerService.getServices - Response:", response);
      // Ensure we return an array even if response is not what we expect
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error("providerService.getServices - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.getServices - Error status:", error.response.status);
        console.error("providerService.getServices - Error data:", error.response.data);
      } else {
        console.error("providerService.getServices - No response object in error");
      }
      
      // Return empty array on error
      return []
    }
  },

  async createService(data: Omit<Service, "_id" | "provider" | "createdAt" | "updatedAt">) {
    try {
      console.log("providerService.createService - Creating service with data:", data);
      const response = await api.post("/api/providers/works", data)
      console.log("providerService.createService - Response:", response);
      return response
    } catch (error: any) {
      console.error("providerService.createService - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.createService - Error status:", error.response.status);
        console.error("providerService.createService - Error data:", error.response.data);
      } else {
        console.error("providerService.createService - No response object in error");
      }
      
      throw error;
    }
  },

  async updateService(id: string, data: Partial<Service>) {
    try {
      console.log(`providerService.updateService - Updating service ${id} with data:`, data);
      const response = await api.put(`/api/providers/works/${id}`, data)
      console.log(`providerService.updateService - Response:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.updateService - Error updating service ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.updateService - Error status:`, error.response.status);
        console.error(`providerService.updateService - Error data:`, error.response.data);
      } else {
        console.error(`providerService.updateService - No response object in error`);
      }
      
      throw error;
    }
  },

  async deleteService(id: string) {
    try {
      console.log(`providerService.deleteService - Deleting service ${id}`);
      const response = await api.delete(`/api/providers/works/${id}`)
      console.log(`providerService.deleteService - Response:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.deleteService - Error deleting service ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.deleteService - Error status:`, error.response.status);
        console.error(`providerService.deleteService - Error data:`, error.response.data);
      } else {
        console.error(`providerService.deleteService - No response object in error`);
      }
      
      throw error;
    }
  },

  // Provider Booking Management Methods
  async getBookings(): Promise<Booking[]> {
    try {
      console.log("providerService.getBookings - Fetching bookings");
      const response = await api.get("/api/provider/bookings")
      console.log("providerService.getBookings - Response:", response);
      // Ensure we return an array even if response is not what we expect
      return Array.isArray(response) ? response : response.data || []
    } catch (error: any) {
      console.error("providerService.getBookings - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.getBookings - Error status:", error.response.status);
        console.error("providerService.getBookings - Error data:", error.response.data);
      } else {
        console.error("providerService.getBookings - No response object in error");
      }
      
      // Return empty array on error
      return []
    }
  },

  async getBookingById(id: string) {
    try {
      console.log(`providerService.getBookingById - Fetching booking ${id}`);
      const response = await api.get(`/api/provider/bookings/${id}`)
      console.log(`providerService.getBookingById - Response:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.getBookingById - Error fetching booking ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.getBookingById - Error status:`, error.response.status);
        console.error(`providerService.getBookingById - Error data:`, error.response.data);
      } else {
        console.error(`providerService.getBookingById - No response object in error`);
      }
      
      throw error;
    }
  },

  async updateBookingStatus(id: string, status: string) {
    try {
      console.log(`providerService.updateBookingStatus - Updating booking ${id} status to ${status}`);
      const response = await api.put(`/api/provider/bookings/${id}/status`, { status })
      console.log(`providerService.updateBookingStatus - Response:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.updateBookingStatus - Error updating booking ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.updateBookingStatus - Error status:`, error.response.status);
        console.error(`providerService.updateBookingStatus - Error data:`, error.response.data);
      } else {
        console.error(`providerService.updateBookingStatus - No response object in error`);
      }
      
      throw error;
    }
  },

  async deleteBooking(id: string) {
    try {
      console.log(`providerService.deleteBooking - Deleting booking ${id}`);
      const response = await api.delete(`/api/provider/bookings/${id}`)
      console.log(`providerService.deleteBooking - Response:`, response);
      return response
    } catch (error: any) {
      console.error(`providerService.deleteBooking - Error deleting booking ${id}:`, error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error(`providerService.deleteBooking - Error status:`, error.response.status);
        console.error(`providerService.deleteBooking - Error data:`, error.response.data);
      } else {
        console.error(`providerService.deleteBooking - No response object in error`);
      }
      
      throw error;
    }
  },

  // Image upload method
  async uploadImage(file: File) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post("/api/providers/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return response;
    } catch (error: any) {
      console.error("providerService.uploadImage - Error:", error);
      
      // Check if error.response exists before accessing its properties
      if (error.response) {
        console.error("providerService.uploadImage - Error status:", error.response.status);
        console.error("providerService.uploadImage - Error data:", error.response.data);
      } else {
        console.error("providerService.uploadImage - No response object in error");
      }
      
      throw error;
    }
  },
}