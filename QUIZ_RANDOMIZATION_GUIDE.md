# Quiz Randomization & Test History System - Complete Guide

## 🎯 Overview

This system implements individual student quiz randomization where each student receives questions in a unique random order, and all attempt history is tracked in the database for review and analysis.

## ✨ Key Features

### 1. **Individual Randomization**
- ✅ Each student gets a unique randomized question order
- ✅ Question order is stored in database per attempt
- ✅ No two students see questions in the same order (if randomization is enabled)
- ✅ Original question order preserved for non-randomized quizzes

### 2. **Complete Test History**
- ✅ All attempts stored in database with full details
- ✅ Track in-progress, completed, abandoned, and expired attempts
- ✅ View attempt history by student or by quiz
- ✅ Detailed statistics and analytics

### 3. **Review System**
- ✅ Students see questions in the exact order they answered them
- ✅ Show correct/incorrect answers with explanations
- ✅ Track time spent, score, and percentage
- ✅ Generate certificates for passing attempts

### 4. **Security & Tracking**
- ✅ Track IP address and user agent for each attempt
- ✅ Prevent multiple attempts if disabled
- ✅ Automatic expiration for time-limited quizzes
- ✅ Row Level Security (RLS) policies

---

## 📊 Database Schema

### Enhanced `quiz_attempts` Table

```sql
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES users(id),

  -- Randomization Support
  question_order JSONB NOT NULL,  -- ["q-id-1", "q-id-2", "q-id-3"]

  -- Student Answers
  answers JSONB NOT NULL,  -- {"q-id-1": "answer", "q-id-2": ["a", "b"]}

  -- Scoring
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  percentage NUMERIC(5,2) GENERATED,  -- Auto-calculated

  -- Timing
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  time_spent INTEGER,  -- seconds
  time_limit INTEGER,  -- seconds

  -- Status
  status TEXT DEFAULT 'in_progress',  -- in_progress | completed | abandoned | expired

  -- Tracking
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Fields Explained:

| Field | Purpose | Example |
|-------|---------|---------|
| `question_order` | Stores the randomized order for this student | `["q3", "q1", "q5", "q2", "q4"]` |
| `answers` | Maps question IDs to student answers | `{"q1": "Paris", "q2": ["A", "B"]}` |
| `status` | Current state of the attempt | `completed`, `in_progress`, `expired` |
| `percentage` | Auto-calculated: `(score/max_score)*100` | `85.50` |

---

## 🚀 API Endpoints

### 1. Start Quiz Attempt
**POST** `/api/quiz-attempts/start`

Creates a new attempt with randomized questions.

**Request:**
```json
{
  "quiz_id": "uuid",
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "quiz_id": "quiz-uuid",
    "user_id": "user-uuid",
    "question_order": ["q-id-1", "q-id-2", "q-id-3"],
    "max_score": 100,
    "time_limit": 3600,
    "started_at": "2025-12-17T10:00:00Z",
    "status": "in_progress"
  },
  "questions": [/* questions in randomized order */],
  "quiz_info": {
    "title": "Math Quiz",
    "time_limit": 60,
    "passing_score": 70
  }
}
```

**Features:**
- ✅ Checks for multiple attempt restrictions
- ✅ Randomizes questions if enabled
- ✅ Tracks IP address and user agent
- ✅ Returns questions in student's unique order

### 2. Submit Quiz Attempt
**POST** `/api/quiz-attempts/submit`

Submits answers and calculates score.

**Request:**
```json
{
  "attempt_id": "uuid",
  "answers": {
    "q-id-1": "answer1",
    "q-id-2": ["option-a", "option-b"],
    "q-id-3": {"blank1": "answer", "blank2": "answer"}
  }
}
```

**Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "score": 85,
    "max_score": 100,
    "percentage": "85.00",
    "passed": true,
    "status": "completed",
    "time_spent": 1234
  },
  "results": {
    "q-id-1": {
      "student_answer": "answer1",
      "correct_answer": "answer1",
      "is_correct": true,
      "points_earned": 10,
      "points_possible": 10
    }
  },
  "certificate": {
    "id": "cert-uuid",
    "certificate_number": "CERT-1234567890",
    "issued_at": "2025-12-17T10:30:00Z"
  }
}
```

**Auto-Grading Supported:**
- Multiple choice
- Multiple select
- True/False
- Short answer
- Fill in the blanks
- Matching
- Ordering/Sequence
- Drag & drop
- Image choice
- Hotspot

**Manual Grading Required:**
- Essay questions

### 3. Get Attempt Details
**GET** `/api/quiz-attempts/[id]`

Retrieves full attempt details for review.

**Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "score": 85,
    "max_score": 100,
    "percentage": "85.00",
    "passed": true,
    "time_spent": 1234
  },
  "quiz": {
    "title": "Math Quiz",
    "passing_score": 70,
    "show_correct_answers": true
  },
  "questions": [
    {
      "question_number": 1,
      "question": "What is 2+2?",
      "student_answer": "4",
      "correct_answer": "4",
      "is_correct": true,
      "points_earned": 5,
      "points_possible": 5,
      "explanation": "2+2 equals 4"
    }
  ],
  "statistics": {
    "total_questions": 20,
    "correct_answers": 17,
    "incorrect_answers": 2,
    "unanswered": 1
  }
}
```

**Features:**
- ✅ Questions returned in student's attempt order
- ✅ Shows correct answers (if enabled in quiz settings)
- ✅ Detailed explanations for each question
- ✅ Certificate info if earned

### 4. Get Attempt History
**GET** `/api/quiz-attempts/history?user_id={uuid}&quiz_id={uuid}`

Retrieves all attempts for a user (optionally filtered by quiz).

**Response:**
```json
{
  "success": true,
  "attempts": [
    {
      "id": "attempt-uuid",
      "quiz": {
        "id": "quiz-uuid",
        "title": "Math Quiz",
        "category": {"name": "Mathematics"}
      },
      "score": 85,
      "max_score": 100,
      "percentage": "85.00",
      "passed": true,
      "status": "completed",
      "started_at": "2025-12-17T10:00:00Z",
      "completed_at": "2025-12-17T10:30:00Z",
      "time_spent": 1800,
      "question_count": 20
    }
  ],
  "stats": {
    "total_attempts": 15,
    "completed_attempts": 12,
    "in_progress_attempts": 1,
    "average_score": "82.50",
    "highest_score": "95.00",
    "passed_count": 10
  }
}
```

---

## 🎨 User Interface Flow

### Flow 1: Taking a Quiz

```
┌─────────────────┐
│  Quiz List Page │
└────────┬────────┘
         │
         │ Click "Take Quiz"
         ▼
┌─────────────────────────────┐
│  Start Attempt API Call     │
│  - Creates new attempt      │
│  - Randomizes questions     │
│  - Returns unique order     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Quiz Taking Page           │
│  /quizzes/take/[id]         │
│  - Shows questions in order │
│  - Tracks answers           │
│  - Timer countdown          │
│  - Progress indicator       │
└────────┬────────────────────┘
         │
         │ Submit
         ▼
┌─────────────────────────────┐
│  Submit API Call            │
│  - Calculates score         │
│  - Checks answers           │
│  - Generates certificate    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Result Page                │
│  /quizzes/result/[attemptId]│
│  - Shows score & percentage │
│  - Questions in same order  │
│  - Correct/incorrect marks  │
│  - Explanations             │
└─────────────────────────────┘
```

### Flow 2: Reviewing History

```
┌─────────────────┐
│ My Quiz History │
│ Page            │
└────────┬────────┘
         │
         │ GET /api/quiz-attempts/history
         ▼
┌─────────────────────────────┐
│  History Table              │
│  - All attempts listed      │
│  - Statistics cards         │
│  - Filter by quiz           │
│  - Sort by date             │
└────────┬────────────────────┘
         │
         │ Click "View"
         ▼
┌─────────────────────────────┐
│  Result Page                │
│  - Detailed review          │
│  - Questions in order       │
│  - Answers & explanations   │
└─────────────────────────────┘
```

---

## 📁 File Structure

```
app/
├── api/
│   └── quiz-attempts/
│       ├── start/
│       │   └── route.ts          # Start new attempt
│       ├── submit/
│       │   └── route.ts          # Submit answers
│       ├── history/
│       │   └── route.ts          # Get attempt history
│       └── [id]/
│           └── route.ts          # Get attempt details
│
├── quizzes/
│   ├── take/
│   │   └── [id]/
│   │       └── page.tsx          # Take quiz page
│   └── result/
│       └── [attemptId]/
│           └── page.tsx          # View results
│
└── my-quiz-history/
    └── page.tsx                  # History page

supabase/
└── enhanced-quiz-attempts-schema.sql
```

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration

```sql
-- Execute in Supabase SQL Editor
-- File: supabase/enhanced-quiz-attempts-schema.sql

-- This will:
-- ✅ Create/update quiz_attempts table
-- ✅ Add indexes for performance
-- ✅ Set up RLS policies
-- ✅ Create helper functions
-- ✅ Create statistics view
```

### Step 2: Verify RLS Policies

Check that these policies exist:
- ✅ Users can view their own attempts
- ✅ Users can create their own attempts
- ✅ Users can update their in-progress attempts
- ✅ Admins can view all attempts

### Step 3: Test the Flow

1. **Create a quiz** with randomization enabled
2. **Take the quiz** as Student A - note question order
3. **Take same quiz** as Student B - verify different order
4. **Submit both attempts**
5. **View results** - verify order matches what they saw
6. **Check history** - see all attempts listed

---

## 🎯 Usage Examples

### Example 1: Student Takes Randomized Quiz

1. Student navigates to `/quizzes`
2. Clicks "Take Quiz" on "Math Test"
3. System creates attempt with `question_order: ["q5", "q2", "q7", "q1"]`
4. Student sees questions in that order: Q5 → Q2 → Q7 → Q1
5. Student submits answers
6. Result page shows review in same order: Q5 → Q2 → Q7 → Q1

### Example 2: Teacher Reviews All Student Attempts

1. Teacher views quiz analytics
2. Sees list of all students who took the quiz
3. Each student has different `question_order`
4. Clicks on a student to see their specific attempt
5. Reviews answers in the order that student experienced

### Example 3: Student Views Test History

1. Student goes to `/my-quiz-history`
2. Sees table of all attempts across all quizzes
3. Statistics show: 15 total, 85% average, 12 passed
4. Clicks "View" on a past attempt
5. Reviews questions in original order with explanations

---

## 🔒 Security Features

### 1. Row Level Security (RLS)
- Students can only view/edit their own attempts
- Admins can view all attempts
- Prevents unauthorized access

### 2. Attempt Restrictions
- Check `allow_multiple_attempts` setting
- Enforce `max_attempts` limit
- Redirect if already completed

### 3. Auto-Expiration
- Automatically mark expired attempts
- Function: `mark_expired_attempts()`
- Can be scheduled to run every 5 minutes

### 4. Tracking
- IP address recorded per attempt
- User agent captured
- Timestamps for audit trail

---

## 📊 Analytics & Reporting

### Available Statistics

**Per Student:**
- Total attempts
- Completed attempts
- Average score
- Highest score
- Pass rate
- Time trends

**Per Quiz:**
- Total students
- Average score
- Score distribution
- Completion rate
- Average time spent
- Question difficulty analysis

### Statistics View
```sql
SELECT * FROM quiz_attempt_stats
WHERE quiz_id = 'uuid';

-- Returns:
-- quiz_id, quiz_title, total_students, total_attempts,
-- completed_attempts, avg_score, highest_score, lowest_score,
-- avg_time_spent
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Questions Not Randomized
**Cause:** Quiz setting `randomize_questions` is `false`
**Solution:** Enable randomization in quiz settings

### Issue 2: Can't Take Quiz Again
**Cause:** `allow_multiple_attempts` is `false` and student already completed
**Solution:** Either enable multiple attempts or clear previous attempt

### Issue 3: Timer Not Working
**Cause:** `time_limit` is `0` or `null`
**Solution:** Set time limit in quiz settings (in minutes)

### Issue 4: Correct Answers Not Showing
**Cause:** Quiz setting `show_correct_answers` is `false`
**Solution:** Enable in quiz settings for review mode

### Issue 5: Certificate Not Generated
**Cause:** Student didn't pass or `certificate_enabled` is `false`
**Solution:** Check passing score threshold and certificate setting

---

## 🎓 Best Practices

### For Teachers:
1. ✅ Enable randomization for fair testing
2. ✅ Set appropriate time limits
3. ✅ Configure passing score based on difficulty
4. ✅ Enable "show correct answers" for learning
5. ✅ Review attempt statistics regularly

### For Students:
1. ✅ Check time limit before starting
2. ✅ Answer all questions (or as many as possible)
3. ✅ Review results to learn from mistakes
4. ✅ Track progress in history page
5. ✅ Request clarification on unclear questions

### For Administrators:
1. ✅ Monitor attempt statistics
2. ✅ Run expired attempt cleanup regularly
3. ✅ Backup quiz_attempts table frequently
4. ✅ Review RLS policies for security
5. ✅ Analyze quiz difficulty and adjust

---

## 🎉 Success!

You now have a complete quiz randomization and tracking system with:

✅ Individual student question randomization
✅ Full attempt history in database
✅ Results review in student's original order
✅ Comprehensive analytics
✅ Auto-grading for 10+ question types
✅ Certificate generation
✅ Security with RLS policies
✅ Performance optimized with indexes

**Ready to deploy!** 🚀
