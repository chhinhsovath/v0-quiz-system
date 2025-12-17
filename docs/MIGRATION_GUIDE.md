# Database Migration Guide
## Adding shuffle_options to quizzes table

**Migration File:** `supabase/migrations/add_shuffle_options.sql`
**Estimated Time:** 5-15 minutes
**Risk Level:** Low (adds new column with safe defaults)

---

## 📋 Pre-Migration Checklist

Before running the migration, verify:

- [ ] You have access to Supabase Dashboard or database
- [ ] You have backup of current database (recommended)
- [ ] No active quiz attempts in progress (optional, but safer)
- [ ] You understand what will change (adds one new column)

---

## 🎯 What This Migration Does

### Changes:
1. **Adds column:** `shuffle_options BOOLEAN` to `quizzes` table
2. **Default value:** `false` (preserves current behavior)
3. **Updates existing quizzes:** Sets `shuffle_options = false` for all
4. **Creates index:** For analytics queries (optional performance improvement)
5. **Adds documentation:** Comment explaining the field

### Impact:
- ✅ **Zero downtime** - Safe to run while system is live
- ✅ **Backward compatible** - Existing quizzes unchanged
- ✅ **Non-destructive** - No data deletion
- ✅ **Reversible** - Can be rolled back if needed

---

## 🚀 Migration Methods

Choose the method that works best for your setup:

### Method 1: Supabase Dashboard (Recommended - Easiest)

**Steps:**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** (in left sidebar)

2. **Open the migration file**
   ```bash
   # In your terminal, display the migration
   cat supabase/migrations/add_shuffle_options.sql
   ```

3. **Copy the SQL**
   - Select all content from the migration file
   - Copy to clipboard (Cmd+C / Ctrl+C)

4. **Execute in Dashboard**
   - Paste into SQL Editor
   - Click **Run** button
   - Wait for success message

5. **Verify**
   ```sql
   -- Run this query to verify
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'quizzes'
   AND column_name = 'shuffle_options';
   ```

   **Expected result:**
   ```
   column_name     | data_type | column_default
   ----------------+-----------+----------------
   shuffle_options | boolean   | false
   ```

6. **Test**
   ```sql
   -- Check that existing quizzes have the field
   SELECT id, title, shuffle_options
   FROM quizzes
   LIMIT 5;
   ```

   **Expected:** All existing quizzes should have `shuffle_options = false`

---

### Method 2: Using psql (For Advanced Users)

**Prerequisites:**
- PostgreSQL client installed (`psql`)
- Database connection URL

**Steps:**

1. **Get your database URL**
   - From Supabase Dashboard: Settings → Database → Connection String
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres`

2. **Run migration**
   ```bash
   # Navigate to project directory
   cd /Users/chhinhsovath/Documents/GitHubWeb/PLP-TEST

   # Run migration
   psql "YOUR_DATABASE_URL" -f supabase/migrations/add_shuffle_options.sql
   ```

3. **Verify**
   ```bash
   psql "YOUR_DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'quizzes' AND column_name = 'shuffle_options';"
   ```

---

### Method 3: Supabase CLI (For CI/CD Pipelines)

**Prerequisites:**
- Supabase CLI installed (`npm install -g supabase`)
- Project linked

**Steps:**

1. **Install Supabase CLI** (if not installed)
   ```bash
   npm install -g supabase
   ```

2. **Link project** (if not linked)
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run migration**
   ```bash
   supabase db push
   ```

4. **Verify**
   ```bash
   supabase db diff
   ```

---

## ✅ Verification Steps

After running the migration, verify everything worked:

### 1. Check Column Exists
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
AND column_name IN ('randomize_questions', 'shuffle_options')
ORDER BY ordinal_position;
```

**Expected output:**
```
column_name          | data_type | is_nullable | column_default
---------------------+-----------+-------------+----------------
randomize_questions  | boolean   | YES         | false
shuffle_options      | boolean   | YES         | false
```

### 2. Check Existing Data
```sql
SELECT
  id,
  title,
  randomize_questions,
  shuffle_options,
  created_at
FROM quizzes
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:** All quizzes should have `shuffle_options = false`

### 3. Check Index Created
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'quizzes'
AND indexname = 'idx_quizzes_shuffle_options';
```

**Expected:** Index should exist

### 4. Test Insert
```sql
-- Test that new quizzes can be created with shuffle_options
INSERT INTO quizzes (title, shuffle_options, questions)
VALUES ('Test Quiz', true, '[]'::jsonb)
RETURNING id, title, shuffle_options;
```

**Expected:** Should create successfully with `shuffle_options = true`

---

## 🔄 Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove the column (WARNING: This deletes data!)
ALTER TABLE public.quizzes
DROP COLUMN IF EXISTS shuffle_options;

-- Remove the index
DROP INDEX IF EXISTS idx_quizzes_shuffle_options;
```

**Note:** Only use rollback if absolutely necessary. The column is harmless even if unused.

---

## 🐛 Troubleshooting

### Issue 1: "Column already exists"

**Error:**
```
ERROR: column "shuffle_options" of relation "quizzes" already exists
```

**Solution:**
```sql
-- Check if column exists and what its definition is
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
AND column_name = 'shuffle_options';
```

If it exists with correct definition, migration already ran. ✅

### Issue 2: "Permission denied"

**Error:**
```
ERROR: permission denied for table quizzes
```

**Solution:**
- Verify you're using the correct database user
- Use postgres superuser or owner role
- Check Supabase dashboard permissions

### Issue 3: "Table 'quizzes' does not exist"

**Error:**
```
ERROR: relation "public.quizzes" does not exist
```

**Solution:**
```sql
-- Check if table exists
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'quizzes';
```

If table doesn't exist, you may need to run earlier migrations first.

### Issue 4: Migration runs but verification fails

**Check:**
```sql
-- See all columns in quizzes table
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
ORDER BY ordinal_position;
```

This will show all columns and help identify the issue.

---

## 📊 Post-Migration Testing

After migration completes successfully:

### 1. Backend Test (API)

Test that API can read the new field:

```bash
# Test quiz creation with shuffle_options
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "shuffleOptions": true,
    "questions": []
  }'
```

### 2. Frontend Test (UI)

1. Go to `/admin/quiz-builder`
2. Create new quiz
3. Look for "Shuffle Answer Options" toggle
4. Enable it
5. Save quiz
6. Verify it saved correctly

### 3. Database Test (Direct)

```sql
-- Create a quiz with shuffle enabled
INSERT INTO quizzes (title, shuffle_options, questions)
VALUES ('Migration Test Quiz', true, '[]'::jsonb)
RETURNING *;

-- Verify it was created
SELECT id, title, shuffle_options
FROM quizzes
WHERE title = 'Migration Test Quiz';

-- Clean up test
DELETE FROM quizzes
WHERE title = 'Migration Test Quiz';
```

---

## 📈 Migration Metrics

Track these metrics after migration:

### Before Migration:
```sql
-- Count total quizzes
SELECT COUNT(*) as total_quizzes FROM quizzes;

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('quizzes')) as table_size;
```

### After Migration:
```sql
-- Verify all quizzes have the new field
SELECT
  COUNT(*) as total_quizzes,
  COUNT(shuffle_options) as quizzes_with_field,
  SUM(CASE WHEN shuffle_options = true THEN 1 ELSE 0 END) as shuffle_enabled
FROM quizzes;
```

**Expected:**
- total_quizzes = quizzes_with_field (all have the field)
- shuffle_enabled = 0 (none enabled yet)
- table_size increase < 1MB (minimal impact)

---

## ⏱️ Estimated Timeline

| Step | Time | Notes |
|------|------|-------|
| Read migration file | 2 min | Understand what it does |
| Open Supabase Dashboard | 1 min | Navigate to SQL Editor |
| Copy & paste migration | 1 min | From file to dashboard |
| Execute migration | 30 sec | Click Run button |
| Verify column exists | 1 min | Run verification query |
| Test with sample data | 2 min | Optional but recommended |
| Update documentation | 3 min | Mark migration as complete |
| **Total** | **~10 min** | Can be done in one sitting |

---

## ✅ Success Criteria

Migration is successful when:

- [ ] Column `shuffle_options` exists in `quizzes` table
- [ ] Column type is `BOOLEAN`
- [ ] Default value is `false`
- [ ] All existing quizzes have `shuffle_options = false`
- [ ] Index `idx_quizzes_shuffle_options` created
- [ ] No errors in migration execution
- [ ] Test quiz can be created with `shuffle_options = true`
- [ ] UI toggle appears in quiz builder
- [ ] API correctly reads/writes the field

---

## 🎯 Next Steps After Migration

Once migration is complete:

1. **Update project status**
   - Mark "Database migration" as complete
   - Update DAY_2_IMPLEMENTATION_UPDATE.md

2. **Test in browser**
   - Create quiz with shuffle enabled
   - Test as different students
   - Verify different option orders

3. **Deploy to staging**
   - Push code changes
   - Run migration on staging database
   - Test full flow

4. **Document for team**
   - Notify team migration is complete
   - Update deployment checklist
   - Add to release notes

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review Supabase logs** (Dashboard → Logs)
3. **Verify database connection** works
4. **Check for typos** in the SQL
5. **Try rollback and re-run** if needed

---

## 📝 Migration File Location

```
/Users/chhinhsovath/Documents/GitHubWeb/PLP-TEST/supabase/migrations/add_shuffle_options.sql
```

**File contents preview:**
```sql
-- Add shuffle_options column to quizzes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'shuffle_options'
  ) THEN
    ALTER TABLE public.quizzes
    ADD COLUMN shuffle_options BOOLEAN DEFAULT false;
    -- ... (rest of migration)
  END IF;
END $$;
```

---

**Guide Prepared By:** Development Team
**Last Updated:** 2025-12-17
**Version:** 1.0
**Status:** Ready for execution

---

*"A successful migration is one you don't have to run twice."*
