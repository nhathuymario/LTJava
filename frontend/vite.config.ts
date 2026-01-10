import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8081', // cổng backend của bạn
                changeOrigin: true,
                // Nếu backend KHÔNG có prefix /api, bật rewrite:
                // rewrite: (p) => p.replace(/^\/api/, ''),
            },
        },
    },
})