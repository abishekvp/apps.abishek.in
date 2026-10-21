/**
 * Lightweight Cryptographic Authentication & Session Tokens
 */
import crypto from 'node:crypto';
import { db } from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'abishek-apps-secret-key-2026';

export function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 86400 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${claims}`).digest('base64url');
  return `${header}.${claims}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, claims, signature] = parts;

  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${claims}`).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(claims, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export async function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  req.user = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.userId) {
      const user = await db.one('SELECT id, email, name, role, notify_new_tools, created_at FROM users WHERE id = ?', [payload.userId]);
      if (user) req.user = user;
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}
