import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/quiz-attempts/submit
 * Submit a quiz attempt and calculate score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { attempt_id, answers } = body

    if (!attempt_id || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields: attempt_id and answers' },
        { status: 400 }
      )
    }

    // Fetch the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: 'Attempt not found', details: attemptError?.message },
        { status: 404 }
      )
    }

    // Check if already completed
    if (attempt.status === 'completed') {
      return NextResponse.json(
        { error: 'This attempt has already been submitted' },
        { status: 400 }
      )
    }

    // Fetch the quiz to get questions and correct answers
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', attempt.quiz_id)
      .single()

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found', details: quizError?.message },
        { status: 404 }
      )
    }

    // Calculate score
    const questions = quiz.questions || []
    let totalScore = 0
    const results: Record<string, any> = {}

    questions.forEach((question: any) => {
      const studentAnswer = answers[question.id]
      const isCorrect = checkAnswer(question, studentAnswer)

      results[question.id] = {
        student_answer: studentAnswer,
        correct_answer: question.correctAnswer,
        is_correct: isCorrect,
        points_earned: isCorrect ? (question.points || 0) : 0,
        points_possible: question.points || 0
      }

      if (isCorrect) {
        totalScore += question.points || 0
      }
    })

    // Calculate time spent
    const startedAt = new Date(attempt.started_at)
    const completedAt = new Date()
    const timeSpent = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000) // in seconds

    // Update attempt with results
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        answers,
        score: totalScore,
        status: 'completed',
        completed_at: completedAt.toISOString(),
        time_spent: timeSpent
      })
      .eq('id', attempt_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating attempt:', updateError)
      return NextResponse.json(
        { error: 'Failed to submit quiz', details: updateError.message },
        { status: 500 }
      )
    }

    // Check if passed and certificate is enabled
    const percentage = (totalScore / attempt.max_score) * 100
    const passed = percentage >= quiz.passing_score

    let certificate = null
    if (passed && quiz.certificate_enabled) {
      // Generate certificate
      const certificateNumber = `CERT-${Date.now()}-${attempt.user_id.substring(0, 8)}`

      const { data: cert, error: certError } = await supabase
        .from('certificates')
        .insert({
          user_id: attempt.user_id,
          quiz_id: attempt.quiz_id,
          attempt_id: attempt.id,
          score: totalScore,
          max_score: attempt.max_score,
          percentage: percentage.toFixed(2),
          certificate_number: certificateNumber,
          issued_at: completedAt.toISOString()
        })
        .select()
        .single()

      if (!certError && cert) {
        certificate = {
          id: cert.id,
          certificate_number: cert.certificate_number,
          issued_at: cert.issued_at
        }
      }
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: updatedAttempt.id,
        quiz_id: updatedAttempt.quiz_id,
        user_id: updatedAttempt.user_id,
        score: updatedAttempt.score,
        max_score: updatedAttempt.max_score,
        percentage: percentage.toFixed(2),
        passed,
        status: updatedAttempt.status,
        started_at: updatedAttempt.started_at,
        completed_at: updatedAttempt.completed_at,
        time_spent: updatedAttempt.time_spent
      },
      results,
      certificate
    })
  } catch (error: any) {
    console.error('Error in submit quiz attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Helper function to check if an answer is correct
 */
function checkAnswer(question: any, studentAnswer: any): boolean {
  if (!studentAnswer) return false

  const correctAnswer = question.correctAnswer

  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
    case 'short-answer':
      return String(studentAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()

    case 'multiple-select':
      if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) return false
      const sortedStudent = [...studentAnswer].sort()
      const sortedCorrect = [...correctAnswer].sort()
      return JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect)

    case 'fill-blanks':
      if (typeof studentAnswer !== 'object' || typeof correctAnswer !== 'object') return false
      return Object.keys(correctAnswer).every(
        key => String(studentAnswer[key]).trim().toLowerCase() === String(correctAnswer[key]).trim().toLowerCase()
      )

    case 'matching':
      if (typeof studentAnswer !== 'object' || !Array.isArray(question.pairs)) return false
      return question.pairs.every((pair: any) => studentAnswer[pair.left] === pair.right)

    case 'ordering':
      if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) return false
      return JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)

    case 'drag-drop':
      if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) return false
      return JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)

    case 'image-choice':
      return String(studentAnswer) === String(correctAnswer)

    case 'hotspot':
      // Hotspot questions need special handling - check if clicked coordinates are within correct regions
      if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) return false
      return correctAnswer.every((correct: any) =>
        studentAnswer.some((student: any) =>
          Math.abs(student.x - correct.x) <= 10 && Math.abs(student.y - correct.y) <= 10
        )
      )

    case 'essay':
      // Essays can't be auto-graded, return false (needs manual grading)
      return false

    default:
      return false
  }
}
