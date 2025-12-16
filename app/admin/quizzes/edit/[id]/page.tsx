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

  useEffect(() => {
    const id = params.id as string
    const foundQuiz = quizStorage.getQuizById(id)
    if (foundQuiz) {
      setQuiz(foundQuiz)
    }
  }, [params.id])

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
