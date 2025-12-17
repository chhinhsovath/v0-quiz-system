import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/quiz-attempts/[id]
 * Get detailed information about a specific attempt including review data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const attemptId = id

    // Fetch attempt with quiz and user data
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes!inner (
          id,
          title,
          title_km,
          description,
          description_km,
          questions,
          passing_score,
          show_correct_answers,
          category_id,
          categories (
            id,
            name,
            name_km,
            icon
          )
        ),
        users!inner (
          id,
          name,
          name_km,
          email
        )
      `)
      .eq('id', attemptId)
      .single()

    if (error || !attempt) {
      return NextResponse.json(
        { error: 'Attempt not found', details: error?.message },
        { status: 404 }
      )
    }

    // Get questions in the order they were presented to the student
    const allQuestions = attempt.quizzes.questions || []
    const questionOrder = attempt.question_order || []

    const orderedQuestions = questionOrder
      .map((qId: string) => allQuestions.find((q: any) => q.id === qId))
      .filter(Boolean)

    // Build review data with student answers
    const reviewData = orderedQuestions.map((question: any, index: number) => {
      const studentAnswer = attempt.answers?.[question.id]
      const result = calculateQuestionResult(question, studentAnswer)

      return {
        question_number: index + 1,
        question_id: question.id,
        type: question.type,
        question: question.question,
        questionKm: question.questionKm,
        options: question.options,
        optionsKm: question.optionsKm,
        student_answer: studentAnswer,
        correct_answer: attempt.quizzes.show_correct_answers ? question.correctAnswer : undefined,
        is_correct: result.is_correct,
        points_earned: result.points_earned,
        points_possible: question.points || 0,
        explanation: attempt.quizzes.show_correct_answers ? question.explanation : undefined,
        explanationKm: attempt.quizzes.show_correct_answers ? question.explanationKm : undefined
      }
    })

    // Calculate percentage
    const percentage = attempt.max_score > 0
      ? ((attempt.score / attempt.max_score) * 100).toFixed(2)
      : '0.00'

    const passed = parseFloat(percentage) >= attempt.quizzes.passing_score

    // Check if certificate exists
    const { data: certificate } = await supabase
      .from('certificates')
      .select('*')
      .eq('attempt_id', attemptId)
      .single()

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        user_id: attempt.user_id,
        status: attempt.status,
        started_at: attempt.started_at,
        completed_at: attempt.completed_at,
        time_spent: attempt.time_spent,
        time_limit: attempt.time_limit,
        score: attempt.score,
        max_score: attempt.max_score,
        percentage,
        passed
      },
      quiz: {
        id: attempt.quizzes.id,
        title: attempt.quizzes.title,
        title_km: attempt.quizzes.title_km,
        description: attempt.quizzes.description,
        description_km: attempt.quizzes.description_km,
        passing_score: attempt.quizzes.passing_score,
        show_correct_answers: attempt.quizzes.show_correct_answers,
        category: attempt.quizzes.categories
      },
      user: {
        id: attempt.users.id,
        name: attempt.users.name,
        name_km: attempt.users.name_km,
        email: attempt.users.email
      },
      questions: reviewData,
      certificate: certificate || null,
      statistics: {
        total_questions: orderedQuestions.length,
        correct_answers: reviewData.filter((q: any) => q.is_correct).length,
        incorrect_answers: reviewData.filter((q: any) => !q.is_correct && q.student_answer).length,
        unanswered: reviewData.filter((q: any) => !q.student_answer).length
      }
    })
  } catch (error: any) {
    console.error('Error fetching attempt details:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate result for a single question
 */
function calculateQuestionResult(question: any, studentAnswer: any) {
  if (!studentAnswer) {
    return { is_correct: false, points_earned: 0 }
  }

  const correctAnswer = question.correctAnswer
  let isCorrect = false

  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
    case 'short-answer':
      isCorrect = String(studentAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()
      break

    case 'multiple-select':
      if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer)) {
        const sortedStudent = [...studentAnswer].sort()
        const sortedCorrect = [...correctAnswer].sort()
        isCorrect = JSON.stringify(sortedStudent) === JSON.stringify(sortedCorrect)
      }
      break

    case 'fill-blanks':
      if (typeof studentAnswer === 'object' && typeof correctAnswer === 'object') {
        isCorrect = Object.keys(correctAnswer).every(
          key => String(studentAnswer[key]).trim().toLowerCase() === String(correctAnswer[key]).trim().toLowerCase()
        )
      }
      break

    case 'matching':
      if (typeof studentAnswer === 'object' && Array.isArray(question.pairs)) {
        isCorrect = question.pairs.every((pair: any) => studentAnswer[pair.left] === pair.right)
      }
      break

    case 'ordering':
    case 'drag-drop':
      if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer)) {
        isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer)
      }
      break

    case 'image-choice':
      isCorrect = String(studentAnswer) === String(correctAnswer)
      break

    case 'hotspot':
      if (Array.isArray(studentAnswer) && Array.isArray(correctAnswer)) {
        isCorrect = correctAnswer.every((correct: any) =>
          studentAnswer.some((student: any) =>
            Math.abs(student.x - correct.x) <= 10 && Math.abs(student.y - correct.y) <= 10
          )
        )
      }
      break

    case 'essay':
      // Essays need manual grading
      isCorrect = false
      break
  }

  return {
    is_correct: isCorrect,
    points_earned: isCorrect ? (question.points || 0) : 0
  }
}
