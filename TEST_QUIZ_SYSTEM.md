# Quick Test Guide - Quiz System Verification

## ✅ Migration Successful!

Your database is ready with **0 attempts** (clean slate).

---

## 🧪 Quick Verification Tests

### Test 1: Verify Table Structure

```sql
-- Run this in Supabase SQL Editor
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
ORDER BY ordinal_position;
```

**Expected Output:** 17 columns including `question_order`, `answers`, `status`, etc.

---

### Test 2: Check RLS Policies

```sql
SELECT
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'quiz_attempts';
```

**Expected Output:** 4 policies
- ✅ Users can view own attempts (SELECT)
- ✅ Users can create own attempts (INSERT)
- ✅ Users can update own in_progress attempts (UPDATE)
- ✅ Admins can manage all attempts (ALL)

---

### Test 3: Manual Insert Test

```sql
-- Insert a test attempt
INSERT INTO quiz_attempts (
  quiz_id,
  user_id,
  question_order,
  max_score,
  status
) VALUES (
  (SELECT id FROM quizzes LIMIT 1), -- Use existing quiz
  (SELECT id FROM users LIMIT 1),   -- Use existing user
  '["q1", "q2", "q3"]'::jsonb,      -- Question order
  100,                               -- Max score
  'in_progress'                      -- Status
)
RETURNING id, quiz_id, user_id, question_order, status;
```

**Expected Output:** Returns new attempt record with UUID

---

### Test 4: Update Test

```sql
-- Update the attempt we just created
UPDATE quiz_attempts
SET
  answers = '{"q1": "answer1", "q2": "answer2"}'::jsonb,
  score = 85,
  status = 'completed',
  completed_at = NOW(),
  time_spent = 300
WHERE id = (SELECT id FROM quiz_attempts ORDER BY created_at DESC LIMIT 1)
RETURNING id, score, percentage, status;
```

**Expected Output:** Shows score, auto-calculated percentage, and status

---

### Test 5: Read Test with Statistics

```sql
-- Query the attempt with computed fields
SELECT
  id,
  user_id,
  question_order,
  answers,
  score,
  max_score,
  percentage,  -- This should be auto-calculated!
  status,
  started_at,
  completed_at,
  time_spent
FROM quiz_attempts
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Output:**
- `percentage` should be **85.00** (auto-calculated from 85/100)
- `question_order` should be `["q1", "q2", "q3"]`
- `answers` should be `{"q1": "answer1", "q2": "answer2"}`

---

### Test 6: Statistics View Test

```sql
-- Check the statistics view
SELECT * FROM quiz_attempt_stats
LIMIT 5;
```

**Expected Output:** Shows aggregated stats per quiz

---

### Test 7: Helper Function Test

```sql
-- Test the expired attempts function
SELECT mark_expired_attempts();
```

**Expected Output:** Returns count (probably 0 since test data just created)

---

### Test 8: Clean Up Test Data

```sql
-- Delete test attempt
DELETE FROM quiz_attempts
WHERE id = (SELECT id FROM quiz_attempts ORDER BY created_at DESC LIMIT 1);

-- Verify clean
SELECT COUNT(*) FROM quiz_attempts;
```

**Expected Output:** COUNT = 0 (back to clean slate)

---

## 🌐 Test via Web UI

### Quick Flow Test:

1. **Open your app**: `http://localhost:3001` or `https://test.openplp.com`

2. **Login as a student**

3. **Navigate to Quizzes**: `/quizzes`

4. **Take a Quiz**:
   - Click "Take Quiz" on any quiz
   - Note the question order
   - Answer a few questions
   - Submit

5. **Verify in Database**:
```sql
SELECT
  id,
  user_id,
  question_order,
  score,
  percentage,
  status
FROM quiz_attempts
ORDER BY started_at DESC
LIMIT 1;
```

6. **View Results**: `/quizzes/result/{attempt-id}`
   - Should show questions in same order
   - Should show score and percentage
   - Should show correct/incorrect marking

7. **Check History**: `/my-quiz-history`
   - Should see the attempt listed
   - Statistics should be accurate

---

## 🔧 Test API Endpoints

### Test API 1: Start Attempt

```bash
# Create a new attempt via API
curl -X POST http://localhost:3001/api/quiz-attempts/start \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "PUT_QUIZ_UUID_HERE",
    "user_id": "PUT_USER_UUID_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "question_order": ["q-random-1", "q-random-2", ...],
    "status": "in_progress"
  },
  "questions": [/* ordered questions */]
}
```

### Test API 2: Get Attempt

```bash
# Get attempt details
curl http://localhost:3001/api/quiz-attempts/{attempt-id}
```

**Expected Response:**
```json
{
  "success": true,
  "attempt": {
    "score": 85,
    "percentage": "85.00",
    "status": "completed"
  },
  "questions": [/* questions in order */]
}
```

---

## 🎯 Randomization Verification

### Test Same Quiz with Different Users:

1. **Student A takes quiz**:
```sql
-- Check Student A's question order
SELECT question_order
FROM quiz_attempts
WHERE user_id = 'student-a-uuid'
  AND quiz_id = 'quiz-uuid'
ORDER BY started_at DESC
LIMIT 1;
```

Result: `["q5", "q2", "q7", "q1", "q3"]`

2. **Student B takes same quiz**:
```sql
-- Check Student B's question order
SELECT question_order
FROM quiz_attempts
WHERE user_id = 'student-b-uuid'
  AND quiz_id = 'quiz-uuid'
ORDER BY started_at DESC
LIMIT 1;
```

Result: `["q3", "q1", "q5", "q7", "q2"]` ← **Different order!** ✅

---

## ✅ Success Indicators

Your system is working correctly if:

- ✅ Table has 17 columns
- ✅ 4 RLS policies exist
- ✅ Can INSERT new attempts
- ✅ Can UPDATE attempts
- ✅ Can READ attempts
- ✅ `percentage` auto-calculates correctly
- ✅ `question_order` stores as JSONB array
- ✅ `answers` stores as JSONB object
- ✅ Status transitions work (in_progress → completed)
- ✅ Different students get different question orders
- ✅ API endpoints return correct data
- ✅ UI pages load without errors
- ✅ Review page shows questions in correct order

---

## 🐛 Troubleshooting

### Issue: "relation quiz_attempts does not exist"

**Solution:**
```sql
-- Check if table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'quiz_attempts';

-- If not exists, re-run migration
```

### Issue: "permission denied"

**Solution:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'quiz_attempts';

-- Should return: rowsecurity = true

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'quiz_attempts';
```

### Issue: "percentage is NULL"

**Solution:**
```sql
-- Check if column is generated
SELECT column_name, generation_expression
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
  AND column_name = 'percentage';

-- Should show: CASE WHEN max_score > 0 THEN...
```

### Issue: "Cannot insert JSONB"

**Solution:**
```sql
-- Verify JSONB format
-- Correct: '["q1", "q2"]'::jsonb
-- Wrong: "['q1', 'q2']"

-- Test JSONB insertion
SELECT '{"key": "value"}'::jsonb;
SELECT '["item1", "item2"]'::jsonb;
```

---

## 📊 Database Health Check

Run this comprehensive health check:

```sql
-- Complete system verification
SELECT
  'quiz_attempts table exists' as check_name,
  EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'quiz_attempts') as passed
UNION ALL
SELECT
  'RLS enabled',
  (SELECT rowsecurity FROM pg_tables WHERE tablename = 'quiz_attempts')
UNION ALL
SELECT
  'Has indexes',
  COUNT(*) >= 6 as passed
FROM pg_indexes
WHERE tablename = 'quiz_attempts'
UNION ALL
SELECT
  'Has RLS policies',
  COUNT(*) >= 4 as passed
FROM pg_policies
WHERE tablename = 'quiz_attempts'
UNION ALL
SELECT
  'Statistics view exists',
  EXISTS(SELECT FROM information_schema.views WHERE table_name = 'quiz_attempt_stats')
UNION ALL
SELECT
  'Helper function exists',
  EXISTS(SELECT FROM pg_proc WHERE proname = 'mark_expired_attempts');
```

**Expected Output:** All checks should return `passed = true`

---

## 🎉 Next Steps

Now that the database is ready:

1. **Test via UI**: Take a quiz and submit it
2. **Verify randomization**: Have 2 students take same quiz
3. **Check review page**: Verify questions show in correct order
4. **Test history page**: View all attempts
5. **Test admin view**: View all students' attempts
6. **Performance test**: Create 50-100 attempts and check query speed

---

## 📞 Need Help?

If any test fails:

1. Copy the error message
2. Check which test failed
3. Run the troubleshooting section
4. Verify migration ran completely
5. Check Supabase logs for errors

---

**Your database is ready! Start testing the quiz flow!** 🚀

Total Setup Time: ~2 minutes
- [x] Migration complete
- [x] Table verified
- [x] RLS configured
- [x] Indexes created
- [x] Ready for testing
