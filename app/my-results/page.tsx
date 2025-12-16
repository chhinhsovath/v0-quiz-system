"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { quizStorage } from "@/lib/quiz-storage"
import type { QuizAttempt, Quiz, Category } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Trophy, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MyResultsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  const loadData = () => {
    if (!user) return
    const userAttempts = quizStorage.getUserAttempts(user.id)
    setAttempts(userAttempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()))
    setQuizzes(quizStorage.getQuizzes())
    setCategories(quizStorage.getCategories())
  }

  const getQuizById = (id: string) => {
    return quizzes.find((q) => q.id === id)
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-destructive"
  }

  const averageScore =
    attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100, 0) / attempts.length
      : 0

  const totalQuizzesTaken = new Set(attempts.map((a) => a.quizId)).size

  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Results</h1>
            <p className="text-muted-foreground">Track your quiz performance and progress</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{attempts.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Quizzes Taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalQuizzesTaken}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts List */}
          {attempts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quiz attempts yet</h3>
                <p className="text-muted-foreground text-center mb-4">Start taking quizzes to see your results here</p>
                <Button onClick={() => router.push("/quizzes")}>Browse Quizzes</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Attempts</h2>
              {attempts.map((attempt) => {
                const quiz = getQuizById(attempt.quizId)
                if (!quiz) return null

                const category = getCategoryById(quiz.categoryId)
                const percentage = (attempt.score / attempt.maxScore) * 100

                return (
                  <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{quiz.title}</CardTitle>
                            {category && (
                              <Badge
                                variant="secondary"
                                style={{
                                  backgroundColor: category.color + "20",
                                  color: category.color,
                                  borderColor: category.color + "40",
                                }}
                              >
                                {category.name}
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{quiz.description}</CardDescription>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>
                            {attempt.score} / {attempt.maxScore} points
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(attempt.timeSpent)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(attempt.completedAt)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {quiz.allowMultipleAttempts && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/quizzes/${quiz.id}`)}
                            className="bg-transparent"
                          >
                            Retake Quiz
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
