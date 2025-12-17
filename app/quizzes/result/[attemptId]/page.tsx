"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Clock, Award, AlertCircle, Loader2, Download, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function QuizResultPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { language, t } = useI18n()

  const [attemptData, setAttemptData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const fetchAttemptDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/quiz-attempts/${params.attemptId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load results')
        }

        setAttemptData(data)
      } catch (err: any) {
        console.error('Error fetching results:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAttemptDetails()
  }, [params.attemptId, user, router])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <Button onClick={() => router.push('/quizzes')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToQuizzes || 'Back to Quizzes'}
          </Button>
        </main>
      </div>
    )
  }

  const { attempt, quiz, questions, statistics, certificate } = attemptData

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/quizzes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {language === 'km' ? 'ត្រលប់ទៅតេស្ត' : 'Back to Quizzes'}
          </Link>

          {/* Results Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {language === 'km' && quiz.title_km ? quiz.title_km : quiz.title}
                  </CardTitle>
                  <CardDescription>
                    {language === 'km' ? 'ពិន្ទុរបស់អ្នក' : 'Your Score'}
                  </CardDescription>
                </div>
                {attempt.passed && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {language === 'km' ? 'ជាប់' : 'Passed'}
                  </Badge>
                )}
                {!attempt.passed && (
                  <Badge variant="destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    {language === 'km' ? 'ធ្លាក់' : 'Failed'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{attempt.percentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'km' ? 'ភាគរយ' : 'Percentage'}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{attempt.score}/{attempt.max_score}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'km' ? 'ពិន្ទុ' : 'Score'}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{statistics.correct_answers}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'km' ? 'ត្រូវ' : 'Correct'}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{statistics.incorrect_answers}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {language === 'km' ? 'ខុស' : 'Incorrect'}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {attempt.time_spent && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {language === 'km' ? 'ពេលវេលា៖' : 'Time:'} {formatTime(attempt.time_spent)}
                    </span>
                  </div>
                )}
                <div>
                  {language === 'km' ? 'ពិន្ទុដែលត្រូវការ៖' : 'Passing Score:'} {quiz.passing_score}%
                </div>
              </div>

              {certificate && (
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <Award className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {language === 'km' ? 'សញ្ញាប័ត្ររបស់អ្នក៖' : 'Certificate Number:'} {certificate.certificate_number}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      {language === 'km' ? 'ទាញយក' : 'Download'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Question Review - In Student's Order */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">
              {language === 'km' ? 'សម្រង់សំណួរ' : 'Review Questions'}
            </h2>

            {questions.map((q: any) => (
              <Card key={q.question_id} className={`${q.is_correct ? 'border-green-200' : 'border-red-200'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{language === 'km' ? 'សំណួរ' : 'Question'} {q.question_number}</Badge>
                        <Badge variant="secondary">{q.points_possible} {language === 'km' ? 'ពិន្ទុ' : 'pts'}</Badge>
                        {q.is_correct ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {language === 'km' ? 'ត្រូវ' : 'Correct'}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {language === 'km' ? 'ខុស' : 'Incorrect'}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {language === 'km' && q.questionKm ? q.questionKm : q.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Student Answer */}
                    <div>
                      <div className="text-sm font-medium mb-1">
                        {language === 'km' ? 'ចម្លើយរបស់អ្នក៖' : 'Your Answer:'}
                      </div>
                      <div className={`p-3 rounded-lg ${q.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                        {renderAnswer(q.student_answer, q.type, language)}
                      </div>
                    </div>

                    {/* Correct Answer (if show_correct_answers is enabled) */}
                    {quiz.show_correct_answers && q.correct_answer && (
                      <div>
                        <div className="text-sm font-medium mb-1">
                          {language === 'km' ? 'ចម្លើយត្រឹមត្រូវ៖' : 'Correct Answer:'}
                        </div>
                        <div className="p-3 rounded-lg bg-green-50">
                          {renderAnswer(q.correct_answer, q.type, language)}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {quiz.show_correct_answers && (q.explanation || q.explanationKm) && (
                      <div>
                        <div className="text-sm font-medium mb-1">
                          {language === 'km' ? 'ការពន្យល់៖' : 'Explanation:'}
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 text-sm">
                          {language === 'km' && q.explanationKm ? q.explanationKm : q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <Button onClick={() => router.push('/quizzes')} variant="outline" className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'km' ? 'ត្រលប់ទៅតេស្ត' : 'Back to Quizzes'}
            </Button>
            <Button onClick={() => router.push('/my-results')} className="flex-1">
              {language === 'km' ? 'មើលប្រវត្តិ' : 'View History'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function renderAnswer(answer: any, type: string, language: string): string {
  if (!answer) {
    return language === 'km' ? 'មិនបានឆ្លើយ' : 'Not answered'
  }

  if (Array.isArray(answer)) {
    return answer.join(', ')
  }

  if (typeof answer === 'object') {
    return JSON.stringify(answer)
  }

  if (typeof answer === 'boolean') {
    return answer ? (language === 'km' ? 'ត្រូវ' : 'True') : (language === 'km' ? 'ខុស' : 'False')
  }

  return String(answer)
}
