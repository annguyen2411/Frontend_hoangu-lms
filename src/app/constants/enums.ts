export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum QuestType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
  ACHIEVEMENT = 'achievement',
}

export enum PostType {
  QUESTION = 'question',
  TIP = 'tip',
  MILESTONE = 'milestone',
  GENERAL = 'general',
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.BEGINNER]: 'Cơ bản',
  [CourseLevel.INTERMEDIATE]: 'Trung cấp',
  [CourseLevel.ADVANCED]: 'Nâng cao',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PaymentMethod.MOMO]: 'MoMo',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Đang chờ',
  [PaymentStatus.COMPLETED]: 'Hoàn thành',
  [PaymentStatus.FAILED]: 'Thất bại',
  [PaymentStatus.CANCELLED]: 'Đã hủy',
};
