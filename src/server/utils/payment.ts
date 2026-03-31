import crypto from 'crypto';
import { logInfo, logError } from './logger';

interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
}

interface PaymentRequest {
  amount: number;
  orderId: string;
  orderInfo: string;
  ipAddr: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}

class VNPayService {
  private config: VNPayConfig;

  constructor() {
    this.config = {
      vnp_TmnCode: process.env.VNP_TMNCODE || '',
      vnp_HashSecret: process.env.VNP_HASHSECRET || '',
      vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnp_ReturnUrl: process.env.VNP_RETURNURL || 'http://localhost:5173/payment/return',
    };
  }

  isConfigured(): boolean {
    return !!(this.config.vnp_TmnCode && this.config.vnp_HashSecret);
  }

  createPaymentUrl(params: PaymentRequest): PaymentResponse {
    if (!this.isConfigured()) {
      logError('VNPay not configured');
      return { success: false, message: 'Payment gateway not configured' };
    }

    const { amount, orderId, orderInfo, ipAddr } = params;

    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_Amount: String(amount * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: this.config.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: this.formatDate(new Date()),
    };

    const sortedParams = Object.keys(vnp_Params).sort().reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {} as Record<string, string>);

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${this.config.vnp_Url}?${new URLSearchParams(vnp_Params).toString()}`;

    logInfo('Created VNPay payment URL', { orderId, amount });

    return { success: true, paymentUrl };
  }

  verifyCallback(params: Record<string, string>): { success: boolean; orderId?: string; message?: string } {
    const secureHash = params['vnp_SecureHash'];
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = Object.keys(params).sort().reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {} as Record<string, string>);

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      logError('VNPay invalid signature', { params });
      return { success: false, message: 'Invalid signature' };
    }

    const responseCode = params['vnp_ResponseCode'];
    const orderId = params['vnp_TxnRef'];

    if (responseCode === '00') {
      logInfo('VNPay payment success', { orderId });
      return { success: true, orderId };
    }

    logError('VNPay payment failed', { orderId, responseCode });
    return { success: false, orderId, message: `Payment failed with code: ${responseCode}` };
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:T\.\s]/g, '').slice(0, 14);
  }

  getPaymentStatusUrl(txnRef: string): string {
    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'querydr',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_TxnRef: txnRef,
      vnp_TransDate: '',
      vnp_CreateDate: this.formatDate(new Date()),
    };

    const sortedParams = Object.keys(vnp_Params).sort().reduce((obj, key) => {
      obj[key] = vnp_Params[key];
      return obj;
    }, {} as Record<string, string>);

    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    return `${this.config.vnp_Url}?${new URLSearchParams(vnp_Params).toString()}`;
  }
}

export const vnPayService = new VNPayService();
