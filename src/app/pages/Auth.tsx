import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { Mail, Lock, User, Facebook, Chrome, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, logout, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read mode from URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  // Real-time validation
  const errors = useMemo<FormErrors>(() => {
    const result: FormErrors = {};
    
    if (touched.name && !isLogin) {
      if (!formData.name.trim()) {
        result.name = 'Vui lòng nhập họ tên';
      } else if (formData.name.trim().length < 2) {
        result.name = 'Tên phải có ít nhất 2 ký tự';
      }
    }
    
    if (touched.email) {
      if (!formData.email) {
        result.email = 'Vui lòng nhập email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        result.email = 'Email không hợp lệ';
      }
    }
    
    if (touched.password) {
      if (!formData.password) {
        result.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 6) {
        result.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
    
    if (touched.confirmPassword && !isLogin) {
      if (!formData.confirmPassword) {
        result.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.confirmPassword !== formData.password) {
        result.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    
    return result;
  }, [formData, touched, isLogin]);

  const isValid = useMemo(() => {
    if (isLogin) {
      return formData.email && formData.password && !errors.email && !errors.password;
    }
    return formData.name && formData.email && formData.password && formData.confirmPassword &&
           !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
  }, [formData, errors, isLogin]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setError('Vui lòng điền đầy đủ thông tin');
          setLoading(false);
          return;
        }

        const { error: loginError } = await login(formData.email, formData.password);
        
        if (loginError) {
          setError(loginError.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          setError('Vui lòng điền đầy đủ thông tin');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Mật khẩu xác nhận không khớp');
          setLoading(false);
          return;
        }

        const { error: registerError } = await register(formData.name, formData.email, formData.password);
        
        if (registerError) {
          setError(registerError.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } else {
          // Show success message, switch to login tab, and LOGOUT to prevent auto-login
          const registeredEmail = formData.email;
          await logout(); // Prevent auto-login
          setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
          setFormData({ name: '', email: registeredEmail, password: '', confirmPassword: '' });
          setTouched({});
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setError('Tính năng đăng nhập mạng xã hội sẽ sớm được cập nhật.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs - Modern Flat Design */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setSuccessMessage(''); setError(''); }}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                isLogin
                  ? 'text-[var(--primary)] bg-[var(--primary-light)] border-b-2 border-[var(--primary)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[var(--muted)]'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setSuccessMessage(''); setError(''); }}
              className={`flex-1 py-4 text-center font-semibold transition-all ${
                !isLogin
                  ? 'text-[var(--primary)] bg-[var(--primary-light)] border-b-2 border-[var(--primary)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-[var(--muted)]'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? 'Đăng nhập để tiếp tục học tập'
                  : 'Bắt đầu hành trình chinh phục tiếng Hoa'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-lg text-[var(--error)] text-sm font-medium">
                {error}
              </div>
            )}

            {successMessage && isLogin && (
              <div className="mb-6 p-4 bg-green-50 border border-green-500 rounded-lg text-green-700 text-sm font-medium">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative">
                  <Input
                    label="Họ và tên"
                    type="text"
                    placeholder="Nhập họ và tên"
                    leftIcon={<User className="h-4 w-4" />}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    error={errors.name}
                    required
                    fullWidth
                  />
                  {touched.name && !errors.name && formData.name.length >= 2 && (
                    <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                  )}
                </div>
              )}

              <div className="relative">
                <Input
                  label="Email"
                  type="email"
                  placeholder="example@email.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={errors.email}
                  required
                  fullWidth
                />
                {touched.email && !errors.email && formData.email && (
                  <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                )}
              </div>

              <div className="relative">
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  error={errors.password}
                  required
                  fullWidth
                  helperText={!isLogin ? "Tối thiểu 6 ký tự" : undefined}
                />
                {touched.password && !errors.password && formData.password.length >= 6 && (
                  <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                )}
              </div>

              {!isLogin && (
                <div className="relative">
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="h-4 w-4" />}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    error={errors.confirmPassword}
                    required={true}
                    fullWidth={true}
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-muted-foreground">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link to="/forgot-password" className="text-[var(--primary)] hover:underline font-medium">
                    Quên mật khẩu?
                  </Link>
                </div>
              )}

              <Button type="submit" size="lg" fullWidth disabled={loading || !isValid}>
                {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-muted-foreground">Hoặc tiếp tục với</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center"
                  disabled
                >
                  <Chrome className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center"
                  disabled
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin('phone')}
                  className="flex items-center justify-center"
                  disabled
                >
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {!isLogin && (
              <p className="mt-6 text-center text-xs text-muted-foreground">
                Bằng việc đăng ký, bạn đồng ý với{' '}
                <a href="/terms" className="text-[var(--primary)] hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="/privacy" className="text-[var(--primary)] hover:underline">
                  Chính sách bảo mật
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
