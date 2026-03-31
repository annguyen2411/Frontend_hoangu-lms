// Certificate Generator
import { offlineStorage } from './offlineStorage';

export interface Certificate {
  id: string;
  courseName: string;
  studentName: string;
  completionDate: Date;
  issueDate: Date;
  score: number;
  level: string;
  certificateNumber: string;
  instructorName: string;
  skills: string[];
  duration: string;
}

class CertificateGenerator {
  private readonly CERTIFICATES_KEY = 'hoangu-certificates';

  // Generate certificate
  generate(data: Omit<Certificate, 'id' | 'issueDate' | 'certificateNumber'>): Certificate {
    const certificate: Certificate = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      issueDate: new Date(),
      certificateNumber: this.generateCertificateNumber(),
    };

    const certificates = this.getAll();
    certificates.push(certificate);
    offlineStorage.set(this.CERTIFICATES_KEY, certificates);

    return certificate;
  }

  // Get all certificates
  getAll(): Certificate[] {
    return offlineStorage.get<Certificate[]>(this.CERTIFICATES_KEY) || [];
  }

  // Get certificate by ID
  getById(id: string): Certificate | null {
    return this.getAll().find(c => c.id === id) || null;
  }

  // Generate certificate number
  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `HN-${year}-${random}`;
  }

  // Generate certificate as HTML
  generateHTML(certificate: Certificate): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chứng chỉ - ${certificate.studentName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .certificate {
      background: white;
      width: 100%;
      max-width: 1000px;
      aspect-ratio: 1.414;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      position: relative;
      border: 20px solid #dc2626;
      border-image: linear-gradient(45deg, #dc2626, #eab308) 1;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      inset: 30px;
      border: 2px solid #eab308;
      pointer-events: none;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 48px;
      font-weight: bold;
      background: linear-gradient(45deg, #dc2626, #eab308);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 18px;
      color: #666;
      font-style: italic;
    }
    
    .title {
      text-align: center;
      font-size: 48px;
      color: #dc2626;
      margin: 30px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .body {
      text-align: center;
      font-size: 18px;
      line-height: 1.8;
      color: #333;
    }
    
    .name {
      font-size: 42px;
      color: #dc2626;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
      text-decoration-color: #eab308;
    }
    
    .course {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      margin: 20px 0;
    }
    
    .details {
      margin: 30px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      text-align: left;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      background: #f9fafb;
      border-left: 4px solid #dc2626;
    }
    
    .detail-label {
      font-weight: bold;
      color: #666;
    }
    
    .detail-value {
      color: #333;
    }
    
    .footer {
      margin-top: 50px;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    
    .signature {
      flex: 1;
    }
    
    .signature-line {
      border-top: 2px solid #333;
      margin-top: 60px;
      padding-top: 10px;
      font-weight: bold;
    }
    
    .date {
      text-align: center;
      margin-top: 20px;
      font-style: italic;
      color: #666;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 150px;
      opacity: 0.03;
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
    
    .cert-number {
      position: absolute;
      bottom: 40px;
      right: 60px;
      font-size: 12px;
      color: #999;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .certificate {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">HoaNgữ</div>
    
    <div class="header">
      <div class="logo">📚 HoaNgữ</div>
      <div class="subtitle">Học tiếng Hoa chuẩn Bắc Kinh – Chỉ 90 ngày nói thành thạo</div>
    </div>
    
    <h1 class="title">Chứng chỉ hoàn thành</h1>
    
    <div class="body">
      <p>Chứng nhận rằng</p>
      <div class="name">${certificate.studentName}</div>
      <p>đã hoàn thành xuất sắc khóa học</p>
      <div class="course">${certificate.courseName}</div>
      
      <div class="details">
        <div class="detail-item">
          <span class="detail-label">Cấp độ:</span>
          <span class="detail-value">${certificate.level}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Điểm số:</span>
          <span class="detail-value">${certificate.score}/100</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Thời lượng:</span>
          <span class="detail-value">${certificate.duration}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Ngày hoàn thành:</span>
          <span class="detail-value">${new Date(certificate.completionDate).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
      
      <p style="margin-top: 20px;"><strong>Kỹ năng đã đạt được:</strong></p>
      <p style="margin-top: 10px;">${certificate.skills.join(' • ')}</p>
    </div>
    
    <div class="footer">
      <div class="signature">
        <div class="signature-line">Giảng viên</div>
        <div style="margin-top: 5px;">${certificate.instructorName}</div>
      </div>
      <div class="signature">
        <div class="signature-line">Giám đốc HoaNgữ</div>
        <div style="margin-top: 5px;">Nguyễn Văn A</div>
      </div>
    </div>
    
    <div class="date">
      Cấp ngày ${new Date(certificate.issueDate).toLocaleDateString('vi-VN')}
    </div>
    
    <div class="cert-number">
      Số chứng chỉ: ${certificate.certificateNumber}
    </div>
  </div>
</body>
</html>
    `;
  }

  // Download certificate as HTML file
  downloadHTML(certificate: Certificate): void {
    const html = this.generateHTML(certificate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chung-chi-${certificate.certificateNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Verify certificate
  verify(certificateNumber: string): Certificate | null {
    return this.getAll().find(c => c.certificateNumber === certificateNumber) || null;
  }
}

export const certificateGenerator = new CertificateGenerator();
