"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specializationsAPI = exports.usersAPI = exports.appointmentsAPI = exports.doctorsAPI = exports.authAPI = void 0;
const api_1 = __importDefault(require("./api"));

exports.authAPI = {
    login: (data) => api_1.default.post('/auth/login', data),
    signup: (data) => api_1.default.post('/auth/signup', data),
    logout: () => api_1.default.get('/auth/logout'),
    getProfile: () => api_1.default.get('/auth/profile'),
};

exports.doctorsAPI = {
    getAll: (params) => api_1.default.get('/doctors', { params }),
    getOne: (id) => api_1.default.get(`/doctors/${id}`),
    create: (data) => api_1.default.post('/doctors', data),
    update: (id, data) => api_1.default.put(`/doctors/${id}`, data),
    delete: (id) => api_1.default.delete(`/doctors/${id}`),
    getStats: () => api_1.default.get('/doctors/stats'),
};

exports.appointmentsAPI = {
    getAll: (params) => api_1.default.get('/appointments', { params }),
    book: (data) => api_1.default.post('/appointments', data),
    getAvailableSlots: (doctorId, date) => api_1.default.get('/appointments/available-slots', { params: { doctorId, date } }),
    getQueue: (doctorId, date) => api_1.default.get(`/appointments/queue/${doctorId}/${date}`),
    checkIn: (id) => api_1.default.patch(`/appointments/${id}/check-in`),
    updateStatus: (id, data) => api_1.default.patch(`/appointments/${id}/status`, data),
    complete: (id, notes) => api_1.default.patch(`/appointments/${id}/complete`, { notes }),
    cancel: (id) => api_1.default.patch(`/appointments/${id}/cancel`),
};

exports.usersAPI = {
    getAll: (params) => api_1.default.get('/users', { params }),
    getOne: (id) => api_1.default.get(`/users/${id}`),
    create: (data) => api_1.default.post('/users', data),
    update: (id, data) => api_1.default.put(`/users/${id}`, data),
    delete: (id) => api_1.default.delete(`/users/${id}`),
};

exports.specializationsAPI = {
    getAll: () => api_1.default.get('/specializations'),
};
