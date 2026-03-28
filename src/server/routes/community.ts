import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
    } catch {}
  }
  next();
};

router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const result = await query(
      `SELECT p.*, u.full_name, u.avatar_url, u.level as user_level 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       ORDER BY p.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/posts', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, error: 'Phải đăng nhập để đăng bài' });
    const { content, type, tags } = req.body;
    const result = await query(
      'INSERT INTO posts (user_id, content, type, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, content, type || 'post', tags || []]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/posts/:id/like', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, error: 'Phải đăng nhập' });
    const { id } = req.params;
    await query('INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [req.userId, id]);
    await query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT c.*, u.full_name, u.avatar_url FROM post_comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/posts/:id/comments', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, error: 'Phải đăng nhập' });
    const { id } = req.params;
    const { content } = req.body;
    const result = await query('INSERT INTO post_comments (user_id, post_id, content) VALUES ($1, $2, $3) RETURNING *', [req.userId, id, content]);
    await query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/groups', optionalAuth, async (req, res) => {
  try {
    const result = await query('SELECT sg.*, u.full_name as creator_name FROM study_groups sg LEFT JOIN users u ON sg.creator_id = u.id WHERE sg.is_public = true ORDER BY sg.created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/groups', optionalAuth, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ success: false, error: 'Phải đăng nhập' });
    const { name, description, is_public, max_members } = req.body;
    const result = await query('INSERT INTO study_groups (name, description, creator_id, is_public, max_members) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, req.userId, is_public !== false, max_members || 50]);
    await query('INSERT INTO study_group_members (group_id, user_id, role) VALUES ($1, $2, \'admin\')', [result.rows[0].id, req.userId]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/activities', async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const result = await query(
      `SELECT a.*, u.full_name, u.avatar_url FROM activities a JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT $1`,
      [limit]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
