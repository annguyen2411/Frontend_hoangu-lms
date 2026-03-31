import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return '';
    if (!email) return 'Vui lòng nhập email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ';
    return '';
  }, [email, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (emailError) return;

    setLoading(true);
    try {
      const response = await api.auth.forgotPassword(email);
      if (response.success) {
        setEmailSent(true);
        toast.success('Đã gửi link đặt lại mật khẩu!');
      } else {
        toast.error(response.error || 'Không thể gửi link đặt lại mật khẩu');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Kiểm tra email của bạn!</h2>
            <p className="text-muted-foreground mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Nếu bạn không thấy email, hãy kiểm tra hòm thư rác hoặc thử lại sau.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/?auth=login')}
                className="w-full"
              >
                Quay lại đăng nhập
              </Button>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
              >
                Gửi lại email
              </Button>
            </div>
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
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quên mật khẩu?</h2>
            <p className="text-muted-foreground">
              Không sao! Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="example@email.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                error={emailError}
                required
                fullWidth
              />
              {touched && !emailError && email && (
                <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
              )}
            </div>

            <Button type="submit" size="lg" fullWidth disabled={loading || !!emailError}>
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Nhớ mật khẩu rồi?{' '}
            <Link to="/?auth=login" className="text-[var(--primary)] hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
