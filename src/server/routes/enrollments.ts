import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Không có token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT e.*, c.title as course_title, c.thumbnail_url, c.price_vnd 
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.id 
       WHERE e.user_id = $1 AND e.status = 'active' 
       ORDER BY e.enrolled_at DESC`,
      [req.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { course_id } = req.body;

    const existing = await query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [req.userId, course_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Đã đăng ký khóa học này' });
    }

    const course = await query('SELECT * FROM courses WHERE id = $1', [course_id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    const courseData = course.rows[0];
    const isFree = courseData.course_type === 'free' || courseData.is_free_for_all === true;
    const freeUsers = courseData.free_for_users || [];
    const isUserInFreeList = Array.isArray(freeUsers) && freeUsers.includes(req.userId);

    const paidCheck = await query(
      "SELECT id FROM payments WHERE user_id = $1 AND course_id = $2 AND status = 'completed'",
      [req.userId, course_id]
    );
    const hasPaid = paidCheck.rows.length > 0;

    if (!isFree && !isUserInFreeList && !hasPaid) {
      return res.status(403).json({ success: false, error: 'Khóa học này yêu cầu thanh toán' });
    }

    const result = await query(
      `INSERT INTO enrollments (user_id, course_id, progress, status)
       VALUES ($1, $2, 0, 'active')
       RETURNING *`,
      [req.userId, course_id]
    );

    await query('UPDATE courses SET students_enrolled = students_enrolled + 1 WHERE id = $1', [course_id]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create enrollment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    const result = await query(
      `UPDATE enrollments 
       SET progress = COALESCE($1, progress),
           status = COALESCE($2, status),
           completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [progress, status, id, req.userId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/check/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = \'active\'',
      [req.userId, courseId]
    );

    res.json({ success: true, data: { enrolled: result.rows.length > 0, enrollment: result.rows[0] || null } });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = \'active\'',
      [req.userId, courseId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get enrollment by course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
