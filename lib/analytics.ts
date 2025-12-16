import type { QuizAttempt, Question, QuestionAnalytics, StudentAnalytics } from "./quiz-types"
import { quizStorage } from "./quiz-storage"

export const analyticsEngine = {
  // Calculate question difficulty based on correct response rate
  calculateQuestionDifficulty: (questionId: string): number => {
    const attempts = quizStorage.getAttempts()
    const questionAttempts = attempts.filter((a) => a.answers[questionId])
    if (questionAttempts.length === 0) return 0.5

    const quizzes = quizStorage.getQuizzes()
    let correctCount = 0
    let totalCount = 0

    questionAttempts.forEach((attempt) => {
      const quiz = quizzes.find((q) => q.id === attempt.quizId)
      if (!quiz) return

      const question = quiz.questions.find((q) => q.id === questionId)
      if (!question) return

      const userAnswer = attempt.answers[questionId]
      const isCorrect = analyticsEngine.checkAnswer(question, userAnswer)

      if (isCorrect) correctCount++
      totalCount++
    })

    return totalCount > 0 ? correctCount / totalCount : 0.5
  },

  // Calculate discrimination index (how well question separates high/low performers)
  calculateDiscrimination: (questionId: string): number => {
    const attempts = quizStorage.getAttempts()
    const questionAttempts = attempts.filter((a) => a.answers[questionId])
    if (questionAttempts.length < 10) return 0

    // Sort attempts by overall score
    const sortedAttempts = [...questionAttempts].sort((a, b) => b.percentage - a.percentage)

    const topThird = sortedAttempts.slice(0, Math.floor(sortedAttempts.length / 3))
    const bottomThird = sortedAttempts.slice(-Math.floor(sortedAttempts.length / 3))

    const quizzes = quizStorage.getQuizzes()
    let topCorrect = 0
    let bottomCorrect = 0

    const checkGroup = (group: QuizAttempt[]) => {
      let correct = 0
      group.forEach((attempt) => {
        const quiz = quizzes.find((q) => q.id === attempt.quizId)
        if (!quiz) return
        const question = quiz.questions.find((q) => q.id === questionId)
        if (!question) return
        if (analyticsEngine.checkAnswer(question, attempt.answers[questionId])) correct++
      })
      return correct
    }

    topCorrect = checkGroup(topThird)
    bottomCorrect = checkGroup(bottomThird)

    const discrimination = (topCorrect - bottomCorrect) / Math.floor(sortedAttempts.length / 3)
    return Math.max(-1, Math.min(1, discrimination))
  },

  checkAnswer: (question: Question, userAnswer: string | string[] | undefined): boolean => {
    if (!userAnswer) return false

    switch (question.type) {
      case "multiple-choice":
      case "true-false":
      case "image-choice":
        return userAnswer === question.correctAnswer

      case "multiple-select":
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) return false
        return (
          userAnswer.length === question.correctAnswer.length &&
          userAnswer.every((a) => question.correctAnswer.includes(a))
        )

      case "short-answer":
        return String(userAnswer).toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim()

      case "matching":
      case "drag-drop":
        if (typeof userAnswer !== "object" || typeof question.correctAnswer !== "object") return false
        const userObj = userAnswer as Record<string, string>
        const correctObj = question.correctAnswer as Record<string, string>
        return Object.keys(correctObj).every((key) => userObj[key] === correctObj[key])

      default:
        return false
    }
  },

  // Get comprehensive analytics for a question
  getQuestionAnalytics: (questionId: string): QuestionAnalytics => {
    const attempts = quizStorage.getAttempts()
    const questionAttempts = attempts.filter((a) => a.answers[questionId])

    let correctCount = 0
    let totalTime = 0

    questionAttempts.forEach((attempt) => {
      const timing = attempt.questionTimings?.[questionId] || 0
      totalTime += timing

      const quizzes = quizStorage.getQuizzes()
      const quiz = quizzes.find((q) => q.id === attempt.quizId)
      if (quiz) {
        const question = quiz.questions.find((q) => q.id === questionId)
        if (question && analyticsEngine.checkAnswer(question, attempt.answers[questionId])) {
          correctCount++
        }
      }
    })

    return {
      questionId,
      totalAttempts: questionAttempts.length,
      correctAttempts: correctCount,
      averageTime: questionAttempts.length > 0 ? totalTime / questionAttempts.length : 0,
      difficulty: analyticsEngine.calculateQuestionDifficulty(questionId),
      discrimination: analyticsEngine.calculateDiscrimination(questionId),
    }
  },

  // Get student performance analytics
  getStudentAnalytics: (userId: string): StudentAnalytics => {
    const attempts = quizStorage.getUserAttempts(userId)
    const quizzes = quizStorage.getQuizzes()

    let totalScore = 0
    let totalTime = 0
    const subjectScores: Record<string, number[]> = {}
    const progressData: Array<{ date: string; score: number }> = []

    attempts.forEach((attempt) => {
      totalScore += attempt.percentage
      totalTime += attempt.timeSpent

      const quiz = quizzes.find((q) => q.id === attempt.quizId)
      if (quiz && quiz.subject) {
        if (!subjectScores[quiz.subject]) subjectScores[quiz.subject] = []
        subjectScores[quiz.subject].push(attempt.percentage)
      }

      progressData.push({
        date: attempt.completedAt,
        score: attempt.percentage,
      })
    })

    // Identify strong and weak subjects
    const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject,
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))

    subjectAverages.sort((a, b) => b.average - a.average)

    return {
      userId,
      totalQuizzes: quizzes.length,
      completedQuizzes: attempts.length,
      averageScore: attempts.length > 0 ? totalScore / attempts.length : 0,
      averageTime: attempts.length > 0 ? totalTime / attempts.length : 0,
      strongSubjects: subjectAverages.slice(0, 3).map((s) => s.subject),
      weakSubjects: subjectAverages.slice(-3).map((s) => s.subject),
      progressOverTime: progressData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      recentActivity: attempts.slice(-10).reverse(),
    }
  },

  // Compare class performance
  getClassComparison: (classId: string) => {
    const classData = quizStorage.getClasses().find((c) => c.id === classId)
    if (!classData) return null

    const students = classData.studentIds
    const studentAnalytics = students.map((studentId) => analyticsEngine.getStudentAnalytics(studentId))

    return {
      classId,
      studentCount: students.length,
      averageScore: studentAnalytics.reduce((acc, s) => acc + s.averageScore, 0) / students.length,
      topPerformers: studentAnalytics.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5),
      strugglingStudents: studentAnalytics.sort((a, b) => a.averageScore - b.averageScore).slice(0, 5),
    }
  },

  // Adaptive testing: Select next question based on performance
  selectAdaptiveQuestion: (
    questionBank: Question[],
    recentPerformance: number, // 0-1, percentage correct
    answeredIds: string[],
  ): Question | null => {
    const unanswered = questionBank.filter((q) => !answeredIds.includes(q.id))
    if (unanswered.length === 0) return null

    // Target difficulty based on performance
    let targetDifficulty: "easy" | "medium" | "hard"
    if (recentPerformance < 0.4) targetDifficulty = "easy"
    else if (recentPerformance < 0.7) targetDifficulty = "medium"
    else targetDifficulty = "hard"

    // Try to find question matching target difficulty
    const matchingDifficulty = unanswered.filter((q) => q.difficulty === targetDifficulty)
    if (matchingDifficulty.length > 0) {
      return matchingDifficulty[Math.floor(Math.random() * matchingDifficulty.length)]
    }

    // Fallback to random unanswered question
    return unanswered[Math.floor(Math.random() * unanswered.length)]
  },
}
