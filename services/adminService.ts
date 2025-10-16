import api from '@/lib/api';
import { User, Service, Category, Booking, Complaint, Notification, Feedback } from '@/types/api';

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

// Support Management
const getAllComplaints = () => api.get<Complaint[]>('/api/support/complaints');
const updateComplaintStatus = (id: string, data: { status?: string; assignedTo?: string }) => 
  api.put<Complaint>(`/api/support/complaints/${id}`, data);
const getAllNotifications = () => api.get<Notification[]>('/api/support/notifications');
const createNotification = (data: Partial<Notification>) => 
  api.post<Notification>('/api/support/notifications', data);

// Feedback Management
const getAllFeedbacks = () => api.get<Feedback[]>('/api/admin/feedbacks');
const getFeedbackById = (id: string) => api.get<Feedback>(`/api/admin/feedbacks/${id}`);
const updateFeedback = (id: string, data: Partial<Feedback>) => 
  api.put<Feedback>(`/api/admin/feedbacks/${id}`, data);
const deleteFeedback = (id: string) => api.delete(`/api/admin/feedbacks/${id}`);

// Ratings Management
const getAllRatings = () => api.get<any[]>('/api/admin/ratings');

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
  updateBookingStatus,
  getAllComplaints,
  updateComplaintStatus,
  getAllNotifications,
  createNotification,
  getAllFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  getAllRatings
};