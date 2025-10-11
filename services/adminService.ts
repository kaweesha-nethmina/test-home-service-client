import api from '@/lib/api';
import { User, Service, Category, Booking } from '@/types/api';

// User Management
const getAllUsers = () => api.get<User[]>('/api/admin/users');
const deleteUser = (id: string) => api.delete(`/api/admin/users/${id}`);
const blockUser = (id: string) => api.post(`/api/admin/users/${id}/block`);
const unblockUser = (id: string) => api.post(`/api/admin/users/${id}/unblock`);

// Service Management
const getAllServices = () => api.get<Service[]>('/api/admin/services');
const deleteService = (id: string) => api.delete(`/api/services/${id}`);

// Category Management
const getAllCategories = () => api.get<Category[]>('/api/admin/categories');
const deleteCategory = (id: string) => api.delete(`/api/services/categories/${id}`);
const createCategory = (data: Partial<Category>) => api.post<Category>('/api/services/categories', data);
const updateCategory = (id: string, data: Partial<Category>) => api.put<Category>(`/api/services/categories/${id}`, data);

// Booking Management
const getAllBookings = () => api.get<Booking[]>('/api/admin/bookings');
const updateBookingStatus = (id: string, status: string) => 
  api.put(`/api/admin/bookings/${id}/status`, { status });

// Export all functions as a named object
export const adminService = {
  getAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
  getAllServices,
  deleteService,
  getAllCategories,
  deleteCategory,
  createCategory,
  updateCategory,
  getAllBookings,
  updateBookingStatus
};