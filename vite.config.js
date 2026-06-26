import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.GITHUB_PAGES === 'true' ? '/app-receitas/' : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'Minhas Receitas',
        short_name: 'Receitas',
        description: 'Salve, encontre e leia suas receitas no celular.',
        lang: 'pt-BR',
        display: 'standalone',
        start_url: base,
        scope: base,
        theme_color: '#2F7D65',
        background_color: '#F7F4EE',
        icons: [
          {
            src: `${base}icons/icon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
