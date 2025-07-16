import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Use polling instead of native file watching to reduce file descriptors
      usePolling: true,
      interval: 1000,
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "**/coverage/**",
        "**/.git/**",
        "**/src-tauri/**",
        "**/supabase/**"
      ]
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Otimizar dependências para Tauri
  optimizeDeps: {
    include: ['react', 'react-dom', '@tauri-apps/api']
  },
  // Limit concurrent processing
  build: {
    rollupOptions: {
      maxParallelFileOps: 5
    }
  }
}));
