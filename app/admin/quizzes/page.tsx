"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { quizStorage } from "@/lib/quiz-storage"
import type { Quiz, Category } from "@/lib/quiz-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Clock, Shuffle, Repeat, Eye, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function QuizzesPage() {
  const { isAdmin, user } = useAuth()
  const { language } = useI18n()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    loadData()
  }, [isAdmin, router])

  const loadData = () => {
    setQuizzes(quizStorage.getQuizzes())
    setCategories(quizStorage.getCategories())
  }

  const handleDelete = (id: string) => {
    if (
      confirm(
        language === "km"
          ? "តើអ្នកប្រាកដថាចង់លុបតេស្តនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។"
          : "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      quizStorage.deleteQuiz(id)
      loadData()
    }
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {language === "km" ? "តេស្ត" : "Quizzes"}
              </h1>
              <p className="text-muted-foreground">
                {language === "km" ? "បង្កើត និងគ្រប់គ្រងមាតិកាតេស្តរបស់អ្នក" : "Create and manage your quiz content"}
              </p>
            </div>

            <Link href="/admin/quizzes/create">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {language === "km" ? "បង្កើតតេស្ត" : "Create Quiz"}
              </Button>
            </Link>
          </div>

          {quizzes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "km" ? "មិនទាន់មានតេស្តនៅឡើយ" : "No quizzes yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {language === "km" ? "បង្កើតតេស្តដំបូងរបស់អ្នកដើម្បីចាប់ផ្តើម" : "Create your first quiz to get started"}
                </p>
                <Link href="/admin/quizzes/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "km" ? "បង្កើតតេស្ត" : "Create Quiz"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const category = getCategoryById(quiz.categoryId)
                return (
                  <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{quiz.title}</CardTitle>
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
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-4 w-4" />
                          <span>
                            {quiz.questions.length} {language === "km" ? "សំណួរ" : "questions"}
                          </span>
                        </div>
                        {quiz.timeLimit > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {quiz.timeLimit} {language === "km" ? "នាទី" : "minutes"}
                            </span>
                          </div>
                        )}
                        {quiz.randomizeQuestions && (
                          <div className="flex items-center gap-1">
                            <Shuffle className="h-4 w-4" />
                            <span>{language === "km" ? "ចៃដន្យ" : "Randomized"}</span>
                          </div>
                        )}
                        {quiz.allowMultipleAttempts && (
                          <div className="flex items-center gap-1">
                            <Repeat className="h-4 w-4" />
                            <span>{language === "km" ? "អាចធ្វើម្តងទៀត" : "Multiple attempts"}</span>
                          </div>
                        )}
                        {quiz.showCorrectAnswers && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{language === "km" ? "បង្ហាញចម្លើយ" : "Show answers"}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/quizzes/edit/${quiz.id}`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Pencil className="h-4 w-4 mr-2" />
                            {language === "km" ? "កែសម្រួល" : "Edit"}
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="text-destructive hover:text-destructive bg-transparent"
                          onClick={() => handleDelete(quiz.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
