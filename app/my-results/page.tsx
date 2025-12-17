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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    if (!user) return
    try {
      setLoading(true)
      const [userAttempts, allQuizzes, allCategories] = await Promise.all([
        quizStorage.getUserAttempts(user.id),
        quizStorage.getQuizzes(),
        quizStorage.getCategories()
      ])
      setAttempts(userAttempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()))
      setQuizzes(allQuizzes)
      setCategories(allCategories)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Results</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Track your quiz performance and progress</p>
          </div>

          {/* Stats Overview */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">Total Attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold">{attempts.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">Quizzes Taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className="text-2xl sm:text-3xl font-bold">{totalQuizzesTaken}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 md:col-span-1">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">Average Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          ) : attempts.length === 0 ? (
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
              <h2 className="text-lg sm:text-xl font-semibold">Recent Attempts</h2>
              {attempts.map((attempt) => {
                const quiz = getQuizById(attempt.quizId)
                if (!quiz) return null

                const category = getCategoryById(quiz.categoryId)
                const percentage = (attempt.score / attempt.maxScore) * 100

                return (
                  <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CardTitle className="text-base sm:text-lg">{quiz.title}</CardTitle>
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
                          <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                        </div>
                        <div className={`text-2xl sm:text-3xl font-bold ${getScoreColor(percentage)}`}>
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
                            className="bg-transparent w-full sm:w-auto"
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
