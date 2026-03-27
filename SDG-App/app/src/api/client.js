import axios from 'axios';

// axios will fallback onto localhost:8000 if it cannot find the API base URL
const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
});

// Attach the JWT from localStorage to every request automatically
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
