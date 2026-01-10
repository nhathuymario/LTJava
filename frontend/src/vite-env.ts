/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
}

// @ts-ignore
interface ImportMeta {
    readonly env: ImportMetaEnv
}