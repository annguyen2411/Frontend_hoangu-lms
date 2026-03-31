# 🎓 HoaNgữ - Nền Tảng Học Tiếng Hoa Trực Tuyến

> "Học tiếng Hoa chuẩn Bắc Kinh – Chỉ 90 ngày nói thành thạo"

**Tech Stack:** React + TypeScript + Tailwind CSS v4  
**Design:** Modern Vibrant (Electric Blue + Vibrant Purple)  
**Status:** 🚧 Development

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:5173
```

---

## 📚 Development Guides

**🗺️ Build from Demo to Product:**

1. **[DEVELOPMENT_ROADMAP.md](/DEVELOPMENT_ROADMAP.md)** ⭐ START HERE
   - Complete 8-12 week plan
   - Week-by-week breakdown
   - Success metrics & budget

2. **[BACKEND_INTEGRATION_GUIDE.md](/BACKEND_INTEGRATION_GUIDE.md)** (Week 1-2)
   - Supabase setup step-by-step
   - Database schema & RLS
   - Authentication implementation
   - React Query integration

3. **[CONTENT_CREATION_GUIDE.md](/CONTENT_CREATION_GUIDE.md)** (Week 3-4)
   - HSK 1 curriculum plan
   - Video recording & editing
   - Quiz & flashcard creation
   - Quality standards

4. **[PAYMENT_INTEGRATION_GUIDE.md](/PAYMENT_INTEGRATION_GUIDE.md)** (Week 5-6)
   - VNPay setup & integration
   - Checkout flow implementation
   - Testing & security
   - Production deployment

5. **[DEPLOYMENT_GUIDE.md](/DEPLOYMENT_GUIDE.md)** (Week 9)
   - Vercel deployment
   - Domain configuration
   - Analytics setup
   - Production checklist

6. **[LAUNCH_CHECKLIST.md](/LAUNCH_CHECKLIST.md)** (Week 10-12)
   - Pre-launch preparation
   - Soft launch strategy
   - Public launch plan
   - Marketing tactics

**📖 Summary:** [GUIDES_SUMMARY.md](/GUIDES_SUMMARY.md) - Overview of all guides & how to use them

---

## ✨ Features

### Core Learning Platform
- 🔐 **Authentication** - Login/Signup with OAuth/OTP support
- 📚 **Course Catalog** - Browse, search, filter courses
- 🎓 **Learning Experience** - Video lessons, quizzes, progress tracking
- 📊 **Dashboard** - Overview, my courses, analytics
- 📜 **Certificates** - Generate HSK certificates
- 🗂️ **Flashcards** - Spaced repetition system

### Gamification System
- 🎮 **XP & Levels** - Earn points, level up (1-50+)
- 🏆 **Quests** - Daily, weekly, achievement-based missions
- 🥇 **Badges** - 20+ unlockable achievements
- 🏪 **Shop** - Spend coins on avatars, themes
- 📊 **Leaderboard** - Compete with other learners
- 🔥 **Streak Tracking** - Daily study consistency

### Community & Social
- 👥 **Activity Feed** - Posts, comments, likes
- 💬 **Discussions** - Course Q&A, forums
- 📱 **Social Sharing** - Share achievements

### Advanced Features
- 🔍 **Smart Search** - Fuzzy matching, multi-field search
- 🎨 **Advanced Filters** - Level, HSK, duration, price
- ⌨️ **Command Palette** (⌘K) - Quick actions
- 🍞 **Breadcrumbs** - Enhanced navigation
- 📱 **PWA Support** - Offline mode, installable
- 🔔 **Notifications** - Real-time alerts
- 📊 **Analytics** - Study time, progress charts
- 🌙 **Theme Support** - Modern Vibrant theme

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4.0
- **Routing:** React Router 7
- **Animations:** Motion (Framer Motion)
- **Charts:** Recharts
- **Icons:** Lucide React
- **UI Components:** Radix UI + shadcn/ui
- **Build Tool:** Vite 6

### Backend (Planned)
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage

### Payment Integration
- **Primary:** VNPay
- **Secondary:** Momo, ZaloPay (planned)

---

## 📂 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── pages/              # 20+ page components
│   │   ├── components/         # 50+ reusable components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── quests/        # Gamification components
│   │   │   ├── admin/         # Admin panel components
│   │   │   └── ...
│   │   ├── contexts/          # Auth, Theme contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   ├── data/              # Mock data (temporary)
│   │   └── routes.tsx         # App routing
│   │
│   └── styles/
│       ├── index.css          # Main styles
│       ├── theme.css          # Theme tokens
│       ├── tailwind.css       # Tailwind base
│       └── fonts.css          # Font imports
│
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── offline.html           # Offline fallback
│
├── templates/
│   ├── BUG_REPORT_TEMPLATE.md
│   └── TESTING_CHECKLIST.md
│
├── TODO.md                    # Development tasks
├── ATTRIBUTIONS.md            # Credits & licenses
└── guidelines/
    └── Guidelines.md          # Coding guidelines
```

---

## 🎨 Design System

### Colors
- **Primary:** Electric Blue `#3b82f6`
- **Secondary:** Vibrant Purple `#8b5cf6`
- **Success:** `#10b981`
- **Warning:** `#f59e0b`
- **Error:** `#ef4444`

### Theme
- **Style:** Modern Vibrant
- **Typography:** Clean, readable
- **Spacing:** Consistent 8px grid
- **Components:** Cards, badges, buttons with gradients

### Responsive
- **Desktop:** 1440px+
- **Tablet:** 768px - 1023px
- **Mobile:** 375px+

---

## 📊 Project Stats

- **Pages:** 20+
- **Components:** 50+
- **Routes:** 27
- **Lines of Code:** ~15,000+
- **Gamification Elements:** 7 types
- **Admin Pages:** 7

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (Vite)

# Build
npm run build            # Production build

# Preview
npm run preview          # Preview production build
```

---

## 📱 Features in Detail

### Smart Search
- Fuzzy matching (tolerates typos)
- Multi-field search (title, description, teacher)
- Real-time results
- Recent searches saved
- Keyboard navigation

### Advanced Filters
- **Level:** Cơ bản, Trung cấp, Nâng cao
- **HSK:** Level 1-6
- **Duration:** Custom range
- **Price:** Min-max slider
- Filter chips with remove

### Progress Tracking
- Per-lesson completion
- Course progress percentage
- XP earned & level progress
- Study time analytics
- Streak tracking
- Weekly/monthly reports

### Gamification
- **XP System:** Earn 10-100 XP per activity
- **Levels:** 1-50+ with increasing requirements
- **Quests:** 20+ unique missions
- **Badges:** Achievement system
- **Shop:** 15+ items to unlock
- **Leaderboard:** Top 100 users
- **Daily Rewards:** Login bonuses

---

## 🎯 Development Roadmap

### Phase 1: Core Features ✅
- ✅ Course catalog & browsing
- ✅ Learning interface
- ✅ Gamification system
- ✅ User dashboard
- ✅ Responsive design

### Phase 2: Backend Integration (In Progress)
- ⏳ Supabase setup
- ⏳ Real authentication
- ⏳ Database migration
- ⏳ API integration

### Phase 3: Payment & Launch
- 📅 VNPay integration
- 📅 Order management
- 📅 Beta testing
- 📅 Public launch

### Phase 4: Advanced Features (v2.0)
- 📅 AI pronunciation checker
- 📅 Live classes
- 📅 Mobile app (React Native)
- 📅 Advanced analytics

---

## 🧪 Testing

See [`/templates/TESTING_CHECKLIST.md`](/templates/TESTING_CHECKLIST.md) for:
- 200+ test cases
- Feature coverage
- Browser compatibility
- Performance benchmarks

---

## 📝 Documentation

- **TODO:** [`/TODO.md`](/TODO.md) - Development tasks
- **Bug Reports:** [`/templates/BUG_REPORT_TEMPLATE.md`](/templates/BUG_REPORT_TEMPLATE.md)
- **Testing:** [`/templates/TESTING_CHECKLIST.md`](/templates/TESTING_CHECKLIST.md)
- **Guidelines:** [`/guidelines/Guidelines.md`](/guidelines/Guidelines.md)
- **Credits:** [`/ATTRIBUTIONS.md`](/ATTRIBUTIONS.md)

---

## ⚡ Performance

### Targets
- **Bundle Size:** <300KB (gzipped)
- **First Paint:** <1.5s
- **Time to Interactive:** <2s
- **Lighthouse Score:** >90

### Optimizations
- Code splitting by route
- Lazy loading images
- PWA with service worker
- Optimized fonts
- Minified assets

---

## 🌟 Key Highlights

### User Experience
- **Intuitive Navigation** - Clear hierarchy, breadcrumbs
- **Responsive Design** - Perfect on all devices
- **Fast & Smooth** - Optimized performance
- **Engaging UI** - Modern, vibrant aesthetics
- **Accessibility** - WCAG compliant components

### Developer Experience
- **TypeScript** - Type safety
- **Component Library** - Reusable UI
- **Tailwind v4** - Modern CSS
- **Hot Reload** - Fast iteration
- **Clean Code** - Well-structured

---

## 📦 Dependencies

### Core
```json
{
  "react": "18.3.1",
  "react-router": "7.13.0",
  "tailwindcss": "4.1.12"
}
```

### UI & Components
- `@radix-ui/*` - Accessible components
- `lucide-react` - Icons
- `recharts` - Charts
- `motion` - Animations
- `sonner` - Toast notifications

### Utilities
- `date-fns` - Date formatting
- `class-variance-authority` - Component variants
- `clsx` + `tailwind-merge` - Class management

See [`package.json`](/package.json) for complete list.

---

## 🚨 Important Notes

### Current Status
⚠️ **Development Phase - Using Mock Data**

This is a prototype with:
- Simulated backend (localStorage)
- Mock course data
- No real payment processing
- Demo user accounts

### Production Readiness
Before launch, need to:
- [ ] Integrate Supabase backend
- [ ] Setup real authentication
- [ ] Configure VNPay payment
- [ ] Create actual course content
- [ ] Security audit
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🎯 Mission & Vision

### Mission
> Giúp người Việt học tiếng Hoa hiệu quả, dễ dàng và thú vị thông qua công nghệ hiện đại và phương pháp giảng dạy khoa học.

### Vision
Trở thành nền tảng học tiếng Hoa #1 tại Việt Nam

### Values
- 🎯 **User-First** - Tập trung trải nghiệm người học
- 🚀 **Ship Fast** - Ra mắt nhanh, cải thiện liên tục
- 💡 **Innovation** - Công nghệ tiên tiến
- 🤝 **Community** - Cộng đồng học tập mạnh mẽ
- 📈 **Growth** - Phát triển không ngừng

---

## 📜 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

Built with amazing open-source tools:
- React Team
- Tailwind CSS
- Radix UI / shadcn/ui
- Vite
- And many more (see [`ATTRIBUTIONS.md`](/ATTRIBUTIONS.md))

---

## 📞 Contact

- **Website:** [Coming soon]
- **Email:** [Coming soon]
- **Support:** [Coming soon]

---

**Last Updated:** March 14, 2026  
**Version:** 0.0.2-alpha  
**Status:** 🚧 Active Development

---

**Let's build something amazing! 🚀**