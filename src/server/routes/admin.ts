import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { authenticate, requireAdmin } from '../middleware/security';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [courses, users, payments, enrollments] = await Promise.all([
      query('SELECT COUNT(*) FROM courses'),
      query('SELECT COUNT(*) FROM users'),
      query('SELECT COALESCE(SUM(amount_vnd), 0) FROM payments WHERE status = \'completed\''),
      query('SELECT COUNT(*) FROM enrollments'),
    ]);
    res.json({
      success: true,
      data: {
        totalCourses: parseInt(courses.rows[0].count),
        totalStudents: parseInt(users.rows[0].count),
        totalRevenue: parseInt(payments.rows[0].sum) || 0,
        totalEnrollments: parseInt(enrollments.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = '1', limit = '20', search, role, mshv } = req.query;
    let sql = 'SELECT id, email, full_name, role, level, coins, mshv, created_at FROM users';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (search) {
      conditions.push(`(full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR mshv ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    if (role) {
      conditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }
    if (mshv) {
      conditions.push(`mshv ILIKE $${params.length + 1}`);
      params.push(`%${mshv}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, level, coins, mshv } = req.body;
    
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(role);
    }
    if (level !== undefined) {
      updates.push(`level = $${paramIndex++}`);
      params.push(level);
    }
    if (coins !== undefined) {
      updates.push(`coins = $${paramIndex++}`);
      params.push(coins);
    }
    if (mshv !== undefined) {
      updates.push(`mshv = $${paramIndex++}`);
      params.push(mshv);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
    }
    
    params.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, full_name, role, level, coins, mshv, created_at`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Người dùng không tồn tại' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    let sql = 'SELECT p.*, u.email as user_email, c.title as course_title FROM payments p LEFT JOIN users u ON p.user_id = u.id LEFT JOIN courses c ON p.course_id = c.id';
    const params: any[] = [];
    let idx = 1;
    if (status && status !== 'all') {
      sql += ` WHERE p.status = $${idx++}`;
      params.push(status);
    }
    sql += ' ORDER BY p.created_at DESC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await query('UPDATE payments SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (status === 'completed' && result.rows[0]?.course_id) {
      await query('INSERT INTO enrollments (user_id, course_id, progress, status) VALUES ($1, $2, 0, \'active\') ON CONFLICT DO NOTHING', [result.rows[0].user_id, result.rows[0].course_id]);
      await query('UPDATE courses SET students_enrolled = students_enrolled + 1 WHERE id = $1', [result.rows[0].course_id]);
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
    }
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Vai trò không hợp lệ' });
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email đã tồn tại' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, level, xp, total_xp, xp_to_next_level, coins, language)
       VALUES ($1, $2, $3, $4, 1, 0, 0, 100, 50, 'vi')
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, full_name, role]
    );
    if (role === 'instructor') {
      await query(
        `INSERT INTO instructor_profiles (user_id, bio, specialty, hourly_rate, is_available)
         VALUES ($1, '', '', 0, false)`,
        [result.rows[0].id]
      );
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Course Approval
router.get('/courses/pending', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, u.full_name as instructor_name 
       FROM courses c 
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE c.approval_status = 'pending'
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Add user to free course
router.post('/courses/:id/free-users', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, action } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Thiếu userId' });
    }

    const course = await query('SELECT free_for_users FROM courses WHERE id = $1', [id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    let freeUsers: string[] = course.rows[0].free_for_users || [];

    if (action === 'add') {
      if (!freeUsers.includes(userId)) {
        freeUsers.push(userId);
      }
    } else if (action === 'remove') {
      freeUsers = freeUsers.filter((id: string) => id !== userId);
    }

    await query('UPDATE courses SET free_for_users = $1 WHERE id = $2', [JSON.stringify(freeUsers), id]);

    res.json({ success: true, data: { free_for_users: freeUsers } });
  } catch (error) {
    console.error('Manage free users error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Get free users of a course
router.get('/courses/:id/free-users', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await query('SELECT free_for_users FROM courses WHERE id = $1', [id]);
    
    if (course.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    const freeUsers: string[] = course.rows[0].free_for_users || [];
    
    // Get user details
    const users = await query(
      'SELECT id, email, full_name FROM users WHERE id = ANY($1)',
      [freeUsers]
    );

    res.json({ success: true, data: users.rows });
  } catch (error) {
    console.error('Get free users error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/courses/:id/approve', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE courses SET approval_status = 'approved', approved_by = $1, approved_at = NOW(), is_published = true WHERE id = $2 RETURNING *`,
      [req.userId, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/courses/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await query(
      `UPDATE courses SET approval_status = 'rejected', rejection_reason = $1 WHERE id = $2 RETURNING *`,
      [reason, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Analytics
router.get('/analytics/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const result = await query(
      `SELECT DATE(created_at) as date, SUM(amount_vnd) as revenue, COUNT(*) as orders
       FROM payments 
       WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '${period} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/analytics/top-courses', async (req, res) => {
  try {
    const { limit = '10' } = req.query;
    const result = await query(
      `SELECT c.id, c.title, c.category, c.price_vnd, c.students_enrolled,
              COUNT(DISTINCT p.id) as purchase_count,
              COALESCE(SUM(p.amount_vnd), 0) as total_revenue
       FROM courses c
       LEFT JOIN payments p ON p.course_id = c.id AND p.status = 'completed'
       GROUP BY c.id
       ORDER BY total_revenue DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get top courses error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/analytics/engagement', async (req, res) => {
  try {
    const [dailyActive, monthlyActive, newUsers, completionRate] = await Promise.all([
      query(`SELECT COUNT(DISTINCT user_id) as count FROM lesson_progress WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      query(`SELECT COUNT(DISTINCT user_id) as count FROM enrollments WHERE enrolled_at >= NOW() - INTERVAL '30 days'`),
      query(`SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'`),
      query(`SELECT 
              COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100 as rate
            FROM enrollments`),
    ]);
    res.json({
      success: true,
      data: {
        dailyActiveUsers: parseInt(dailyActive.rows[0]?.count || 0),
        monthlyActiveUsers: parseInt(monthlyActive.rows[0]?.count || 0),
        newUsersThisMonth: parseInt(newUsers.rows[0]?.count || 0),
        completionRate: parseFloat(completionRate.rows[0]?.rate || 0).toFixed(1),
      },
    });
  } catch (error) {
    console.error('Get engagement error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Banners
router.get('/banners', async (req, res) => {
  try {
    const result = await query('SELECT * FROM banners ORDER BY order_index ASC, created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const { title, image_url, link_url, position, is_active, start_date, end_date, order_index } = req.body;
    const result = await query(
      `INSERT INTO banners (title, image_url, link_url, position, is_active, start_date, end_date, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, image_url, link_url, position || 'home', is_active ?? true, start_date, end_date, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/banners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url, link_url, position, is_active, start_date, end_date, order_index } = req.body;
    const result = await query(
      `UPDATE banners SET title = $1, image_url = $2, link_url = $3, position = $4, is_active = $5, start_date = $6, end_date = $7, order_index = $8 WHERE id = $9 RETURNING *`,
      [title, image_url, link_url, position, is_active, start_date, end_date, order_index, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await query('DELETE FROM banners WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// System Notifications
router.get('/notifications', async (req, res) => {
  try {
    const result = await query('SELECT * FROM system_notifications ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, content, type, target_role, start_date, end_date } = req.body;
    const result = await query(
      `INSERT INTO system_notifications (title, content, type, target_role, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, type || 'info', target_role, start_date, end_date]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, is_active, target_role, start_date, end_date } = req.body;
    const result = await query(
      `UPDATE system_notifications SET title = $1, content = $2, type = $3, is_active = $4, target_role = $5, start_date = $6, end_date = $7 WHERE id = $8 RETURNING *`,
      [title, content, type, is_active, target_role, start_date, end_date, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    await query('DELETE FROM system_notifications WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Certificates
router.get('/certificates', async (req, res) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    let sql = `SELECT cert.*, u.full_name as student_name, c.title as course_title 
               FROM certificates cert 
               LEFT JOIN users u ON cert.user_id = u.id 
               LEFT JOIN courses c ON cert.course_id = c.id`;
    const params: any[] = [];
    if (search) {
      sql += ` WHERE u.full_name ILIKE $1 OR c.title ILIKE $1`;
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY cert.issued_at DESC';
    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/certificates', async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin' });
    }
    const certNumber = `HN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const result = await query(
      `INSERT INTO certificates (user_id, course_id, certificate_number)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, course_id) DO UPDATE SET certificate_number = EXCLUDED.certificate_number, issued_at = NOW()
       RETURNING *`,
      [user_id, course_id, certNumber]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

export default router;
