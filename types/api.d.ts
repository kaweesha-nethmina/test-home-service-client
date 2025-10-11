export interface User {
  _id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  address?: string
  userType: "customer" | "provider" | "admin"
  role: "customer" | "provider" | "admin"
  isBlocked?: boolean
  createdAt?: string
}

export interface Service {
  _id: string
  name?: string
  description: string
  price: number
  categoryId: string
  providerId: string
  category?: Category
  provider?: User
  images?: string[]
  location?: string
  rating?: number
  createdAt?: string
}

export interface Category {
  _id: string
  name: string
  description: string
  icon?: string
  createdAt?: string
}

export interface Work {
  _id: string
  title: string
  description: string
  images: string[]
  providerId: string
  date?: string
  serviceId?: string
  createdAt?: string
}

export interface Booking {
  _id: string
  service: string | Service
  customerId: string
  providerId: string
  date: string
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  totalPrice: number
  address: string
  notes?: string
  customerName: string
  customerPhone: string
  serviceName?: string
  customer?: User
  provider?: User
  providerName?: string
  rated?: boolean
  createdAt?: string
}

export interface Payment {
  _id: string
  bookingId: string
  amount: number
  status: "pending" | "completed" | "failed"
  paymentMethod?: string
  transactionId?: string
  createdAt?: string
}

export interface Complaint {
  _id: string
  userId: string
  bookingId?: string
  subject: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  user?: User
  createdAt?: string
}

export interface Rating {
  _id: string
  bookingId: string
  customerId: string
  providerId: string
  rating: number
  comment?: string
  createdAt?: string
}

export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt?: string
}
