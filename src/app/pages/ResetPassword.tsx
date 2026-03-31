import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError('Link đặt lại mật khẩu không hợp lệ');
    }
  }, [token]);

  const passwordErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    
    if (touched.newPassword) {
      if (!passwordData.newPassword) {
        errors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (passwordData.newPassword.length < 6) {
        errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
    
    if (touched.confirmPassword) {
      if (!passwordData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (passwordData.confirmPassword !== passwordData.newPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    
    return errors;
  }, [passwordData, touched]);

  const isValid = useMemo(() => {
    return passwordData.newPassword.length >= 6 && 
           passwordData.confirmPassword === passwordData.newPassword &&
           !passwordErrors.newPassword &&
           !passwordErrors.confirmPassword;
  }, [passwordData, passwordErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !token) return;

    setLoading(true);
    try {
      const response = await api.auth.resetPassword(token, passwordData.newPassword);
      if (response.success) {
        setSuccess(true);
        toast.success('Đặt lại mật khẩu thành công!');
      } else {
        toast.error(response.error || 'Không thể đặt lại mật khẩu');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Đặt lại mật khẩu thành công!</h2>
            <p className="text-muted-foreground mb-6">
              Mật khẩu của bạn đã được đặt lại. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
            <Button
              onClick={() => navigate('/?auth=login')}
              className="w-full"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Link không hợp lệ</h2>
            <p className="text-muted-foreground mb-6">
              {tokenError}
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">
                Yêu cầu link mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link
            to="/?auth=login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Đặt lại mật khẩu</h2>
            <p className="text-muted-foreground">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                leftIcon={<Lock className="h-4 w-4" />}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                onBlur={() => setTouched({ ...touched, newPassword: true })}
                error={passwordErrors.newPassword}
                required
                fullWidth
              />
              {touched.newPassword && !passwordErrors.newPassword && passwordData.newPassword.length >= 6 && (
                <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
              )}
            </div>

            <div className="relative">
              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                leftIcon={<Lock className="h-4 w-4" />}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                error={passwordErrors.confirmPassword}
                required
                fullWidth
              />
              {touched.confirmPassword && !passwordErrors.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
                <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
              )}
            </div>

            <Button 
              type="submit" 
              size="lg" 
              fullWidth 
              disabled={loading || !isValid}
            >
              {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
