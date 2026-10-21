import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/requests — List approved / active tool requests
router.get('/', async (req, res) => {
  try {
    const requests = await db.all(
      'SELECT id, title, description, use_cases, votes_count, status, created_at FROM tool_requests ORDER BY votes_count DESC, created_at DESC LIMIT 50'
    );
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/mine — Get requests submitted by the logged-in user
router.get('/mine', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in' });
  try {
    const requests = await db.all(
      'SELECT * FROM tool_requests WHERE user_id = ? OR email = ? ORDER BY created_at DESC',
      [req.user.id, req.user.email]
    );
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests — Submit a new tool / feature request (Public with email, or logged in)
router.post('/', async (req, res) => {
  try {
    const { title, description, use_cases, ref_links, email, name } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const requesterEmail = req.user?.email || email;
    if (!requesterEmail || !requesterEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required so we can notify you when the tool is built.' });
    }

    const requesterName = req.user?.name || name || requesterEmail.split('@')[0];

    const result = await db.run(
      `INSERT INTO tool_requests (user_id, email, name, title, description, use_cases, ref_links, status, votes_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 1)`,
      [req.user?.id || null, requesterEmail, requesterName, title, description, use_cases || '', ref_links || '']
    );

    res.status(201).json({
      success: true,
      message: 'Tool request submitted successfully! We will review and notify you.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests/:id/vote — Upvote a tool request
router.post('/:id/vote', async (req, res) => {
  try {
    await db.run('UPDATE tool_requests SET votes_count = votes_count + 1 WHERE id = ?', [req.params.id]);
    const updated = await db.one('SELECT votes_count FROM tool_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, votes: updated?.votes_count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
