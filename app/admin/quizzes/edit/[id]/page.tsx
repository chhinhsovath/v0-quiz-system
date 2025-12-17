"use client"

import { useEffect, useState } from "react"
import { QuizBuilder } from "@/components/quiz-builder"
import { BackButton } from "@/components/back-button"
import { quizStorage } from "@/lib/quiz-storage"
import type { Quiz } from "@/lib/quiz-types"
import { useParams } from "next/navigation"

export default function EditQuizPage() {
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const foundQuiz = await quizStorage.getQuizById(id)
        if (foundQuiz) {
          setQuiz(foundQuiz)
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
      } finally {
        setLoading(false)
      }
    }
    loadQuiz()
  }, [params.id])

  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <BackButton href="/admin/quizzes" />
      </div>
      <QuizBuilder initialQuiz={quiz} />
    </div>
  )
}
