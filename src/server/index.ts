import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import enrollmentRoutes from './routes/enrollments';
import paymentRoutes from './routes/payments';
import progressRoutes from './routes/progress';
import settingsRoutes from './routes/settings';
import adminRoutes from './routes/admin';
import gamificationRoutes from './routes/gamification';
import shopRoutes from './routes/shop';
import communityRoutes from './routes/community';
import couponRoutes from './routes/coupons';
import leaderboardRoutes from './routes/leaderboard';
import achievementsRoutes from './routes/achievements';
import studyGroupsRoutes from './routes/studyGroups';
import friendsRoutes from './routes/friends';
import notificationsRoutes from './routes/notifications';
import instructorsRoutes from './routes/instructors';
import studentRoutes from './routes/student';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/study-groups', studyGroupsRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
