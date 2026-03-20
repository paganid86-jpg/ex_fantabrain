import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // Proxy per football-data.org: risolve CORS in sviluppo locale.
        // Aggiunge l'header X-Auth-Token server-side (non esposto nel bundle).
        '/api/football': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football/, '/v4'),
          headers: {
            'X-Auth-Token': env.VITE_FOOTBALL_DATA_API_KEY || '',
          },
        },
      },
    },
  };
});
