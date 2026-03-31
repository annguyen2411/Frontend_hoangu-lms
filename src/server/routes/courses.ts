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
  try {
    const { id } = req.params;
    const user = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
    const userRole = user.rows[0]?.role;
    
    if (['admin', 'super_admin'].includes(userRole)) {
      return next();
    }
    
    try {
      const course = await query('SELECT teacher_id, created_by FROM courses WHERE id = $1', [id]);
      if (course.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
      }
      const courseCreator = course.rows[0]?.teacher_id || course.rows[0]?.created_by;
      if (courseCreator && courseCreator === req.userId) {
        return next();
      }
    } catch (e) {
      console.log('Course creator check skipped - columns may not exist');
    }
    
    return next();
  } catch (error: any) {
    console.error('canManageCourse error:', error.message);
    return res.status(500).json({ success: false, error: 'Lỗi kiểm tra quyền' });
  }
};

router.get('/', async (req, res) => {
  try {
    const { category, level, featured, published = 'true', page = '1', limit = '20', free = 'false' } = req.query;

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

    if (free === 'true') {
      sql += ` AND course_type = 'free'`;
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

// Check if user can access course for free
router.get('/:id/check-access', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const course = await query('SELECT * FROM courses WHERE id = $1', [id]);
    if (course.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
    }

    const courseData = course.rows[0];
    
    // Check if course is free type
    if (courseData.course_type === 'free') {
      // Free for everyone
      if (courseData.is_free_for_all) {
        return res.json({ success: true, data: { canAccess: true, reason: 'free_for_all' } });
      }
      
      // Check if user is in free_for_users list
      const freeForUsers = courseData.free_for_users || [];
      if (freeForUsers.includes(userId)) {
        return res.json({ success: true, data: { canAccess: true, reason: 'free_for_user' } });
      }
    }

    // Check if user has enrollment
    const enrollment = await query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = $3',
      [userId, id, 'active']
    );
    
    if (enrollment.rows.length > 0) {
      return res.json({ success: true, data: { canAccess: true, reason: 'enrolled' } });
    }

    // Check if user has completed payment
    const payment = await query(
      `SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND status = 'completed'`,
      [userId, id]
    );
    
    if (payment.rows.length > 0) {
      return res.json({ success: true, data: { canAccess: true, reason: 'paid' } });
    }

    // Not free - requires payment
    res.json({ success: true, data: { canAccess: false, reason: 'requires_payment' } });
  } catch (error) {
    console.error('Check access error:', error);
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
    const { title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured, course_type, is_free_for_all, free_for_users } = req.body;

    const result = await query(
      `INSERT INTO courses (title, slug, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, has_certificate, is_published, is_featured, course_type, is_free_for_all, free_for_users)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [title, slug, description, thumbnail_url, teacher_name, level || 'beginner', category, price_vnd || 0, original_price_vnd, discount_percent || 0, has_certificate || false, is_published || false, is_featured || false, course_type || 'paid', is_free_for_all || false, free_for_users || []]
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
    const updates = req.body;

    const allowedFields = [
      'title', 'slug', 'description', 'thumbnail_url', 'teacher_name',
      'level', 'category', 'price_vnd', 'original_price_vnd', 'discount_percent',
      'has_certificate', 'is_published', 'is_featured', 'total_lessons',
      'students_enrolled', 'rating', 'duration_hours'
    ];

    const courseTypeFields = ['course_type', 'is_free_for_all', 'free_for_users'];
    
    try {
      const tableInfo = await query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'"
      );
      const existingColumns = tableInfo.rows.map((r: any) => r.column_name);
      
      for (const field of courseTypeFields) {
        if (existingColumns.includes(field)) {
          allowedFields.push(field);
        }
      }
    } catch (e) {
      console.log('Could not get table info, using basic fields');
    }

    const updateData: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'free_for_users') {
          updateData[key] = Array.isArray(value) ? JSON.stringify(value) : value;
        } else {
          updateData[key] = value;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
    }

    const setClauses = Object.keys(updateData).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = [...Object.values(updateData), id];

    const result = await query(
      `UPDATE courses SET ${setClauses}, updated_at = NOW() WHERE id = $${Object.keys(updateData).length + 1} RETURNING *`,
      values
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server', details: error.message });
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
