import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'Không có token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT sg.*, 
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count,
        u.full_name as creator_name
      FROM study_groups sg
      LEFT JOIN users u ON sg.creator_id = u.id
      WHERE sg.is_public = true
    `;
    const params: any[] = [];
    if (search) {
      sql += ` AND (sg.name ILIKE $1 OR sg.description ILIKE $1)`;
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY sg.created_at DESC LIMIT 50';
    
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT sg.*, 
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count,
        u.full_name as creator_name,
        sm.joined_at as my_joined_at
      FROM study_groups sg
      LEFT JOIN users u ON sg.creator_id = u.id
      LEFT JOIN study_group_members sm ON sg.id = sm.group_id AND sm.user_id = $1
      WHERE sm.user_id = $1 OR sg.creator_id = $1
      ORDER BY sg.created_at DESC
    `, [req.userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, is_public = true, max_members = 50 } = req.body;
    
    const result = await query(`
      INSERT INTO study_groups (name, description, creator_id, is_public, max_members)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, req.userId, is_public, max_members]);

    await query(`
      INSERT INTO study_group_members (group_id, user_id, role)
      VALUES ($1, $2, 'admin')
    `, [result.rows[0].id, req.userId]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await query(`
      SELECT sg.*, 
        (SELECT COUNT(*) FROM study_group_members WHERE group_id = sg.id) as member_count,
        u.full_name as creator_name
      FROM study_groups sg
      LEFT JOIN users u ON sg.creator_id = u.id
      WHERE sg.id = $1
    `, [id]);

    if (group.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Nhóm không tồn tại' });
    }

    const members = await query(`
      SELECT sm.*, u.full_name, u.avatar_url, u.level
      FROM study_group_members sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.group_id = $1
      ORDER BY sm.joined_at ASC
    `, [id]);

    res.json({ success: true, data: { ...group.rows[0], members: members.rows } });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await query('SELECT * FROM study_groups WHERE id = $1', [id]);
    if (group.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Nhóm không tồn tại' });
    }

    const memberCount = await query('SELECT COUNT(*) as count FROM study_group_members WHERE group_id = $1', [id]);
    if (memberCount.rows[0].count >= group.rows[0].max_members) {
      return res.status(400).json({ success: false, error: 'Nhóm đã đầy' });
    }

    await query(`
      INSERT INTO study_group_members (group_id, user_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT DO NOTHING
    `, [id, req.userId]);

    res.json({ success: true, message: 'Tham gia thành công' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM study_group_members WHERE group_id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true, message: 'Rời nhóm thành công' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
