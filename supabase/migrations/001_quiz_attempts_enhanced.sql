-- Migration: Enhanced Quiz Attempts Table with Randomization Support
-- Version: 001
-- Date: 2025-12-17
-- Description: Creates/updates quiz_attempts table with question_order field and enhanced tracking

-- ============================================================================
-- STEP 1: Backup existing data (if table exists)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_attempts_backup') THEN
    DROP TABLE quiz_attempts_backup;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_attempts') THEN
    CREATE TABLE quiz_attempts_backup AS SELECT * FROM quiz_attempts;
    RAISE NOTICE 'Existing quiz_attempts data backed up to quiz_attempts_backup';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Drop existing table and recreate with new schema
-- ============================================================================

DROP TABLE IF EXISTS public.quiz_attempts CASCADE;

-- Create enhanced quiz_attempts table
CREATE TABLE public.quiz_attempts (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign keys
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Randomization support - stores the order questions were presented
  question_order JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Student answers mapped by question ID
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Scoring
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,

  -- Auto-calculated percentage (computed column)
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN max_score > 0 THEN ROUND((score::NUMERIC / max_score::NUMERIC * 100), 2)
      ELSE 0
    END
  ) STORED,

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in seconds
  time_limit INTEGER, -- in seconds (snapshot of quiz time limit)

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),

  -- Audit fields
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_quiz_attempts_started_at ON public.quiz_attempts(started_at DESC);
CREATE INDEX idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC NULLS LAST);

-- ============================================================================
-- STEP 4: Add table and column comments
-- ============================================================================

COMMENT ON TABLE public.quiz_attempts IS 'Stores individual student quiz attempts with randomized question orders and full tracking';
COMMENT ON COLUMN public.quiz_attempts.question_order IS 'Array of question IDs in the order they were presented to this specific student';
COMMENT ON COLUMN public.quiz_attempts.answers IS 'Student answers mapped by question ID: {"q-id": "answer"}';
COMMENT ON COLUMN public.quiz_attempts.status IS 'Current status: in_progress, completed, abandoned, or expired';
COMMENT ON COLUMN public.quiz_attempts.percentage IS 'Auto-calculated percentage score';
COMMENT ON COLUMN public.quiz_attempts.time_limit IS 'Quiz time limit in seconds (snapshot from quiz settings)';

-- ============================================================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can update own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Allow all operations on quiz_attempts" ON public.quiz_attempts;

-- Policy: Users can view their own attempts
CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    user_id::text = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Policy: Users can create their own attempts
CREATE POLICY "Users can create own attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Policy: Users can update their own in-progress attempts
CREATE POLICY "Users can update own in_progress attempts"
  ON public.quiz_attempts
  FOR UPDATE
  USING (user_id::text = auth.uid()::text AND status = 'in_progress');

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage all attempts"
  ON public.quiz_attempts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 6: Create trigger for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_quiz_attempts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_quiz_attempts_updated_at ON public.quiz_attempts;

CREATE TRIGGER trigger_quiz_attempts_updated_at
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_attempts_updated_at();

-- ============================================================================
-- STEP 7: Helper function to mark expired attempts
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_expired_attempts()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.quiz_attempts
  SET
    status = 'expired',
    completed_at = started_at + (time_limit || ' seconds')::INTERVAL,
    updated_at = NOW()
  WHERE
    status = 'in_progress'
    AND time_limit IS NOT NULL
    AND time_limit > 0
    AND NOW() > started_at + (time_limit || ' seconds')::INTERVAL;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_expired_attempts() IS 'Marks in-progress attempts as expired if time limit exceeded. Returns count of affected rows.';

-- ============================================================================
-- STEP 8: Create statistics view
-- ============================================================================

DROP VIEW IF EXISTS public.quiz_attempt_stats CASCADE;

CREATE VIEW public.quiz_attempt_stats AS
SELECT
  qa.quiz_id,
  q.title as quiz_title,
  q.title_km as quiz_title_km,
  COUNT(DISTINCT qa.user_id) as total_students,
  COUNT(qa.id) as total_attempts,
  COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_attempts,
  COUNT(CASE WHEN qa.status = 'in_progress' THEN 1 END) as in_progress_attempts,
  COUNT(CASE WHEN qa.status = 'expired' THEN 1 END) as expired_attempts,
  ROUND(AVG(CASE WHEN qa.status = 'completed' THEN qa.percentage END), 2) as avg_percentage,
  MAX(qa.percentage) as highest_percentage,
  MIN(CASE WHEN qa.status = 'completed' THEN qa.percentage END) as lowest_percentage,
  ROUND(AVG(CASE WHEN qa.status = 'completed' THEN qa.time_spent END), 0) as avg_time_seconds,
  COUNT(CASE WHEN qa.status = 'completed' AND qa.percentage >= q.passing_score THEN 1 END) as passed_count,
  COUNT(CASE WHEN qa.status = 'completed' AND qa.percentage < q.passing_score THEN 1 END) as failed_count
FROM public.quiz_attempts qa
JOIN public.quizzes q ON qa.quiz_id = q.id
GROUP BY qa.quiz_id, q.title, q.title_km, q.passing_score;

COMMENT ON VIEW public.quiz_attempt_stats IS 'Aggregated statistics for quiz attempts by quiz';

GRANT SELECT ON public.quiz_attempt_stats TO authenticated;

-- ============================================================================
-- STEP 9: Migrate old data (if backup exists)
-- ============================================================================

DO $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quiz_attempts_backup') THEN
    -- Migrate old attempts to new structure
    INSERT INTO public.quiz_attempts (
      id,
      quiz_id,
      user_id,
      question_order, -- Will be empty array for old attempts
      answers,
      score,
      max_score,
      started_at,
      completed_at,
      time_spent,
      status, -- Set to 'completed' for old attempts
      created_at
    )
    SELECT
      id,
      quiz_id,
      user_id,
      '[]'::jsonb, -- Empty question order for old data
      COALESCE(answers, '{}'::jsonb),
      COALESCE(score, 0),
      max_score,
      started_at,
      COALESCE(completed_at, started_at),
      time_spent,
      'completed', -- Mark old attempts as completed
      COALESCE(created_at, started_at)
    FROM quiz_attempts_backup
    ON CONFLICT (id) DO NOTHING;

    GET DIAGNOSTICS migrated_count = ROW_COUNT;
    RAISE NOTICE 'Migrated % existing attempts from backup', migrated_count;
  ELSE
    RAISE NOTICE 'No existing data to migrate';
  END IF;
END $$;

-- ============================================================================
-- STEP 10: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON public.quiz_attempts TO authenticated;
GRANT SELECT ON public.quiz_attempt_stats TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (run these to check migration)
-- ============================================================================

-- Check table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'quiz_attempts'
ORDER BY ordinal_position;

-- Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'quiz_attempts';

-- Check RLS policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'quiz_attempts';

-- Check if data was migrated
SELECT
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN jsonb_array_length(question_order) = 0 THEN 1 END) as migrated_old_data,
  COUNT(CASE WHEN jsonb_array_length(question_order) > 0 THEN 1 END) as new_randomized_data
FROM public.quiz_attempts;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════════╗
║  MIGRATION COMPLETED SUCCESSFULLY!                           ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ quiz_attempts table created with enhanced schema         ║
║  ✅ Indexes created for optimal performance                  ║
║  ✅ RLS policies configured for security                     ║
║  ✅ Auto-update trigger installed                            ║
║  ✅ Helper functions created                                 ║
║  ✅ Statistics view available                                ║
║  ✅ Old data migrated (if existed)                           ║
╠══════════════════════════════════════════════════════════════╣
║  Next Steps:                                                 ║
║  1. Review verification queries above                        ║
║  2. Test quiz-taking flow                                    ║
║  3. Optional: Drop quiz_attempts_backup after verification   ║
║  4. Optional: Set up cron job for mark_expired_attempts()    ║
╚══════════════════════════════════════════════════════════════╝
  ';
END $$;
