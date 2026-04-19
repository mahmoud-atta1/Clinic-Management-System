import api from './api';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  createdAt: string;
}

export interface Doctor {
  _id: string;
  userId: User;
  specializationId: { _id: string; name: string };
  consultationFee: number;
  followUpFee: number;
  availableDays: string[];
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export interface Appointment {
  _id: string;
  doctorId: Doctor;
  patientId: User;
  date: string;
  slotTime: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'rejected';
  appointmentType: 'consultation' | 'follow_up';
  price: number;
  bookingCode: string;
  queueNumber: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: 'cash' | 'card';
  notes?: string;
}

export const authAPI = {
  login: (data: { email?: string; phone?: string; password: string }) =>
    api.post('/auth/login', data),
  signup: (data: Partial<User> & { password?: string }) => api.post('/auth/signup', data),
  logout: () => api.get('/auth/logout'),
  getProfile: () => api.get<{ data: User }>('/auth/profile'),
};

export const doctorsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: Doctor[] }>('/doctors', { params }),
  getOne: (id: string) => api.get<{ data: Doctor }>(`/doctors/${id}`),
  create: (data: Partial<Doctor>) => api.post('/doctors', data),
  update: (id: string, data: Partial<Doctor>) => api.put(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
  getStats: () => api.get('/doctors/stats'),
};

export const appointmentsAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: Appointment[] }>('/appointments', { params }),
  book: (data: {
    doctorId: string;
    date: string;
    slotTime: string;
    appointmentType: 'consultation' | 'follow_up';
    notes?: string;
    patientId?: string;
  }) => api.post('/appointments', data),
  getAvailableSlots: (doctorId: string, date: string) =>
    api.get<{ data: string[] }>('/appointments/available-slots', { params: { doctorId, date } }),
  getQueue: (doctorId: string, date: string) =>
    api.get<{ data: Appointment[] }>(`/appointments/queue/${doctorId}/${date}`),
  checkIn: (id: string) => api.patch(`/appointments/${id}/check-in`),
  updateStatus: (id: string, data: { status?: string; paymentStatus?: string; paymentMethod?: string }) =>
    api.patch(`/appointments/${id}/status`, data),
  complete: (id: string, notes?: string) =>
    api.patch(`/appointments/${id}/complete`, { notes }),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
};

export const usersAPI = {
  getAll: (params?: Record<string, unknown>) => api.get<{ data: User[] }>('/users', { params }),
  getOne: (id: string) => api.get<{ data: User }>(`/users/${id}`),
  create: (data: Partial<User> & { password?: string }) => api.post('/users', data),
  update: (id: string, data: Partial<User>) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const specializationsAPI = {
  getAll: () => api.get<{ data: { _id: string; name: string }[] }>('/specializations'),
  create: (data: { name: string }) => api.post<{ data: { _id: string; name: string } }>('/specializations', data),
  delete: (id: string) => api.delete(`/specializations/${id}`),
  update: (id: string, data: { name: string }) => api.put<{ data: { _id: string; name: string } }>(`/specializations/${id}`, data),
};
