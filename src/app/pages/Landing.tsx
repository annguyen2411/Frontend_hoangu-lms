import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Flame,
  Clock,
  Trophy,
  Flag,
  ChevronRight,
  Star,
  Play,
  BookOpen,
  Users,
  Target,
  Award,
  Zap,
  Brain,
  MessageSquare,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Crown,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../../lib/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const COLORS = {
  redImperial: '#9B1D2C',
  redDark: '#7A1320',
  redLight: '#C23B4A',
  gold: '#D4AF37',
  goldLight: '#F0C45A',
  jade: '#2C9A8C',
  jadeLight: '#5ABFAD',
  cream: '#FFFBF5',
  graySoft: '#F5EFE6',
  textDark: '#2C2C2C',
  textMuted: '#6B5E4A',
};

interface UserData {
  name: string;
  avatar: string;
  goal: string;
  studyStreak: number;
  todayStudyTime: number;
  xp: number;
  hskProgress: number;
}

interface GlobalStats {
  totalLessons: number;
  totalStudents: number;
  satisfactionRate: number;
  totalBadges: number;
}

interface Course {
  id: number;
  title: string;
  emoji: string;
  rating: number;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  students: number;
  price: string;
  category: string;
  buttonText: string;
}

interface Quiz {
  question: string;
  options: { text: string; isCorrect: boolean }[];
  correctFeedback: string;
}

interface Testimonial {
  quote: string;
  author: string;
}

interface HSKLevel {
  level: string;
  vocab: number;
  estimatedTime: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const hskLevels: HSKLevel[] = [
  { level: 'HSK 1', vocab: 150, estimatedTime: '2 tuần' },
  { level: 'HSK 2', vocab: 300, estimatedTime: '3 tuần' },
  { level: 'HSK 3', vocab: 600, estimatedTime: '4 tuần' },
  { level: 'HSK 4', vocab: 1200, estimatedTime: '6 tuần' },
  { level: 'HSK 5', vocab: 2500, estimatedTime: '8 tuần' },
  { level: 'HSK 6', vocab: 5000, estimatedTime: '12 tuần' },
];

const features: Feature[] = [
  {
    icon: 'gamepad',
    title: 'Gamification',
    description: 'XP, level, huy hiệu vàng, bảng xếp hạng',
  },
  {
    icon: 'chart-line',
    title: 'Lộ trình thông minh',
    description: 'Cá nhân hóa theo mục tiêu HSK',
  },
  { icon: 'trophy', title: 'Thử thách hàng ngày', description: 'Quest & phần thưởng đặc biệt' },
  { icon: 'users', title: 'Cộng đồng', description: 'Trao đổi, hỏi đáp cùng giáo viên' },
  { icon: 'mobile', title: 'Học mọi lúc', description: 'PWA, offline, đồng bộ tiến độ' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gamepad: Zap,
  'chart-line': Target,
  trophy: Award,
  users: Users,
  mobile: Smartphone,
};

function ProgressRing({ progress }: { progress: number }) {
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);

  return (
    <div className="relative w-[60px] h-[60px]">
      <svg className="w-[60px] h-[60px] transform -rotate-90">
        <circle cx="30" cy="30" r={radius} fill="none" stroke={COLORS.graySoft} strokeWidth="6" />
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke={COLORS.jade}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color: COLORS.jade }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

function generateStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < fullStars; i++) stars += '★';
  if (hasHalfStar) stars += '☆';
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) stars += '☆';
  return stars;
}

export function Landing() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, logout } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: 'Học viên',
    avatar: 'M',
    goal: 'HSK 4 trong 3 tháng',
    studyStreak: 0,
    todayStudyTime: 0,
    xp: 0,
    hskProgress: 0,
  });
  const [stats, setStats] = useState<GlobalStats>({
    totalLessons: 156,
    totalStudents: 45678,
    satisfactionRate: 98,
    totalBadges: 24,
  });
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'Tiếng Trung sơ cấp HSK 1-2',
      emoji: '🇨🇳',
      rating: 4.0,
      progress: 45,
      completedLessons: 5,
      totalLessons: 12,
      students: 2340,
      price: '399.000đ',
      category: 'hsk12',
      buttonText: 'Tiếp tục học',
    },
    {
      id: 2,
      title: 'Giao tiếp Hoàng gia',
      emoji: '🏯',
      rating: 5.0,
      progress: 82,
      completedLessons: 20,
      totalLessons: 24,
      students: 1890,
      price: '599.000đ',
      category: 'hsk34',
      buttonText: 'Tiếp tục học',
    },
    {
      id: 3,
      title: 'Luyện thi HSK cấp tốc',
      emoji: '📜',
      rating: 4.5,
      progress: 23,
      completedLessons: 4,
      totalLessons: 18,
      students: 3120,
      price: '499.000đ',
      category: 'hsk56',
      buttonText: 'Bắt đầu học',
    },
  ]);
  const [quiz, setQuiz] = useState<Quiz>({
    question: '📜 Tên gọi khác của "Cố Cung" (Bảo tàng) trước đây là gì?',
    options: [
      { text: '紫禁城 (Zǐjìnchéng)', isCorrect: true },
      { text: '故宫 (Gùgōng)', isCorrect: false },
      { text: '天坛 (Tiāntán)', isCorrect: false },
    ],
    correctFeedback: 'Chính xác! 紫禁城 (Tử Cấm Thành) mới là tên gốc.',
  });
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      quote: 'Sau 3 tháng mình đã đạt HSK3. Lộ trình rất rõ ràng, giảng viên nhiệt tình!',
      author: 'Minh Anh',
    },
    { quote: 'Phát âm chuẩn như người bản xứ. Cảm ơn HoaNgữ rất nhiều!', author: 'Đức Huy' },
    { quote: 'Gamification khiến mình học mỗi ngày không thấy chán!', author: 'Phương Linh' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && profile) {
        try {
          const userRes = await api.user.getProfile();
          if (userRes.success && userRes.data) {
            setUserData({
              name: userRes.data.full_name || 'Học viên',
              avatar: userRes.data.full_name?.[0] || 'M',
              goal: userRes.data.target_level
                ? `HSK ${userRes.data.target_level} trong 3 th��ng`
                : 'HSK 4 trong 3 tháng',
              studyStreak: userRes.data.study_streak || 0,
              todayStudyTime: userRes.data.today_study_minutes || 0,
              xp: userRes.data.xp || 0,
              hskProgress: userRes.data.hsk_progress || 0,
            });
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }

      try {
        const statsRes = await api.home.getStats();
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }

      try {
        const coursesRes = await api.courses.getAll({ featured: true, limit: 6 });
        if (coursesRes.success && coursesRes.data) {
          const mapped = coursesRes.data.map((c: any, idx: number) => ({
            id: c.id || idx + 1,
            title: c.title,
            emoji: c.thumbnail_url || '📚',
            rating: c.rating || 4.5,
            progress: c.progress || 0,
            completedLessons: c.completed_lessons || 0,
            totalLessons: c.total_lessons || 10,
            students: c.enrollment_count || 100,
            price: c.price === 0 ? 'Miễn phí' : `${c.price?.toLocaleString() || 0}đ`,
            category: c.level || 'hsk12',
            buttonText: c.is_enrolled ? 'Tiếp tục học' : 'Bắt đầu học',
          }));
          if (mapped.length > 0) setCourses(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }

      try {
        const quizRes = await api.quizzes.getDaily();
        if (quizRes.success && quizRes.data) {
          setQuiz(quizRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
      }

      try {
        const testRes = await api.testimonials.getAll();
        if (testRes.success && testRes.data) {
          setTestimonials(testRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      }
    };

    fetchData();
  }, [isAuthenticated, profile]);

  const handleQuizAnswer = (index: number) => {
    if (quizAnswered) return;
    setSelectedAnswer(index);
    setQuizAnswered(true);
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    navigate(`/?auth=${mode}`);
  };

  const filteredCourses =
    activeFilter === 'all' ? courses : courses.filter((c) => c.category === activeFilter);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 shadow-lg"
        style={{
          backgroundColor: COLORS.redImperial,
          boxShadow: '0 4px 20px rgba(155, 29, 44, 0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <BookOpen className="h-8 w-8" style={{ color: COLORS.gold }} />
            <div>
              <span className="text-2xl font-extrabold" style={{ color: COLORS.gold }}>
                HoaNgữ YN
              </span>
              <span className="block text-xs font-medium" style={{ color: COLORS.goldLight }}>
                học tiếng Hoa chuẩn Bắc Kinh
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="font-medium transition-colors"
              style={{ color: COLORS.goldLight }}
            >
              Trang chủ
            </Link>
            <Link
              to="/courses"
              className="font-medium transition-colors hover:text-white"
              style={{ color: COLORS.goldLight }}
            >
              Khóa học
            </Link>
            <Link
              to="/learn"
              className="font-medium transition-colors hover:text-white"
              style={{ color: COLORS.goldLight }}
            >
              Lộ trình
            </Link>
            <Link
              to="/community"
              className="font-medium transition-colors hover:text-white"
              style={{ color: COLORS.goldLight }}
            >
              Cộng đồng
            </Link>
            <button
              onClick={() => handleAuthClick('login')}
              className="px-5 py-2 rounded-full font-semibold border transition-colors"
              style={{ borderColor: COLORS.gold, color: COLORS.gold }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleAuthClick('register')}
              className="px-5 py-2 rounded-full font-bold transition-transform hover:scale-105"
              style={{
                backgroundColor: COLORS.gold,
                color: COLORS.redDark,
              }}
            >
              Bắt đầu
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(95deg, ${COLORS.redDark}f0 0%, ${COLORS.redImperial}d0 100%)`,
          minHeight: '580px',
        }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&auto=format&fit=crop"
            alt="Tử Cấm Thành"
            className="w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(95deg, ${COLORS.redDark}f0 0%, ${COLORS.redImperial}d0 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <Badge
                className="mb-6 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  color: COLORS.goldLight,
                  borderLeft: `3px solid ${COLORS.gold}`,
                }}
              >
                <Crown className="w-4 h-4 mr-2 inline" />
                TINH HOA HOÀNG CUNG
              </Badge>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Chinh phục tiếng Hoa cùng{' '}
                <span
                  className="border-b-4"
                  style={{ borderColor: COLORS.jade, color: COLORS.gold }}
                >
                  Hoa Ngữ YN
                </span>
              </h1>

              <p className="text-lg mb-6 opacity-95 max-w-lg">
                Phát âm chuẩn Bắc Kinh, lộ trình cá nhân hóa, gamification hấp dẫn — 90 ngày nói
                thành thạo.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="shadow-lg hover:shadow-xl hover:-translate-y-1"
                    style={{ backgroundColor: COLORS.gold, color: COLORS.redDark }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Học thử miễn phí
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white/10"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Xem lộ trình
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 pt-6 border-t border-white/20">
                <div>
                  <div className="text-3xl font-extrabold" style={{ color: COLORS.gold }}>
                    {stats.totalStudents >= 1000
                      ? `${(stats.totalStudents / 1000).toFixed(0)}k+`
                      : stats.totalStudents}
                  </div>
                  <div className="text-sm opacity-90">Học viên</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold" style={{ color: COLORS.gold }}>
                    {stats.satisfactionRate}%
                  </div>
                  <div className="text-sm opacity-90">Hài lòng</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold">HSK 1-6</div>
                  <div className="text-sm opacity-90">Giáo trình chuẩn</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <img
                src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&auto=format&fit=crop"
                alt="Tử Cấm Thành - Cố Cung Bắc Kinh"
                className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl border-4"
                style={{ borderColor: COLORS.gold }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats Dashboard */}
      {isAuthenticated && (
        <section
          className="relative z-10 -mt-8 mx-4 md:mx-8 rounded-2xl shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${COLORS.jade} 0%, ${COLORS.jadeLight} 100%)`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
                    color: COLORS.redDark,
                    border: '3px solid white',
                  }}
                >
                  {userData.avatar}
                </div>
                <div>
                  <h3 className="text-white text-lg font-bold">
                    Chào mừng trở lại, {userData.name}! 👋
                  </h3>
                  <p className="text-white/90 text-sm">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    Mục tiêu: {userData.goal}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur">
                  <div
                    className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"
                    style={{ color: COLORS.jade }}
                  >
                    <Fire className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/90">Chuỗi học tập</div>
                    <div className="text-xl font-extrabold text-white">
                      {userData.studyStreak} <span className="text-sm font-normal">ngày</span>
                      <Fire className="w-4 h-4 inline ml-1 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur">
                  <div
                    className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"
                    style={{ color: COLORS.jade }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/90">Hôm nay</div>
                    <div className="text-xl font-extrabold text-white">
                      {userData.todayStudyTime} <span className="text-sm font-normal">phút</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur">
                  <div
                    className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"
                    style={{ color: COLORS.jade }}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/90">Điểm XP</div>
                    <div className="text-xl font-extrabold text-white">
                      {userData.xp.toLocaleString()} <span className="text-sm font-normal">XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur">
                  <div
                    className="w-10 h-10 rounded-lg bg-white flex items-center justify-center"
                    style={{ color: COLORS.jade }}
                  >
                    <Flag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-white/90">Tiến độ HSK 4</div>
                    <div className="text-xl font-extrabold text-white">
                      {userData.hskProgress}
                      <span className="text-sm font-normal">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto -mt-6 mx-4 rounded-2xl bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-around gap-6">
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: COLORS.redImperial }}>
                {stats.totalLessons}+
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.jade }}>
                Bài học chất lượng
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: COLORS.redImperial }}>
                {stats.totalStudents >= 1000
                  ? `${(stats.totalStudents / 1000).toFixed(0)}k+`
                  : stats.totalStudents}
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.jade }}>
                Học viên đăng ký
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: COLORS.redImperial }}>
                {stats.satisfactionRate}%
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.jade }}>
                Hài lòng về lộ trình
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: COLORS.redImperial }}>
                24/7
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.jade }}>
                Hỗ trợ AI
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: COLORS.redImperial }}>
                {stats.totalBadges}+
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.jade }}>
                Huy hiệu thành tích
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.redImperial }}>
          Khóa học nổi bật
        </h2>
        <p className="text-lg mb-8" style={{ color: COLORS.textMuted }}>
          Lộ trình từ sơ cấp đến cao cấp, tích hợp văn hóa và luyện thi HSK
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[250px] flex items-center rounded-full bg-white px-4 border">
            <Search className="w-5 h-5" style={{ color: COLORS.textMuted }} />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-3 bg-transparent outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'hsk12', 'hsk34', 'hsk56'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: activeFilter === filter ? COLORS.redImperial : 'white',
                  color: activeFilter === filter ? 'white' : COLORS.textDark,
                  border: `1px solid ${COLORS.graySoft}`,
                }}
              >
                {filter === 'all'
                  ? 'Tất cả'
                  : filter === 'hsk12'
                    ? 'HSK 1-2'
                    : filter === 'hsk34'
                      ? 'HSK 3-4'
                      : 'HSK 5-6'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses
            .filter(
              (c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((course) => (
              <Card
                key={course.id}
                hover
                className="overflow-hidden"
                style={{ borderTop: `5px solid ${COLORS.redImperial}` }}
              >
                <div
                  className="text-center py-8 text-5xl"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.redImperial}, ${COLORS.redDark})`,
                  }}
                >
                  {course.emoji}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold" style={{ color: COLORS.redImperial }}>
                      {course.title}
                    </h3>
                    <div className="text-sm" style={{ color: COLORS.gold }}>
                      {generateStars(course.rating)} {course.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-4 py-3 border-t border-b">
                    <ProgressRing progress={course.progress} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: COLORS.textMuted }}>Tiến độ</span>
                        <span className="font-bold" style={{ color: COLORS.jade }}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs" style={{ color: COLORS.textMuted }}>
                        <span>
                          <CheckCircle className="w-3 h-3 inline" /> {course.completedLessons}/
                          {course.totalLessons} bài
                        </span>
                        <span>Còn {course.totalLessons - course.completedLessons} bài</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex justify-between items-center text-sm mb-3"
                    style={{ color: COLORS.textMuted }}
                  >
                    <span>
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      {course.totalLessons} bài học
                    </span>
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      {(course.students / 1000).toFixed(1)}k học
                    </span>
                  </div>

                  <div className="font-bold text-lg mb-3" style={{ color: COLORS.redImperial }}>
                    {course.price}
                  </div>

                  <Link to={`/courses/${course.id}`}>
                    <button
                      className="w-full py-2.5 rounded-full font-semibold transition-colors"
                      style={{
                        backgroundColor: COLORS.redImperial,
                        color: 'white',
                      }}
                    >
                      {course.buttonText}
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
        </div>
      </section>

      {/* HSK Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.redImperial }}>
          Lộ trình theo cấp độ HSK
        </h2>
        <p className="text-lg mb-8" style={{ color: COLORS.textMuted }}>
          Từ con số 0 đến thành thạo, lộ trình rõ ràng cho từng mục tiêu
        </p>

        <div className="flex flex-wrap justify-between gap-4">
          {hskLevels.map((level) => (
            <Link
              key={level.level}
              to={`/courses?level=${level.level}`}
              className="flex-1 text-center py-5 px-3 bg-white rounded-2xl transition-all hover:-translate-y-1 shadow-sm hover:shadow-md"
              style={{ borderBottom: `3px solid ${COLORS.gold}` }}
            >
              <div className="text-2xl font-extrabold" style={{ color: COLORS.redImperial }}>
                {level.level}
              </div>
              <div className="text-sm" style={{ color: COLORS.jade }}>
                {level.vocab} từ vựng
              </div>
              <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>
                ~{level.estimatedTime}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.redImperial }}>
          Trải nghiệm hoàng cung hiện đại
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Star;
            return (
              <Card key={feature.title} className="text-center py-6 px-4">
                <div className="text-5xl mb-4" style={{ color: COLORS.jade }}>
                  <Icon className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.redImperial }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: COLORS.textMuted }}>
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quiz */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.redImperial }}>
          Thử thách hôm nay
        </h2>

        <Card className="p-6 mt-4" style={{ borderLeft: `6px solid ${COLORS.gold}` }}>
          <Badge
            className="mb-4 px-3 py-1 rounded-full text-xs"
            style={{ backgroundColor: COLORS.redImperial, color: COLORS.gold }}
          >
            <MessageSquare className="w-3 h-3 mr-1 inline" />
            BÀI TẬP TƯƠNG TÁC
          </Badge>

          <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.redImperial }}>
            {quiz.question}
          </h3>

          <div className="flex flex-wrap gap-3 mb-4">
            {quiz.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(idx)}
                disabled={quizAnswered}
                className="px-5 py-2.5 rounded-full border transition-all disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    quizAnswered && option.isCorrect
                      ? COLORS.jadeLight
                      : quizAnswered && selectedAnswer === idx && !option.isCorrect
                        ? '#FFEFEF'
                        : 'white',
                  borderColor:
                    quizAnswered && option.isCorrect
                      ? COLORS.jade
                      : quizAnswered && selectedAnswer === idx && !option.isCorrect
                        ? COLORS.redLight
                        : COLORS.graySoft,
                  color:
                    quizAnswered && option.isCorrect
                      ? COLORS.jade
                      : quizAnswered && selectedAnswer === idx && !option.isCorrect
                        ? COLORS.redLight
                        : COLORS.textDark,
                }}
              >
                {option.text}
              </button>
            ))}
          </div>

          {quizAnswered && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: '#FEF7E8' }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: COLORS.jade }}
              >
                ✓
              </span>
              <span>
                <strong style={{ color: COLORS.jade }}>Chính xác!</strong> {quiz.correctFeedback}
              </span>
            </div>
          )}
        </Card>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: COLORS.redImperial }}>
          Học viên nói gì về HoaNgữ
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="text-center p-6">
              <Star className="w-8 h-8 mx-auto mb-4" style={{ color: COLORS.gold }} />
              <p className="italic mb-4" style={{ color: COLORS.textDark }}>
                "{t.quote}"
              </p>
              <h4 className="font-bold" style={{ color: COLORS.redImperial }}>
                - {t.author}
              </h4>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl p-8 md:p-12 text-center text-white"
          style={{
            background: `linear-gradient(115deg, ${COLORS.redImperial}, ${COLORS.redDark})`,
          }}
        >
          <h2 className="text-3xl font-extrabold mb-4">
            🏮 Hôm nay, bắt đầu hành trình ngôn ngữ của bạn 🏮
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Hơn {stats.totalStudents.toLocaleString()} học viên đã chinh phục tiếng Hoa cùng phương
            pháp Hoàng cung
          </p>
          <Button size="lg" style={{ backgroundColor: COLORS.gold, color: COLORS.redDark }}>
            <Zap className="w-5 h-5 mr-2" />
            Học thử miễn phí
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 pb-6"
        style={{
          backgroundColor: COLORS.redDark,
          color: '#FFEFCF',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6" style={{ color: COLORS.gold }} />
                <span className="text-xl font-bold" style={{ color: COLORS.gold }}>
                  HoaNgữ YN
                </span>
              </div>
              <p className="text-sm">
                Học viện tiếng Hoa trực tuyến
                <br />
                Chuẩn Bắc Kinh - Gamification hấp dẫn
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: COLORS.gold }}>
                Khám phá
              </h4>
              <Link to="/courses" className="block text-sm mb-2 hover:underline">
                Khóa học
              </Link>
              <Link to="/learn" className="block text-sm mb-2 hover:underline">
                Lộ trình HSK
              </Link>
              <Link to="/community" className="block text-sm hover:underline">
                Cộng đồng
              </Link>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: COLORS.gold }}>
                Hỗ trợ
              </h4>
              <Link to="/faq" className="block text-sm mb-2 hover:underline">
                FAQ
              </Link>
              <Link to="/policy" className="block text-sm mb-2 hover:underline">
                Chính sách
              </Link>
              <Link to="/contact" className="block text-sm hover:underline">
                Liên hệ
              </Link>
            </div>

            <div>
              <h4 className="font-bold mb-4" style={{ color: COLORS.gold }}>
                Liên hệ
              </h4>
              <p className="text-sm mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                123 Đường Hoàng Cung, Q.1, TP.HCM
              </p>
              <p className="text-sm mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                1900 8888 - 028 1234 5678
              </p>
              <p className="text-sm mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                contact@hoanguyn.edu.vn
              </p>
              <p className="text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                Thứ 2 - Chủ nhật: 8:00 - 22:00
              </p>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-white/20 text-sm">
            © 2026 HoaNgữ YN — Tinh hoa giao thoa cùng thế hệ mới. Phiên bản Imperial Theme.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
