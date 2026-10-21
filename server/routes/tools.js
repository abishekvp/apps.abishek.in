import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// GET /api/tools — List all visible tools (with category, search query, and upcoming flags)
router.get('/', async (req, res) => {
  try {
    const { category, search, upcoming } = req.query;
    let sql = 'SELECT * FROM tools WHERE is_hidden = 0';
    const params = [];

    if (upcoming === 'true') {
      sql += ' AND is_upcoming = 1';
    } else if (upcoming === 'false') {
      sql += ' AND is_upcoming = 0';
    }

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(short_desc) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(features) LIKE ?)';
      const s = `%${search.toLowerCase().trim()}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY is_upcoming ASC, display_order ASC, likes_count DESC';

    const tools = await db.all(sql, params);

    // Parse JSON fields
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

// GET /api/tools/:slug
router.get('/:slug', async (req, res) => {
  try {
    const tool = await db.one('SELECT * FROM tools WHERE slug = ?', [req.params.slug]);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    res.json({
      tool: {
        ...tool,
        features: tool.features ? JSON.parse(tool.features) : [],
        tags: tool.tags ? JSON.parse(tool.tags) : []
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tools/:slug/like — Like / Upvote tool
router.post('/:slug/like', async (req, res) => {
  try {
    await db.run('UPDATE tools SET likes_count = likes_count + 1 WHERE slug = ?', [req.params.slug]);
    const updated = await db.one('SELECT likes_count FROM tools WHERE slug = ?', [req.params.slug]);
    res.json({ success: true, likes: updated?.likes_count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
