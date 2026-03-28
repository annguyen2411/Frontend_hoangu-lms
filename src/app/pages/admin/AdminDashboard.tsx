import { TrendingUp, Users, BookOpen, ShoppingCart, DollarSign, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAdminStats, useAdminOrders } from '../../hooks/useAdmin';

export function AdminDashboard() {
  const { stats, loading: statsLoading } = useAdminStats();
  const { orders, loading: ordersLoading } = useAdminOrders();

  const statsData = [
    {
      id: 'revenue',
      name: 'Doanh thu tháng này',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      id: 'students',
      name: 'Học viên mới',
      value: stats.totalStudents,
      change: '+23.4%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'completion',
      name: 'Tỷ lệ hoàn thành',
      value: `${Math.round((stats.totalEnrollments / Math.max(stats.totalStudents, 1)) * 100)}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: Award,
      color: 'bg-yellow-500'
    },
    {
      id: 'orders',
      name: 'Đơn hàng',
      value: orders.filter(o => o.status === 'pending').length,
      change: '+8.1%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-red-500'
    }
  ];

  const recentOrders = orders.slice(0, 5);

  const analyticsData = [
    { day: 'T2', revenue: 1200000, students: 12, orders: 8 },
    { day: 'T3', revenue: 1800000, students: 15, orders: 12 },
    { day: 'T4', revenue: 900000, students: 8, orders: 5 },
    { day: 'T5', revenue: 2100000, students: 18, orders: 14 },
    { day: 'T6', revenue: 1500000, students: 14, orders: 10 },
    { day: 'T7', revenue: 2400000, students: 20, orders: 16 },
    { day: 'CN', revenue: 1800000, students: 16, orders: 11 },
  ];

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan hệ thống HoaNgữ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.name}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Doanh thu 7 ngày</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid key="grid-revenue" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                key="xaxis-revenue"
                dataKey="day"
                stroke="#9ca3af"
              />
              <YAxis
                key="yaxis-revenue"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                stroke="#9ca3af"
              />
              <Tooltip
                key="tooltip-revenue"
                formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                labelFormatter={(label) => `Ngày ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line
                key="line-revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ fill: '#dc2626', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students & Orders Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Học viên & Đơn hàng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid key="grid-bar" strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                key="xaxis-bar"
                dataKey="day"
                stroke="#9ca3af"
              />
              <YAxis key="yaxis-bar" stroke="#9ca3af" />
              <Tooltip
                key="tooltip-bar"
                labelFormatter={(label) => `Ngày ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar key="bar-students" dataKey="students" fill="#3b82f6" name="Học viên" />
              <Bar key="bar-orders" dataKey="orders" fill="#f59e0b" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{order.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900">{order.user_id.slice(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{order.course_id ? order.course_id.slice(0, 8) + '...' : 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {(order.amount_vnd || 0).toLocaleString()}đ
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status === 'completed'
                        ? 'Hoàn thành'
                        : order.status === 'pending'
                        ? 'Chờ xử lý'
                        : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}