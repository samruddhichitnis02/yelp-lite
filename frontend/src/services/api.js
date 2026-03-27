import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // FastAPI backend will run here
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Don't redirect on 401 for the AI assistant — it's accessible without login
            const url = error.config?.url || '';
            if (!url.includes('/ai-assistant/')) {
                localStorage.removeItem('auth_token');
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

export default api;