"use client"

import { QuizBuilder } from "@/components/quiz-builder"
import { BackButton } from "@/components/back-button"

export default function CreateQuizPage() {
  return (
    <div>
      <div className="container mx-auto px-4 py-4">
        <BackButton href="/admin/quizzes" />
      </div>
      <QuizBuilder />
    </div>
  )
}
