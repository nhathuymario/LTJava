import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // API backend
            "/api": {
                target: "http://localhost:8081",
                changeOrigin: true,
                secure: false,
            },

            // static files (avatars, uploads, etc.)
            "/uploads": {
                target: "http://localhost:8081",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
