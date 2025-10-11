export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const USER_ROLES = {
  CUSTOMER: "customer",
  PROVIDER: "provider",
  ADMIN: "admin",
} as const

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const COMPLAINT_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in-progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
} as const
