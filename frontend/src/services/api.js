import axios from 'axios';

const API = axios.create({
  baseURL: 'https://homehive-backend-f3ub.onrender.com/api',
  timeout: 15000,
});

// Interceptor to attach JWT token to headers if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;