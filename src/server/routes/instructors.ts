import { Router } from 'express';
import multer from 'multer';
import { query } from '../db/pool';
import { authenticate, requireInstructor, requireAdmin } from '../middleware/security';

const Papa = require('papaparse');

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

const verifyCourseOwnership = async (req: any, res: any, next: any) => {
  const { courseId } = req.params;
  const course = await query('SELECT teacher_id FROM courses WHERE id = $1', [courseId]);
  
  if (course.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Khóa học không tồn tại' });
  }

  if (req.userRole !== 'admin' && req.userRole !== 'super_admin' && course.rows[0].teacher_id !== req.userId) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền truy cập khóa học này' });
  }
  
  next();
};

const verifyLessonOwnership = async (req: any, res: any, next: any) => {
  const { lessonId } = req.params;
  const lesson = await query(
    'SELECT l.*, c.teacher_id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = $1',
    [lessonId]
  );
  
  if (lesson.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Bài học không tồn tại' });
  }

  if (req.userRole !== 'admin' && req.userRole !== 'super_admin' && lesson.rows[0].teacher_id !== req.userId) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền với bài học này' });
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

// ========== GRAMMAR EXERCISES ==========
router.get('/exercises/lesson/:lessonId', authenticate, requireInstructor, verifyLessonOwnership, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await query(
      `SELECT * FROM grammar_exercises WHERE lesson_id = $1 ORDER BY order_index ASC`,
      [lessonId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/exercises', authenticate, requireInstructor, async (req, res) => {
  try {
    const { lesson_id, question, question_type, options, correct_answer, explanation, difficulty, order_index } = req.body;
    const result = await query(
      `INSERT INTO grammar_exercises (lesson_id, question, question_type, options, correct_answer, explanation, difficulty, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [lesson_id, question, question_type || 'multiple_choice', options || [], correct_answer, explanation, difficulty || 'easy', order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/exercises/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, question_type, options, correct_answer, explanation, difficulty, order_index } = req.body;
    const result = await query(
      `UPDATE grammar_exercises SET question = COALESCE($1, question), question_type = COALESCE($2, question_type),
       options = COALESCE($3, options), correct_answer = COALESCE($4, correct_answer), explanation = COALESCE($5, explanation),
       difficulty = COALESCE($6, difficulty), order_index = COALESCE($7, order_index) WHERE id = $8 RETURNING *`,
      [question, question_type, options, correct_answer, explanation, difficulty, order_index, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/exercises/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    await query('DELETE FROM grammar_exercises WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ========== VOCABULARY ==========
router.get('/vocabulary/lesson/:lessonId', authenticate, requireInstructor, verifyLessonOwnership, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await query(
      `SELECT * FROM vocabulary WHERE lesson_id = $1 ORDER BY id ASC`,
      [lessonId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/vocabulary', authenticate, requireInstructor, async (req, res) => {
  try {
    const { lesson_id, word, pinyin, meaning, example_sentence, audio_url, image_url, category, hsk_level } = req.body;
    const result = await query(
      `INSERT INTO vocabulary (lesson_id, word, pinyin, meaning, example_sentence, audio_url, image_url, category, hsk_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [lesson_id, word, pinyin, meaning, example_sentence, audio_url, image_url, category, hsk_level]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/vocabulary/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { word, pinyin, meaning, example_sentence, audio_url, image_url, category, hsk_level } = req.body;
    const result = await query(
      `UPDATE vocabulary SET word = COALESCE($1, word), pinyin = COALESCE($2, pinyin), meaning = COALESCE($3, meaning),
       example_sentence = COALESCE($4, example_sentence), audio_url = COALESCE($5, audio_url), image_url = COALESCE($6, image_url),
       category = COALESCE($7, category), hsk_level = COALESCE($8, hsk_level) WHERE id = $9 RETURNING *`,
      [word, pinyin, meaning, example_sentence, audio_url, image_url, category, hsk_level, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/vocabulary/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    await query('DELETE FROM vocabulary WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ========== LESSON RESOURCES ==========
router.get('/resources/lesson/:lessonId', authenticate, requireInstructor, verifyLessonOwnership, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await query(
      `SELECT * FROM lesson_resources WHERE lesson_id = $1 ORDER BY created_at DESC`,
      [lessonId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/resources', authenticate, requireInstructor, async (req, res) => {
  try {
    const { lesson_id, title, type, url, description } = req.body;
    
    if (!lesson_id || !title || !type || !url) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
    }

    const result = await query(
      `INSERT INTO lesson_resources (lesson_id, title, type, url, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [lesson_id, title, type, url, description]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.put('/resources/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, url, description } = req.body;
    
    const result = await query(
      `UPDATE lesson_resources 
       SET title = COALESCE($1, title), type = COALESCE($2, type), 
           url = COALESCE($3, url), description = COALESCE($4, description)
       WHERE id = $5 RETURNING *`,
      [title, type, url, description, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.delete('/resources/:id', authenticate, requireInstructor, async (req, res) => {
  try {
    await query('DELETE FROM lesson_resources WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ========== STUDENT PROGRESS ==========
router.get('/student-progress/:courseId', authenticate, requireInstructor, verifyCourseOwnership, async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await query(`
      SELECT u.id as user_id, u.full_name, u.email, u.mshv, u.avatar_url,
             e.progress, e.status as enrollment_status, e.enrolled_at, e.completed_at,
             COUNT(DISTINCT lp.lesson_id) as lessons_completed,
             COUNT(DISTINCT l.id) as total_lessons,
             COALESCE(SUM(lp.watched_seconds), 0) as total_watch_time
      FROM users u
      JOIN enrollments e ON e.user_id = u.id
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN lessons l ON l.course_id = c.id AND l.is_published = true
      LEFT JOIN lesson_progress lp ON lp.user_id = u.id AND lp.is_completed = true
      WHERE c.teacher_id = $1 AND c.id = $2
      GROUP BY u.id, e.progress, e.status, e.enrolled_at, e.completed_at
      ORDER BY e.enrolled_at DESC
    `, [req.userId, courseId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// ========== BULK IMPORT LESSONS ==========
router.post('/lessons/import', authenticate, requireInstructor, (req: any, res: any) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, error: 'Lỗi upload file' });
    }
    try {
      const { course_id } = req.body;
      if (!course_id) {
        return res.status(400).json({ success: false, error: 'Thiếu course_id' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Thiếu file' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const parsed = Papa.parse(csvContent, { header: true, skip_empty_lines: true });
      
      if (parsed.errors && (parsed.errors as any[]).length > 0) {
        return res.status(400).json({ success: false, error: 'Lỗi định dạng CSV' });
      }

      const lessons = parsed.data;
      if (!lessons || lessons.length === 0) {
        return res.status(400).json({ success: false, error: 'File CSV trống' });
      }

      const maxOrder = await query('SELECT COALESCE(MAX(order_index), 0) as max_order FROM lessons WHERE course_id = $1', [course_id]);
      let orderIndex = maxOrder.rows[0]?.max_order || 0;

      const insertedLessons: any[] = [];
      const errors: string[] = [];

      for (const row of lessons) {
        try {
          const title = row.title?.trim();
          if (!title) {
            errors.push(`Thiếu tiêu đề ở dòng ${errors.length + insertedLessons.length + 1}`);
            continue;
          }

          orderIndex++;
          const result = await query(`
            INSERT INTO lessons (course_id, title, description, video_id, video_duration, is_free, is_published, order_index)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, title, order_index
          `, [
            course_id,
            title,
            row.description?.trim() || '',
            row.video_id?.trim() || '',
            parseInt(row.video_duration) || 0,
            row.is_free?.toLowerCase() === 'true' || row.is_free === '1',
            row.is_published?.toLowerCase() !== 'false' && row.is_published !== '0',
            orderIndex
          ]);
          insertedLessons.push(result.rows[0]);
        } catch (err) {
          errors.push(`Lỗi khi thêm: ${row.title}`);
        }
      }

      res.json({ 
        success: true, 
        data: { 
          imported: insertedLessons.length, 
          lessons: insertedLessons,
          errors 
        }
      });
    } catch (error) {
      console.error('Bulk import error:', error);
      res.status(500).json({ success: false, error: 'Lỗi server khi import' });
    }
  });
});

export default router;
