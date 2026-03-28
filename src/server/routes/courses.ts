import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { Course } from '../types/database';

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

const requireInstructor = async (req: any, res: any, next: any) => {
  const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (!user.rows[0] || !['admin', 'super_admin', 'instructor'].includes(user.rows[0].role)) {
    return res.status(403).json({ success: false, error: 'Không có quyền' });
  }
  req.userRole = user.rows[0].role;
  next();
};

const canManageCourse = async (req: any, res: any, next: any) => {
  const { id } = req.params;
  const course = await query('SELECT teacher_id FROM courses WHERE id = $1', [id]);
  if (course.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
  }
  const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (['admin', 'super_admin'].includes(user.rows[0]?.role) || course.rows[0].teacher_id === req.userId) {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Không có quyền quản lý khóa học này' });
};

router.get('/', async (req, res) => {
  try {
    const { category, level, featured, published = 'true', page = '1', limit = '20' } = req.query;

    let sql = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (published === 'true') {
      sql += ` AND is_published = $${paramIndex++}`;
      params.push(true);
    }

    if (featured === 'true') {
      sql += ` AND is_featured = $${paramIndex++}`;
      params.push(true);
    }

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (level) {
      sql += ` AND level = $${paramIndex++}`;
      params.push(level);
    }

    const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*)'), params);
    const total = parseInt(countResult.rows[0].count);

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit as string), (parseInt(page as string) - 1) * parseInt(limit as string));

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await query(
      'SELECT * FROM courses WHERE slug = $1 AND is_published = true',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get course by slug error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, requireInstructor, async (req, res) => {
  try {
    const { title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured } = req.body;

    const result = await query(
      `INSERT INTO courses (title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, slug, description, thumbnail_url, teacher_name, level || 'beginner', category, price_vnd || 0, original_price_vnd, discount_percent || 0, has_certificate || false, is_published || false, is_featured || false]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id', authenticate, requireInstructor, canManageCourse, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured, total_lessons, students_enrolled, rating } = req.body;

    const result = await query(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           thumbnail_url = COALESCE($4, thumbnail_url),
           teacher_name = COALESCE($5, teacher_name),
           level = COALESCE($6, level),
           category = COALESCE($7, category),
           price_vnd = COALESCE($8, price_vnd),
           original_price_vnd = COALESCE($9, original_price_vnd),
           discount_percent = COALESCE($10, discount_percent),
           has_certificate = COALESCE($11, has_certificate),
           is_published = COALESCE($12, is_published),
           is_featured = COALESCE($13, is_featured),
           total_lessons = COALESCE($14, total_lessons),
           students_enrolled = COALESCE($15, students_enrolled),
           rating = COALESCE($16, rating)
       WHERE id = $17
       RETURNING *`,
      [title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured, total_lessons, students_enrolled, rating, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:id', authenticate, requireInstructor, canManageCourse, async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM courses WHERE id = $1', [id]);

    res.json({ success: true, message: 'Xóa khóa học thành công' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
