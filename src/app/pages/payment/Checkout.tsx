import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';
import { BANK_INFO, MOMO_INFO, createPayment } from '../../utils/paymentService';
import { Loader2, Building2, Smartphone, Copy, Check, QrCode } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  price_vnd: number;
  original_price_vnd: number;
  discount_percent: number;
  teacher_name: string;
}

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'momo'>('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) throw error;
      return data as Course;
    },
    enabled: !!courseId,
  });

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/checkout/' + courseId);
      return;
    }

    if (!course) return;

    setIsProcessing(true);
    try {
      const payment = await createPayment(course.id, course.price_vnd, paymentMethod);
      toast.success('Tạo đơn thanh toán thành công! Vui lòng thanh toán theo hướng dẫn.');
      navigate(`/payment/success/${payment.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Đã copy!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return <div className="container mx-auto p-8 text-center">Không tìm thấy khóa học</div>;
  }

  const discountAmount = course.original_price_vnd - course.price_vnd;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khóa học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-500">{course.teacher_name}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Giá gốc:</span>
                  <span className="line-through text-gray-400">
                    {course.original_price_vnd?.toLocaleString()}đ
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Tổng cộng:</span>
                  <span className="text-blue-600">{course.price_vnd?.toLocaleString()}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as 'bank_transfer' | 'momo')}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="bank_transfer" id="bank" />
                  <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-5 h-5" />
                    <span>Chuyển khoản ngân hàng</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="momo" id="momo" />
                  <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer">
                    <Smartphone className="w-5 h-5" />
                    <span>Ví MoMo</span>
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === 'bank_transfer' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Thông tin chuyển khoản</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-medium">{BANK_INFO.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium font-mono">{BANK_INFO.accountNumber}</span>
                        <button onClick={() => copyToClipboard(BANK_INFO.accountNumber)} className="p-1">
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên tài khoản:</span>
                      <span className="font-medium">{BANK_INFO.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chi nhánh:</span>
                      <span className="font-medium">{BANK_INFO.branch}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    Nội dung chuyển khoản: <span className="font-mono text-blue-600">HN{user?.email?.split('@')[0]}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'momo' && (
                <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Thanh toán MoMo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium">{MOMO_INFO.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên tài khoản:</span>
                      <span className="font-medium">{MOMO_INFO.accountName}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Quét QR để thanh toán</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full mt-6"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  `Thanh toán ${course.price_vnd?.toLocaleString()}đ`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
