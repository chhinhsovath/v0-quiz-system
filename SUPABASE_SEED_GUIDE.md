# Supabase Demo Data Seeding Guide

## Quick Start

1. Navigate to: `http://localhost:3001/admin/quizzes`
2. Click the **"Seed Demo Data"** button (Database icon)
3. Wait for the success message
4. Refresh to see all demo quizzes

## What Gets Seeded

### 4 Categories:
1. **Khmer Language / អក្សរសាស្ត្រខ្មែរ** (Blue)
2. **Mathematics / គណិតវិទ្យា** (Green)
3. **Science / វិទ្យាសាស្ត្រ** (Purple)
4. **General Knowledge / ចំណេះដឹងទូទៅ** (Orange)

### 5 Comprehensive Quizzes (42 Total Questions):

#### 1. Complete Question Types Demo (22 questions)
**Category:** General Knowledge
**Grade:** 3-4
**Duration:** 60 minutes
**Features:** All 11 question types with 2+ examples each

**Question Types Covered:**
- ✅ Multiple Choice (2 questions)
- ✅ Multiple Select (2 questions)
- ✅ True/False (2 questions)
- ✅ Short Answer (2 questions)
- ✅ Fill in the Blanks (2 questions)
- ✅ Drag & Drop (2 questions)
- ✅ Matching (2 questions)
- ✅ Ordering/Sequence (2 questions)
- ✅ Essay (2 questions)
- ✅ Image Choice (2 questions)
- ✅ Image Hotspot (2 questions)

#### 2. Khmer Reading - Grade 3 (5 questions)
**Category:** Khmer Language
**Duration:** 30 minutes
**Topics:** Vocabulary, Reading, Grammar

#### 3. Basic Math - Grade 3 (5 questions)
**Category:** Mathematics
**Duration:** 30 minutes
**Topics:** Addition, Subtraction, Ordering

#### 4. Khmer Grammar - Grade 4 (5 questions)
**Category:** Khmer Language
**Duration:** 40 minutes
**Topics:** Grammar, Verbs, Essay Writing

#### 5. Advanced Math - Grade 4 (5 questions)
**Category:** Mathematics
**Duration:** 40 minutes
**Topics:** Multiplication, Division, Fractions, Area

## Database Tables Affected

### `categories` table:
- id (text)
- name (text)
- name_km (text)
- description (text)
- description_km (text)
- icon (text) - stores color value
- created_at (timestamp)

### `quizzes` table:
- id (text)
- title (text)
- title_km (text)
- description (text)
- description_km (text)
- category_id (text) - foreign key to categories
- created_by (text)
- grade_level (text)
- subject (text)
- exam_type (text)
- passing_score (integer)
- certificate_enabled (boolean)
- adaptive_testing (boolean)
- max_attempts (integer)
- time_limit (integer) - in minutes
- randomize_questions (boolean)
- allow_multiple_attempts (boolean)
- show_correct_answers (boolean)
- questions (jsonb) - array of question objects
- created_at (timestamp)

## Features

### Smart Seeding:
- ✅ Checks for existing data before inserting
- ✅ Skips duplicates (based on ID)
- ✅ Shows detailed progress in console
- ✅ Reports how many items were added
- ✅ Handles errors gracefully

### Bilingual Support:
- ✅ All quizzes have English and Khmer titles
- ✅ All questions have English and Khmer text
- ✅ All options have English and Khmer translations
- ✅ All explanations provided in both languages

### Question Quality:
- ✅ Each question has point values (5-20 points)
- ✅ Difficulty levels assigned (easy, medium, hard)
- ✅ Detailed explanations for learning
- ✅ Realistic educational content

## Technical Details

### File Structure:
```
lib/
├── seed-data.ts               # Demo quiz data (42 questions)
├── seed-utils.supabase.ts     # Supabase seeding functions
├── quiz-storage.ts            # Supabase storage layer
└── quiz-types.ts              # TypeScript interfaces

app/admin/quizzes/
└── page.tsx                   # Admin page with seed button
```

### Seeding Function:
```typescript
import { seedDemoDataSupabase } from '@/lib/seed-utils.supabase'

const result = await seedDemoDataSupabase()
// Returns: { success, message, categoriesAdded, quizzesAdded }
```

### Other Available Functions:
```typescript
// Clear all demo data
import { clearDemoDataSupabase } from '@/lib/seed-utils.supabase'
await clearDemoDataSupabase()

// Reseed (clear + seed)
import { reseedDemoDataSupabase } from '@/lib/seed-utils.supabase'
await reseedDemoDataSupabase()
```

## Troubleshooting

### Issue: Button shows "Seeding..." but nothing happens
**Solution:** Check browser console (F12) for error messages. Verify Supabase connection.

### Issue: "Category already exists" messages
**Solution:** This is normal! The seeding function checks for duplicates and skips them.

### Issue: Database errors
**Solution:** Ensure your Supabase tables match the schema above. Check `.env.local` for correct Supabase credentials.

### Issue: No data appears after seeding
**Solution:** Refresh the page. Check that categories and quizzes tables exist in Supabase.

## Verification Steps

After seeding, verify the data:

1. **Check Categories:**
   - Go to: `http://localhost:3001/admin/categories`
   - Should see 4 categories with colors

2. **Check Quizzes:**
   - Go to: `http://localhost:3001/admin/quizzes`
   - Should see 5 quizzes listed

3. **Check Questions:**
   - Click "Edit" on "Complete Question Types Demo"
   - Should see 22 questions
   - Each question type should appear at least twice

4. **Check Database:**
   - Open Supabase dashboard
   - Check `categories` table: 4 rows
   - Check `quizzes` table: 5 rows

## Success!

You now have a fully populated quiz system with:
- ✅ 4 Categories
- ✅ 5 Quizzes
- ✅ 42 Questions
- ✅ All 11 Question Types (2+ examples each)
- ✅ Full English/Khmer bilingual support
- ✅ Ready for testing and demonstration!

🎉 Happy testing!
