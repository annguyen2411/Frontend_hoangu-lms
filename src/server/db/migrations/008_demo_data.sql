-- Demo Data for Testing Learn Page
-- Run this to populate sample course, lessons, vocabulary, exercises

-- =====================================================
-- 1. DEMO COURSE (Tiếng Trung Cơ Bản)
-- =====================================================

-- Insert demo course
INSERT INTO courses (
  id, title, slug, description, thumbnail_url, price_vnd, 
  course_type, is_free_for_all, category, level, 
  total_lessons, duration_hours, is_published, created_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
  'Tiếng Trung Cơ Bản - HSK 1',
  'tieng-trung-co-ban-hsk1',
  'Khóa học Tiếng Trung cơ bản dành cho người mới bắt đầu. Học từ vựng, ngữ pháp và giao tiếp cơ bản theo chuẩn HSK 1. Sau khóa học, bạn có thể giao tiếp đơn giản về các chủ đề thường ngày.',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
  0,
  'free',
  true,
  'Tiếng Trung',
  'beginner',
  10,
  5,
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. DEMO LESSONS
-- =====================================================

INSERT INTO lessons (id, course_id, title, description, order_index, video_id, video_duration, is_free, is_published) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chào hỏi và giới thiệu', 'Học cách chào hỏi, giới thiệu bản thân và hỏi tên người khác. Cách sử dụng các câu chào phổ biến trong tiếng Trung.', 1, '8jD6mJXkfes', 900, true, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Số đếm từ 1-10', 'Học cách đếm số từ 1 đến 10 và cách hỏi giá tiền cơ bản.', 2, '8jD6mJXkfes', 720, true, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gia đình', 'Tên gọi các thành viên trong gia đình: bố, mẹ, anh chị em...', 3, '8jD6mJXkfes', 840, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Màu sắc', 'Tên các màu sắc cơ bản trong tiếng Trung.', 4, '8jD6mJXkfes', 660, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Thời gian và ngày tháng', 'Cách hỏi và trả lời về thời gian, ngày, tháng, năm.', 5, '8jD6mJXkfes', 960, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Địa điểm và phương hướng', 'Học về các địa điểm như nhà cửa, thành phố và cách hỏi đường.', 6, '8jD6mJXkfes', 780, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mua sắm và giao dịch', 'Cách hỏi giá, trả giá và mua bán cơ bản.', 7, '8jD6mJXkfes', 900, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Thức ăn và đồ uống', 'Tên các món ăn, đồ uống phổ biến và cách gọi món.', 8, '8jD6mJXkfes', 840, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Di chuyển và giao thông', 'Cách hỏi đường, sử dụng phương tiện giao thông.', 9, '8jD6mJXkfes', 720, false, true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a1b', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ôn tập và thực hành', 'Ôn tập tổng hợp các kiến thức đã học và thực hành giao tiếp.', 10, '8jD6mJXkfes', 1200, false, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. DEMO VOCABULARY (Lesson 1 - Greetings)
-- =====================================================

INSERT INTO vocabulary (id, lesson_id, word, pinyin, meaning, example, example_translation, audio_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '你好', 'nǐ hǎo', 'Xin chào', '你好，我叫小明。', 'Xin chào, tôi tên là Tiểu Minh.', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '早上好', 'zǎo shang hǎo', 'Chào buổi sáng', '早上好！', 'Chào buổi sáng!', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '晚上好', 'wǎn shang hǎo', 'Chào buổi tối', '晚上好，你好吗？', 'Chào buổi tối, bạn khỏe không?', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '再见', 'zài jiàn', 'Tạm biệt', '再见，明天见！', 'Tạm biệt, ngày mai gặp!', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '谢谢', 'xiè xie', 'Cảm ơn', '谢谢你！', 'Cảm ơn bạn!', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '不客气', 'bù kè qi', 'Không có gì', '不客气！', 'Không có gì!', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '对不起', 'duì bu qǐ', 'Xin lỗi', '对不起，我来晚了。', 'Xin lỗi, tôi đến muộn.', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '没关系', 'méi guān xi', 'Không sao', '没关系。', 'Không sao.', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '请问', 'qǐng wèn', 'Xin hỏi', '请问，这个多少钱？', 'Xin hỏi, cái này bao nhiêu tiền?', NULL),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a2a', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '我', 'wǒ', 'Tôi', '我是学生。', 'Tôi là sinh viên.', NULL);

-- =====================================================
-- 4. DEMO EXERCISES (Lesson 1)
-- =====================================================

INSERT INTO grammar_exercises (id, lesson_id, question, question_type, options, correct_answer, explanation, difficulty, created_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '"你好" có nghĩa là gì?', 'multiple_choice', '["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"]', 'Xin chào', '你好 (nǐ hǎo) là cách chào hỏi phổ biến nhất trong tiếng Trung', 'easy', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '"谢谢" có nghĩa là gì?', 'multiple_choice', '["Xin chào", "Tạm biệt", "Cảm ơn", "Xin lỗi"]', 'Cảm ơn', '谢谢 (xiè xie) có nghĩa là cảm ơn trong tiếng Trung', 'easy', NOW()),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Cách nói "Tạm biệt" trong tiếng Trung?', 'multiple_choice', '["你好", "再见", "谢谢", "对不起"]', '再见', '再见 (zài jiàn) có nghĩa là tạm biệt', 'easy', NOW());

-- =====================================================
-- 5. DEMO USER (Test Account)
-- =====================================================

INSERT INTO users (id, email, password_hash, full_name, role, language, created_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'test@hoangu.tech', '$2a$10$YourHashHere12345678901234567890123456789012', 'Test User', 'student', 'vi', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. DEMO ENROLLMENT
-- =====================================================

INSERT INTO enrollments (id, user_id, course_id, enrolled_at, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), true)
ON CONFLICT (id) DO NOTHING;
