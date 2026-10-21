/**
 * Vercel Serverless Function entrypoint for apps.abishek.in
 */
import { createApp } from '../server/index.js';

let appPromise = null;

export default async function handler(req, res) {
  try {
    if (!appPromise) {
      appPromise = createApp().catch((err) => {
        appPromise = null;
        throw err;
      });
    }
    const app = await appPromise;
    return await app(req, res);
  } catch (err) {
    console.error('[API Handler Error]:', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
