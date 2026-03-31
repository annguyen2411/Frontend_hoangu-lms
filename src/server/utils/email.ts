import { logInfo, logError } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private provider: 'resend' | 'console' | 'disabled';
  private resendApiKey: string | undefined;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.provider = (process.env.EMAIL_PROVIDER as 'resend' | 'console' | 'disabled') || 'console';
    this.resendApiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@hoangu.tech';
    this.fromName = process.env.EMAIL_FROM_NAME || 'HoaNgữ LMS';

    if (this.provider === 'resend' && !this.resendApiKey) {
      logWarn('RESEND_API_KEY not set, falling back to console email');
      this.provider = 'console';
    }
  }

  async send(options: EmailOptions): Promise<boolean> {
    const { to, subject, html } = options;

    if (this.provider === 'disabled') {
      logInfo(`Email disabled, skipping send to ${to}`);
      return true;
    }

    if (this.provider === 'console') {
      logInfo(`[EMAIL] To: ${to}, Subject: ${subject}`);
      logInfo(`[EMAIL] Body: ${html.substring(0, 200)}...`);
      return true;
    }

    if (this.provider === 'resend') {
      return this.sendWithResend(to, subject, html);
    }

    return false;
  }

  private async sendWithResend(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const resend = require('resend');
      const resendClient = new resend.Resend(this.resendApiKey);

      const result = await resendClient.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject,
        html,
      });

      logInfo(`Email sent successfully to ${to}`, { messageId: result.data?.id });
      return true;
    } catch (error: any) {
      logError(`Failed to send email to ${to}`, { error: error.message });
      return false;
    }
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Chào mừng đến với HoaNgữ LMS!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Chào mừng ${fullName}!</h1>
          <p>Cảm ơn bạn đã đăng ký HoaNgữ LMS - nền tảng học tiếng Hoa hàng đầu.</p>
          <p>Bạn có thể bắt đầu học ngay hôm nay!</p>
          <a href="${process.env.FRONTEND_URL}/courses" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Khám phá khóa học</a>
          <p style="margin-top: 24px;">Chúc bạn học tập hiệu quả!</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.send({
      to: email,
      subject: 'Đặt lại mật khẩu - HoaNgữ LMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Đặt lại mật khẩu</h1>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào nút bên dưới để tiếp tục:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Đặt lại mật khẩu</a>
          <p style="margin-top: 24px; color: #666;">Link này sẽ hết hạn sau 1 giờ.</p>
          <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });
  }

  async sendPaymentConfirmation(email: string, courseTitle: string, amount: number): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Xác nhận thanh toán thành công - HoaNgữ LMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">Thanh toán thành công!</h1>
          <p>Cảm ơn bạn đã mua khóa học <strong>${courseTitle}</strong></p>
          <p>Số tiền: <strong>${amount.toLocaleString('vi-VN')} VNĐ</strong></p>
          <p>Bạn có thể bắt đầu học ngay!</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/my-courses" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Vào học ngay</a>
        </div>
      `,
    });
  }

  async sendCourseEnrollmentNotification(email: string, courseTitle: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Bạn đã được ghi danh vào khóa học ${courseTitle} - HoaNgữ LMS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Bạn đã được ghi danh!</h1>
          <p>Chúc mừng! Bạn đã được ghi danh vào khóa học <strong>${courseTitle}</strong></p>
          <a href="${process.env.FRONTEND_URL}/dashboard/my-courses" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Bắt đầu học</a>
        </div>
      `,
    });
  }
}

function logWarn(message: string, meta?: any) {
  console.warn(message, meta);
}

export const emailService = new EmailService();
