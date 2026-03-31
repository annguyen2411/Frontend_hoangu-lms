import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';
import { pronunciationService } from '../utils/pronunciation';

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

// Grammar Exercises
router.get('/exercises/lesson/:lessonId', authenticate, async (req, res) => {
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

router.post('/exercises/submit', authenticate, async (req, res) => {
  try {
    const { exercise_id, user_answer } = req.body;
    
    const exercise = await query('SELECT * FROM grammar_exercises WHERE id = $1', [exercise_id]);
    if (exercise.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Bài tập không tồn tại' });
    }

    const isCorrect = user_answer.toLowerCase().trim() === exercise.rows[0].correct_answer.toLowerCase().trim();
    
    await query(
      `INSERT INTO user_exercise_progress (user_id, exercise_id, is_correct, user_answer)
       VALUES ($1, $2, $3, $4)`,
      [req.userId, exercise_id, isCorrect, user_answer]
    );

    res.json({ 
      success: true, 
      data: { 
        is_correct: isCorrect, 
        correct_answer: exercise.rows[0].correct_answer,
        explanation: exercise.rows[0].explanation 
      } 
    });
  } catch (error) {
    console.error('Submit exercise error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Vocabulary
router.get('/vocabulary/lesson/:lessonId', authenticate, async (req, res) => {
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

router.get('/vocabulary/hsk/:level', authenticate, async (req, res) => {
  try {
    const { level } = req.params;
    const result = await query(
      `SELECT * FROM vocabulary WHERE hsk_level = $1 ORDER BY word ASC LIMIT 50`,
      [level]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get vocabulary by HSK error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/vocabulary/save', authenticate, async (req, res) => {
  try {
    const { vocabulary_id } = req.body;
    await query(
      `INSERT INTO user_vocabulary (user_id, vocabulary_id, status, next_review_at)
       VALUES ($1, $2, 'learning', NOW() + INTERVAL '1 day')
       ON CONFLICT (user_id, vocabulary_id) DO NOTHING`,
      [req.userId, vocabulary_id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Save vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/vocabulary/my-words', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT v.*, uv.status, uv.times_reviewed, uv.correct_count, uv.next_review_at
       FROM vocabulary v
       JOIN user_vocabulary uv ON v.id = uv.vocabulary_id
       WHERE uv.user_id = $1
       ORDER BY uv.created_at DESC`,
      [req.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get my vocabulary error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// User Goals
router.get('/goals', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM user_goals WHERE user_id = $1', [req.userId]);
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/goals', authenticate, async (req, res) => {
  try {
    const { target_level, daily_study_time, study_days_per_week, goal_description, interests } = req.body;
    await query(
      `INSERT INTO user_goals (user_id, target_level, daily_study_time, study_days_per_week, goal_description, interests)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET 
         target_level = $2, daily_study_time = $3, study_days_per_week = $4, 
         goal_description = $5, interests = $6, updated_at = NOW()`,
      [req.userId, target_level, daily_study_time || 30, study_days_per_week || 7, goal_description, interests || []]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Save goals error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Course Recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const user = await query('SELECT level, interests FROM users u LEFT JOIN user_goals ug ON u.id = ug.user_id WHERE u.id = $1', [req.userId]);
    const userLevel = user.rows[0]?.level || 1;
    const interests = user.rows[0]?.interests || [];

    const levelMap: Record<number, string> = {
      1: 'beginner', 2: 'beginner', 3: 'beginner',
      4: 'intermediate', 5: 'intermediate', 6: 'intermediate',
      7: 'advanced', 8: 'advanced', 9: 'advanced', 10: 'advanced'
    };
    
    const targetLevel = levelMap[userLevel] || 'beginner';
    
    const result = await query(
      `SELECT c.*, 
              CASE 
                WHEN c.level = $2 THEN 3
                WHEN c.level = 'beginner' AND $2 = 'intermediate' THEN 2
                ELSE 1
              END as relevance
       FROM courses c
       WHERE c.is_published = true AND c.approval_status = 'approved'
       ORDER BY relevance DESC, c.rating DESC, c.students_enrolled DESC
       LIMIT 10`,
      [req.userId, targetLevel]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Learning History
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [history, total] = await Promise.all([
      query(
        `SELECT lh.*, les.title as lesson_title, c.title as course_title, c.slug as course_slug
         FROM learning_history lh
         LEFT JOIN lessons les ON lh.lesson_id = les.id
         LEFT JOIN courses c ON les.course_id = c.id
         WHERE lh.user_id = $1
         ORDER BY lh.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      ),
      query('SELECT COUNT(*) FROM learning_history WHERE user_id = $1', [req.userId])
    ]);
    
    res.json({ 
      success: true, 
      data: {
        items: history.rows,
        total: parseInt(total.rows[0].count),
        page: parseInt(page as string),
        totalPages: Math.ceil(parseInt(total.rows[0].count) / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/history', authenticate, async (req, res) => {
  try {
    const { lesson_id, action, duration_seconds } = req.body;
    await query(
      `INSERT INTO learning_history (user_id, lesson_id, action, duration_seconds)
       VALUES ($1, $2, $3, $4)`,
      [req.userId, lesson_id, action, duration_seconds || 0]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Save history error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Voice Practice with AI Pronunciation Scoring
router.post('/voice-practice', authenticate, async (req: Request, res: Response) => {
  try {
    const { lesson_id, vocabulary_id, recording_url, expected_text, language } = req.body;

    let transcript = '';
    let score: number | null = null;
    let feedback = '';

    if (expected_text && recording_url) {
      const analysis = await pronunciationService.analyzePronunciation(
        recording_url,
        expected_text,
        language || 'zh-CN'
      );
      transcript = analysis.transcript;
      score = analysis.score;
      feedback = analysis.feedback;
    }

    const result = await query(
      `INSERT INTO voice_practices (user_id, lesson_id, vocabulary_id, recording_url, transcript, score, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.userId, lesson_id, vocabulary_id, recording_url, transcript, score, feedback]
    );

    const practice = result.rows[0];

    if (score !== null) {
      await query(
        `INSERT INTO activities (user_id, type, description, metadata)
         VALUES ($1, 'voice_practice', 'Practiced pronunciation', $2)`,
        [req.userId, JSON.stringify({ vocabulary_id, score })]
      );
    }

    res.json({ success: true, data: practice });
  } catch (error) {
    console.error('Save voice practice error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.post('/voice-practice/analyze', authenticate, async (req: Request, res: Response) => {
  try {
    const { recording_url, expected_text, language } = req.body;

    if (!recording_url || !expected_text) {
      return res.status(400).json({ 
        success: false, 
        error: 'recording_url and expected_text are required' 
      });
    }

    const analysis = await pronunciationService.analyzePronunciation(
      recording_url,
      expected_text,
      language || 'zh-CN'
    );

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Analyze pronunciation error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze pronunciation' });
  }
});

router.get('/voice-practice', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await query(
      `SELECT vp.*, v.word, v.pinyin, v.meaning
       FROM voice_practices vp
       LEFT JOIN vocabulary v ON vp.vocabulary_id = v.id
       WHERE vp.user_id = $1
       ORDER BY vp.created_at DESC
       LIMIT $2`,
      [req.userId, limit]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get voice practices error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

router.get('/voice-practice/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const stats = await pronunciationService.getPronunciationStats(req.userId!);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get voice practice stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

router.get('/voice-practice/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await pronunciationService.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

export default router;
