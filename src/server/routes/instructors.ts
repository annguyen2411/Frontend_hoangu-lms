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

const requireAdmin = async (req: any, res: any, next: any) => {
  const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
  if (!user.rows[0] || !['admin', 'super_admin'].includes(user.rows[0].role)) {
    return res.status(403).json({ success: false, error: 'Không có quyền' });
  }
  next();
};

// Get all instructors
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.email, u.full_name, u.avatar_url, u.role, u.level, u.created_at,
        i.bio, i.specialty, i.hourly_rate, i.is_available
      FROM users u
      LEFT JOIN instructor_profiles i ON u.id = i.user_id
      WHERE u.role IN ('instructor', 'admin', 'super_admin')
      ORDER BY u.full_name ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Create/update instructor profile
router.post('/profile', authenticate, requireAdmin, async (req, res) => {
  try {
    const { bio, specialty, hourly_rate, is_available } = req.body;
    
    const existing = await query('SELECT id FROM instructor_profiles WHERE user_id = $1', [req.userId]);
    
    if (existing.rows.length > 0) {
      await query(`
        UPDATE instructor_profiles 
        SET bio = $1, specialty = $2, hourly_rate = $3, is_available = $4
        WHERE user_id = $5
      `, [bio, specialty, hourly_rate, is_available, req.userId]);
    } else {
      await query(`
        INSERT INTO instructor_profiles (user_id, bio, specialty, hourly_rate, is_available)
        VALUES ($1, $2, $3, $4, $5)
      `, [req.userId, bio, specialty, hourly_rate, is_available]);
    }
    
    // Update user role to instructor if not already
    await query(`UPDATE users SET role = 'instructor' WHERE id = $1 AND role = 'student'`, [req.userId]);
    
    res.json({ success: true, message: 'Cập nhật hồ sơ giảng viên thành công' });
  } catch (error) {
    console.error('Update instructor profile error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Assign teacher to course (admin only)
router.put('/assign-course', authenticate, requireAdmin, async (req, res) => {
  try {
    const { course_id, teacher_id } = req.body;
    
    await query('UPDATE courses SET teacher_id = $1 WHERE id = $2', [teacher_id, course_id]);
    
    res.json({ success: true, message: 'Đã phân công giảng viên' });
  } catch (error) {
    console.error('Assign course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Get my courses (instructor's own courses)
router.get('/my-courses', authenticate, requireInstructor, async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.full_name as teacher_name
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.teacher_id = $1
      ORDER BY c.created_at DESC
    `, [req.userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Get courses by instructor
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT c.*, u.full_name as teacher_name
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.teacher_id = $1
      ORDER BY c.created_at DESC
    `, [id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Create new course (instructor)
router.post('/courses', authenticate, requireInstructor, async (req, res) => {
  try {
    const { title, description, thumbnail_url, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, total_lessons, duration_hours } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Thiếu tiêu đề khóa học' });
    }

    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();

    const result = await query(`
      INSERT INTO courses (slug, title, description, thumbnail_url, teacher_id, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, total_lessons, duration_hours, is_published, approval_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, false, 'pending')
      RETURNING *
    `, [
      slug, title, description, thumbnail_url, req.userId, 
      req.body.teacher_name || 'Giảng viên',
      level || 'beginner', category || 'General', 
      price_vnd || 0, original_price_vnd, discount_percent || 0,
      has_certificate || false, total_lessons || 0, duration_hours || 0
    ]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Get instructor statistics
router.get('/stats', authenticate, requireInstructor, async (req, res) => {
  try {
    const [courses, students, revenue, lessons] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM courses WHERE teacher_id = $1`, [req.userId]),
      query(`SELECT COUNT(DISTINCT e.user_id) as count FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = $1`, [req.userId]),
      query(`SELECT COALESCE(SUM(p.amount_vnd), 0) as total FROM payments p JOIN courses c ON p.course_id = c.id WHERE c.teacher_id = $1 AND p.status = 'completed'`, [req.userId]),
      query(`SELECT COUNT(*) as count FROM lessons l JOIN courses c ON l.course_id = c.id WHERE c.teacher_id = $1`, [req.userId]),
    ]);

    const publishedCourses = await query(
      `SELECT c.id, c.title, c.students_enrolled, c.price_vnd, 
              COALESCE(SUM(p.amount_vnd), 0) as revenue
       FROM courses c
       LEFT JOIN payments p ON p.course_id = c.id AND p.status = 'completed'
       WHERE c.teacher_id = $1
       GROUP BY c.id
       ORDER BY revenue DESC
       LIMIT 5`,
      [req.userId]
    );

    res.json({
      success: true,
      data: {
        totalCourses: parseInt(courses.rows[0].count),
        totalStudents: parseInt(students.rows[0].count),
        totalRevenue: parseInt(revenue.rows[0].total),
        totalLessons: parseInt(lessons.rows[0].count),
        topCourses: publishedCourses.rows,
      }
    });
  } catch (error) {
    console.error('Get instructor stats error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Get instructor's students
router.get('/students', authenticate, requireInstructor, async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT u.id, u.email, u.full_name, u.avatar_url, u.level, u.created_at,
             c.id as course_id, c.title as course_title, e.progress, e.enrolled_at
      FROM users u
      JOIN enrollments e ON e.user_id = u.id
      JOIN courses c ON c.id = e.course_id
      WHERE c.teacher_id = $1
      ORDER BY e.enrolled_at DESC
    `, [req.userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get instructor students error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Instructor messages (simple version)
router.get('/messages', authenticate, requireInstructor, async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, u.full_name as student_name, u.avatar_url as student_avatar
      FROM instructor_messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.instructor_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [req.userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/messages', authenticate, requireInstructor, async (req, res) => {
  try {
    const { user_id, content, subject } = req.body;
    const result = await query(`
      INSERT INTO instructor_messages (instructor_id, user_id, subject, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.userId, user_id, subject, content]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/messages/:id/read', authenticate, requireInstructor, async (req, res) => {
  try {
    await query(`UPDATE instructor_messages SET is_read = true WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
