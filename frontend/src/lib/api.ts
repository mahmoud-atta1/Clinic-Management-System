import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {

      }
    }
    return Promise.reject(error);
  }
);

export default api;
