import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, logout, isLoading: authLoading } = useAuth();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'register') {
      setIsLogin(false);
    } else if (auth === 'login') {
      setIsLogin(true);
    }
  }, []);

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

        const { error: loginError, role } = await login(formData.email, formData.password);
        
        if (loginError) {
          setError(loginError.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } else {
          onClose();
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'instructor') {
            navigate('/instructor');
          } else {
            navigate('/');
          }
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Vui lòng điền đầy đủ thông tin');
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
          // Show success message and switch to login tab (don't auto-login)
          const registeredEmail = formData.email;
          await logout();
          setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
          setFormData({ name: '', email: registeredEmail, password: '', confirmPassword: '' });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {successMessage && isLogin && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => { onClose(); navigate('/forgot-password'); }}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || authLoading}
          >
            {(loading || authLoading) ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký'
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-red-600 hover:underline font-medium"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}