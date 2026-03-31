import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const faqs = [
  {
    question: 'Tôi có thể học thử miễn phí không?',
    answer: 'Có, bạn được học thử miễn phí 7 ngày đầu tiên với đầy đủ tính năng. Không cần thanh toán trước, không tự động gia hạn.'
  },
  {
    question: 'Làm sao để đăng ký khóa học?',
    answer: 'Bạn chỉ cần đăng ký tài khoản, chọn khóa học phù hợp, và thanh toán qua VNPay, Momo, ZaloPay hoặc thẻ Visa. Sau đó bạn có thể học ngay lập tức.'
  },
  {
    question: 'Tôi có thể học bao lâu?',
    answer: 'Sau khi thanh toán, bạn có quyền truy cập vĩnh viễn vào khóa học. Bạn có thể học theo tốc độ của mình mà không bị giới hạn thời gian.'
  },
  {
    question: 'Có giáo viên hỗ trợ trực tiếp không?',
    answer: 'Có, chúng tôi có đội ngũ giáo viên Việt và bản xứ Trung Quốc sẵn sàng hỗ trợ bạn qua chat, email hoặc video call.'
  },
  {
    question: 'Chứng chỉ HSK có giá trị không?',
    answer: 'Chứng chỉ HSK là chứng chỉ quốc tế được công nhận trên toàn thế giới. Sau khi hoàn thành khóa học, bạn có thể đăng ký thi chính thức tại Viện Khổng Tử.'
  },
  {
    question: 'Tôi có thể học trên điện thoại không?',
    answer: 'Hoàn toàn được! Nền tảng HoaNgữ hoạt động tốt trên mọi thiết bị: máy tính, tablet và điện thoại. Bạn có thể học mọi lúc mọi nơi.'
  },
  {
    question: 'Phương thức thanh toán nào được hỗ trợ?',
    answer: 'Chúng tôi hỗ trợ VNPay, Momo, ZaloPay, thẻ Visa/Mastercard và chuyển khoản ngân hàng. Tất cả đều được bảo mật 100%.'
  },
  {
    question: 'Có chính sách hoàn tiền không?',
    answer: 'Có, nếu bạn không hài lòng trong vòng 7 ngày đầu, chúng tôi sẽ hoàn lại 100% số tiền. Không cần lý do.'
  },
  {
    question: 'AI chấm phát âm hoạt động như thế nào?',
    answer: 'Công nghệ AI của chúng tôi phân tích giọng nói của bạn theo 4 thanh điệu chuẩn Bắc Kinh, đưa ra điểm số và gợi ý cải thiện chi tiết.'
  },
  {
    question: 'Flashcard Spaced Repetition là gì?',
    answer: 'Đây là phương pháp học từ vựng khoa học, giúp bạn ghi nhớ lâu hơn bằng cách ôn tập đúng thời điểm mà não bộ cần củng cố.'
  }
];

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: 'general', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header - High Contrast */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ & Hỗ trợ</h1>
          <p className="text-xl text-white">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hotline</h3>
            <p className="text-gray-600 mb-2">Gọi ngay để được tư vấn</p>
            <a href="tel:1900xxxx" className="text-2xl font-bold text-red-600 hover:text-red-700">
              1900 xxxx
            </a>
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
              <Clock className="h-4 w-4" />
              8:00 - 22:00 (Hàng ngày)
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-2">Gửi câu hỏi qua email</p>
            <a
              href="mailto:support@hoanguy.edu.vn"
              className="text-lg font-bold text-red-600 hover:text-red-700"
            >
              support@hoanguy.edu.vn
            </a>
            <p className="text-sm text-gray-500 mt-2">
              Phản hồi trong 24 giờ
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Văn phòng</h3>
            <p className="text-gray-600 mb-2">Ghé thăm chúng tôi</p>
            <p className="text-gray-700 font-semibold">
              Tầng 5, Tòa nhà ABC
              <br />
              Quận 1, TP.HCM
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                ✓ Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chủ đề
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="general">Tư vấn chung</option>
                  <option value="course">Thông tin khóa học</option>
                  <option value="payment">Thanh toán</option>
                  <option value="technical">Hỗ trợ kỹ thuật</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nội dung *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Nhập nội dung câu hỏi hoặc yêu cầu hỗ trợ của bạn..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {expandedFaq === index && (
                    <div className="px-5 pb-5 text-gray-700 border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-red-600 to-yellow-500 rounded-xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">Vẫn cần hỗ trợ?</h3>
              <p className="text-white/90 mb-4">
                Chat trực tiếp với đội ngũ tư vấn viên
              </p>
              <button className="px-6 py-3 bg-white text-red-600 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                Mở chat Zalo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}