-- Migration: Add shuffle_options field to quizzes table
-- Date: 2025-12-17
-- Feature: Answer Randomization (Phase 1, Week 1)

-- Add shuffle_options column to quizzes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'shuffle_options'
  ) THEN
    ALTER TABLE public.quizzes
    ADD COLUMN shuffle_options BOOLEAN DEFAULT false;

    -- Add comment for documentation
    COMMENT ON COLUMN public.quizzes.shuffle_options IS
    'Whether to shuffle answer options for each student to prevent cheating. Uses deterministic shuffling based on student ID + attempt ID.';
  END IF;
END $$;

-- Update existing quizzes to have shuffle_options = false (preserve current behavior)
UPDATE public.quizzes
SET shuffle_options = false
WHERE shuffle_options IS NULL;

-- Create index for queries filtering by shuffle_options (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_quizzes_shuffle_options
ON public.quizzes(shuffle_options)
WHERE shuffle_options = true;

-- Verify the change
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quizzes' AND column_name = 'shuffle_options'
  ) THEN
    RAISE NOTICE 'Column shuffle_options successfully added to quizzes table';
  ELSE
    RAISE EXCEPTION 'Failed to add shuffle_options column';
  END IF;
END $$;

-- Show current state
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'quizzes'
AND column_name IN ('randomize_questions', 'shuffle_options')
ORDER BY ordinal_position;
