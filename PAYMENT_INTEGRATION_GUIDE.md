# 💳 Payment Integration Guide - VNPay

**Goal:** Enable course purchases via VNPay  
**Time:** Week 5-6 (15-20 hours)  
**Difficulty:** Medium-Hard

---

## 📚 Table of Contents

1. [VNPay Overview](#vnpay-overview)
2. [Account Setup](#account-setup)
3. [Integration Steps](#integration-steps)
4. [Testing](#testing)
5. [Production](#production)

---

## 🏦 VNPay Overview

### What is VNPay?

**VNPay** là cổng thanh toán phổ biến nhất tại Việt Nam:
- ✅ Hỗ trợ ATM, Visa/Master, QR code
- ✅ Phí thấp (1.5-3% per transaction)
- ✅ Tích hợp dễ dàng
- ✅ Hỗ trợ tiếng Việt

### Payment Flow

```
1. User clicks "Mua khóa học" (Buy course)
2. App creates payment request → VNPay
3. VNPay returns payment URL
4. User redirected to VNPay gateway
5. User completes payment
6. VNPay redirects back with result
7. App verifies & grants course access
```

---

## 🔧 Account Setup

### Step 1: Register VNPay Merchant

**Production (Real payments):**

```
1. Go to: https://vnpay.vn
2. Click "Đăng ký"
3. Fill business info:
   - Tên doanh nghiệp
   - Mã số thuế
   - Giấy phép kinh doanh
   - Thông tin liên hệ

4. Submit documents
5. Wait 3-7 days for approval
6. Receive merchant credentials
```

**Development (Testing):**

```
Use VNPay Sandbox (Demo):

Website: https://sandbox.vnpayment.vn/
Username: demo
Password: demo123

Sandbox credentials:
- TmnCode: DEMOJAVA  (for Java)
- TmnCode: DEMOQRPAY (for QR)
- HashSecret: provided after registration
```

---

### Step 2: Get Credentials

**After approval, you'll receive:**

```
✅ TmnCode: YOUR_TMN_CODE
✅ HashSecret: YOUR_HASH_SECRET
✅ URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html (sandbox)
   OR: https://vnpay.vn/paymentv2/vpcpay.html (production)
```

**Save these securely!**

---

### Step 3: Add to Environment Variables

**Edit `.env.local`:**

```env
# VNPay Sandbox
VITE_VNPAY_TMN_CODE=DEMOJAVA
VITE_VNPAY_HASH_SECRET=your_hash_secret_here
VITE_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VITE_VNPAY_RETURN_URL=http://localhost:5173/payment/callback

# For production, change to:
# VITE_VNPAY_URL=https://vnpay.vn/paymentv2/vpcpay.html
# VITE_VNPAY_RETURN_URL=https://yourdomain.com/payment/callback
```

---

## 🔌 Integration Steps

### Step 1: Install Dependencies

```bash
npm install crypto-js
npm install query-string
```

---

### Step 2: Create Payment Service

**Create `/src/app/services/vnpay.ts`:**

```typescript
import CryptoJS from 'crypto-js';
import queryString from 'query-string';

const tmnCode = import.meta.env.VITE_VNPAY_TMN_CODE;
const hashSecret = import.meta.env.VITE_VNPAY_HASH_SECRET;
const vnpayUrl = import.meta.env.VITE_VNPAY_URL;
const returnUrl = import.meta.env.VITE_VNPAY_RETURN_URL;

export interface PaymentParams {
  amount: number; // VND
  orderInfo: string; // Description
  orderId: string; // Unique order ID
  userId: string;
  courseId: string;
}

export function createPaymentUrl(params: PaymentParams): string {
  const createDate = formatDate(new Date());
  const expireDate = formatDate(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes

  const vnpParams: any = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: params.amount * 100, // VNPay uses smallest unit (VND * 100)
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: '127.0.0.1', // Will get from user in production
    vnp_Locale: 'vn',
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: params.orderId,
    vnp_ExpireDate: expireDate,
  };

  // Sort parameters
  const sortedParams = sortObject(vnpParams);

  // Create signature
  const signData = queryString.stringify(sortedParams, { encode: false });
  const hmac = CryptoJS.HmacSHA512(signData, hashSecret);
  const signed = hmac.toString(CryptoJS.enc.Hex);

  // Add signature to params
  sortedParams.vnp_SecureHash = signed;

  // Create payment URL
  const paymentUrl = vnpayUrl + '?' + queryString.stringify(sortedParams, { encode: false });

  return paymentUrl;
}

export function verifyReturnUrl(query: any): boolean {
  const secureHash = query.vnp_SecureHash;
  delete query.vnp_SecureHash;
  delete query.vnp_SecureHashType;

  const sortedParams = sortObject(query);
  const signData = queryString.stringify(sortedParams, { encode: false });
  const hmac = CryptoJS.HmacSHA512(signData, hashSecret);
  const signed = hmac.toString(CryptoJS.enc.Hex);

  return secureHash === signed;
}

// Helper functions
function sortObject(obj: any): any {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
```

---

### Step 3: Create Checkout Page

**Create `/src/app/pages/Checkout.tsx`:**

```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCourse } from '../hooks/api/useCourses';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentUrl } from '../services/vnpay';
import { supabase } from '../../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourse(courseId!);
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user || !course) return;

    setProcessing(true);

    try {
      // Create order in database
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          course_id: course.id,
          amount: course.price,
          status: 'pending',
          payment_method: 'vnpay',
        });

      if (orderError) throw orderError;

      // Create payment URL
      const paymentUrl = createPaymentUrl({
        amount: course.price,
        orderInfo: `Thanh toán khóa học: ${course.title}`,
        orderId: orderId,
        userId: user.id,
        courseId: course.id,
      });

      // Redirect to VNPay
      window.location.href = paymentUrl;
    } catch (error: any) {
      toast.error('Lỗi tạo thanh toán: ' + error.message);
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center p-8">Không tìm thấy khóa học</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Thanh Toán</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Giá khóa học:</span>
            <span className="font-bold">{course.price.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Giảm giá:</span>
            <span>0 đ</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Tổng cộng:</span>
            <span className="text-blue-600">{course.price.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-bold mb-4">Phương thức thanh toán</h3>
        <div className="flex items-center gap-3 p-4 border rounded-lg">
          <img src="/vnpay-logo.png" alt="VNPay" className="h-8" />
          <div>
            <div className="font-semibold">VNPay</div>
            <div className="text-sm text-gray-600">ATM, Visa, MasterCard, QR Code</div>
          </div>
        </div>
      </Card>

      <Button
        onClick={handlePayment}
        disabled={processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Đang xử lý...
          </>
        ) : (
          'Thanh toán ngay'
        )}
      </Button>

      <p className="text-sm text-gray-600 text-center mt-4">
        Bạn sẽ được chuyển đến trang thanh toán an toàn của VNPay
      </p>
    </div>
  );
}
```

---

### Step 4: Create Payment Callback Handler

**Create `/src/app/pages/PaymentCallback.tsx`:**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { verifyReturnUrl } from '../services/vnpay';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    const query: any = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Verify signature
    const isValid = verifyReturnUrl(query);
    
    if (!isValid) {
      setStatus('failed');
      setMessage('Xác thực thanh toán thất bại. Vui lòng liên hệ hỗ trợ.');
      return;
    }

    const responseCode = query.vnp_ResponseCode;
    const orderId = query.vnp_TxnRef;

    if (responseCode === '00') {
      // Payment successful
      try {
        // Update order status
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            transaction_id: query.vnp_TransactionNo,
            paid_at: new Date().toISOString(),
          })
          .eq('id', orderId)
          .select()
          .single();

        if (orderError) throw orderError;

        // Create enrollment
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            user_id: order.user_id,
            course_id: order.course_id,
            status: 'active',
            enrolled_at: new Date().toISOString(),
          });

        if (enrollError) throw enrollError;

        setStatus('success');
        setMessage('Thanh toán thành công! Bạn đã được ghi danh vào khóa học.');
      } catch (error: any) {
        setStatus('failed');
        setMessage('Lỗi xử lý đơn hàng: ' + error.message);
      }
    } else {
      // Payment failed
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', orderId);

      setStatus('failed');
      setMessage('Thanh toán thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">Đang xử lý...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">Thành công!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/dashboard/my-courses')}>
              Đến khóa học của tôi
            </Button>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Thất bại</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/courses')} className="w-full">
                Quay lại khóa học
              </Button>
              <Button onClick={() => navigate('/contact')} variant="outline" className="w-full">
                Liên hệ hỗ trợ
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### Step 5: Add Routes

**Edit `/src/app/routes.tsx`:**

```typescript
import Checkout from './pages/Checkout';
import PaymentCallback from './pages/PaymentCallback';

// Add to routes:
{
  path: 'checkout/:courseId',
  Component: Checkout,
},
{
  path: 'payment/callback',
  Component: PaymentCallback,
},
```

---

### Step 6: Add Checkout Button

**Edit `/src/app/pages/CourseDetail.tsx`:**

```typescript
import { useNavigate } from 'react-router';

// In component:
const navigate = useNavigate();

// In render:
<Button 
  onClick={() => navigate(`/checkout/${course.id}`)}
  size="lg"
>
  Mua khóa học - {course.price.toLocaleString('vi-VN')} đ
</Button>
```

---

## 🧪 Testing

### Test Cards (Sandbox)

**VNPay provides test cards:**

```
ATM Test Card:
- Card Number: 9704198526191432198
- Card Holder: NGUYEN VAN A
- Issue Date: 07/15
- OTP: 123456

Visa Test Card:
- Card Number: 4111111111111111
- CVV: 123
- Expiry: 12/25
```

---

### Test Scenarios

**1. Successful Payment:**
```
1. Click "Mua khóa học"
2. Redirected to VNPay
3. Enter test card
4. Confirm payment
5. Redirected back with success
6. Course added to "My Courses"
7. Order status = "completed"
```

**2. Failed Payment:**
```
1. Click "Mua khóa học"
2. Close VNPay window (cancel)
3. Redirected back with error
4. Order status = "failed"
5. Course NOT added
```

**3. Invalid Signature:**
```
Manually modify return URL parameters
→ Should show "Xác thực thất bại"
```

---

## 🚀 Production Checklist

**Before going live:**

- [ ] Register real VNPay merchant account
- [ ] Get production credentials
- [ ] Update `.env.production`:
  ```env
  VITE_VNPAY_URL=https://vnpay.vn/paymentv2/vpcpay.html
  VITE_VNPAY_RETURN_URL=https://yourdomain.com/payment/callback
  ```
- [ ] Test with small real transaction (10,000 VND)
- [ ] Verify money received in bank
- [ ] Setup webhook for IPN (optional)
- [ ] Add email confirmation
- [ ] Add receipt generation
- [ ] Setup refund process
- [ ] Add fraud detection

---

## 💡 Best Practices

### Security

```typescript
// 1. Always verify signature
const isValid = verifyReturnUrl(query);
if (!isValid) {
  throw new Error('Invalid signature');
}

// 2. Use HTTPS in production
const returnUrl = 'https://yourdomain.com/payment/callback'; // Not HTTP!

// 3. Store hash secret securely
// NEVER commit to Git
// Use environment variables only

// 4. Validate amount before creating payment
if (amount < 1000) {
  throw new Error('Amount too small');
}

// 5. Check order doesn't already exist
const existing = await supabase
  .from('orders')
  .select('id')
  .eq('id', orderId)
  .single();

if (existing) {
  throw new Error('Order already exists');
}
```

---

### User Experience

```typescript
// 1. Show loading state
<Button disabled={processing}>
  {processing ? 'Đang xử lý...' : 'Thanh toán'}
</Button>

// 2. Handle errors gracefully
try {
  await createPayment();
} catch (error) {
  toast.error('Lỗi: ' + error.message);
}

// 3. Redirect quickly
window.location.href = paymentUrl; // Don't delay

// 4. Show clear success/fail messages
{status === 'success' && (
  <div className="text-green-600">
    ✅ Thanh toán thành công!
  </div>
)}
```

---

## 📊 Database Schema

**Orders table:**

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES courses NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- pending, completed, failed, refunded
  payment_method TEXT, -- vnpay, momo, etc
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

---

## 🔗 Resources

**VNPay Docs:**
- Integration guide: https://sandbox.vnpayment.vn/apis/docs/
- Test cards: https://sandbox.vnpayment.vn/apis/vnpay-test-data.html

**Support:**
- VNPay Hotline: 1900 55 55 77
- Email: support@vnpay.vn

---

**Last Updated:** March 14, 2026  
**Estimated Time:** 15-20 hours  
**Difficulty:** ⭐⭐⭐⭐ Medium-Hard

---

**Good luck with payment integration! 💪**
