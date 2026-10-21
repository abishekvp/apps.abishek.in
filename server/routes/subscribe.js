import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// POST /api/subscribe — Subscribe email to "Notify on Launch" or tool updates
router.post('/', async (req, res) => {
  try {
    const { email, tool_slug } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const slug = tool_slug || 'all';

    const existing = await db.one(
      'SELECT id FROM launch_subscribers WHERE email = ? AND tool_slug = ?',
      [email, slug]
    );

    if (existing) {
      return res.json({ success: true, message: 'You are already subscribed for launch alerts on this tool!' });
    }

    await db.run(
      'INSERT INTO launch_subscribers (email, tool_slug, is_active) VALUES (?, ?, 1)',
      [email, slug]
    );

    res.status(201).json({
      success: true,
      message: 'Subscribed! You will receive an email as soon as this tool launches.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
