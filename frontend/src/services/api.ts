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
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('jwt')

    console.log('token:', token)
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})