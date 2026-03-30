import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/security';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();

router.use(authenticate);

router.post('/',
  requireRole('instructor', 'admin'),
  body('title').notEmpty().trim().escape(),
  body('quiz_type').isIn(['practice', 'quiz', 'exam', 'midterm', 'final']),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, quiz_type, course_id, lesson_id, hsk_level,
        time_limit_minutes, passing_score, randomize_questions, show_results,
        allow_retry, max_attempts, is_published, category_ids } = req.body;

      const result = await pool.query(
        `INSERT INTO quizzes (title, description, quiz_type, course_id, lesson_id,
          hsk_level, time_limit_minutes, passing_score, randomize_questions,
          show_results, allow_retry, max_attempts, is_published, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [title, description, quiz_type, course_id, lesson_id, hsk_level,
          time_limit_minutes, passing_score || 60, randomize_questions,
          show_results, allow_retry, max_attempts, is_published, req.userId]
      );

      const quiz = result.rows[0];

      if (category_ids && category_ids.length > 0) {
        for (const catId of category_ids) {
          await pool.query(
            'INSERT INTO quiz_category_relations (quiz_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [quiz.id, catId]
          );
        }
      }

      res.status(201).json(quiz);
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  }
);

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('quiz_type').optional().isIn(['practice', 'quiz', 'exam', 'midterm', 'final']),
  query('course_id').optional().isUUID(),
  query('hsk_level').optional().isInt({ min: 1, max: 6 }),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE is_published = true';
      const params: any[] = [];
      let paramIndex = 1;

      if (req.query.quiz_type) {
        whereClause += ` AND quiz_type = $${paramIndex}`;
        params.push(req.query.quiz_type);
        paramIndex++;
      }

      if (req.query.course_id) {
        whereClause += ` AND course_id = $${paramIndex}`;
        params.push(req.query.course_id);
        paramIndex++;
      }

      if (req.query.hsk_level) {
        whereClause += ` AND hsk_level = $${paramIndex}`;
        params.push(req.query.hsk_level);
        paramIndex++;
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM quizzes ${whereClause}`,
        params
      );

      const result = await pool.query(
        `SELECT q.*, 
          (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) as question_count,
          c.title as course_title
         FROM quizzes q
         LEFT JOIN courses c ON q.course_id = c.id
         ${whereClause}
         ORDER BY q.created_at DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      );

      res.json({
        quizzes: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      });
    } catch (error) {
      console.error('Get quizzes error:', error);
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  }
);

router.get('/:id',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quizResult = await pool.query(
        `SELECT q.*, 
          u.full_name as creator_name,
          c.title as course_title,
          l.title as lesson_title
         FROM quizzes q
         LEFT JOIN users u ON q.created_by = u.id
         LEFT JOIN courses c ON q.course_id = c.id
         LEFT JOIN lessons l ON q.lesson_id = l.id
         WHERE q.id = $1`,
        [id]
      );

      if (quizResult.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const quiz = quizResult.rows[0];

      const questionsResult = await pool.query(
        `SELECT id, question_text, question_type, options, points, audio_url, image_url, order_index
         FROM quiz_questions
         WHERE quiz_id = $1
         ORDER BY order_index`,
        [id]
      );

      quiz.questions = questionsResult.rows;

      res.json(quiz);
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Failed to fetch quiz' });
    }
  }
);

router.put('/:id',
  requireRole('instructor', 'admin'),
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, quiz_type, course_id, lesson_id, hsk_level,
        time_limit_minutes, passing_score, randomize_questions, show_results,
        allow_retry, max_attempts, is_published, category_ids } = req.body;

      const checkResult = await pool.query(
        'SELECT created_by FROM quizzes WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (req.userRole !== 'admin' && checkResult.rows[0].created_by !== req.userId) {
        return res.status(403).json({ error: 'Not authorized to update this quiz' });
      }

      const result = await pool.query(
        `UPDATE quizzes SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          quiz_type = COALESCE($3, quiz_type),
          course_id = COALESCE($4, course_id),
          lesson_id = COALESCE($5, lesson_id),
          hsk_level = COALESCE($6, hsk_level),
          time_limit_minutes = COALESCE($7, time_limit_minutes),
          passing_score = COALESCE($8, passing_score),
          randomize_questions = COALESCE($9, randomize_questions),
          show_results = COALESCE($10, show_results),
          allow_retry = COALESCE($11, allow_retry),
          max_attempts = COALESCE($12, max_attempts),
          is_published = COALESCE($13, is_published)
         WHERE id = $14
         RETURNING *`,
        [title, description, quiz_type, course_id, lesson_id, hsk_level,
          time_limit_minutes, passing_score, randomize_questions, show_results,
          allow_retry, max_attempts, is_published, id]
      );

      if (category_ids) {
        await pool.query('DELETE FROM quiz_category_relations WHERE quiz_id = $1', [id]);
        for (const catId of category_ids) {
          await pool.query(
            'INSERT INTO quiz_category_relations (quiz_id, category_id) VALUES ($1, $2)',
            [id, catId]
          );
        }
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ error: 'Failed to update quiz' });
    }
  }
);

router.delete('/:id',
  requireRole('instructor', 'admin'),
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const checkResult = await pool.query(
        'SELECT created_by FROM quizzes WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      if (req.userRole !== 'admin' && checkResult.rows[0].created_by !== req.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this quiz' });
      }

      await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);

      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ error: 'Failed to delete quiz' });
    }
  }
);

router.post('/:id/questions',
  requireRole('instructor', 'admin'),
  param('id').isUUID(),
  body('questions').isArray({ min: 1 }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { questions } = req.body;

      const quizCheck = await pool.query(
        'SELECT id FROM quizzes WHERE id = $1',
        [id]
      );

      if (quizCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const createdQuestions = [];

      for (const q of questions) {
        const result = await pool.query(
          `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options,
            correct_answer, correct_answers, points, explanation, audio_url, image_url, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [id, q.question_text, q.question_type, JSON.stringify(q.options || []),
            q.correct_answer, JSON.stringify(q.correct_answers || []), q.points || 1,
            q.explanation, q.audio_url, q.image_url, q.order_index || 0]
        );
        createdQuestions.push(result.rows[0]);
      }

      res.status(201).json(createdQuestions);
    } catch (error) {
      console.error('Add questions error:', error);
      res.status(500).json({ error: 'Failed to add questions' });
    }
  }
);

router.put('/questions/:questionId',
  requireRole('instructor', 'admin'),
  param('questionId').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { questionId } = req.params;
      const { question_text, question_type, options, correct_answer,
        correct_answers, points, explanation, audio_url, image_url, order_index } = req.body;

      const result = await pool.query(
        `UPDATE quiz_questions SET
          question_text = COALESCE($1, question_text),
          question_type = COALESCE($2, question_type),
          options = COALESCE($3, options),
          correct_answer = COALESCE($4, correct_answer),
          correct_answers = COALESCE($5, correct_answers),
          points = COALESCE($6, points),
          explanation = COALESCE($7, explanation),
          audio_url = COALESCE($8, audio_url),
          image_url = COALESCE($9, image_url),
          order_index = COALESCE($10, order_index)
         WHERE id = $11
         RETURNING *`,
        [question_text, question_type, options, correct_answer,
          correct_answers, points, explanation, audio_url, image_url, order_index, questionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }
);

router.delete('/questions/:questionId',
  requireRole('instructor', 'admin'),
  param('questionId').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { questionId } = req.params;

      await pool.query('DELETE FROM quiz_questions WHERE id = $1', [questionId]);

      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  }
);

router.post('/:id/start',
  param('id').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const quizResult = await pool.query(
        'SELECT * FROM quizzes WHERE id = $1 AND is_published = true',
        [id]
      );

      if (quizResult.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found or not published' });
      }

      const quiz = quizResult.rows[0];

      if (quiz.max_attempts) {
        const attemptCount = await pool.query(
          'SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
          [req.userId, id]
        );

        if (parseInt(attemptCount.rows[0].count) >= quiz.max_attempts) {
          return res.status(400).json({ error: 'Maximum attempts reached' });
        }
      }

      const attemptResult = await pool.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, status, ip_address, user_agent)
         VALUES ($1, $2, 'in_progress', $3, $4)
         RETURNING *`,
        [req.userId, id, req.ip, req.headers['user-agent']]
      );

      let questionsResult;
      if (quiz.randomize_questions) {
        questionsResult = await pool.query(
          `SELECT id, question_text, question_type, options, points, audio_url, image_url
           FROM quiz_questions
           WHERE quiz_id = $1
           ORDER BY RANDOM()`,
          [id]
        );
      } else {
        questionsResult = await pool.query(
          `SELECT id, question_text, question_type, options, points, audio_url, image_url
           FROM quiz_questions
           WHERE quiz_id = $1
           ORDER BY order_index`,
          [id]
        );
      }

      const questions = questionsResult.rows.map((q: any) => ({
        ...q,
        options: q.options || []
      }));

      res.json({
        attempt: attemptResult.rows[0],
        quiz: {
          title: quiz.title,
          time_limit_minutes: quiz.time_limit_minutes,
          show_results: quiz.show_results,
          passing_score: quiz.passing_score
        },
        questions
      });
    } catch (error) {
      console.error('Start quiz error:', error);
      res.status(500).json({ error: 'Failed to start quiz' });
    }
  }
);

router.post('/:id/submit',
  param('id').isUUID(),
  body('attempt_id').isUUID(),
  body('answers').isArray(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { attempt_id, answers } = req.body;

      const attemptCheck = await pool.query(
        'SELECT * FROM quiz_attempts WHERE id = $1 AND user_id = $2 AND quiz_id = $3',
        [attempt_id, req.userId, id]
      );

      if (attemptCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      const attempt = attemptCheck.rows[0];

      if (attempt.status === 'completed') {
        return res.status(400).json({ error: 'Quiz already submitted' });
      }

      const questionsResult = await pool.query(
        'SELECT id, question_type, correct_answer, correct_answers, points FROM quiz_questions WHERE quiz_id = $1',
        [id]
      );

      const questionsMap: Map<string, any> = new Map(questionsResult.rows.map((q: any) => [q.id, q]));

      let totalPoints = 0;
      let earnedPoints = 0;
      const answerResults = [];

      for (const answer of answers) {
        const question = questionsMap.get(answer.question_id);

        if (!question) continue;

        let isCorrect = false;

        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          isCorrect = answer.user_answer?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
        } else if (question.question_type === 'fill_blank') {
          const correctAnswers = question.correct_answers || [question.correct_answer];
          isCorrect = correctAnswers.some((a: string) => a.toLowerCase().trim() === answer.user_answer?.toLowerCase().trim());
        } else if (question.question_type === 'matching') {
          isCorrect = JSON.stringify(answer.user_answer) === JSON.stringify(question.correct_answer);
        }

        const pointsEarned = isCorrect ? question.points : 0;

        totalPoints += question.points;
        earnedPoints += pointsEarned;

        const answerResult = await pool.query(
          `INSERT INTO quiz_answers (attempt_id, question_id, user_answer, is_correct, points_earned)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [attempt_id, answer.question_id, JSON.stringify(answer.user_answer), isCorrect, pointsEarned]
        );

        answerResults.push(answerResult.rows[0]);
      }

      const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = scorePercentage >= (attempt.passing_score || 60);

      const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);
      const quiz = quizResult.rows[0];

      const endedAt = new Date();
      const startedAt = new Date(attempt.started_at);
      const timeSpentSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

      await pool.query(
        `UPDATE quiz_attempts SET
          status = 'completed',
          completed_at = $1,
          total_points = $2,
          earned_points = $3,
          score_percentage = $4,
          passed = $5,
          time_spent_seconds = $6
         WHERE id = $7`,
        [endedAt, totalPoints, earnedPoints, scorePercentage, passed, timeSpentSeconds, attempt_id]
      );

      await pool.query(
        `INSERT INTO user_quiz_stats (user_id, quiz_id, attempts_count, best_score, average_score, total_time_seconds, last_attempt_at)
         VALUES ($1, $2, 1, $3, $3, $4, $5)
         ON CONFLICT (user_id, quiz_id) DO UPDATE SET
           attempts_count = user_quiz_stats.attempts_count + 1,
           best_score = GREATEST(user_quiz_stats.best_score, $3),
           average_score = (user_quiz_stats.average_score * user_quiz_stats.attempts_count + $3) / (user_quiz_stats.attempts_count + 1),
           total_time_seconds = user_quiz_stats.total_time_seconds + $4,
           last_attempt_at = $5`,
        [req.userId, id, scorePercentage, timeSpentSeconds, endedAt]
      );

      await pool.query(
        `INSERT INTO activities (user_id, type, description, metadata)
         VALUES ($1, 'quiz_completed', 'Completed quiz', $2)`,
        [req.userId, JSON.stringify({ quiz_id: id, quiz_title: quiz.title, score: scorePercentage, passed })]
      );

      res.json({
        attempt_id,
        total_points: totalPoints,
        earned_points: earnedPoints,
        score_percentage: scorePercentage,
        passed,
        show_results: quiz.show_results,
        time_spent_seconds: timeSpentSeconds,
        answers: quiz.show_results ? answerResults : undefined
      });
    } catch (error) {
      console.error('Submit quiz error:', error);
      res.status(500).json({ error: 'Failed to submit quiz' });
    }
  }
);

router.get('/attempts/history',
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const countResult = await pool.query(
        'SELECT COUNT(*) FROM quiz_attempts WHERE user_id = $1',
        [req.userId]
      );

      const result = await pool.query(
        `SELECT qa.*, q.title as quiz_title, q.quiz_type
         FROM quiz_attempts qa
         JOIN quizzes q ON qa.quiz_id = q.id
         WHERE qa.user_id = $1
         ORDER BY qa.started_at DESC
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      );

      res.json({
        attempts: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].count),
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
      });
    } catch (error) {
      console.error('Get attempt history error:', error);
      res.status(500).json({ error: 'Failed to fetch attempt history' });
    }
  }
);

router.get('/attempts/:attemptId',
  param('attemptId').isUUID(),
  async (req: Request, res: Response) => {
    try {
      const { attemptId } = req.params;

      const attemptResult = await pool.query(
        `SELECT qa.*, q.title as quiz_title, q.show_results, q.passing_score
         FROM quiz_attempts qa
         JOIN quizzes q ON qa.quiz_id = q.id
         WHERE qa.id = $1 AND qa.user_id = $2`,
        [attemptId, req.userId]
      );

      if (attemptResult.rows.length === 0) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      const attempt = attemptResult.rows[0];

      const answersResult = await pool.query(
        `SELECT qa.*, qq.question_text, qq.question_type, qq.options, qq.correct_answer, qq.correct_answers, qq.explanation
         FROM quiz_answers qa
         JOIN quiz_questions qq ON qa.question_id = qq.id
         WHERE qa.attempt_id = $1`,
        [attemptId]
      );

      attempt.answers = answersResult.rows;

      res.json(attempt);
    } catch (error) {
      console.error('Get attempt error:', error);
      res.status(500).json({ error: 'Failed to fetch attempt' });
    }
  }
);

router.get('/stats/my',
  async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT 
           COUNT(*) as total_quizzes_taken,
           SUM(CASE WHEN passed = true THEN 1 ELSE 0 END) as quizzes_passed,
           AVG(score_percentage) as average_score,
           MAX(score_percentage) as best_score,
           SUM(time_spent_seconds) as total_time_seconds
         FROM quiz_attempts
         WHERE user_id = $1 AND status = 'completed'`,
        [req.userId]
      );

      const byTypeResult = await pool.query(
        `SELECT q.quiz_type,
           COUNT(*) as attempts,
           AVG(qa.score_percentage) as average_score,
           SUM(CASE WHEN qa.passed = true THEN 1 ELSE 0 END) as passed
         FROM quiz_attempts qa
         JOIN quizzes q ON qa.quiz_id = q.id
         WHERE qa.user_id = $1 AND qa.status = 'completed'
         GROUP BY q.quiz_type`,
        [req.userId]
      );

      res.json({
        overall: result.rows[0],
        by_type: byTypeResult.rows
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
);

export default router;
