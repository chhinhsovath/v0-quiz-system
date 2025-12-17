-- Migration: Add subject, grade_level, and shared_with fields to question_banks table
-- Run this if you have an existing database

-- Add subject column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'question_banks' AND column_name = 'subject') THEN
    ALTER TABLE public.question_banks ADD COLUMN subject TEXT;
  END IF;
END $$;

-- Add grade_level column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'question_banks' AND column_name = 'grade_level') THEN
    ALTER TABLE public.question_banks ADD COLUMN grade_level TEXT;
  END IF;
END $$;

-- Add shared_with column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'question_banks' AND column_name = 'shared_with') THEN
    ALTER TABLE public.question_banks ADD COLUMN shared_with UUID[] DEFAULT '{}';
  END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'question_banks'
ORDER BY ordinal_position;
