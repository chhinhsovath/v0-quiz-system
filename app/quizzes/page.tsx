"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { NavHeader } from "@/components/nav-header"
import { quizStorage } from "@/lib/quiz-storage"
import type { Quiz, Category, QuizAttempt } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ClipboardList, Shuffle, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function QuizzesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  const loadData = () => {
    setQuizzes(quizStorage.getQuizzes())
    setCategories(quizStorage.getCategories())
    if (user) {
      setAttempts(quizStorage.getUserAttempts(user.id))
    }
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  const getQuizAttemptCount = (quizId: string) => {
    return attempts.filter((a) => a.quizId === quizId).length
  }

  const getBestScore = (quizId: string) => {
    const quizAttempts = attempts.filter((a) => a.quizId === quizId)
    if (quizAttempts.length === 0) return null
    return Math.max(...quizAttempts.map((a) => (a.score / a.maxScore) * 100))
  }

  if (!user) return null

  // Group quizzes by category
  const quizzesByCategory = categories.map((category) => ({
    category,
    quizzes: quizzes.filter((q) => q.categoryId === category.id),
  }))

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Available Quizzes</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Browse quizzes and test your knowledge</p>
          </div>

          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quizzes available yet</h3>
                <p className="text-muted-foreground text-center">Check back later for new quizzes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {quizzesByCategory.map(
                ({ category, quizzes: categoryQuizzes }) =>
                  categoryQuizzes.length > 0 && (
                    <div key={category.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + "20" }}
                        >
                          <BookOpen className="h-4 w-4" style={{ color: category.color }} />
                        </div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {categoryQuizzes.map((quiz) => {
                          const attemptCount = getQuizAttemptCount(quiz.id)
                          const bestScore = getBestScore(quiz.id)

                          return (
                            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                              <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                                  {attemptCount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                      {attemptCount} attempt{attemptCount > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <ClipboardList className="h-4 w-4" />
                                    <span>{quiz.questions.length} questions</span>
                                  </div>
                                  {quiz.timeLimit > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{quiz.timeLimit} min</span>
                                    </div>
                                  )}
                                  {quiz.randomizeQuestions && (
                                    <div className="flex items-center gap-1">
                                      <Shuffle className="h-4 w-4" />
                                      <span>Randomized</span>
                                    </div>
                                  )}
                                </div>

                                {bestScore !== null && (
                                  <div className="mb-4 p-3 bg-muted rounded-lg">
                                    <p className="text-sm font-medium">Best Score: {bestScore.toFixed(0)}%</p>
                                  </div>
                                )}

                                <Link href={`/quizzes/${quiz.id}`}>
                                  <Button className="w-full">{attemptCount > 0 ? "Retake Quiz" : "Start Quiz"}</Button>
                                </Link>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
