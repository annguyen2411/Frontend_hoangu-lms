import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { authenticate, requireRole } from '../middleware/security';
import { query } from '../db/pool';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin', 'instructor'));

router.get('/overview', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '7d';
    let dateFilter = "NOW() - INTERVAL '7 days'";
    
    if (period === '30d') dateFilter = "NOW() - INTERVAL '30 days'";
    if (period === '90d') dateFilter = "NOW() - INTERVAL '90 days'";
    if (period === 'today') dateFilter = "CURRENT_DATE";

    const [usersStats, coursesStats, revenueStats, activityStats] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN created_at >= ${dateFilter} THEN 1 END) as new_users,
          COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
          COUNT(CASE WHEN role = 'instructor' THEN 1 END) as instructors
        FROM users
      `),
      query(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN is_published = true THEN 1 END) as published,
          COUNT(CASE WHEN is_featured = true THEN 1 END) as featured,
          AVG(rating) as average_rating
        FROM courses
      `),
      query(`
        SELECT 
          COALESCE(SUM(amount_vnd), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN created_at >= ${dateFilter} THEN amount_vnd ELSE 0 END), 0) as period_revenue,
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN created_at >= ${dateFilter} THEN 1 END) as period_transactions
        FROM payments WHERE status = 'completed'
      `),
      query(`
        SELECT 
          COUNT(*) as total_enrollments,
          COUNT(CASE WHEN enrolled_at >= ${dateFilter} THEN 1 END) as period_enrollments,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completions
        FROM enrollments
      `)
    ]);

    res.json({
      success: true,
      data: {
        users: usersStats.rows[0],
        courses: coursesStats.rows[0],
        revenue: revenueStats.rows[0],
        enrollments: activityStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch overview' });
  }
});

router.get('/revenue', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '30d';
    let dateFilter = "NOW() - INTERVAL '30 days'";
    
    if (period === '7d') dateFilter = "NOW() - INTERVAL '7 days'";
    if (period === '90d') dateFilter = "NOW() - INTERVAL '90 days'";
    if (period === '1y') dateFilter = "NOW() - INTERVAL '1 year'";

    const result = await query(`
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as transactions,
        SUM(amount_vnd) as revenue
      FROM payments 
      WHERE status = 'completed' AND completed_at >= ${dateFilter}
      GROUP BY DATE(completed_at)
      ORDER BY date
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch revenue' });
  }
});

router.get('/enrollments', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '30d';
    let dateFilter = "NOW() - INTERVAL '30 days'";
    
    if (period === '7d') dateFilter = "NOW() - INTERVAL '7 days'";
    if (period === '90d') dateFilter = "NOW() - INTERVAL '90 days'";

    const result = await query(`
      SELECT 
        DATE(enrolled_at) as date,
        COUNT(*) as enrollments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completions
      FROM enrollments 
      WHERE enrolled_at >= ${dateFilter}
      GROUP BY DATE(enrolled_at)
      ORDER BY date
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
  }
});

router.get('/courses/top', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(`
      SELECT 
        c.id, c.title, c.thumbnail_url, c.rating, c.price_vnd,
        c.students_enrolled, c.total_lessons,
        COUNT(DISTINCT e.user_id) as enrollments_count,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.user_id END) as completions_count,
        ROUND(AVG(e.progress), 2) as average_progress
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.students_enrolled DESC
      LIMIT $1
    `, [limit]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get top courses error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch top courses' });
  }
});

router.get('/users/active', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '7d';
    let dateFilter = "NOW() - INTERVAL '7 days'";
    
    if (period === '30d') dateFilter = "NOW() - INTERVAL '30 days'";
    if (period === '90d') dateFilter = "NOW() - INTERVAL '90 days'";

    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as active_users
      FROM activities
      WHERE created_at >= ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active users' });
  }
});

router.get('/users/retention', async (req: Request, res: Response) => {
  try {
    const cohortMonths = parseInt(req.query.months as string) || 6;

    const result = await query(`
      SELECT 
        TO_CHAR(cohort_date, 'YYYY-MM') as cohort,
        COUNT(*) as users,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM activities a 
          WHERE a.user_id = uc.user_id 
          AND a.created_at >= uc.cohort_date + INTERVAL '30 days'
        ) THEN 1 END) as retained_month_1,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM activities a 
          WHERE a.user_id = uc.user_id 
          AND a.created_at >= uc.cohort_date + INTERVAL '60 days'
        ) THEN 1 END) as retained_month_2,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM activities a 
          WHERE a.user_id = uc.user_id 
          AND a.created_at >= uc.cohort_date + INTERVAL '90 days'
        ) THEN 1 END) as retained_month_3
      FROM user_cohorts uc
      WHERE cohort_date >= NOW() - INTERVAL '${cohortMonths} months'
      GROUP BY TO_CHAR(cohort_date, 'YYYY-MM'), cohort_date
      ORDER BY cohort_date
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get retention error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch retention' });
  }
});

router.get('/content/performance', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string || 'course';
    const limit = parseInt(req.query.limit as string) || 10;

    let queryStr = '';
    const params: any[] = [limit];

    if (type === 'course') {
      queryStr = `
        SELECT 
          c.id, c.title, c.thumbnail_url,
          cm.views, cm.completions, cm.engagement_score
        FROM courses c
        LEFT JOIN content_metrics cm ON cm.content_id = c.id AND cm.content_type = 'course'
        WHERE c.is_published = true
        ORDER BY cm.views DESC NULLS LAST
        LIMIT $1
      `;
    } else if (type === 'lesson') {
      queryStr = `
        SELECT 
          l.id, l.title, l.course_id,
          cm.views, cm.completions, cm.engagement_score
        FROM lessons l
        LEFT JOIN content_metrics cm ON cm.content_id = l.id AND cm.content_type = 'lesson'
        ORDER BY cm.views DESC NULLS LAST
        LIMIT $1
      `;
    }

    const result = await query(queryStr, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get content performance error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch content performance' });
  }
});

router.get('/quiz/analytics', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        q.id, q.title, q.quiz_type,
        COUNT(qa.id) as attempts,
        AVG(qa.score_percentage) as average_score,
        COUNT(CASE WHEN qa.passed = true THEN 1 END) as passed_count,
        AVG(qa.time_spent_seconds) as average_time_seconds
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
      WHERE q.is_published = true
      GROUP BY q.id
      ORDER BY attempts DESC
      LIMIT 20
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get quiz analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quiz analytics' });
  }
});

router.get('/funnel', async (req: Request, res: Response) => {
  try {
    const funnelName = req.query.funnel as string || 'onboarding';

    const result = await query(`
      SELECT 
        step_name, step_order, users_count, conversion_rate
      FROM funnel_analytics
      WHERE funnel_name = $1
      ORDER BY step_order
    `, [funnelName]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get funnel error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch funnel' });
  }
});

router.get('/learning-time', async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || '30d';
    let dateFilter = "NOW() - INTERVAL '30 days'";
    
    if (period === '7d') dateFilter = "NOW() - INTERVAL '7 days'";
    if (period === '90d') dateFilter = "NOW() - INTERVAL '90 days'";

    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        SUM(duration_seconds) as total_seconds,
        COUNT(DISTINCT user_id) as active_users,
        ROUND(AVG(duration_seconds), 0) as avg_seconds_per_session
      FROM learning_history
      WHERE created_at >= ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get learning time error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch learning time' });
  }
});

router.get('/instructor/stats', requireRole('instructor', 'admin'), async (req: Request, res: Response) => {
  try {
    const coursesResult = await query(`
      SELECT id FROM courses WHERE created_by = $1
    `, [req.userId]);

    const courseIds = coursesResult.rows.map((c: any) => c.id);

    if (courseIds.length === 0) {
      return res.json({ success: true, data: { courses: [], students: 0, revenue: 0 } });
    }

    const placeholders = courseIds.map((_: any, i: number) => `$${i + 1}`).join(',');

    const [studentsResult, revenueResult, progressResult] = await Promise.all([
      query(`
        SELECT COUNT(DISTINCT user_id) as total_students
        FROM enrollments WHERE course_id IN (${placeholders})
      `, courseIds),
      query(`
        SELECT COALESCE(SUM(amount_vnd), 0) as total_revenue
        FROM payments WHERE course_id IN (${placeholders}) AND status = 'completed'
      `, courseIds),
      query(`
        SELECT 
          ROUND(AVG(progress), 2) as avg_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completions
        FROM enrollments WHERE course_id IN (${placeholders})
      `, courseIds)
    ]);

    res.json({
      success: true,
      data: {
        courses: coursesResult.rows.length,
        students: parseInt(studentsResult.rows[0].total_students),
        revenue: parseInt(revenueResult.rows[0].total_revenue),
        avgProgress: progressResult.rows[0].avg_progress,
        completions: progressResult.rows[0].completions
      }
    });
  } catch (error) {
    console.error('Get instructor stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

export default router;
