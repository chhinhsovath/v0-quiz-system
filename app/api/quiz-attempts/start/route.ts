import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/quiz-attempts/start
 * Start a new quiz attempt with randomized question order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quiz_id, user_id } = body

    if (!quiz_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: quiz_id and user_id' },
        { status: 400 }
      )
    }

    // Fetch the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found', details: quizError?.message },
        { status: 404 }
      )
    }

    // Check if multiple attempts are allowed
    if (!quiz.allow_multiple_attempts) {
      const { data: existingAttempts } = await supabase
        .from('quiz_attempts')
        .select('id, status')
        .eq('quiz_id', quiz_id)
        .eq('user_id', user_id)
        .eq('status', 'completed')

      if (existingAttempts && existingAttempts.length > 0) {
        return NextResponse.json(
          {
            error: 'Multiple attempts not allowed',
            existing_attempt_id: existingAttempts[0].id
          },
          { status: 403 }
        )
      }
    }

    // Check max attempts limit
    if (quiz.max_attempts && quiz.max_attempts > 0) {
      const { data: attemptCount } = await supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_id', quiz_id)
        .eq('user_id', user_id)
        .eq('status', 'completed')

      const { count } = attemptCount as any

      if (count >= quiz.max_attempts) {
        return NextResponse.json(
          {
            error: `Maximum attempts reached (${quiz.max_attempts})`,
            attempts_used: count
          },
          { status: 403 }
        )
      }
    }

    // Randomize question order if enabled
    const questions = quiz.questions || []
    let questionOrder: string[]

    if (quiz.randomize_questions) {
      // Create randomized order
      questionOrder = questions
        .map((q: any) => q.id)
        .sort(() => Math.random() - 0.5)
    } else {
      // Keep original order
      questionOrder = questions.map((q: any) => q.id)
    }

    // Calculate max score
    const maxScore = questions.reduce((sum: number, q: any) => sum + (q.points || 0), 0)

    // Get IP address and user agent
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    // Create new attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id,
        user_id,
        question_order: questionOrder,
        answers: {},
        max_score: maxScore,
        time_limit: quiz.time_limit ? quiz.time_limit * 60 : null, // Convert minutes to seconds
        status: 'in_progress',
        started_at: new Date().toISOString(),
        ip_address,
        user_agent
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating attempt:', attemptError)
      return NextResponse.json(
        { error: 'Failed to create quiz attempt', details: attemptError.message },
        { status: 500 }
      )
    }

    // Return attempt with questions in randomized order
    const orderedQuestions = questionOrder
      .map(qId => questions.find((q: any) => q.id === qId))
      .filter(Boolean)

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        user_id: attempt.user_id,
        question_order: attempt.question_order,
        max_score: attempt.max_score,
        time_limit: attempt.time_limit,
        started_at: attempt.started_at,
        status: attempt.status
      },
      questions: orderedQuestions,
      quiz_info: {
        title: quiz.title,
        title_km: quiz.title_km,
        description: quiz.description,
        description_km: quiz.description_km,
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        show_correct_answers: quiz.show_correct_answers
      }
    })
  } catch (error: any) {
    console.error('Error in start quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
