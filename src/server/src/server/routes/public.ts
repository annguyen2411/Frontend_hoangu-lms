import { Router } from 'express';
import { pool } from '../db/pool';

const router = Router();

const dailyQuizzes = [
  {
    id: 'daily-1',
    question: '📜 Tên gọi khác của "Cố Cung" (Bảo tàng) trước đây là gì?',
    options: [
      { text: '紫禁城 (Zǐjìnchéng)', isCorrect: true },
      { text: '故宫 (Gùgōng)', isCorrect: false },
      { text: '天坛 (Tiāntán)', isCorrect: false },
    ],
    correctFeedback: 'Chính xác! 紫禁城 (Tử Cấm Thành) mới là tên gốc.',
  },
  {
    id: 'daily-2',
    question: '🇨🇳 Từ nào có nghĩa là "Cửa hàng" trong tiếng Trung?',
    options: [
      { text: '商店 (shāngdiàn)', isCorrect: true },
      { text: '餐厅 (cāntīng)', isCorrect: false },
      { text: '银行 (yínháng)', isCorrect: false },
    ],
    correctFeedback: 'Đúng rồi! 商店 (shāngdiàn) có nghĩa là cửa hàng.',
  },
  {
    id: 'daily-3',
    question: '🎯 Từ nào có nghĩa là "Học" trong tiếng Trung?',
    options: [
      { text: '学习 (xuéxí)', isCorrect: true },
      { text: '工作 (gōngzuò)', isCorrect: false },
      { text: '吃饭 (chīfàn)', isCorrect: false },
    ],
    correctFeedback: 'Chính xác! 学习 (xuéxí) có nghĩa là học.',
  },
];

router.get('/quizzes/daily', (req, res) => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quizIndex = dayOfYear % dailyQuizzes.length;
  const quiz = dailyQuizzes[quizIndex];

  res.json({
    success: true,
    data: {
      id: quiz.id,
      question: quiz.question,
      options: quiz.options,
      correctFeedback: quiz.correctFeedback,
    },
  });
});

router.post('/quizzes/submit', async (req, res) => {
  const { quiz_id, answer_index, user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập' });
  }

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quizIndex = dayOfYear % dailyQuizzes.length;
  const quiz = dailyQuizzes[quizIndex];

  const isCorrect = quiz.options[answer_index]?.isCorrect === true;

  if (isCorrect) {
    try {
      await pool.query(
        `INSERT INTO user_xp (user_id, xp_amount, source_type, source_id, description)
         VALUES ($1, $2, 'quiz', $3, 'Hoàn thành quiz hàng ngày')`,
        [user_id, 20, quiz.id]
      );
    } catch (e) {
      console.log('XP insert error (may be not available):', e);
    }
  }

  res.json({
    success: true,
    data: {
      correct: isCorrect,
      xpEarned: isCorrect ? 20 : 0,
    },
  });
});

export default router;
