// Full-Stack Express Server with Cloudflare D1 Emulation & Vite Dev Middleware
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from './src/server/router';
import { getNodeD1Database } from './src/server/node-d1';
import { resolve } from 'path';
import { existsSync } from 'fs';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize local D1 database
  const d1Database = getNodeD1Database();

  // Route /api/* to Cloudflare Workers Handler
  app.use('/api', async (req, res) => {
    try {
      // Build full URL
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.get('host') || `localhost:${PORT}`;
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      // Convert Express request to standard Web Request
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      let body: any = undefined;
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        body = JSON.stringify(req.body);
        headers.set('Content-Type', 'application/json');
      }

      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers,
        body,
      });

      // Execute Cloudflare Worker Router
      const response = await handleApiRequest(webRequest, {
        DB: d1Database,
        ENVIRONMENT: isProduction ? 'production' : 'development',
      });

      // Transfer headers
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          res.append('Set-Cookie', value);
        } else {
          res.setHeader(key, value);
        }
      });

      res.status(response.status);
      const resText = await response.text();
      res.send(resText);
    } catch (error: any) {
      console.error('[API Proxy Error]', error);
      res.status(500).json({ error: error?.message || 'Server error' });
    }
  });

  // Frontend Serving
  if (!isProduction) {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = resolve('dist');
    if (existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Comentosh] Full-stack Cloudflare D1 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
