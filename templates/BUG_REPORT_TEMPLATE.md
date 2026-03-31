# 🐛 Bug Report Template

**Use this template for all bug reports during testing phases**

---

## Bug Information

**Bug ID:** #[AUTO-INCREMENT]  
**Reported by:** [Name]  
**Date:** [DD/MM/YYYY]  
**Priority:** 
- [ ] 🔴 Critical (Blocks users, payment issues, data loss)
- [ ] 🟡 High (Major features broken, poor UX)
- [ ] 🟢 Medium (Minor features, cosmetic issues)
- [ ] ⚪ Low (Nice to fix, edge cases)

**Status:**
- [ ] 🆕 New
- [ ] 🔍 Investigating
- [ ] 🛠️ In Progress
- [ ] ✅ Fixed
- [ ] 🧪 Testing
- [ ] ✓ Closed

---

## Environment

**Browser/Device:**
- [ ] Chrome (version: ___)
- [ ] Firefox (version: ___)
- [ ] Safari (version: ___)
- [ ] Edge (version: ___)
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] Other: ___

**Operating System:**
- [ ] Windows 11
- [ ] macOS
- [ ] Linux
- [ ] iOS (version: ___)
- [ ] Android (version: ___)

**Screen Size:** ___px × ___px

**Network:** 
- [ ] WiFi
- [ ] 4G/5G
- [ ] Slow 3G (throttled)

---

## Bug Description

### Title
[Clear, concise one-liner describing the issue]

Example: "Payment confirmation email not sent after successful VNPay transaction"

### Expected Behavior
[What should happen?]

### Actual Behavior
[What actually happens?]

### Impact
[How does this affect users?]

---

## Steps to Reproduce

1. Go to [URL or page name]
2. Click on [element]
3. Fill in [form fields]
4. Submit/Click [button]
5. Observe [error/issue]

**Reproducibility:**
- [ ] Always (100%)
- [ ] Sometimes (50-99%)
- [ ] Rarely (<50%)

---

## Screenshots/Videos

**Before:**
[Attach screenshot of expected state]

**After:**
[Attach screenshot showing bug]

**Screen Recording:**
[Link to Loom/video showing steps]

---

## Console Errors

```
[Paste console errors here]
Example:
Uncaught TypeError: Cannot read property 'map' of undefined
    at Courses.tsx:45
```

**Network Tab:**
```
[Any failed API calls]
Example:
GET /api/courses 500 Internal Server Error
```

---

## Additional Context

**Related Issues:** #[issue number]

**User Account:**
- User ID: ___
- Email: ___
- Subscription: Free / Premium

**Data State:**
[Any relevant data that might affect the bug]

**Workaround:**
[Temporary fix if exists]

---

## Developer Notes

**Assigned to:** [Developer name]

**Root Cause:**
[Analysis of why bug occurred]

**Fix Applied:**
[Description of the fix]

**Files Changed:**
- `path/to/file1.tsx`
- `path/to/file2.ts`

**PR Link:** [GitHub PR URL]

**Testing Instructions:**
[How to verify the fix]

---

## Verification

**Tested by:** [QA name]  
**Test Date:** [DD/MM/YYYY]  
**Test Result:**
- [ ] ✅ Fixed - Works as expected
- [ ] ❌ Not Fixed - Issue persists
- [ ] ⚠️ Partially Fixed - Edge cases remain

**Sign-off:** [Name] on [Date]

---

## Prevention

**Why did this happen?**
- [ ] Missing test case
- [ ] Insufficient code review
- [ ] Unclear requirements
- [ ] Edge case not considered
- [ ] Third-party library issue

**How to prevent in future?**
- [ ] Add unit test
- [ ] Add integration test
- [ ] Update documentation
- [ ] Add code comments
- [ ] Refactor code structure

---

## Examples

### Example 1: Critical Bug

**Title:** Users cannot complete payment with VNPay

**Priority:** 🔴 Critical

**Environment:** All browsers, Desktop & Mobile

**Expected:** User clicks "Pay", redirected to VNPay, completes payment, redirected back with success

**Actual:** User clicks "Pay", redirected to VNPay, but after payment, stuck on loading screen

**Steps:**
1. Login to account
2. Navigate to /courses/hsk1-co-ban-90-ngay
3. Click "Enroll Now"
4. Select VNPay payment
5. Complete payment on VNPay
6. Observe: Stuck on loading screen

**Console Error:**
```
TypeError: Cannot read property 'orderId' of undefined
at PaymentCallback.tsx:23
```

**Root Cause:** VNPay callback params not being parsed correctly

**Fix:** Updated PaymentCallback.tsx to handle query params correctly

---

### Example 2: Medium Bug

**Title:** Course thumbnail images not loading on slow 3G

**Priority:** 🟢 Medium

**Environment:** Mobile, Slow 3G

**Expected:** Thumbnails load with skeleton state

**Actual:** Broken image icon shown

**Steps:**
1. Throttle network to Slow 3G (DevTools)
2. Navigate to /courses
3. Observe: Broken images

**Root Cause:** Missing error handling for image load failures

**Fix:** Added `<img onError={fallback} />` handler

---

**Remember:**
✅ Be specific and detailed  
✅ Include all reproduction steps  
✅ Attach screenshots/videos  
✅ Note the impact on users  
✅ Suggest workarounds if possible
