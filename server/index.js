/**
 * Apps & Tools Directory Server — apps.abishek.in & tools.abishek.in
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initDb } from './db/index.js';
import { authMiddleware } from './lib/auth.js';

import toolsRouter from './routes/tools.js';
import requestsRouter from './routes/requests.js';
import bugsRouter from './routes/bugs.js';
import messagesRouter from './routes/messages.js';
import subscribeRouter from './routes/subscribe.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

export async function createApp() {
  await initDb();

  const app = express();

  // Basic Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // CORS Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  // Auth Middleware
  app.use(authMiddleware);

  // API Routes
  app.use('/api/tools', toolsRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/bugs', bugsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/subscribe', subscribeRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  // API 404 handler: Any unhandled /api route returns JSON 404
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl || req.url}` });
  });

  // Global Error Handler for API and Express errors
  app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]:', err);
    if (res.headersSent) return next(err);
    if (req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api')) {
      return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
    }
    res.status(500).send('Internal server error');
  });

  // Static Assets: Prefer built React production app in dist/, fallback to public/
  const distDir = path.resolve(__dirname, '../dist');
  const publicDir = path.resolve(__dirname, '../public');
  const staticDir = fs.existsSync(distDir) ? distDir : publicDir;
  app.use(express.static(staticDir));
  if (staticDir !== publicDir) {
    app.use(express.static(publicDir));
  }

  // Admin Portal Route: Dedicated separate administration page
  app.get(['/admin', '/admin.html'], (req, res) => {
    const adminPath = path.join(publicDir, 'admin.html');
    if (fs.existsSync(adminPath)) {
      return res.sendFile(adminPath);
    }
    res.status(404).send('Admin page not found');
  });

  // SPA Fallback: Send index.html for any unhandled GET route that doesn't start with /api
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = fs.existsSync(path.join(distDir, 'index.html'))
        ? path.join(distDir, 'index.html')
        : path.join(publicDir, 'index.html');
      return res.sendFile(indexPath);
    }
    next();
  });

  return app;
}

// Server startup if run directly from CLI
import { pathToFileURL } from 'node:url';

const isMainModule = process.argv[1] && (
  import.meta.url === pathToFileURL(process.argv[1]).href ||
  process.argv[1].endsWith('server/index.js') ||
  process.argv[1].endsWith('server\\index.js')
);

if (isMainModule) {
  const PORT = process.env.PORT || 5000;
  createApp().then(app => {
    app.listen(PORT, () => {
      console.log(`[SERVER] Apps & Tools Hub running at http://localhost:${PORT}`);
      console.log(`[SERVER] Serving both apps.abishek.in and tools.abishek.in`);
    });
  }).catch(err => {
    console.error('[SERVER] Startup failed:', err);
    process.exit(1);
  });
}
