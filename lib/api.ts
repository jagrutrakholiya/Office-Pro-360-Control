import axios from 'axios';

// Use 5001 as default since macOS uses 5000 for AirPlay Receiver
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

