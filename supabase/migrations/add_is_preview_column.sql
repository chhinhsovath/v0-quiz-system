-- Migration: Add is_preview column to quiz_attempts
-- Date: 2025-12-17
-- Description: Adds is_preview boolean flag to distinguish preview attempts from real student attempts

-- Add is_preview column with default false
ALTER TABLE public.quiz_attempts
ADD COLUMN IF NOT EXISTS is_preview BOOLEAN NOT NULL DEFAULT false;

-- Create index for filtering preview attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_is_preview ON public.quiz_attempts(is_preview);

-- Create composite index for common queries (user + is_preview)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_is_preview ON public.quiz_attempts(user_id, is_preview);

-- Add comment
COMMENT ON COLUMN public.quiz_attempts.is_preview IS 'True if this is a preview attempt by admin/teacher, false for real student attempts. Preview attempts are excluded from student history and statistics.';

-- Update the statistics view to exclude preview attempts
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
WHERE qa.is_preview = false -- Exclude preview attempts from statistics
GROUP BY qa.quiz_id, q.title, q.title_km, q.passing_score;

COMMENT ON VIEW public.quiz_attempt_stats IS 'Aggregated statistics for quiz attempts by quiz (excludes preview attempts)';

GRANT SELECT ON public.quiz_attempt_stats TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '
╔══════════════════════════════════════════════════════════════╗
║  MIGRATION COMPLETED: is_preview column added                ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ is_preview column added with default false               ║
║  ✅ Indexes created for optimal filtering                    ║
║  ✅ Statistics view updated to exclude previews              ║
╠══════════════════════════════════════════════════════════════╣
║  Usage:                                                      ║
║  - Preview attempts: is_preview = true                       ║
║  - Real attempts: is_preview = false (default)               ║
║  - Preview attempts excluded from student history & stats    ║
╚══════════════════════════════════════════════════════════════╝
  ';
END $$;
