-- Enhanced Quiz Attempts Schema for Individual Student Randomization
-- Run this in Supabase SQL Editor to upgrade the quiz_attempts table

-- Drop existing quiz_attempts table if you want to start fresh
-- DROP TABLE IF EXISTS public.quiz_attempts CASCADE;

-- Create enhanced quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

  -- Store the randomized question order for this specific attempt
  question_order JSONB NOT NULL DEFAULT '[]', -- Array of question IDs in the order they were presented

  -- Store student's answers mapped to question IDs
  answers JSONB NOT NULL DEFAULT '{}', -- { "question-id": "answer-value" }

  -- Scoring and grading
  score INTEGER DEFAULT 0,
  max_score INTEGER NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN max_score > 0 THEN (score::NUMERIC / max_score::NUMERIC * 100)
      ELSE 0
    END
  ) STORED,

  -- Timing information
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- in seconds
  time_limit INTEGER, -- quiz time limit in seconds (snapshot)

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at);

-- Add RLS policy
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own attempts
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid()::text = user_id OR
         EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'admin'));

-- Policy: Users can create their own attempts
CREATE POLICY "Users can create own attempts" ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own in-progress attempts
CREATE POLICY "Users can update own attempts" ON public.quiz_attempts
  FOR UPDATE
  USING (auth.uid()::text = user_id AND status = 'in_progress');

-- Policy: Admins can view all attempts
CREATE POLICY "Admins can view all attempts" ON public.quiz_attempts
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'admin'));

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark attempts as expired if time limit exceeded
CREATE OR REPLACE FUNCTION mark_expired_attempts()
RETURNS void AS $$
BEGIN
  UPDATE public.quiz_attempts
  SET status = 'expired',
      completed_at = started_at + (time_limit || ' seconds')::INTERVAL
  WHERE status = 'in_progress'
    AND time_limit > 0
    AND NOW() > started_at + (time_limit || ' seconds')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run this function periodically
-- You can set this up in Supabase Dashboard > Database > Cron Jobs
-- SELECT cron.schedule('mark-expired-attempts', '*/5 * * * *', 'SELECT mark_expired_attempts()');

-- Create a view for quiz attempt statistics
CREATE OR REPLACE VIEW public.quiz_attempt_stats AS
SELECT
  qa.quiz_id,
  q.title as quiz_title,
  COUNT(DISTINCT qa.user_id) as total_students,
  COUNT(qa.id) as total_attempts,
  COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_attempts,
  AVG(CASE WHEN qa.status = 'completed' THEN qa.score END) as avg_score,
  MAX(qa.score) as highest_score,
  MIN(CASE WHEN qa.status = 'completed' THEN qa.score END) as lowest_score,
  AVG(CASE WHEN qa.status = 'completed' THEN qa.time_spent END) as avg_time_spent
FROM public.quiz_attempts qa
JOIN public.quizzes q ON qa.quiz_id = q.id
GROUP BY qa.quiz_id, q.title;

-- Grant access to the view
GRANT SELECT ON public.quiz_attempt_stats TO authenticated;

COMMENT ON TABLE public.quiz_attempts IS 'Stores individual student quiz attempts with randomized question orders';
COMMENT ON COLUMN public.quiz_attempts.question_order IS 'Array of question IDs in the order presented to this student';
COMMENT ON COLUMN public.quiz_attempts.answers IS 'Student answers mapped by question ID';
COMMENT ON COLUMN public.quiz_attempts.status IS 'Current status: in_progress, completed, abandoned, or expired';
