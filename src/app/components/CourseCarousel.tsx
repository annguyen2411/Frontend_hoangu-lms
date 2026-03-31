import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { Link } from 'react-router';
import type { Course } from '../../lib/database.types';
import { COURSE_LEVEL_LABELS } from '../constants/enums';

interface CourseCarouselProps {
  courses: Course[];
  enrolledCourseIds?: string[];
}

export function CourseCarousel({ courses, enrolledCourseIds = [] }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (courses.length <= slidesToShow) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [courses.length, slidesToShow]);

  if (courses.length === 0) {
    return null;
  }

  const visibleCourses = [];
  for (let i = 0; i < Math.min(slidesToShow, courses.length); i++) {
    const index = (currentIndex + i) % courses.length;
    visibleCourses.push(courses[index]);
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
  };

  const getLevelLabel = (level: string) => {
    return COURSE_LEVEL_LABELS[level as keyof typeof COURSE_LEVEL_LABELS] || level;
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex gap-6">
          <AnimatePresence mode="popLayout">
            {visibleCourses.map((course, idx) => {
              const discountPercent = course.original_price_vnd && course.price_vnd < course.original_price_vnd
                ? Math.round(((course.original_price_vnd - course.price_vnd) / course.original_price_vnd) * 100)
                : 0;

              return (
                <motion.div
                  key={`${course.id}-${currentIndex}-${idx}`}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`flex-shrink-0 ${
                    slidesToShow === 1
                      ? 'w-full'
                      : slidesToShow === 2
                      ? 'w-[calc(50%-12px)]'
                      : 'w-[calc(33.333%-16px)]'
                  }`}
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow h-full">
                    <div className="relative group">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                          <Star className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-16 w-16 text-white" />
                      </div>
                      {discountPercent > 0 && (
                        <div className="absolute top-3 right-3 bg-error text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          -{discountPercent}%
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                        {course.category && (
                          <span className="px-3 py-1 bg-primary-light text-primary rounded-full text-xs font-semibold">
                            {course.category}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {getLevelLabel(course.level)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                          {course.teacher_name?.[0] || 'G'}
                        </div>
                        <span className="text-sm text-gray-600">
                          {course.teacher_name || 'Giảng viên HoaNgữ'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{course.duration_hours ? `${course.duration_hours}h` : 'N/A'}</span>
                        <span>•</span>
                        <span>{course.total_lessons} bài</span>
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold text-gray-900">{course.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({course.students_enrolled} học viên)
                        </span>
                      </div>

                      <div className="flex items-end justify-between mb-4">
                        <div>
                          {enrolledCourseIds.includes(String(course.id)) ? (
                            <span className="text-2xl font-bold text-green-600">Đã đăng ký</span>
                          ) : discountPercent > 0 ? (
                            <>
                              <span className="text-2xl font-bold text-error">
                                {(course.price_vnd === 0 || course.course_type === 'free') ? 'Miễn phí' : `${course.price_vnd.toLocaleString()}đ`}
                              </span>
                              <span className="ml-2 text-sm text-gray-400 line-through">
                                {course.original_price_vnd?.toLocaleString()}đ
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              {(course.price_vnd === 0 || course.course_type === 'free') ? 'Miễn phí' : `${course.price_vnd.toLocaleString()}đ`}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to={enrolledCourseIds.includes(String(course.id)) ? `/courses/${course.slug}/learn` : `/courses/${course.slug}`}
                        className="block w-full py-3 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white text-center rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        {enrolledCourseIds.includes(String(course.id)) ? 'Vào học ngay' : 'Xem chi tiết'}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {courses.length > slidesToShow && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6 text-primary" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6 text-primary" />
          </button>

          <div className="flex justify-center gap-2 mt-8">
            {courses.slice(0, Math.min(courses.length, 5)).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex % courses.length ? 'bg-primary w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
