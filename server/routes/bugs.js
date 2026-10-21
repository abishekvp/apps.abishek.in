import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/bugs/mine — Get bug reports submitted by logged-in user
router.get('/mine', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in' });
  try {
    const bugs = await db.all(
      'SELECT * FROM bug_reports WHERE user_id = ? OR email = ? ORDER BY created_at DESC',
      [req.user.id, req.user.email]
    );
    res.json({ bugs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bugs — Submit a bug report (Public with email, or logged in)
router.post('/', async (req, res) => {
  try {
    const { tool_slug, toolSlug, tool_name, toolName, title, description, steps_to_reproduce, severity, email, system_info } = req.body;

    const slug = tool_slug || toolSlug;
    const name = tool_name || toolName || slug;

    if (!title || !description || !slug) {
      return res.status(400).json({ error: 'Tool, title, and description are required.' });
    }

    const reporterEmail = req.user?.email || email;
    if (!reporterEmail || !reporterEmail.includes('@')) {
      return res.status(400).json({ error: 'A valid email ID is required so our engineers can reply and resolve your report.' });
    }

    const result = await db.run(
      `INSERT INTO bug_reports (user_id, email, tool_slug, tool_name, title, description, steps_to_reproduce, severity, system_info, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user?.id || null,
        reporterEmail,
        slug,
        name,
        title,
        description,
        steps_to_reproduce || '',
        severity || 'medium',
        system_info || req.headers['user-agent'] || ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Bug report received! Thank you for helping us maintain high quality tools.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
