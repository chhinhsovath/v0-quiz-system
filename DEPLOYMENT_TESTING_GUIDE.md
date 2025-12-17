# Deployment & Testing Guide - Quiz Randomization System

## 📋 Pre-Deployment Checklist

Before deploying the quiz randomization system, ensure you have:

- ✅ Supabase project URL and keys in `.env.local`
- ✅ Admin access to Supabase SQL Editor
- ✅ Backup of existing quiz_attempts data (if any)
- ✅ Users table with demo admin user
- ✅ Test quiz with questions created

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Navigate to: `https://supabase.com/dashboard/project/ywiuptsshhuazbqsabvp`
   - Go to: **SQL Editor** (left sidebar)

2. **Execute Migration Script**
   ```sql
   -- Copy and paste entire contents of:
   -- supabase/migrations/001_quiz_attempts_enhanced.sql
   ```

3. **Click "RUN"**
   - Wait for success message
   - Check for any errors in output

4. **Verify Migration Success**
   ```sql
   -- Run verification query
   SELECT
     COUNT(*) as total_attempts,
     COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
     COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
   FROM public.quiz_attempts;
   ```

### Step 2: Verify Table Structure

```sql
-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
ORDER BY ordinal_position;
```

**Expected columns:**
- ✅ `id` (UUID)
- ✅ `quiz_id` (UUID)
- ✅ `user_id` (UUID)
- ✅ `question_order` (JSONB)
- ✅ `answers` (JSONB)
- ✅ `score` (INTEGER)
- ✅ `max_score` (INTEGER)
- ✅ `percentage` (NUMERIC - computed)
- ✅ `started_at` (TIMESTAMP)
- ✅ `completed_at` (TIMESTAMP)
- ✅ `time_spent` (INTEGER)
- ✅ `time_limit` (INTEGER)
- ✅ `status` (TEXT)
- ✅ `ip_address` (TEXT)
- ✅ `user_agent` (TEXT)
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)

### Step 3: Verify RLS Policies

```sql
-- Check RLS policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'quiz_attempts';
```

**Expected policies:**
- ✅ Users can view own attempts (SELECT)
- ✅ Users can create own attempts (INSERT)
- ✅ Users can update own in_progress attempts (UPDATE)
- ✅ Admins can manage all attempts (ALL)

### Step 4: Test API Endpoints

#### Test 1: Start Quiz Attempt

```bash
# Using curl or Postman
curl -X POST https://test.openplp.com/api/quiz-attempts/start \
  -H "Content-Type: application/json" \
  -d '{
    "quiz_id": "your-quiz-uuid",
    "user_id": "your-user-uuid"
  }'
```

**Expected Response:**
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
  "questions": [/* ordered questions */],
  "quiz_info": {/* quiz details */}
}
```

#### Test 2: Submit Quiz Attempt

```bash
curl -X POST https://test.openplp.com/api/quiz-attempts/submit \
  -H "Content-Type: application/json" \
  -d '{
    "attempt_id": "attempt-uuid",
    "answers": {
      "q-id-1": "answer1",
      "q-id-2": ["option-a", "option-b"]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "attempt": {
    "id": "attempt-uuid",
    "score": 85,
    "max_score": 100,
    "percentage": "85.00",
    "passed": true,
    "status": "completed"
  },
  "results": {/* per-question results */},
  "certificate": {/* if earned */}
}
```

#### Test 3: Get Attempt History

```bash
curl https://test.openplp.com/api/quiz-attempts/history?user_id=user-uuid
```

**Expected Response:**
```json
{
  "success": true,
  "attempts": [/* array of attempts */],
  "stats": {
    "total_attempts": 15,
    "completed_attempts": 12,
    "average_score": "82.50",
    "passed_count": 10
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Quiz Flow (Happy Path)

**Steps:**
1. Login as student
2. Navigate to `/quizzes`
3. Click "Take Quiz" on any quiz
4. Verify questions load in random order
5. Answer all questions
6. Click "Submit Quiz"
7. Verify results page shows:
   - Correct score
   - Questions in same order as during test
   - Correct/incorrect marking
   - Certificate (if passed)

**Expected Result:** ✅ All steps complete successfully

### Scenario 2: Randomization Verification

**Steps:**
1. Create a test quiz with 10 questions
2. Enable "Randomize Questions" setting
3. Student A takes quiz - note question order
4. Student B takes same quiz - note question order
5. Compare orders

**Expected Result:** ✅ Different question orders for each student

### Scenario 3: Multiple Attempts Restriction

**Steps:**
1. Create quiz with "Allow Multiple Attempts" = false
2. Student takes quiz and completes it
3. Student tries to take same quiz again

**Expected Result:** ✅ Student redirected to existing attempt result

### Scenario 4: Time Limit Expiration

**Steps:**
1. Create quiz with 5-minute time limit
2. Student starts quiz
3. Wait for timer to expire without submitting

**Expected Result:** ✅ Quiz auto-submits when time expires

### Scenario 5: In-Progress Attempt Resume

**Steps:**
1. Student starts quiz
2. Answer 5 out of 10 questions
3. Close browser/tab
4. Reopen and navigate to quizzes

**Expected Result:** ✅ Student can see in-progress attempt and continue

### Scenario 6: Admin View All Attempts

**Steps:**
1. Login as admin
2. Navigate to quiz analytics/reports
3. View list of all student attempts

**Expected Result:** ✅ Admin sees all attempts with details

---

## 🔍 Database Verification Queries

### Query 1: Check Recent Attempts

```sql
SELECT
  id,
  quiz_id,
  user_id,
  status,
  score,
  max_score,
  percentage,
  jsonb_array_length(question_order) as question_count,
  started_at,
  completed_at
FROM quiz_attempts
ORDER BY started_at DESC
LIMIT 10;
```

### Query 2: Verify Randomization

```sql
-- Check if different students have different question orders
SELECT
  quiz_id,
  user_id,
  question_order,
  started_at
FROM quiz_attempts
WHERE quiz_id = 'your-quiz-uuid'
ORDER BY started_at DESC
LIMIT 5;
```

### Query 3: Check Statistics

```sql
SELECT * FROM quiz_attempt_stats
WHERE quiz_id = 'your-quiz-uuid';
```

### Query 4: Find Expired Attempts

```sql
SELECT
  id,
  user_id,
  started_at,
  time_limit,
  status
FROM quiz_attempts
WHERE status = 'expired'
ORDER BY started_at DESC;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "quiz_attempts table does not exist"

**Cause:** Migration not run
**Solution:**
```sql
-- Run the migration script in Supabase SQL Editor
-- File: supabase/migrations/001_quiz_attempts_enhanced.sql
```

### Issue 2: "permission denied for table quiz_attempts"

**Cause:** RLS policies not configured
**Solution:**
```sql
-- Check RLS is enabled
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'quiz_attempts';
```

### Issue 3: "Cannot insert null value into column question_order"

**Cause:** Missing question_order in insert
**Solution:** Use the new `createAttempt` method from `quiz-storage.ts`

### Issue 4: Percentage showing NULL

**Cause:** Generated column not working
**Solution:**
```sql
-- Check column definition
SELECT
  column_name,
  column_default,
  generation_expression
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
  AND column_name = 'percentage';

-- If missing, recreate column
ALTER TABLE quiz_attempts DROP COLUMN IF EXISTS percentage;
ALTER TABLE quiz_attempts ADD COLUMN percentage NUMERIC(5,2)
  GENERATED ALWAYS AS (
    CASE WHEN max_score > 0
      THEN ROUND((score::NUMERIC / max_score::NUMERIC * 100), 2)
      ELSE 0
    END
  ) STORED;
```

### Issue 5: Old attempts missing question_order

**Cause:** Migrated from old schema
**Solution:** This is expected - old attempts have `[]` for question_order

---

## 📊 Performance Testing

### Load Test 1: Concurrent Attempts

**Test:** 50 students start quiz simultaneously

```bash
# Using Apache Bench or similar tool
ab -n 50 -c 10 -T 'application/json' \
  -p start_attempt.json \
  https://test.openplp.com/api/quiz-attempts/start
```

**Expected:** All requests complete in < 5 seconds

### Load Test 2: Bulk Submissions

**Test:** 100 quiz submissions simultaneously

```bash
ab -n 100 -c 20 -T 'application/json' \
  -p submit_attempt.json \
  https://test.openplp.com/api/quiz-attempts/submit
```

**Expected:** All requests complete in < 10 seconds

### Query Performance Check

```sql
-- Check query execution time
EXPLAIN ANALYZE
SELECT * FROM quiz_attempts
WHERE user_id = 'some-uuid'
ORDER BY started_at DESC
LIMIT 20;

-- Should use index: idx_quiz_attempts_user_id
-- Execution time should be < 10ms
```

---

## 🔒 Security Verification

### Test 1: Cross-User Access Prevention

**Steps:**
1. Login as Student A
2. Try to access Student B's attempt details
3. Use: `GET /api/quiz-attempts/{student-b-attempt-id}`

**Expected Result:** ✅ Error 403 or 404 (not found)

### Test 2: RLS Policy Enforcement

```sql
-- Test as regular user (should only see own attempts)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';

SELECT * FROM quiz_attempts;
-- Should only return attempts for this user

RESET ROLE;
```

### Test 3: Admin Access Verification

**Steps:**
1. Login as admin user
2. Navigate to admin dashboard
3. View all students' attempts

**Expected Result:** ✅ Admin can view all attempts

---

## 📈 Monitoring & Maintenance

### Daily Checks

1. **Run expired attempts cleanup:**
   ```sql
   SELECT mark_expired_attempts();
   -- Returns count of expired attempts
   ```

2. **Check for stuck attempts:**
   ```sql
   SELECT COUNT(*)
   FROM quiz_attempts
   WHERE status = 'in_progress'
     AND started_at < NOW() - INTERVAL '24 hours';
   ```

3. **View daily statistics:**
   ```sql
   SELECT
     DATE(started_at) as date,
     COUNT(*) as total_attempts,
     COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
     AVG(CASE WHEN status = 'completed' THEN percentage END) as avg_score
   FROM quiz_attempts
   WHERE started_at > NOW() - INTERVAL '7 days'
   GROUP BY DATE(started_at)
   ORDER BY date DESC;
   ```

### Weekly Tasks

1. **Backup quiz_attempts table:**
   ```sql
   -- In Supabase Dashboard > Database > Backups
   -- Or export via CLI
   ```

2. **Review error logs:**
   - Check Supabase logs for failed queries
   - Check Next.js error logs for API failures

3. **Performance analysis:**
   ```sql
   -- Check slow queries
   SELECT
     query,
     calls,
     total_time,
     mean_time
   FROM pg_stat_statements
   WHERE query LIKE '%quiz_attempts%'
   ORDER BY total_time DESC
   LIMIT 10;
   ```

### Monthly Maintenance

1. **Archive old completed attempts:**
   ```sql
   -- Move attempts older than 6 months to archive table
   INSERT INTO quiz_attempts_archive
   SELECT * FROM quiz_attempts
   WHERE completed_at < NOW() - INTERVAL '6 months'
     AND status = 'completed';

   -- Then delete from main table (optional)
   ```

2. **Update statistics:**
   ```sql
   REFRESH MATERIALIZED VIEW IF EXISTS quiz_attempt_stats;
   ```

3. **Review and optimize indexes:**
   ```sql
   -- Check index usage
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE tablename = 'quiz_attempts'
   ORDER BY idx_scan DESC;
   ```

---

## ✅ Deployment Success Checklist

Before considering deployment complete:

- [ ] Migration script executed successfully
- [ ] All verification queries pass
- [ ] RLS policies configured correctly
- [ ] API endpoints responding correctly
- [ ] UI pages loading without errors
- [ ] Randomization working (different orders for different students)
- [ ] Results review showing correct order
- [ ] History page displaying all attempts
- [ ] Timer countdown working
- [ ] Auto-submit on expiration working
- [ ] Certificate generation working
- [ ] Admin can view all attempts
- [ ] Students can only see own attempts
- [ ] Performance acceptable (< 1 second response times)
- [ ] Security tests passed
- [ ] Documentation reviewed
- [ ] Backup procedures in place
- [ ] Monitoring set up

---

## 🎉 Post-Deployment

### Notify Users

Send announcement:
```
✨ Quiz System Update!

We've enhanced the quiz-taking experience:

✅ Questions now appear in random order for fair testing
✅ View complete test history with detailed results
✅ Review your answers in the exact order you saw them
✅ Improved performance and security

Try it now: https://test.openplp.com/quizzes

Questions? Contact support.
```

### Train Staff

- Share `QUIZ_RANDOMIZATION_GUIDE.md` with teachers
- Demonstrate new features in staff meeting
- Provide troubleshooting contacts

### Monitor First Week

- Check error logs daily
- Respond to user feedback
- Fix any issues immediately
- Document lessons learned

---

## 📞 Support

For issues during deployment:

1. Check error logs in Supabase Dashboard
2. Review `QUIZ_RANDOMIZATION_GUIDE.md`
3. Check database with verification queries
4. Test API endpoints with curl/Postman
5. Contact: [Your Support Email]

---

## 🎯 Success Metrics

Track these metrics post-deployment:

- **Adoption Rate:** % of students using new quiz system
- **Completion Rate:** % of started quizzes that are completed
- **Average Time:** Median time to complete quizzes
- **Pass Rate:** % of attempts that pass
- **Error Rate:** % of API requests that fail
- **Performance:** Average API response time

**Target Goals:**
- Adoption Rate: > 80% within 2 weeks
- Completion Rate: > 90%
- Pass Rate: 60-75%
- Error Rate: < 1%
- API Response Time: < 500ms

---

**Deployment complete!** 🚀

The quiz randomization system is now live with full CRUD operations and comprehensive tracking!
