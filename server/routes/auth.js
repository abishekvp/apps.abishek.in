import express from 'express';
import { db } from '../db/index.js';
import { hashPassword, verifyPassword } from '../db/schema.js';
import { signToken, requireAuth } from '../lib/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !email.includes('@') || !password || password.length < 4) {
      return res.status(400).json({ error: 'Valid email and password (min 4 chars) are required.' });
    }

    const existing = await db.one('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const passHash = hashPassword(password);
    const userName = name || email.split('@')[0];

    const result = await db.run(
      'INSERT INTO users (email, password_hash, name, role, notify_new_tools) VALUES (?, ?, ?, ?, ?)',
      [email.toLowerCase(), passHash, userName, 'user', 1]
    );

    const user = {
      id: result.lastInsertRowid,
      email: email.toLowerCase(),
      name: userName,
      role: 'user',
      notify_new_tools: 1
    };

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 86400 * 1000
    });

    res.status(201).json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await db.one('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      notify_new_tools: user.notify_new_tools
    };

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 86400 * 1000
    });

    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// PUT /api/auth/preferences — Toggle email notifications on/off
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const { notify_new_tools } = req.body;
    const val = notify_new_tools ? 1 : 0;

    await db.run('UPDATE users SET notify_new_tools = ? WHERE id = ?', [val, req.user.id]);
    req.user.notify_new_tools = val;

    res.json({
      success: true,
      message: val ? 'Email notifications enabled.' : 'Email notifications turned off.',
      notify_new_tools: val
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
