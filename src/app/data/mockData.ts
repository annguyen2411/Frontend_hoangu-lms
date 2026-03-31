// Mock data for HoaNgữ platform

export interface Course {
  id: string;
  slug: string;
  title: string;
  titleVi: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  teacher: Teacher;
  level: string;
  hskLevel?: number;
  duration: string;
  totalLessons: number;
  completionRate?: number;
  price: number;
  salePrice?: number;
  rating: number;
  totalReviews: number;
  tags: string[];
  goals: string[];
  curriculum: Lesson[];
  isFeatured?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  nameVi: string;
  avatar: string;
  bio: string;
  specialization: string;
  isNative?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  titleVi: string;
  duration: string;
  isLocked: boolean;
  type: 'video' | 'quiz' | 'practice' | 'flashcard';
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export const teachers: Teacher[] = [
  {
    id: '1',
    name: 'Trần Minh Hà',
    nameVi: 'Trần Minh Hà',
    avatar: 'https://images.unsplash.com/photo-1740153204804-200310378f2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200',
    bio: 'Giảng viên tiếng Hoa 12 năm kinh nghiệm, từng học tập tại Đại học Bắc Kinh',
    specialization: 'HSK 1-4, Giao tiếp cơ bản',
    isNative: false
  },
  {
    id: '2',
    name: 'Lý Văn Minh (李文明)',
    nameVi: 'Lý Văn Minh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Giáo viên người Trung Quốc, chuẩn giọng Bắc Kinh, chuyên HSK cao cấp',
    specialization: 'HSK 5-6, Tiếng Hoa thương mại',
    isNative: true
  },
  {
    id: '3',
    name: 'Nguyễn Thu Hương',
    nameVi: 'Nguyễn Thu Hương',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Chuyên gia luyện phát âm, chứng chỉ HSK 6 và HSKK cao cấp',
    specialization: 'Phát âm, Giao tiếp du lịch',
    isNative: false
  }
];

export const courses: Course[] = [
  {
    id: '1',
    slug: 'hsk1-co-ban-90-ngay',
    title: 'HSK 1 - Tiếng Hoa Cơ Bản 90 Ngày',
    titleVi: 'HSK 1 - Tiếng Hoa Cơ Bản 90 Ngày',
    description: 'Khóa học HSK 1 giúp bạn nắm vững 150 từ vựng cơ bản, ngữ pháp nền tảng và tự tin giao tiếp trong các tình huống đơn giản chỉ sau 90 ngày.',
    thumbnail: 'https://images.unsplash.com/photo-1765188989413-b0f07270cd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    teacher: teachers[0],
    level: 'Cơ bản',
    hskLevel: 1,
    duration: '90 ngày',
    totalLessons: 45,
    completionRate: 0,
    price: 2990000,
    salePrice: 1990000,
    rating: 4.9,
    totalReviews: 1203,
    tags: ['HSK 1', 'Cơ bản', 'Sơ cấp'],
    goals: [
      'Nắm vững 150 từ vựng HSK 1',
      'Giao tiếp cơ bản trong các tình huống hàng ngày',
      'Đọc hiểu câu đơn giản',
      'Viết chữ Hán cơ bản',
      'Đạt chứng chỉ HSK 1'
    ],
    curriculum: [
      { id: '1-1', title: 'Bài 1: Chào hỏi (你好)', titleVi: 'Bài 1: Chào hỏi', duration: '15 phút', isLocked: false, type: 'video' },
      { id: '1-2', title: 'Bài 2: Giới thiệu bản thân', titleVi: 'Bài 2: Giới thiệu bản thân', duration: '20 phút', isLocked: false, type: 'video' },
      { id: '1-3', title: 'Luyện tập 1', titleVi: 'Luyện tập 1', duration: '10 phút', isLocked: false, type: 'quiz' },
      { id: '1-4', title: 'Bài 3: Số đếm 1-100', titleVi: 'Bài 3: Số đếm 1-100', duration: '18 phút', isLocked: true, type: 'video' },
      { id: '1-5', title: 'Flashcard: Từ vựng bài 1-3', titleVi: 'Flashcard: Từ vựng bài 1-3', duration: '15 phút', isLocked: true, type: 'flashcard' }
    ],
    isFeatured: true
  },
  {
    id: '2',
    slug: 'hsk2-trung-cap',
    title: 'HSK 2 - Nâng Cao Kỹ Năng Giao Tiếp',
    titleVi: 'HSK 2 - Nâng Cao Kỹ Năng Giao Tiếp',
    description: 'Phát triển vốn từ vựng lên 300 từ, nâng cao khả năng giao tiếp và hiểu văn bản đơn giản với HSK 2.',
    thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
    teacher: teachers[0],
    level: 'Trung cấp',
    hskLevel: 2,
    duration: '120 ngày',
    totalLessons: 60,
    price: 3490000,
    salePrice: 2490000,
    rating: 4.8,
    totalReviews: 892,
    tags: ['HSK 2', 'Trung cấp'],
    goals: [
      'Nắm vững 300 từ vựng HSK 2',
      'Giao tiếp tự tin trong cuộc sống hàng ngày',
      'Hiểu các đoạn hội thoại đơn giản',
      'Viết đoạn văn ngắn'
    ],
    curriculum: [],
    isFeatured: true
  },
  {
    id: '3',
    slug: 'tieng-hoa-thuong-mai',
    title: 'Tiếng Hoa Thương Mại - Business Chinese',
    titleVi: 'Tiếng Hoa Thương Mại',
    description: 'Khóa học chuyên sâu cho người đi làm, giúp bạn tự tin giao tiếp trong môi trường kinh doanh và đàm phán.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    teacher: teachers[1],
    level: 'Nâng cao',
    duration: '180 ngày',
    totalLessons: 80,
    price: 5990000,
    salePrice: 4490000,
    rating: 4.9,
    totalReviews: 456,
    tags: ['Thương mại', 'Nâng cao', 'Kinh doanh'],
    goals: [
      'Từ vựng chuyên ngành kinh doanh',
      'Kỹ năng đàm phán và thuyết trình',
      'Viết email công việc chuyên nghiệp',
      'Hiểu văn hóa kinh doanh Trung Quốc'
    ],
    curriculum: [],
    isFeatured: true
  },
  {
    id: '4',
    slug: 'giao-tiep-du-lich',
    title: 'Tiếng Hoa Du Lịch - 30 Ngày Tự Tin',
    titleVi: 'Tiếng Hoa Du Lịch',
    description: 'Học nhanh tiếng Hoa giao tiếp cho du lịch, mua sắm, ăn uống tại Trung Quốc, Đài Loan, Singapore.',
    thumbnail: 'https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=800',
    teacher: teachers[2],
    level: 'Cơ bản',
    duration: '30 ngày',
    totalLessons: 20,
    price: 990000,
    salePrice: 690000,
    rating: 4.7,
    totalReviews: 1567,
    tags: ['Du lịch', 'Giao tiếp', 'Cơ bản'],
    goals: [
      'Giao tiếp cơ bản tại sân bay, khách sạn',
      'Đặt món ăn và mua sắm',
      'Hỏi đường và đi lại',
      'Xử lý tình huống khẩn cấp'
    ],
    curriculum: [],
    isFeatured: false
  },
  {
    id: '5',
    slug: 'hsk3-trung-cap',
    title: 'HSK 3 - Tiếng Hoa Trung Cấp',
    titleVi: 'HSK 3 - Tiếng Hoa Trung Cấp',
    description: 'Nâng cấp lên HSK 3 với 600 từ vựng, đủ để giao tiếp lưu loát trong công việc và học tập.',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    teacher: teachers[1],
    level: 'Trung cấp',
    hskLevel: 3,
    duration: '150 ngày',
    totalLessons: 75,
    price: 3990000,
    salePrice: 2990000,
    rating: 4.8,
    totalReviews: 678,
    tags: ['HSK 3', 'Trung cấp'],
    goals: [
      'Nắm vững 600 từ vựng HSK 3',
      'Giao tiếp trong công việc và học tập',
      'Đọc hiểu báo chí và sách đơn giản',
      'Viết đoạn văn dài'
    ],
    curriculum: [],
    isFeatured: true
  },
  {
    id: '6',
    slug: 'luyen-phat-am-chuan',
    title: 'Luyện Phát Âm Chuẩn Bắc Kinh',
    titleVi: 'Luyện Phát Âm Chuẩn',
    description: 'Khóa học chuyên sâu về thanh điệu và phát âm với AI chấm điểm và giáo viên bản xứ hướng dẫn.',
    thumbnail: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800',
    teacher: teachers[1],
    level: 'Mọi cấp độ',
    duration: '60 ngày',
    totalLessons: 40,
    price: 1990000,
    salePrice: 1490000,
    rating: 4.9,
    totalReviews: 2134,
    tags: ['Phát âm', 'Thanh điệu', 'AI'],
    goals: [
      'Phát âm chuẩn 4 thanh điệu',
      'Luyện nói với AI chấm điểm',
      'Sửa lỗi phát âm phổ biến',
      'Nghe và phân biệt thanh điệu'
    ],
    curriculum: [],
    isFeatured: false
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    comment: 'Khóa học rất chi tiết và dễ hiểu. Giáo viên nhiệt tình, hỗ trợ tận tình. Sau 3 tháng tôi đã thi đỗ HSK 1 với điểm cao!',
    date: '2026-03-10'
  },
  {
    id: '2',
    userName: 'Lê Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    rating: 5,
    comment: 'Flashcard và AI chấm phát âm rất hay. Mình học mỗi ngày 30 phút vẫn tiến bộ rõ rệt.',
    date: '2026-03-08'
  },
  {
    id: '3',
    userName: 'Trần Đức Huy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    rating: 4,
    comment: 'Nội dung tốt, video chất lượng. Có điều giá hơi cao so với các khóa khác.',
    date: '2026-03-05'
  }
];

export const communityStats = {
  totalStudents: 12450,
  averageRating: 4.8,
  totalCourses: 24,
  successRate: 94
};

export const features = [
  {
    icon: 'Users',
    title: 'Giáo viên Việt + Bản xứ',
    description: 'Đội ngũ giảng viên người Việt và người Trung có chứng chỉ quốc tế'
  },
  {
    icon: 'Mic',
    title: 'AI chấm phát âm',
    description: 'Công nghệ AI giúp bạn luyện nói chuẩn như người bản xứ'
  },
  {
    icon: 'Brain',
    title: 'Flashcard Spaced Repetition',
    description: 'Ghi nhớ từ vựng hiệu quả với thuật toán lặp lại ngắt quãng'
  },
  {
    icon: 'Award',
    title: 'Chứng chỉ HSK chính thống',
    description: 'Luyện thi HSK 1-6 với tài liệu chuẩn Bộ Giáo dục TQ'
  }
];
