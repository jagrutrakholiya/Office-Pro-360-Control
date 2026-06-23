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
    // Send timezone offset with every request
    config.headers['X-Timezone-Offset'] = String(new Date().getTimezoneOffset());
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 (expired/revoked token) clear the session and bounce to login, so a
// stale super-admin token can't keep appearing "logged in" with broken data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('cp_token');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Helper function for making API requests
export async function apiRequest(url: string, options?: any) {
  const response = await api.get(url, options);
  return response.data;
}

export default api;

