# ✅ Testing Checklist - HoaNgữ Platform

**Use this for each testing cycle**

---

## 🔐 Authentication & User Management

### Registration
- [ ] Register with valid email/password
- [ ] Register with invalid email format → shows error
- [ ] Register with weak password → shows error
- [ ] Register with existing email → shows error
- [ ] Email validation sent (if implemented)
- [ ] User redirected to onboarding/dashboard
- [ ] User data saved correctly in database

### Login
- [ ] Login with correct credentials → success
- [ ] Login with wrong password → error message
- [ ] Login with non-existent email → error message
- [ ] Login persists across page refresh
- [ ] Login persists across tabs (multi-tab sync)
- [ ] Logout works and clears session
- [ ] "Remember me" checkbox works (if implemented)

### Password Management
- [ ] Forgot password sends reset email
- [ ] Reset password link works
- [ ] Reset password with valid token works
- [ ] Reset password with expired token → error
- [ ] Change password in settings works
- [ ] Old password still invalid after change

### OAuth/Social Login (if implemented)
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] Profile data synced correctly
- [ ] Avatar pulled from social account

### Profile
- [ ] View own profile
- [ ] Edit profile information
- [ ] Upload avatar image
- [ ] Avatar preview works
- [ ] Save changes persists
- [ ] Cancel changes reverts

---

## 📚 Course Management

### Browse Courses
- [ ] All courses load on /courses page
- [ ] Course cards show correct info (title, price, teacher, etc)
- [ ] Thumbnails load correctly
- [ ] Featured courses displayed first (if applicable)
- [ ] Pagination works (if implemented)
- [ ] Infinite scroll works (if implemented)

### Search & Filters
- [ ] Search by course name works
- [ ] Search by keywords works
- [ ] Fuzzy search tolerates typos
- [ ] Filter by level (Cơ bản, Trung cấp, Nâng cao)
- [ ] Filter by HSK level (1-6)
- [ ] Filter by duration
- [ ] Filter by price range
- [ ] Multiple filters work together
- [ ] Clear filters button works
- [ ] Filter chips show active filters
- [ ] Remove filter chip works

### Course Detail
- [ ] Access course detail page via slug
- [ ] All course information displayed
- [ ] Teacher information shown
- [ ] Curriculum/lessons list displayed
- [ ] Reviews displayed (if implemented)
- [ ] Enroll button visible
- [ ] Price displayed correctly
- [ ] Sale price shown if applicable
- [ ] Course preview video works (if available)

### Enrollment
- [ ] Enroll in free course → immediate access
- [ ] Enroll in paid course → payment flow
- [ ] Already enrolled course → shows "Continue Learning"
- [ ] Enrollment adds course to "My Courses"
- [ ] Enrollment tracked in database
- [ ] Cannot enroll twice in same course

---

## 🎓 Learning Experience

### Lesson Access
- [ ] Access enrolled course lessons
- [ ] Locked lessons cannot be accessed
- [ ] Free preview lessons accessible without enrollment
- [ ] Lesson order displayed correctly
- [ ] Lesson icons/types shown (video, quiz, flashcard)

### Video Lessons
- [ ] Video player loads
- [ ] Play/pause works
- [ ] Volume control works
- [ ] Fullscreen works
- [ ] Playback speed control (if implemented)
- [ ] Subtitles toggle (if implemented)
- [ ] Video progress saves (resume on return)
- [ ] Marking lesson complete works
- [ ] Auto-advance to next lesson (optional)

### Quizzes
- [ ] Quiz questions load
- [ ] Single choice questions work
- [ ] Multiple choice questions work
- [ ] Answer submission works
- [ ] Score calculated correctly
- [ ] Feedback shown (correct/incorrect)
- [ ] Retry quiz works
- [ ] Quiz results saved

### Progress Tracking
- [ ] Course progress percentage updates
- [ ] Lesson completion marks visible
- [ ] Progress bar reflects completion
- [ ] Progress syncs across devices
- [ ] Progress shown in dashboard

---

## 🎮 Gamification

### XP & Levels
- [ ] XP earned for completing lessons
- [ ] XP earned for completing quizzes
- [ ] XP earned for daily streak
- [ ] Level up happens at correct XP threshold
- [ ] Level up notification/animation shown
- [ ] User level displayed correctly

### Quests
- [ ] Daily quests load
- [ ] Weekly quests load
- [ ] Quest progress updates correctly
- [ ] Quest completion detected
- [ ] Rewards granted (XP, coins, badges)
- [ ] Quest timer/countdown works
- [ ] Daily quests reset at midnight

### Badges
- [ ] Badge unlock triggers correctly
- [ ] Badge notification shown
- [ ] Badge displayed in profile
- [ ] Badge showcase works
- [ ] Badge filtering works (category, rarity)

### Leaderboard
- [ ] Leaderboard loads top users
- [ ] Current user position highlighted
- [ ] Rankings update correctly
- [ ] XP totals displayed
- [ ] Level shown for each user
- [ ] Ranking change indicators (▲▼)

### Shop
- [ ] Shop items displayed
- [ ] Coin balance shown
- [ ] Purchase item with enough coins
- [ ] Cannot purchase with insufficient coins
- [ ] Purchase confirmation modal
- [ ] Item added to inventory after purchase
- [ ] Avatar/theme items applied

---

## 💳 Payment & Billing

### Checkout Flow
- [ ] Add course to cart (if cart exists)
- [ ] Apply coupon code
- [ ] Coupon discount calculated correctly
- [ ] Invalid coupon rejected
- [ ] Payment method selection
- [ ] Order summary displayed correctly

### VNPay Payment
- [ ] VNPay payment URL generated
- [ ] Redirect to VNPay works
- [ ] Payment with test card succeeds
- [ ] Return to app after payment
- [ ] Payment status verified
- [ ] Order marked as paid
- [ ] Course access granted
- [ ] Receipt email sent

### Momo Payment
- [ ] Momo payment URL generated
- [ ] QR code displayed (if applicable)
- [ ] Deep link works on mobile
- [ ] Payment success flow
- [ ] Payment failure handled

### ZaloPay Payment (if implemented)
- [ ] ZaloPay integration works
- [ ] Payment verified

### Order Management
- [ ] View order history
- [ ] Order details displayed
- [ ] Invoice/receipt downloadable
- [ ] Refund request works (if implemented)

---

## 📊 Dashboard & Analytics

### Overview Dashboard
- [ ] Stats cards load (XP, level, streak, etc)
- [ ] Progress chart displays
- [ ] Study time chart displays
- [ ] Recent activity feed loads
- [ ] Upcoming lessons shown
- [ ] Recommendations displayed

### My Courses
- [ ] Enrolled courses listed
- [ ] Course progress shown
- [ ] "Continue Learning" redirects correctly
- [ ] Filter courses (in progress, completed)
- [ ] Sort courses (by progress, date)

### Schedule/Calendar
- [ ] Calendar view loads
- [ ] Study sessions displayed
- [ ] Add study session works
- [ ] Edit study session works
- [ ] Delete study session works
- [ ] Reminders trigger (if implemented)

### Analytics Page
- [ ] Study time graph displays
- [ ] Progress over time chart
- [ ] Skill breakdown chart
- [ ] Comparative analytics (vs average)
- [ ] Export data works (if implemented)

---

## 🗂️ Flashcards

### Flashcard Management
- [ ] Create new flashcard
- [ ] Edit flashcard
- [ ] Delete flashcard
- [ ] Tag flashcard
- [ ] Search flashcards
- [ ] Filter by deck/tag

### Flashcard Review
- [ ] Flashcard flip works
- [ ] Rate difficulty (0-5)
- [ ] Spaced repetition algorithm works
- [ ] Due flashcards shown
- [ ] Review streak tracked
- [ ] Progress saved

### Flashcard Decks
- [ ] Create deck
- [ ] Add cards to deck
- [ ] Study entire deck
- [ ] Deck statistics shown

---

## 📜 Certificates

### Certificate Generation
- [ ] Certificate generated on course completion
- [ ] Certificate includes user name
- [ ] Certificate includes course name
- [ ] Certificate includes completion date
- [ ] Certificate includes score
- [ ] Certificate includes unique number
- [ ] Certificate downloadable as PDF
- [ ] Certificate shareable

### Certificate Verification
- [ ] Public verification URL works
- [ ] QR code scannable
- [ ] Verification page displays certificate
- [ ] Invalid certificate number → error

---

## 👥 Community & Social

### Community Feed
- [ ] Posts load in feed
- [ ] Create new post
- [ ] Upload image with post
- [ ] Like post
- [ ] Unlike post
- [ ] Comment on post
- [ ] Delete own comment
- [ ] Report inappropriate content (if implemented)

### User Profiles
- [ ] View other user profiles
- [ ] Follow/unfollow users (if implemented)
- [ ] View user's achievements
- [ ] View user's completed courses

### Study Groups (if implemented)
- [ ] Create study group
- [ ] Join study group
- [ ] Post in group
- [ ] Group chat works

---

## ⚙️ Settings

### Account Settings
- [ ] Update email
- [ ] Update password
- [ ] Update phone number
- [ ] Delete account (with confirmation)

### Notification Settings
- [ ] Toggle email notifications
- [ ] Toggle push notifications (if PWA)
- [ ] Set study reminders
- [ ] Quiet hours work

### Preferences
- [ ] Change language (if i18n)
- [ ] Change theme (if dark mode)
- [ ] Timezone setting
- [ ] Privacy settings

---

## 📱 Mobile & Responsive

### Mobile Navigation
- [ ] Mobile menu opens/closes
- [ ] All pages accessible on mobile
- [ ] Bottom navigation works (if applicable)
- [ ] Gesture navigation (swipe, etc)

### Responsive Design
- [ ] Layout adapts to phone (375px)
- [ ] Layout adapts to tablet (768px)
- [ ] Layout adapts to desktop (1440px)
- [ ] Images scale correctly
- [ ] Text readable on all sizes
- [ ] Buttons tap-able (min 44px)
- [ ] Forms usable on mobile

### Touch Interactions
- [ ] Tap works instead of hover
- [ ] Swipe gestures work
- [ ] Pull to refresh (if implemented)
- [ ] Long press actions work

---

## 🚀 Performance

### Page Load Speed
- [ ] Homepage loads <3s
- [ ] Course page loads <3s
- [ ] Dashboard loads <3s
- [ ] No layout shift (CLS <0.1)

### Interactions
- [ ] Buttons respond <100ms
- [ ] Form submissions <1s
- [ ] Search results <500ms
- [ ] Navigation transitions smooth

### Assets
- [ ] Images optimized (WebP)
- [ ] Lazy loading works
- [ ] Code splitting works
- [ ] No unused JS/CSS

---

## ♿ Accessibility

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys navigate menus/lists
- [ ] Focus indicator visible

### Screen Reader
- [ ] Headings announced correctly
- [ ] Buttons have clear labels
- [ ] Forms have labels
- [ ] Images have alt text
- [ ] Errors announced
- [ ] Loading states announced

### Visual
- [ ] Color contrast ≥4.5:1 (text)
- [ ] Color contrast ≥3:1 (UI elements)
- [ ] Text resizable (200%)
- [ ] No text in images (or alt provided)

---

## 🔒 Security

### Input Validation
- [ ] SQL injection protected
- [ ] XSS attacks prevented
- [ ] CSRF tokens used (backend)
- [ ] File upload validated (type, size)
- [ ] Email format validated
- [ ] Phone format validated

### Authentication Security
- [ ] Passwords hashed (bcrypt)
- [ ] Session tokens secure
- [ ] HTTPS enforced
- [ ] Logout on all devices works

### Data Privacy
- [ ] User data encrypted in transit (HTTPS)
- [ ] Sensitive data not in localStorage
- [ ] No API keys exposed in client
- [ ] GDPR compliance (if EU users)

---

## 🌐 Cross-Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest) - All features work
- [ ] Firefox (latest) - All features work
- [ ] Safari (latest) - All features work
- [ ] Edge (latest) - All features work

### Mobile Browsers
- [ ] Chrome Mobile - Works
- [ ] Safari iOS - Works
- [ ] Samsung Internet - Works
- [ ] Firefox Mobile - Works

### Common Issues to Check
- [ ] CSS Grid/Flexbox supported
- [ ] ES6 features work
- [ ] LocalStorage works
- [ ] Fetch API works
- [ ] Video playback works

---

## 📧 Email & Notifications

### Transactional Emails
- [ ] Welcome email sent
- [ ] Email verification sent
- [ ] Password reset sent
- [ ] Payment confirmation sent
- [ ] Course completion email sent
- [ ] Certificate email sent

### Marketing Emails
- [ ] Newsletter signup works
- [ ] Unsubscribe link works
- [ ] Email preferences respected

### In-App Notifications
- [ ] Badge unlock notification
- [ ] Quest completion notification
- [ ] Level up notification
- [ ] Friend request (if implemented)
- [ ] Mark as read works
- [ ] Notification bell count correct

---

## 🔧 Error Handling

### User-Facing Errors
- [ ] Network error → retry option
- [ ] 404 page → back to home
- [ ] 500 error → error page with support
- [ ] Payment failed → clear message
- [ ] Form validation → inline errors
- [ ] API timeout → user notified

### Developer Errors
- [ ] Errors logged to Sentry
- [ ] Stack traces captured
- [ ] User context attached
- [ ] Environment info included

---

## 📊 Analytics & Tracking

### Event Tracking
- [ ] Page views tracked
- [ ] Sign up tracked
- [ ] Login tracked
- [ ] Course enrollment tracked
- [ ] Lesson completion tracked
- [ ] Quiz completion tracked
- [ ] Payment tracked
- [ ] Errors tracked

### User Properties
- [ ] User ID tracked
- [ ] User tier (free/premium)
- [ ] Registration date
- [ ] Last active date

---

## 🧪 Edge Cases & Stress Testing

### Data Edge Cases
- [ ] Empty states handled (no courses, no progress)
- [ ] Very long text handled (course titles, etc)
- [ ] Special characters in input (', ", <, >)
- [ ] Unicode characters (Chinese, emoji)
- [ ] Null/undefined values handled

### Concurrent Actions
- [ ] Multiple tabs → data syncs
- [ ] Rapid clicks → debounced
- [ ] Multiple file uploads → queued
- [ ] Concurrent API calls → handled

### Stress Testing
- [ ] 100 courses → page still loads fast
- [ ] 1000 flashcards → review works
- [ ] Long study sessions → no memory leaks
- [ ] Slow network (3G) → graceful degradation

---

## ✅ Sign-off

**Tested by:** _______________  
**Date:** ___/___/______  
**Platform:** Desktop / Mobile / Tablet  
**Browser:** _______________  
**Overall Status:** 
- [ ] ✅ All tests passed
- [ ] ⚠️ Minor issues (documented)
- [ ] ❌ Critical issues found

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Total Tests:** ___  
**Passed:** ___  
**Failed:** ___  
**Pass Rate:** ___%

---

## 📝 Notes for Testers

### How to Use This Checklist

1. **Print or use digitally** - Mark items as you test
2. **Test systematically** - Don't skip around
3. **Document failures** - Use bug report template
4. **Retest fixes** - Verify bugs are resolved
5. **Sign off** - Complete sign-off section

### Testing Best Practices

✅ **DO:**
- Clear browser cache before testing
- Test with real data (not just demo)
- Try to break things
- Test edge cases
- Note UX issues even if not "bugs"
- Take screenshots of issues
- Test on different networks (WiFi, 4G, 3G)

❌ **DON'T:**
- Rush through tests
- Skip steps
- Test only happy paths
- Ignore small issues
- Forget to document findings

### Priority Levels

🔴 **Critical** = Must fix before launch  
🟡 **High** = Fix before beta ends  
🟢 **Medium** = Fix if time allows  
⚪ **Low** = Add to backlog

---

**Remember:** Good testing prevents bad user experiences! 🚀
