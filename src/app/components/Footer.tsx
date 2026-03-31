import { Link } from 'react-router';
import { BookOpen, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand - Modern Flat */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <BookOpen className="h-8 w-8 text-[var(--primary)] transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold text-[var(--primary)]">HoaNgữ</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Nền tảng học tiếng Hoa trực tuyến hàng đầu Việt Nam
            </p>
            <div className="flex gap-2">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-all">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white transition-all">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - Clean Layout */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Liên kết</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Trang chủ</span>
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Khóa học</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Liên hệ</span>
                </Link>
              </li>
              <li>
                <Link to="/?auth=login" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Đăng nhập</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Khóa học phổ biến</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses/hsk1-co-ban-90-ngay" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">HSK 1 - Cơ bản</span>
                </Link>
              </li>
              <li>
                <Link to="/courses/hsk2-trung-cap" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">HSK 2 - Trung cấp</span>
                </Link>
              </li>
              <li>
                <Link to="/courses/tieng-hoa-thuong-mai" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Tiếng Hoa Thương mại</span>
                </Link>
              </li>
              <li>
                <Link to="/courses/giao-tiep-du-lich" className="text-muted-foreground hover:text-[var(--primary)] transition-colors inline-flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Tiếng Hoa Du lịch</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Modern Style */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-muted-foreground">1900 xxxx<br/>(8:00 - 22:00)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-muted-foreground">support@hoanguy.edu.vn</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-muted-foreground">Tầng 5, Tòa nhà ABC<br/>Quận 1, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 HoaNgữ - Học viện Tiếng Hoa trực tuyến. Bản quyền thuộc về HoaNgữ Education.
          </p>
        </div>
      </div>
    </footer>
  );
}