import api from "@/lib/api"
import type { User } from "@/types/api"

export interface SignupData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  userType: "customer" | "provider"
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  async signup(data: SignupData) {
    try {
      const response = await api.post("/api/auth/signup", data)
      return response
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  },

  async login(data: LoginData) {
    try {
      const response = await api.post("/api/auth/login", data)
      return response
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  async getProfile() {
    try {
      const response = await api.get("/api/auth/profile")
      return response
    } catch (error) {
      console.error("Get profile error:", error)
      throw error
    }
  },

  async updateProfile(data: Partial<User>) {
    try {
      const response = await api.put("/api/auth/profile", data)
      return response
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },

  async resetPassword(email: string) {
    try {
      const response = await api.post("/api/auth/reset-password", { email })
      return response
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  },
}