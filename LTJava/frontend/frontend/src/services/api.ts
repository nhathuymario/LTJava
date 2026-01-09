import axios from 'axios'

// @ts-ignore
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
    }
    // Log để bạn thấy đang gọi URL nào và có header chưa
    console.log('[axios] request:', {
        baseURL,
        url: config.url,
        method: config.method,
        hasAuth: !!config.headers?.Authorization,
    })
    return config
})