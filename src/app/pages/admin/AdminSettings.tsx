import { useState } from 'react';
import { Globe, Bell, Lock, CreditCard, Mail, Save } from 'lucide-react';

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Cài đặt chung', icon: Globe },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'security', name: 'Bảo mật', icon: Lock },
    { id: 'payment', name: 'Thanh toán', icon: CreditCard },
    { id: 'email', name: 'Email', icon: Mail }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-1">Quản lý cấu hình website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt chung</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên website
                    </label>
                    <input
                      type="text"
                      defaultValue="HoaNgữ - Học tiếng Hoa trực tuyến"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Slogan
                    </label>
                    <input
                      type="text"
                      defaultValue="Học tiếng Hoa chuẩn Bắc Kinh – Chỉ 90 ngày nói thành thạo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      defaultValue="support@hoanguy.edu.vn"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hotline
                    </label>
                    <input
                      type="text"
                      defaultValue="1900 xxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Tầng 5, Tòa nhà ABC, Quận 1, TP.HCM"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="maintenance"
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">
                      Chế độ bảo trì (Website sẽ tạm đóng cửa)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt thông báo</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Đơn hàng mới</div>
                      <div className="text-sm text-gray-600">
                        Nhận thông báo khi có đơn hàng mới
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Học viên mới</div>
                      <div className="text-sm text-gray-600">
                        Nhận thông báo khi có học viên đăng ký mới
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Đánh giá mới</div>
                      <div className="text-sm text-gray-600">
                        Nhận thông báo khi có đánh giá mới từ học viên
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">Báo cáo hàng tuần</div>
                      <div className="text-sm text-gray-600">
                        Nhận báo cáo tổng hợp mỗi tuần qua email
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bảo mật</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="2fa"
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="2fa" className="text-sm font-medium text-gray-700">
                        Bật xác thực 2 bước (2FA)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Cài đặt thanh toán
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                          VP
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">VNPay</div>
                          <div className="text-sm text-gray-600">Cổng thanh toán VNPay</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Merchant ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Secret Key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                          M
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Momo</div>
                          <div className="text-sm text-gray-600">Ví điện tử Momo</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Partner Code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Access Key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">
                          Z
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">ZaloPay</div>
                          <div className="text-sm text-gray-600">Ví điện tử ZaloPay</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="App ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt Email</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      defaultValue="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      defaultValue="587"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email gửi đi
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@hoanguy.edu.vn"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      defaultValue="HoaNgữ Education"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
                <Save className="h-5 w-5" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
