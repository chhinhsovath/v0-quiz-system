import type { Certificate, Quiz, User, QuizAttempt } from "./quiz-types"
import { quizStorage } from "./quiz-storage"

export const certificateGenerator = {
  // Generate certificate for passed quiz
  generateCertificate: (attempt: QuizAttempt, quiz: Quiz, user: User): Certificate | null => {
    // Check if passing score is met
    if (quiz.passingScore && attempt.percentage < quiz.passingScore) {
      return null
    }

    const certificate: Certificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      quizId: quiz.id,
      attemptId: attempt.id,
      issuedAt: new Date().toISOString(),
      score: attempt.score,
      percentage: attempt.percentage,
    }

    quizStorage.addCertificate(certificate)

    // Update attempt to mark certificate as issued
    const attempts = quizStorage.getAttempts()
    const attemptIndex = attempts.findIndex((a) => a.id === attempt.id)
    if (attemptIndex !== -1) {
      attempts[attemptIndex].certificateIssued = true
      attempts[attemptIndex].certificateId = certificate.id
      quizStorage.saveAttempts(attempts)
    }

    return certificate
  },

  // Get certificate data for display
  getCertificateData: (certificateId: string) => {
    const certificate = quizStorage.getCertificates().find((c) => c.id === certificateId)
    if (!certificate) return null

    const quiz = quizStorage.getQuizById(certificate.quizId)
    const user = quizStorage.getUsers().find((u) => u.id === certificate.userId)

    return {
      certificate,
      quiz,
      user,
    }
  },
}
