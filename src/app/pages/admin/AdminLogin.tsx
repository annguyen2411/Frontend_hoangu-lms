import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { adminAuthUtils } from '../../utils/adminAuth';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const admin = await adminAuthUtils.adminLogin(email, password);
    setLoading(false);
    
    if (admin) {
      navigate('/admin/dashboard');
    } else {
      setError('Email hoặc mật khẩu không đúng. Chỉ admin mới được phép truy cập.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
            <p className="text-white/90 mt-1">HoaNgữ Management System</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Đăng nhập quản trị</h3>
              <p className="text-gray-600 mt-1">Chỉ dành cho quản trị viên</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Admin
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hoanguy.edu.vn"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : null}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                <strong>Demo credentials:</strong><br />
                Email: admin@hoangu.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-white hover:text-gray-300 text-sm">
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
