import { api } from '../../lib/api';

export interface PaymentRecord {
  id: string;
  user_id: string;
  course_id: string | null;
  amount_vnd: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_id: string | null;
  note: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreatePaymentParams {
  courseId: string;
  amountVnd: number;
  paymentMethod: 'bank_transfer' | 'momo';
}

export interface PaymentConfig {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch: string;
  qrCode?: string;
}

export interface MoMoConfig {
  phoneNumber: string;
  accountName: string;
}

async function getPaymentConfigFromDb(): Promise<PaymentConfig | null> {
  try {
    const response = await api.settings.getAll();
    if (!response.success || !response.data) {
      return null;
    }

    const settings = response.data;
    const configMap = new Map(settings.map((s: any) => [s.key, s.value]));
    
    const bankName = configMap.get('bank_name');
    const accountNumber = configMap.get('account_number');
    const accountName = configMap.get('account_name');
    const branch = configMap.get('bank_branch');

    if (!bankName || !accountNumber || !accountName) {
      return null;
    }

    return {
      bankName,
      accountNumber,
      accountName,
      branch: branch || '',
      qrCode: '',
    };
  } catch (error) {
    console.error('Error fetching payment config:', error);
    return null;
  }
}

export async function getBankInfo(): Promise<PaymentConfig> {
  const dbConfig = await getPaymentConfigFromDb();
  if (dbConfig) {
    return dbConfig;
  }
  
  throw new Error('Thông tin thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
}

export async function getMoMoInfo(): Promise<MoMoConfig> {
  try {
    const response = await api.settings.get('momo_phone');
    if (!response.success || !response.data) {
      throw new Error('Thông tin MoMo chưa được cấu hình');
    }

    return {
      phoneNumber: response.data.value || '',
      accountName: 'HoaNgữ LMS',
    };
  } catch (error) {
    throw new Error('Thông tin MoMo chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
  }
}

export async function createPayment(params: CreatePaymentParams): Promise<PaymentRecord> {
  const response = await api.payments.create({
    course_id: params.courseId,
    amount_vnd: params.amountVnd,
    payment_method: params.paymentMethod,
  });

  if (!response.success) {
    throw new Error(response.error || 'Tạo thanh toán thất bại');
  }

  return response.data as PaymentRecord;
}

export async function completePayment(paymentId: string, transactionId: string): Promise<void> {
  const response = await api.payments.complete(paymentId, transactionId);

  if (!response.success) {
    throw new Error(response.error || 'Xác nhận thanh toán thất bại');
  }
}

export async function getPaymentHistory(): Promise<PaymentRecord[]> {
  const response = await api.payments.getAll();

  if (!response.success) {
    throw new Error(response.error || 'Lỗi khi lấy lịch sử thanh toán');
  }

  return response.data as PaymentRecord[];
}

export async function getPaymentStatus(paymentId: string): Promise<string> {
  const response = await api.payments.getAll();
  
  if (!response.success || !response.data) {
    return 'unknown';
  }

  const payment = response.data.find((p: any) => p.id === paymentId);
  return payment?.status || 'unknown';
}

export async function checkEnrollment(courseId: string): Promise<boolean> {
  const response = await api.enrollments.check(courseId);
  
  if (!response.success) {
    return false;
  }

  return response.data?.enrolled || false;
}

export async function enrollCourse(courseId: string): Promise<void> {
  const response = await api.enrollments.create(courseId);

  if (!response.success) {
    throw new Error(response.error || 'Đăng ký khóa học thất bại');
  }
}
