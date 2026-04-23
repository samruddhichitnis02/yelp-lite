import axios from 'axios';

const api = axios.create({
    baseURL: '/api/restaurants',
});

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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
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