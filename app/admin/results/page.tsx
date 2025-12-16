"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { quizStorage } from "@/lib/quiz-storage"
import type { QuizAttempt, Quiz, Category } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, BarChart3, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminResultsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<string>("all")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    loadData()
  }, [isAdmin, router])

  const loadData = () => {
    setAttempts(
      quizStorage.getAttempts().sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()),
    )
    setQuizzes(quizStorage.getQuizzes())
    setCategories(quizStorage.getCategories())
  }

  const getQuizById = (id: string) => {
    return quizzes.find((q) => q.id === id)
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  const filteredAttempts = selectedQuiz === "all" ? attempts : attempts.filter((a) => a.quizId === selectedQuiz)

  const totalAttempts = filteredAttempts.length
  const uniqueUsers = new Set(filteredAttempts.map((a) => a.userId)).size
  const averageScore =
    totalAttempts > 0
      ? filteredAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.maxScore) * 100, 0) / totalAttempts
      : 0

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-destructive"
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

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quiz Results</h1>
              <p className="text-muted-foreground">Monitor student performance and quiz statistics</p>
            </div>
          </div>

          {/* Filter */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger className="w-full md:w-80">
                  <SelectValue placeholder="Select a quiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quizzes</SelectItem>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{totalAttempts}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Unique Users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{uniqueUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attempts List */}
          {filteredAttempts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
                <p className="text-muted-foreground text-center">
                  {selectedQuiz === "all" ? "No students have taken any quizzes yet" : "No attempts for this quiz yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Attempts</h2>
              {filteredAttempts.map((attempt) => {
                const quiz = getQuizById(attempt.quizId)
                if (!quiz) return null

                const category = getCategoryById(quiz.categoryId)
                const percentage = (attempt.score / attempt.maxScore) * 100

                return (
                  <Card key={attempt.id}>
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
                          <CardDescription>User ID: {attempt.userId}</CardDescription>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          <span>
                            {attempt.score} / {attempt.maxScore} points
                          </span>
                        </div>
                        <div>
                          <span>Completed: {formatDate(attempt.completedAt)}</span>
                        </div>
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
