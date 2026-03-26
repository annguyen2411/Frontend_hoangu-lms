import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Users, Mic, Brain, Award, CheckCircle, ArrowRight, Play, Star } from 'lucide-react';
import { courses, features, communityStats } from '../data/mockData';
import { CourseCarousel } from '../components/CourseCarousel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// Counter animation component
function Counter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <div ref={ref}>{count.toLocaleString()}</div>;
}

export function Home() {
  const featuredCourses = courses.filter((c) => c.isFeatured);

  const iconMap: Record<string, any> = {
    Users,
    Mic,
    Brain,
    Award,
  };

  return (
    <div className="w-full">
      {/* Hero Section - Modern Flat Design */}
      <section className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <Badge variant="secondary" size="md" className="mb-6 bg-white/20 text-white backdrop-blur-sm border border-white/30">
                <Star className="h-3 w-3" />
                Nền tảng học tiếng Hoa #1 Việt Nam
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Học tiếng Hoa chuẩn Bắc Kinh
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 font-semibold">
                Chỉ 90 ngày nói thành thạo
              </p>
              
              <p className="text-lg mb-8 text-white/90 leading-relaxed">
                Phương pháp học hiện đại với AI chấm phát âm, flashcard thông minh, 
                và cộng đồng học viên sôi động
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/courses">
                  <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-gray-100 shadow-lg">
                    Khám phá khóa học
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/20 backdrop-blur-sm">
                  <Play className="h-5 w-5" />
                  Xem demo
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold mb-1"><Counter end={50000} />+</div>
                  <div className="text-sm text-white/90 font-medium">Học viên</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1"><Counter end={120} />+</div>
                  <div className="text-sm text-white/90 font-medium">Khóa học</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">4.9</div>
                  <div className="text-sm text-white/90 font-medium">⭐ Đánh giá</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                  alt="Vạn Lý Trường Thành - Great Wall of China"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">90 ngày</div>
                    <div className="text-xs text-muted-foreground">Thành thạo giao tiếp</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-accent border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl mb-6 tracking-tight">
              Lý do chọn HoaNgữ
            </h2>
            <p className="text-lg text-muted-foreground">
              Phương pháp học hiện đại, hiệu quả vượt trội
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, idx) => {
              const Icon = iconMap[feature.icon];
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 border border-border mb-6">
                    <Icon className="h-7 w-7 text-foreground" />
                  </div>
                  <h3 className="text-xl mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-24 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl mb-6 tracking-tight">
              Cộng đồng HoaNgữ
            </h2>
            <p className="text-lg text-muted-foreground">
              Hơn 12.000 học viên đã học và thành công
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center border-l border-border pl-8">
              <div className="text-5xl mb-3">
                <Counter end={communityStats.totalStudents} />
              </div>
              <div className="text-sm text-muted-foreground tracking-wide uppercase">Học viên</div>
            </div>
            <div className="text-center border-l border-border pl-8">
              <div className="text-5xl mb-3">
                <Counter end={communityStats.averageRating * 10} />
                <span className="text-3xl text-muted-foreground">/50</span>
              </div>
              <div className="text-sm text-muted-foreground tracking-wide uppercase">Đánh giá TB</div>
            </div>
            <div className="text-center border-l border-border pl-8">
              <div className="text-5xl mb-3">
                <Counter end={communityStats.totalCourses} />
                <span className="text-3xl text-muted-foreground">+</span>
              </div>
              <div className="text-sm text-muted-foreground tracking-wide uppercase">Khóa học</div>
            </div>
            <div className="text-center border-l border-border pl-8">
              <div className="text-5xl mb-3">
                <Counter end={communityStats.successRate} />
                <span className="text-3xl text-muted-foreground">%</span>
              </div>
              <div className="text-sm text-muted-foreground tracking-wide uppercase">Thành công</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl mb-8 tracking-tight">
            Bắt đầu hành trình chinh phục tiếng Hoa
          </h2>
          <p className="text-xl text-white/70 mb-12 leading-relaxed">
            Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và học thử miễn phí 7 ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-10 py-4 bg-white text-foreground font-normal tracking-wide hover:bg-white/90 transition-colors"
            >
              Đăng ký miễn phí
            </Link>
            <Link
              to="/contact"
              className="px-10 py-4 bg-transparent text-white border border-white/30 font-normal tracking-wide hover:border-white transition-colors"
            >
              Tư vấn miễn phí
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}