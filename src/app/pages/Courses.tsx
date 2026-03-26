import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Star, Play, Users, Award, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { courses, features, communityStats } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';

export function Courses() {
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('popular');

  const levels = ['Cơ bản', 'Trung cấp', 'Nâng cao'];
  const sortOptions = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-low', label: 'Giá: Thấp đến cao' },
    { value: 'price-high', label: 'Giá: Cao đến thấp' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
  ];

  useEffect(() => {
    let result = [...courses];

    if (searchQuery) {
      result = result.filter(
        (c) =>
          c.titleVi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLevel) {
      result = result.filter((c) => c.level === selectedLevel);
    }

    result = result.filter(
      (c) => (c.salePrice || c.price) >= priceRange[0] && (c.salePrice || c.price) <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        break;
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedLevel, priceRange, sortBy]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Cơ bản':
        return 'bg-green-500';
      case 'Trung cấp':
        return 'bg-blue-500';
      case 'Nâng cao':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-red-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-white/20 text-white border border-white/30 backdrop-blur-sm">
              <Award className="h-4 w-4 mr-1" />
              Khóa học được chứng nhận HSK
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Khám phá khóa học tiếng Hoa
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {courses.length} khóa học chất lượng cao từ giảng viên bản xứ, phù hợp mọi trình độ
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khóa học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{communityStats.totalStudents.toLocaleString()}+</div>
                <div className="text-sm text-gray-500">Học viên</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{communityStats.averageRating}</div>
                <div className="text-sm text-gray-500">Đánh giá</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{communityStats.successRate}%</div>
                <div className="text-sm text-gray-500">Tỷ lệ thành công</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {/* Level Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedLevel === null
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLevel === level
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredCourses.length}</span> khóa học
          {selectedLevel && (
            <span>
              {' '}
              /{' '}
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-[var(--primary)] hover:underline"
              >
                Xem tất cả
              </button>
            </span>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={`/courses/${course.slug}`}
                  className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Thumbnail */}
                  <div className="relative pb-[56.25%] overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.titleVi}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Level Badge */}
                    <span
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${getLevelColor(
                        course.level
                      )}`}
                    >
                      {course.level}
                    </span>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 text-[var(--primary)] fill-[var(--primary)] ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                      {course.titleVi}
                    </h3>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 mb-4">
                      <img
                        src={course.teacher.avatar}
                        alt={course.teacher.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">{course.teacher.name}</span>
                      {course.teacher.isNative && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Bản xứ
                        </span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-gray-900">{course.rating}</span>
                        <span>({course.totalReviews})</span>
                      </div>
                      <div>{course.totalLessons} bài</div>
                      <div>{course.duration}</div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        {course.salePrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-[var(--primary)]">
                              {course.salePrice.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {course.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-[var(--primary)]">
                            {course.price.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-500 mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedLevel(null); }}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
