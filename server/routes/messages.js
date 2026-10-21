import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// POST /api/messages — Send contact / support message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!message || !subject) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    const senderEmail = req.user?.email || email;
    if (!senderEmail || !senderEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email required.' });
    }

    const senderName = req.user?.name || name || 'Anonymous Visitor';

    await db.run(
      `INSERT INTO messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)`,
      [req.user?.id || null, senderName, senderEmail, subject, message]
    );

    res.status(201).json({
      success: true,
      message: 'Your message has been sent directly to the tools team.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
