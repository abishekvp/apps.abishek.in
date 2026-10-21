import express from 'express';
import { db } from '../db/index.js';
import { requireAdmin } from '../lib/auth.js';

const router = express.Router();

// All routes here strictly require admin role
router.use(requireAdmin);

// GET /api/admin/overview — Dashboard Stats
router.get('/overview', async (req, res) => {
  try {
    const toolsCount = await db.one('SELECT COUNT(*) as cnt FROM tools');
    const bugsCount = await db.one('SELECT COUNT(*) as cnt FROM bug_reports');
    const requestsCount = await db.one('SELECT COUNT(*) as cnt FROM tool_requests');
    const messagesCount = await db.one('SELECT COUNT(*) as cnt FROM messages');
    const subscribersCount = await db.one('SELECT COUNT(*) as cnt FROM launch_subscribers');
    const usersCount = await db.one('SELECT COUNT(*) as cnt FROM users');

    res.json({
      counts: {
        tools: Number(toolsCount?.cnt || 0),
        bugs: Number(bugsCount?.cnt || 0),
        requests: Number(requestsCount?.cnt || 0),
        messages: Number(messagesCount?.cnt || 0),
        subscribers: Number(subscribersCount?.cnt || 0),
        users: Number(usersCount?.cnt || 0)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= TOOLS MANAGEMENT =================
// GET /api/admin/tools — List all tools including hidden ones
router.get('/tools', async (req, res) => {
  try {
    const tools = await db.all('SELECT * FROM tools ORDER BY is_upcoming ASC, display_order ASC');
    const formatted = tools.map(t => ({
      ...t,
      features: t.features ? JSON.parse(t.features) : [],
      tags: t.tags ? JSON.parse(t.tags) : []
    }));
    res.json({ tools: formatted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/tools — Add new tool
router.post('/tools', async (req, res) => {
  try {
    const {
      name, slug, url, icon, category, badge, short_desc, long_desc,
      features, tags, is_hidden, is_upcoming, launch_date
    } = req.body;

    if (!name || !slug || !url || !short_desc) {
      return res.status(400).json({ error: 'Name, slug, URL, and short description are required.' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    const existing = await db.one('SELECT id FROM tools WHERE slug = ?', [cleanSlug]);
    if (existing) {
      return res.status(400).json({ error: 'A tool with this slug already exists.' });
    }

    const featuresJson = typeof features === 'string' ? features : JSON.stringify(features || []);
    const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);

    const result = await db.run(
      `INSERT INTO tools (name, slug, url, icon, category, badge, short_desc, long_desc, features, tags, is_hidden, is_upcoming, launch_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, cleanSlug, url, icon || '🔧', category || 'developer', badge || 'Active',
        short_desc, long_desc || '', featuresJson, tagsJson,
        is_hidden ? 1 : 0, is_upcoming ? 1 : 0, launch_date || null
      ]
    );

    res.status(201).json({ success: true, message: 'Tool created successfully', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/tools/:id — Edit tool
router.put('/tools/:id', async (req, res) => {
  try {
    const {
      name, slug, url, icon, category, badge, short_desc, long_desc,
      features, tags, is_hidden, is_upcoming, launch_date
    } = req.body;

    const featuresJson = typeof features === 'string' ? features : JSON.stringify(features || []);
    const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);

    await db.run(
      `UPDATE tools
       SET name = ?, slug = ?, url = ?, icon = ?, category = ?, badge = ?, short_desc = ?,
           long_desc = ?, features = ?, tags = ?, is_hidden = ?, is_upcoming = ?, launch_date = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, slug, url, icon, category, badge, short_desc, long_desc || '',
        featuresJson, tagsJson, is_hidden ? 1 : 0, is_upcoming ? 1 : 0, launch_date || null,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Tool updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/tools/:id/toggle-visibility — Toggle Hide / View
router.patch('/tools/:id/toggle-visibility', async (req, res) => {
  try {
    const tool = await db.one('SELECT is_hidden FROM tools WHERE id = ?', [req.params.id]);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    const newHidden = tool.is_hidden ? 0 : 1;
    await db.run('UPDATE tools SET is_hidden = ? WHERE id = ?', [newHidden, req.params.id]);

    res.json({
      success: true,
      is_hidden: newHidden,
      message: newHidden ? 'Tool is now hidden from public showcase.' : 'Tool is now visible publicly.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/tools/:id — Delete tool
router.delete('/tools/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM tools WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Tool deleted from database.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BUGS MANAGEMENT =================
// GET /api/admin/bugs
router.get('/bugs', async (req, res) => {
  try {
    const bugs = await db.all('SELECT * FROM bug_reports ORDER BY created_at DESC');
    res.json({ bugs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/bugs/:id
router.patch('/bugs/:id', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    await db.run(
      'UPDATE bug_reports SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, admin_notes || '', req.params.id]
    );
    res.json({ success: true, message: 'Bug report status updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/bugs/:id
router.delete('/bugs/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM bug_reports WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Bug report deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= REQUESTS MANAGEMENT =================
// GET /api/admin/requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await db.all('SELECT * FROM tool_requests ORDER BY votes_count DESC, created_at DESC');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/requests/:id
router.patch('/requests/:id', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    await db.run(
      'UPDATE tool_requests SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, admin_notes || '', req.params.id]
    );
    res.json({ success: true, message: 'Tool request status updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/requests/:id
router.delete('/requests/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM tool_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Tool request deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= MESSAGES MANAGEMENT =================
// GET /api/admin/messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await db.all('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/messages/:id/read
router.patch('/messages/:id/read', async (req, res) => {
  try {
    await db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SUBSCRIBERS =================
// GET /api/admin/subscribers
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await db.all('SELECT * FROM launch_subscribers ORDER BY created_at DESC');
    res.json({ subscribers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
