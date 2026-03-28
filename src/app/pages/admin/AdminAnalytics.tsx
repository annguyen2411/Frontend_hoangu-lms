import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, DollarSign, ShoppingCart, Loader2, Target, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminStats } from '../../hooks/useAdmin';
import { api } from '../../../lib/api';

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [revenueRes, topCoursesRes, engagementRes] = await Promise.all([
          api.admin.getRevenueAnalytics(parseInt(dateRange)),
          api.admin.getTopCourses(10),
          api.admin.getEngagement(),
        ]);
        
        if (revenueRes.success && revenueRes.data) {
          setRevenueData(revenueRes.data.map((r: any) => ({
            date: new Date(r.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
            revenue: r.revenue || 0,
            orders: r.orders || 0
          })));
        }

        if (topCoursesRes.success && topCoursesRes.data) {
          setCourses(topCoursesRes.data);
        }

        if (engagementRes.success && engagementRes.data) {
          setEngagement(engagementRes.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange]);

  const totalRevenue = revenueData.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, r) => sum + (r.orders || 0), 0);

  const paymentMethods = [
    { id: 'vnpay', name: 'VNPay', value: 45, color: '#3b82f6' },
    { id: 'momo', name: 'Momo', value: 30, color: '#ec4899' },
    { id: 'zalopay', name: 'ZaloPay', value: 15, color: '#0ea5e9' },
    { id: 'visa', name: 'Visa/Mastercard', value: 10, color: '#6366f1' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="text-gray-500">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Analytics</h1>
          <p className="text-gray-600 mt-1">Phân tích chi tiết dữ liệu kinh doanh</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
            <option value="365">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">User hoạt động/ngày</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.dailyActiveUsers || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">User mới tháng</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.newUsersThisMonth || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">
                {(totalRevenue / 1000000).toFixed(1)}M ₫
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Học viên hoạt động tháng</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.monthlyActiveUsers || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {engagement?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Khóa học bán chạy</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses[0]?.title?.slice(0, 15) || 'N/A'}...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${(value / 1000).toFixed(0)}K ₫`} />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Doanh thu" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top khóa học bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courses.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(1)}M ₫`} />
              <Bar dataKey="total_revenue" fill="#8b5cf6" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức thanh toán</h3>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                <span className="text-sm text-gray-600">{method.name}</span>
                <span className="text-sm font-medium text-gray-900">{method.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}