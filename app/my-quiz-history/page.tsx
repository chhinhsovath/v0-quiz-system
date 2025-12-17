"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, XCircle, Clock, Eye, AlertCircle, Loader2, TrendingUp, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MyQuizHistoryPage() {
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { language, t } = useI18n()

  const [attempts, setAttempts] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/quiz-attempts/history?user_id=${user.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load history')
        }

        setAttempts(data.attempts)
        setStats(data.stats)
      } catch (err: any) {
        console.error('Error fetching history:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, router])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {language === 'km' ? 'ប្រវត្តិតេស្តរបស់ខ្ញុំ' : 'My Quiz History'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'km' ? 'មើលតេស្តទាំងអស់ដែលអ្នកធ្វើរួច' : 'View all your completed quizzes'}
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{language === 'km' ? 'សរុប' : 'Total Attempts'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_attempts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{language === 'km' ? 'បានបញ្ចប់' : 'Completed'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completed_attempts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{language === 'km' ? 'ពិន្ទុមធ្យម' : 'Average Score'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {stats.average_score || '0'}%
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{language === 'km' ? 'ជាប់' : 'Passed'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {stats.passed_count}
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attempts Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'km' ? 'រូបភាពសកម្មភាព' : 'All Attempts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {language === 'km' ? 'អ្នកមិនទាន់ធ្វើតេស្តណាមួយនៅឡើយ' : 'You haven\'t taken any quizzes yet'}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/quizzes">
                      {language === 'km' ? 'ចាប់ផ្តើមតេស្ត' : 'Start a Quiz'}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'km' ? 'តេស្ត' : 'Quiz'}</TableHead>
                        <TableHead>{language === 'km' ? 'ថ្ងៃបញ្ចប់' : 'Completed'}</TableHead>
                        <TableHead>{language === 'km' ? 'ពិន្ទុ' : 'Score'}</TableHead>
                        <TableHead>{language === 'km' ? 'លទ្ធផល' : 'Result'}</TableHead>
                        <TableHead>{language === 'km' ? 'ពេលវេលា' : 'Time'}</TableHead>
                        <TableHead className="text-right">{language === 'km' ? 'សកម្មភាព' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {language === 'km' && attempt.quiz.title_km
                                  ? attempt.quiz.title_km
                                  : attempt.quiz.title}
                              </div>
                              {attempt.quiz.category && (
                                <Badge variant="outline" className="mt-1">
                                  {language === 'km' && attempt.quiz.category.name_km
                                    ? attempt.quiz.category.name_km
                                    : attempt.quiz.category.name}
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              {attempt.completed_at
                                ? formatDate(attempt.completed_at)
                                : language === 'km'
                                ? 'កំពុងដំណើរការ'
                                : 'In Progress'}
                            </div>
                          </TableCell>

                          <TableCell>
                            {attempt.status === 'completed' ? (
                              <div className="font-medium">
                                {attempt.score}/{attempt.max_score}
                                <div className="text-xs text-muted-foreground">{attempt.percentage}%</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>

                          <TableCell>
                            {attempt.status === 'completed' ? (
                              attempt.passed ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {language === 'km' ? 'ជាប់' : 'Passed'}
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {language === 'km' ? 'ធ្លាក់' : 'Failed'}
                                </Badge>
                              )
                            ) : (
                              <Badge variant="secondary">
                                {language === 'km' ? 'កំពុងដំណើរការ' : 'In Progress'}
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell>
                            {attempt.time_spent ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {formatTime(attempt.time_spent)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {attempt.status === 'completed' ? (
                              <Button size="sm" variant="ghost" asChild>
                                <Link href={`/quizzes/result/${attempt.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {language === 'km' ? 'មើល' : 'View'}
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/quizzes/take/${attempt.quiz.id}`}>
                                  {language === 'km' ? 'បន្ត' : 'Continue'}
                                </Link>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
