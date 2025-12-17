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
import { Plus, Pencil, Trash2, Clock, Shuffle, Repeat, Eye, ClipboardList, Database, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { seedDemoDataSupabase } from "@/lib/seed-utils.supabase"

export default function QuizzesPage() {
  const { isAdmin, user } = useAuth()
  const { language } = useI18n()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    loadData()
  }, [isAdmin, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [quizzesData, categoriesData] = await Promise.all([
        quizStorage.getQuizzes(),
        quizStorage.getCategories()
      ])
      setQuizzes(quizzesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      confirm(
        language === "km"
          ? "តើអ្នកប្រាកដថាចង់លុបតេស្តនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។"
          : "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      try {
        await quizStorage.deleteQuiz(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting quiz:', error)
        alert(language === "km" ? "មានបញ្ហាក្នុងការលុប" : "Error deleting quiz")
      }
    }
  }

  const getCategoryById = (id: string) => {
    return categories.find((c) => c.id === id)
  }

  const handleSeedData = async () => {
    try {
      setLoading(true)
      const result = await seedDemoDataSupabase()
      setSeedResult(result)
      if (result.success) {
        await loadData()
        setTimeout(() => setSeedResult(null), 5000)
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      setSeedResult({
        success: false,
        message: language === "km"
          ? "មានបញ្ហាក្នុងការបន្ថែមទិន្នន័យសាកល្បង"
          : "Error seeding demo data",
        categoriesAdded: 0,
        quizzesAdded: 0
      })
    } finally {
      setLoading(false)
    }
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSeedData}
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <Database className="h-4 w-4 mr-2" />
                {loading
                  ? (language === "km" ? "កំពុងបន្ថែម..." : "Seeding...")
                  : (language === "km" ? "ទិន្នន័យសាកល្បង" : "Seed Demo Data")
                }
              </Button>
              <Link href="/admin/quizzes/create">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "km" ? "បង្កើតតេស្ត" : "Create Quiz"}
                </Button>
              </Link>
            </div>
          </div>

          {seedResult && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                seedResult.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p className="font-medium">{seedResult.message}</p>
            </div>
          )}

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    {language === "km" ? "កំពុងផ្ទុក..." : "Loading..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : quizzes.length === 0 ? (
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
                        <Link href={`/quizzes/take/${quiz.id}?preview=true`} className="flex-1">
                          <Button variant="outline" className="w-full bg-transparent">
                            <Play className="h-4 w-4 mr-2" />
                            {language === "km" ? "មើលជាមុន" : "Preview"}
                          </Button>
                        </Link>
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
