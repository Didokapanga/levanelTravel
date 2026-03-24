// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // 🔥 IMPORTANT
      devOptions: {
        enabled: true
      },

      manifest: {
        name: 'ERP LEVANNEL',
        short_name: 'LEVANNEL',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1e293b',
        icons: [
          {
            src: '/192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})


// // vite.config.ts
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     outDir: 'dist',
//   }
// });
