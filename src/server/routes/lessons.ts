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

const requireInstructor = async (req: any, res: any, next: any) => {
  const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (!user.rows[0] || !['admin', 'super_admin', 'instructor'].includes(user.rows[0].role)) {
    return res.status(403).json({ success: false, error: 'Không có quyền' });
  }
  req.userRole = user.rows[0].role;
  next();
};

const canManageLesson = async (req: any, res: any, next: any) => {
  const { id, courseId } = req.params;
  const courseIdToCheck = courseId || req.body.course_id;
  
  if (!courseIdToCheck) {
    return res.status(400).json({ success: false, error: 'Thiếu course_id' });
  }
  
  const course = await query('SELECT teacher_id FROM courses WHERE id = $1', [courseIdToCheck]);
  if (course.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
  }
  const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (['admin', 'super_admin'].includes(user.rows[0]?.role) || course.rows[0].teacher_id === req.userId) {
    return next();
  }
  return res.status(403).json({ success: false, error: 'Không có quyền quản lý bài học này' });
};

router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { published = 'true' } = req.query;

    let sql = 'SELECT * FROM lessons WHERE course_id = $1';
    const params: any[] = [courseId];

    if (published === 'true') {
      sql += ' AND is_published = true';
    }

    sql += ' ORDER BY order_index ASC';

    const result = await query(sql, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM lessons WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Bài học không tồn tại' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, requireInstructor, canManageLesson, async (req, res) => {
  try {
    const { course_id, title, description, order_index, video_url, video_duration, is_free, is_published } = req.body;

    const result = await query(
      `INSERT INTO lessons (course_id, title, description, order_index, video_url, video_duration, is_free, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [course_id, title, description, order_index, video_url, video_duration, is_free || false, is_published || false]
    );

    await query('UPDATE courses SET total_lessons = total_lessons + 1 WHERE id = $1', [course_id]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order_index, video_url, video_duration, is_free, is_published } = req.body;

    const result = await query(
      `UPDATE lessons 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           order_index = COALESCE($3, order_index),
           video_url = COALESCE($4, video_url),
           video_duration = COALESCE($5, video_duration),
           is_free = COALESCE($6, is_free),
           is_published = COALESCE($7, is_published)
       WHERE id = $8
       RETURNING *`,
      [title, description, order_index, video_url, video_duration, is_free, is_published, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await query('SELECT course_id FROM lessons WHERE id = $1', [id]);
    
    if (lesson.rows.length > 0) {
      await query('UPDATE courses SET total_lessons = total_lessons - 1 WHERE id = $1', [lesson.rows[0].course_id]);
    }

    await query('DELETE FROM lessons WHERE id = $1', [id]);

    res.json({ success: true, message: 'Xóa bài học thành công' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT lr.* FROM lesson_resources lr
       WHERE lr.lesson_id = $1
       ORDER BY lr.created_at ASC`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
