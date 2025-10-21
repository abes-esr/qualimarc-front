// vite.config.js
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {fileURLToPath, URL} from 'node:url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
        extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
    server: {
        watch: {
            usePolling: true,
            interval: 1000,
        },
        port: 8080,
        host: "0.0.0.0",
    },
    hmr: {
        host: "localhost", // <-- important
        port: 8080,
        protocol: "ws", // ou "wss" si HTTPS
    },
});
