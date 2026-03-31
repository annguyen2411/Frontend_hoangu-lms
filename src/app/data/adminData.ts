// Mock data for Admin Dashboard

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: number;
  totalSpent: number;
  joinDate: string;
  status: 'active' | 'inactive';
  progress: number;
}

export interface Order {
  id: string;
  orderId: string;
  studentName: string;
  courseName: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  usageLimit: number;
  usageCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Analytics {
  id: string;
  date: string;
  day: number;
  revenue: number;
  students: number;
  orders: number;
}

export const adminUsers: AdminUser[] = [
  {
    id: '1',
    email: 'admin@hoanguy.edu.vn',
    name: 'Admin HoaNgữ',
    role: 'super_admin'
  }
];

export const students: Student[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    phone: '0901234567',
    enrolledCourses: 3,
    totalSpent: 7470000,
    joinDate: '2026-01-15',
    status: 'active',
    progress: 45
  },
  {
    id: '2',
    name: 'Trần Thị Bích',
    email: 'tranbich@gmail.com',
    phone: '0912345678',
    enrolledCourses: 2,
    totalSpent: 4480000,
    joinDate: '2026-02-01',
    status: 'active',
    progress: 67
  },
  {
    id: '3',
    name: 'Lê Văn Cường',
    email: 'lecuong@gmail.com',
    phone: '0923456789',
    enrolledCourses: 1,
    totalSpent: 1990000,
    joinDate: '2026-02-20',
    status: 'active',
    progress: 23
  },
  {
    id: '4',
    name: 'Phạm Thị Dung',
    email: 'phamdung@gmail.com',
    phone: '0934567890',
    enrolledCourses: 4,
    totalSpent: 12960000,
    joinDate: '2025-12-10',
    status: 'active',
    progress: 78
  },
  {
    id: '5',
    name: 'Hoàng Văn Em',
    email: 'hoangem@gmail.com',
    phone: '0945678901',
    enrolledCourses: 1,
    totalSpent: 690000,
    joinDate: '2026-03-05',
    status: 'inactive',
    progress: 12
  }
];

export const orders: Order[] = [
  {
    id: '1',
    orderId: 'ORD-2026-001',
    studentName: 'Nguyễn Văn An',
    courseName: 'HSK 1 - Tiếng Hoa Cơ Bản 90 Ngày',
    amount: 1990000,
    status: 'completed',
    paymentMethod: 'VNPay',
    date: '2026-03-14'
  },
  {
    id: '2',
    orderId: 'ORD-2026-002',
    studentName: 'Trần Thị Bích',
    courseName: 'HSK 2 - Nâng Cao Kỹ Năng Giao Tiếp',
    amount: 2490000,
    status: 'completed',
    paymentMethod: 'Momo',
    date: '2026-03-14'
  },
  {
    id: '3',
    orderId: 'ORD-2026-003',
    studentName: 'Lê Văn Cường',
    courseName: 'Tiếng Hoa Du Lịch - 30 Ngày Tự Tin',
    amount: 690000,
    status: 'pending',
    paymentMethod: 'ZaloPay',
    date: '2026-03-13'
  },
  {
    id: '4',
    orderId: 'ORD-2026-004',
    studentName: 'Phạm Thị Dung',
    courseName: 'Tiếng Hoa Thương Mại - Business Chinese',
    amount: 4490000,
    status: 'completed',
    paymentMethod: 'Visa',
    date: '2026-03-13'
  },
  {
    id: '5',
    orderId: 'ORD-2026-005',
    studentName: 'Nguyễn Văn An',
    courseName: 'Luyện Phát Âm Chuẩn Bắc Kinh',
    amount: 1490000,
    status: 'completed',
    paymentMethod: 'VNPay',
    date: '2026-03-12'
  }
];

export const coupons: Coupon[] = [
  {
    id: '1',
    code: 'TETNGUYENDAN',
    discount: 30,
    type: 'percent',
    usageLimit: 100,
    usageCount: 67,
    expiryDate: '2026-03-31',
    isActive: true
  },
  {
    id: '2',
    code: 'HOCVIENMOI',
    discount: 500000,
    type: 'fixed',
    usageLimit: 50,
    usageCount: 23,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    id: '3',
    code: 'FLASH50',
    discount: 50,
    type: 'percent',
    usageLimit: 20,
    usageCount: 20,
    expiryDate: '2026-02-28',
    isActive: false
  }
];

export const analyticsData: Analytics[] = [
  { id: 'day1', date: '2026-03-08', day: 8, revenue: 8960000, students: 12, orders: 8 },
  { id: 'day2', date: '2026-03-09', day: 9, revenue: 12450000, students: 18, orders: 11 },
  { id: 'day3', date: '2026-03-10', day: 10, revenue: 15780000, students: 24, orders: 15 },
  { id: 'day4', date: '2026-03-11', day: 11, revenue: 9340000, students: 15, orders: 9 },
  { id: 'day5', date: '2026-03-12', day: 12, revenue: 18920000, students: 28, orders: 17 },
  { id: 'day6', date: '2026-03-13', day: 13, revenue: 21560000, students: 32, orders: 21 },
  { id: 'day7', date: '2026-03-14', day: 14, revenue: 24890000, students: 38, orders: 25 }
];

export const dashboardStats = {
  totalRevenue: 245680000,
  monthlyRevenue: 87340000,
  totalStudents: 12450,
  newStudents: 234,
  completionRate: 78.5,
  activeOrders: 45,
  totalCourses: 24,
  totalOrders: 3456
};