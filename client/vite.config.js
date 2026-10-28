import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const clientEnv = loadEnv(mode, process.cwd(), '');
  let siteOrigin = '';
  try {
    const candidate = new URL(clientEnv.VITE_SITE_URL);
    if (candidate.protocol === 'https:') siteOrigin = candidate.origin;
  } catch { /* Social URLs are omitted until a public HTTPS URL is configured. */ }

  return {
    plugins: [react(), {
      name: 'growthos-social-metadata',
      transformIndexHtml(html) {
        if (!siteOrigin) return html;
        const image = `${siteOrigin}/og-image.png`;
        const tags = [
          `<link rel="canonical" href="${siteOrigin}/" />`,
          `<meta property="og:url" content="${siteOrigin}/" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta property="og:image:secure_url" content="${image}" />`,
          '<meta property="og:image:type" content="image/png" />',
          '<meta property="og:image:width" content="1200" />',
          '<meta property="og:image:height" content="630" />',
          '<meta property="og:image:alt" content="GrowthOS: a thoughtful daily practice for a life that feels like yours." />',
          `<meta name="twitter:image" content="${image}" />`,
        ].join('\n    ');
        return html.replace('</head>', `    ${tags}\n  </head>`);
      },
    }],
    resolve: { alias: { '@': resolve(fileURLToPath(new URL('.', import.meta.url)), 'src') } },
    server: { host: '0.0.0.0', port: 5173, proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } } },
    build: { rollupOptions: { output: { manualChunks: { 'react-vendor': ['react', 'react-dom', 'react-router-dom'], 'state-vendor': ['@reduxjs/toolkit', 'react-redux', '@tanstack/react-query'] } } } },
  };
});
