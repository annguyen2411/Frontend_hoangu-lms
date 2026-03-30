import { useState, useEffect, useMemo } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Moon, Zap, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Switch } from '../components/ui/Switch';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/Input';
import { OfflineCoursesManager } from '../components/OfflineCoursesManager';
import { toast } from 'sonner';
import { LoginPrompt } from '../components/LoginPrompt';
import { api } from '../../lib/api';

export function Settings() {
  const { profile, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'offline'>('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    lessons: true,
    achievements: true,
    promotions: false,
  });
  const [saving, setSaving] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordTouched, setPasswordTouched] = useState<Record<string, boolean>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  // Password validation
  const passwordErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (passwordTouched.currentPassword) {
      if (!passwordData.currentPassword) {
        errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }
    }
    if (passwordTouched.newPassword) {
      if (!passwordData.newPassword) {
        errors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (passwordData.newPassword.length < 6) {
        errors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }
    if (passwordTouched.confirmPassword) {
      if (!passwordData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (passwordData.confirmPassword !== passwordData.newPassword) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }
    return errors;
  }, [passwordData, passwordTouched]);

  const isPasswordValid = useMemo(() => {
    return passwordData.currentPassword && 
           passwordData.newPassword.length >= 6 && 
           passwordData.confirmPassword === passwordData.newPassword &&
           !passwordErrors.currentPassword &&
           !passwordErrors.newPassword &&
           !passwordErrors.confirmPassword;
  }, [passwordData, passwordErrors]);

  const handlePasswordChange = async () => {
    if (!isPasswordValid) return;
    
    setChangingPassword(true);
    try {
      const response = await api.auth.changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (response.success) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordTouched({});
      } else {
        toast.error(response.error || 'Không thể đổi mật khẩu');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordBlur = (field: string) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    // Will show login prompt instead of navigating
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  useEffect(() => {
    if (profile) {
      setNotifications({
        email: profile.notification_enabled,
        push: true,
        sms: false,
        lessons: true,
        achievements: true,
        promotions: false,
      });
    }
  }, [profile]);

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateProfile({
        notification_enabled: notifications.email,
      });
      toast.success('Đã lưu cài đặt thông báo');
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    toast.success('Đã lưu cài đặt hồ sơ');
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-[var(--primary)] rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Cài đặt</h1>
              <p className="text-muted-foreground mt-1">
                Tùy chỉnh trải nghiệm học tập của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className={`${
                activeTab === 'profile' ? 'bg-accent text-white' : ''
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Hồ sơ
            </Button>
            <Button
              variant="outline"
              className={`${
                activeTab === 'security' ? 'bg-accent text-white' : ''
              }`}
              onClick={() => setActiveTab('security')}
            >
              Bảo mật
            </Button>
            <Button
              variant="outline"
              className={`${
                activeTab === 'notifications' ? 'bg-accent text-white' : ''
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Thông báo
            </Button>
            <Button
              variant="outline"
              className={`${
                activeTab === 'offline' ? 'bg-accent text-white' : ''
              }`}
              onClick={() => setActiveTab('offline')}
            >
              Khóa học ngoại tuyến
            </Button>
          </div>

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-[var(--theme-primary)]" />
                <h2 className="text-xl font-bold text-foreground">Tài khoản</h2>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold text-foreground">Thông tin cá nhân</div>
                      <div className="text-sm text-muted-foreground">Cập nhật tên, ảnh đại diện</div>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold text-foreground">Bảo mật</div>
                      <div className="text-sm text-muted-foreground">Đổi mật khẩu, xác thực 2 yếu tố</div>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold text-foreground">Ngôn ngữ</div>
                      <div className="text-sm text-muted-foreground">Tiếng Việt</div>
                    </div>
                  </div>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-[var(--theme-primary)]" />
                <h2 className="text-xl font-bold text-foreground">Bảo mật</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Đổi mật khẩu</h3>
                  <p className="text-sm text-muted-foreground mb-6">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>
                  
                  <div className="space-y-4 max-w-md">
                    <div className="relative">
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        onBlur={() => handlePasswordBlur('currentPassword')}
                        error={passwordErrors.currentPassword}
                        className="mt-1"
                      />
                      {passwordTouched.currentPassword && !passwordErrors.currentPassword && passwordData.currentPassword && (
                        <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        onBlur={() => handlePasswordBlur('newPassword')}
                        error={passwordErrors.newPassword}
                        className="mt-1"
                      />
                      {passwordTouched.newPassword && !passwordErrors.newPassword && passwordData.newPassword.length >= 6 && (
                        <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        onBlur={() => handlePasswordBlur('confirmPassword')}
                        error={passwordErrors.confirmPassword}
                        className="mt-1"
                      />
                      {passwordTouched.confirmPassword && !passwordErrors.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
                        <CheckCircle className="absolute right-3 top-9 h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <Button 
                      onClick={handlePasswordChange}
                      disabled={!isPasswordValid || changingPassword}
                      className="w-full mt-4"
                    >
                      {changingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Xác thực 2 yếu tố</h3>
                  <p className="text-sm text-muted-foreground mb-4">Tính năng sẽ sớm được cập nhật</p>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">2FA</div>
                        <div className="text-sm text-muted-foreground">Chưa kích hoạt</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Sắp ra mắt
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-[var(--theme-primary)]" />
                <h2 className="text-xl font-bold text-foreground">Thông báo</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">Email</Label>
                    <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">Push Notification</Label>
                    <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">SMS</Label>
                    <p className="text-sm text-muted-foreground">Nhận thông báo qua tin nhắn</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">Nhắc nhở học tập</Label>
                    <p className="text-sm text-muted-foreground">Nhận nhắc học theo lịch</p>
                  </div>
                  <Switch
                    checked={notifications.lessons}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, lessons: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">Thành tích</Label>
                    <p className="text-sm text-muted-foreground">Thông báo về huy hiệu và giải thưởng</p>
                  </div>
                  <Switch
                    checked={notifications.achievements}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, achievements: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div>
                    <Label className="text-base font-semibold text-foreground">Khuyến mãi</Label>
                    <p className="text-sm text-muted-foreground">Thông báo về ưu đãi đặc biệt</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, promotions: checked })
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Offline Courses Settings */}
          {activeTab === 'offline' && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-5 w-5 text-[var(--theme-primary)]" />
                <h2 className="text-xl font-bold text-foreground">Khóa học ngoại tuyến</h2>
              </div>

              <OfflineCoursesManager />
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Hủy
            </button>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              onClick={activeTab === 'notifications' ? handleSaveNotifications : handleSaveProfile}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
