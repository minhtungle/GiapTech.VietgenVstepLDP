import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Đường dẫn tuyệt đối: route nhiều cấp như /tin-tuc/chi-tiet vẫn tải đúng bundle.
  base: '/',
  server: {
    port: 5173,
    proxy: {
      // Khi chạy dev, chuyển các lệnh gọi API sang server Node.
      '/api': 'http://localhost:3101',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
