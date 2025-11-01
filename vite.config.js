import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/kanban/',
  
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate', // actualiza automáticamente el SW
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png', '*.png'],
      manifest: {
        name: 'Mi App Kanban',
        short_name: 'Kanban',
        description: 'Un tablero Kanban hecho con React y Vite',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/kanbanchu-transparent-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/kanbanchu-transparent-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/kanbanchu-transparent-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
