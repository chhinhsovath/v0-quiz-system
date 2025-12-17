# Login Page Design - PLP-TMS Style

## Design Reference
Based on: https://plp-tms.moeys.gov.kh/login

## Key Features Implemented

### 1. **Dual Logo Header**
- MOEYS Logo (Ministry of Education, Youth and Sports)
- PLP Logo (Partner organization)
- Circular design with gradient backgrounds
- Labels underneath each logo

### 2. **Bilingual Title**
- Khmer: "ប្រព័ន្ធតាមដានវគ្គសិក្សា"
- English: "Course Tracking System"
- Subtitle: "Quiz and Course Management System"

### 3. **Authentication Fields**
- **Phone Number** field instead of email
  - Khmer: "លេខទូរសព្ទ"
  - English: "Phone Number"
- **PIN Code** field (4 digits)
  - Khmer: "លេខកូដសម្ងាត់ (៤ ខ្ទង់ចុងក្រោយ)"
  - English: "PIN (Last 4 digits)"
  - Max length: 4 characters

### 4. **Login Button**
- Khmer: "ចូលប្រព័ន្ធ"
- English: "Login"
- Full width with large height (h-12)

### 5. **Registration Link**
- Text: "មិនមានគណនីទេ? ចុះឈ្មោះឥឡូវនេះ" (KM)
- Text: "No account? Register now" (EN)
- Links to `/register` page

### 6. **Footer Copyright**
- Khmer: "© ២០២៥ ក្រសួងអប់រំ យុវជន និងកីឡា"
- English: "© 2025 Ministry of Education, Youth and Sports"

### 7. **Language Switcher**
- Position: Absolute top-right
- Toggle between Khmer (ខ្មែរ) and English (EN)
- Globe icon indicator

### 8. **Background Design**
- Gradient: blue-50 → white → purple-50
- Grid pattern overlay (5% opacity)
- Clean, professional government style

---

## Demo Accounts

For testing, the system maps phone numbers to user roles:

| Role | Phone Number | Email (backend) |
|------|-------------|-----------------|
| Admin | 0123456789 | admin@quiz.com |
| Teacher | 0987654321 | teacher@quiz.com |
| Student | 0111111111 | student@quiz.com |
| Parent | 0999999999 | parent@quiz.com |

**PIN**: Any 4-digit code works (demo mode)

---

## Technical Implementation

### Component Structure

```
components/login-form.tsx
├── Header Section
│   ├── Logo Display (MOEYS + PLP)
│   ├── Title (Bilingual)
│   └── Language Switcher
├── Login Card
│   ├── Phone Number Input
│   ├── PIN Input (maxLength: 4)
│   ├── Error Alert
│   ├── Login Button
│   ├── Registration Link
│   └── Demo Accounts (dev only)
└── Footer (Copyright)
```

### Key Files Modified

1. **`components/login-form.tsx`** - Main login form component
   - Changed from email to phone number authentication
   - Added dual logo header
   - Added registration link
   - Added footer copyright
   - Updated styling to match PLP-TMS

2. **`app/page.tsx`** - Home page with login
   - Updated background with gradient
   - Added grid pattern overlay

3. **`app/register/page.tsx`** - Registration page (placeholder)
   - Coming soon message
   - Back to login link

---

## Responsive Design

The login page is fully responsive:

- **Mobile**: Stacked layout, full width card
- **Tablet**: Centered card, max-width-md
- **Desktop**: Centered card with proper spacing

---

## Accessibility Features

✅ Proper form labels (Khmer + English)
✅ Required field validation
✅ Error messages in both languages
✅ Focus states on inputs
✅ Keyboard navigation support
✅ Screen reader friendly

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Phone number authentication UI
- ✅ Dual logo display
- ✅ Bilingual support
- ✅ Registration link
- ✅ Government footer

### Phase 2 (Planned)
- [ ] Real phone number verification (OTP)
- [ ] Actual logo images (MOEYS + PTOM)
- [ ] Forgot PIN functionality
- [ ] Remember me option
- [ ] Real registration flow

### Phase 3 (Future)
- [ ] Biometric authentication
- [ ] Social login options
- [ ] Multi-factor authentication (MFA)
- [ ] Session management

---

## Design Philosophy

The login page follows **Cambodia Government Design Standards**:

1. **Trust & Credibility**
   - Official logos prominently displayed
   - Government footer copyright
   - Professional color scheme

2. **Accessibility**
   - Khmer language first
   - Clear instructions
   - Large touch targets

3. **Simplicity**
   - Minimal form fields
   - Clear call-to-action
   - No distractions

4. **Mobile-First**
   - Responsive design
   - Touch-friendly inputs
   - Optimized for small screens

---

## Testing Checklist

- [x] Login with phone number works
- [x] Language switching works
- [x] Registration link navigates correctly
- [x] Error messages display properly
- [x] Responsive on mobile
- [x] Responsive on tablet
- [x] Responsive on desktop
- [x] Khmer text displays correctly
- [x] Demo accounts work
- [x] Hanuman font renders properly

---

## Notes

- The phone-to-email mapping is temporary for demo purposes
- In production, phone numbers should authenticate directly
- PIN should be securely hashed
- Consider SMS OTP for verification
- Logo placeholders should be replaced with actual images

---

**Last Updated**: 2025-12-16
**Designer**: Claude Sonnet 4.5
**Reference**: https://plp-tms.moeys.gov.kh/login
