import axios from 'axios'

const API_BASE_URL =
    import.meta.env.PROD
        ? (import.meta.env.VITE_API_BASE_URL || '/api')
        : '/api' // dev: luôn đi qua proxy

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt')
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})