import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/quiz-attempts/history?user_id={user_id}&quiz_id={quiz_id}
 * Get quiz attempt history for a user (optionally filtered by quiz)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const quiz_id = searchParams.get('quiz_id')

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes!inner (
          id,
          title,
          title_km,
          category_id,
          passing_score,
          max_attempts,
          categories (
            id,
            name,
            name_km,
            icon
          )
        )
      `)
      .eq('user_id', user_id)
      .eq('is_preview', false) // Exclude preview attempts from student history
      .order('started_at', { ascending: false })

    // Filter by quiz_id if provided
    if (quiz_id) {
      query = query.eq('quiz_id', quiz_id)
    }

    const { data: attempts, error } = await query

    if (error) {
      console.error('Error fetching attempt history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch attempt history', details: error.message },
        { status: 500 }
      )
    }

    // Format response
    const formattedAttempts = attempts?.map((attempt: any) => ({
      id: attempt.id,
      quiz: {
        id: attempt.quizzes.id,
        title: attempt.quizzes.title,
        title_km: attempt.quizzes.title_km,
        category: attempt.quizzes.categories,
        passing_score: attempt.quizzes.passing_score
      },
      score: attempt.score,
      max_score: attempt.max_score,
      percentage: attempt.score && attempt.max_score
        ? ((attempt.score / attempt.max_score) * 100).toFixed(2)
        : null,
      passed: attempt.score && attempt.max_score && attempt.quizzes.passing_score
        ? (attempt.score / attempt.max_score) * 100 >= attempt.quizzes.passing_score
        : false,
      status: attempt.status,
      started_at: attempt.started_at,
      completed_at: attempt.completed_at,
      time_spent: attempt.time_spent,
      question_count: attempt.question_order?.length || 0
    })) || []

    // Calculate statistics
    const completedAttempts = formattedAttempts.filter((a: any) => a.status === 'completed')
    const stats = {
      total_attempts: formattedAttempts.length,
      completed_attempts: completedAttempts.length,
      in_progress_attempts: formattedAttempts.filter((a: any) => a.status === 'in_progress').length,
      average_score: completedAttempts.length > 0
        ? (completedAttempts.reduce((sum: number, a: any) => sum + parseFloat(a.percentage || 0), 0) / completedAttempts.length).toFixed(2)
        : null,
      highest_score: completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((a: any) => parseFloat(a.percentage || 0))).toFixed(2)
        : null,
      passed_count: completedAttempts.filter((a: any) => a.passed).length
    }

    return NextResponse.json({
      success: true,
      attempts: formattedAttempts,
      stats
    })
  } catch (error: any) {
    console.error('Error in get attempt history:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
