"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import type { Question } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, CheckCircle2, AlertCircle, Loader2, Eye, GripVertical, Image as ImageIcon } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { language, t } = useI18n()

  // Check if this is a preview mode
  const isPreview = searchParams.get('preview') === 'true'

  // Attempt data
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [quizInfo, setQuizInfo] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize quiz attempt
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const startQuizAttempt = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/quiz-attempts/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz_id: params.id,
            user_id: user.id,
            is_preview: isPreview
          })
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.existing_attempt_id) {
            // Redirect to existing attempt result
            router.push(`/quizzes/result/${data.existing_attempt_id}`)
            return
          }
          throw new Error(data.error || 'Failed to start quiz')
        }

        setAttemptId(data.attempt.id)
        setQuizInfo(data.quiz_info)
        setQuestions(data.questions)
        setStartTime(new Date(data.attempt.started_at))

        if (data.attempt.time_limit) {
          setTimeRemaining(data.attempt.time_limit)
        }
      } catch (err: any) {
        console.error('Error starting quiz:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    startQuizAttempt()
  }, [params.id, user, router])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitting) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, submitting])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleAutoSubmit = async () => {
    if (submitting) return
    await handleSubmit(true)
  }

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return

    if (!isAutoSubmit) {
      const unanswered = questions.filter(q => !answers[q.id]).length
      if (unanswered > 0) {
        toast.warning(
          language === 'km'
            ? `អ្នកមានសំណួរ ${unanswered} ដែលមិនទាន់ឆ្លើយ។ សូមឆ្លើយសំណួរទាំងអស់មុនពេលដាក់ស្នើ។`
            : `You have ${unanswered} unanswered questions. Please answer all questions before submitting.`,
          {
            duration: 4000,
          }
        )
        return
      }
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/quiz-attempts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          answers
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quiz')
      }

      // Redirect to results page
      router.push(`/quizzes/result/${attemptId}`)
    } catch (err: any) {
      console.error('Error submitting quiz:', err)
      setError(err.message)
      setSubmitting(false)
    }
  }

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
            {t.backToQuizzes || 'Back to Quizzes'}
          </Button>
        </main>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Preview Mode Banner */}
          {isPreview && (
            <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Eye className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-400">
                {language === 'km'
                  ? 'មើលជាមុន - លទ្ធផលនឹងមិនត្រូវបានរក្សាទុកក្នុងប្រវត្តិនៃការប្រឡងរបស់សិស្សទេ'
                  : 'Preview Mode - Results will not be saved to student test history'}
              </AlertDescription>
            </Alert>
          )}

          {/* Quiz Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {language === 'km' && quizInfo?.title_km ? quizInfo.title_km : quizInfo?.title}
                  </CardTitle>
                  <CardDescription>
                    {language === 'km' ? 'សំណួរ' : 'Question'} {currentQuestionIndex + 1} {language === 'km' ? 'នៃ' : 'of'} {questions.length}
                  </CardDescription>
                </div>
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-2 ${timeRemaining < 60 ? 'text-destructive' : ''}`}>
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-mono font-bold">{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'km' && currentQuestion.questionKm
                  ? currentQuestion.questionKm
                  : currentQuestion.question}
              </CardTitle>
              <CardDescription>
                {currentQuestion.points} {language === 'km' ? 'ពិន្ទុ' : 'points'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Render question based on type */}
              {renderQuestionInput(currentQuestion, answers[currentQuestion.id], handleAnswerChange, language)}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  {language === 'km' ? 'មុន' : 'Previous'}
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={() => handleSubmit(false)} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'km' ? 'កំពុងដាក់ស្នើ...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {language === 'km' ? 'ដាក់ស្នើ' : 'Submit Quiz'}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    {language === 'km' ? 'បន្ទាប់' : 'Next'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="mt-4 flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  idx === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

function renderQuestionInput(
  question: Question,
  answer: any,
  onChange: (questionId: string, answer: any) => void,
  language: string
) {
  const options = language === 'km' && question.optionsKm ? question.optionsKm : question.options

  switch (question.type) {
    case 'multiple-choice':
      return (
        <RadioGroup value={answer || ''} onValueChange={(val) => onChange(question.id, val)}>
          {options?.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
              <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'multiple-select':
      const selectedOptions = answer || []
      return (
        <div className="space-y-2">
          {options?.map((option, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}-${idx}`}
                checked={selectedOptions.includes(option)}
                onCheckedChange={(checked) => {
                  const newSelection = checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter((o: string) => o !== option)
                  onChange(question.id, newSelection)
                }}
              />
              <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer">{option}</Label>
            </div>
          ))}
        </div>
      )

    case 'true-false':
      return (
        <RadioGroup value={answer || ''} onValueChange={(val) => onChange(question.id, val)}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="true" id={`${question.id}-true`} />
            <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
              {language === 'km' ? 'ត្រូវ' : 'True'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id={`${question.id}-false`} />
            <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
              {language === 'km' ? 'ខុស' : 'False'}
            </Label>
          </div>
        </RadioGroup>
      )

    case 'short-answer':
      return (
        <Input
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={language === 'km' ? 'វាយចម្លើយរបស់អ្នក...' : 'Type your answer...'}
        />
      )

    case 'essay':
      return (
        <Textarea
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={language === 'km' ? 'សរសេរចម្លើយរបស់អ្នក...' : 'Write your answer...'}
          rows={6}
        />
      )

    case 'fill-blank':
    case 'fill-blanks':
      // If question has blanksTemplate, parse it and create multiple inputs
      if (question.blanksTemplate || question.blanksCount) {
        const template = language === 'km' && question.blanksTemplateKm
          ? question.blanksTemplateKm
          : question.blanksTemplate
        const blanksCount = question.blanksCount || 1
        const currentAnswers = answer || {}

        return (
          <div className="space-y-3">
            {template && (
              <p className="text-sm mb-2">{template}</p>
            )}
            <div className="space-y-2">
              {Array.from({ length: blanksCount }, (_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Label className="w-24 text-sm">
                    {language === 'km' ? 'ចន្លោះ' : 'Blank'} {idx + 1}:
                  </Label>
                  <Input
                    value={currentAnswers[`blank${idx + 1}`] || ''}
                    onChange={(e) => {
                      const newAnswers = { ...currentAnswers, [`blank${idx + 1}`]: e.target.value }
                      onChange(question.id, newAnswers)
                    }}
                    placeholder={language === 'km' ? 'បំពេញចម្លើយ' : 'Fill answer'}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      }
      // Single blank
      return (
        <Input
          value={answer || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={language === 'km' ? 'បំពេញចម្លើយ' : 'Fill in the blank'}
        />
      )

    case 'matching':
      // Matching pairs with dropdowns
      if (question.pairs && question.pairs.length > 0) {
        const currentMatches = answer || {}
        const leftItems = question.pairs.map(p => language === 'km' && p.leftKm ? p.leftKm : p.left)
        const rightItems = question.pairs.map(p => language === 'km' && p.rightKm ? p.rightKm : p.right)

        // Shuffle right items for display
        const shuffledRightItems = [...rightItems].sort(() => Math.random() - 0.5)

        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'km'
                ? 'ផ្គូផ្គងធាតុខាងឆ្វេងជាមួយធាតុខាងស្តាំ'
                : 'Match items on the left with items on the right'}
            </p>
            {leftItems.map((leftItem, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex-1 p-2 bg-muted rounded">{leftItem}</div>
                <span className="text-muted-foreground">→</span>
                <select
                  className="flex-1 p-2 border rounded"
                  value={currentMatches[leftItem] || ''}
                  onChange={(e) => {
                    onChange(question.id, { ...currentMatches, [leftItem]: e.target.value })
                  }}
                >
                  <option value="">
                    {language === 'km' ? 'ជ្រើសរើស...' : 'Select...'}
                  </option>
                  {shuffledRightItems.map((rightItem, ridx) => (
                    <option key={ridx} value={rightItem}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )
      }
      // Fallback to text input
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {language === 'km'
              ? 'ផ្គូផ្គងធាតុដោយបញ្ចូលលេខចម្លើយ'
              : 'Match items by entering answer numbers'}
          </p>
          <Textarea
            value={answer || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={language === 'km' ? 'បញ្ចូលចម្លើយរបស់អ្នក...' : 'Enter your answers...'}
            rows={4}
          />
        </div>
      )

    case 'ordering':
    case 'drag-drop':
      // Draggable ordering list
      if (options && options.length > 0) {
        const currentOrder = answer || [...options]

        const moveItem = (fromIndex: number, toIndex: number) => {
          const newOrder = [...currentOrder]
          const [movedItem] = newOrder.splice(fromIndex, 1)
          newOrder.splice(toIndex, 0, movedItem)
          onChange(question.id, newOrder)
        }

        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'km'
                ? 'ចុចលើធាតុហើយប្រើប៊ូតុងឡើងលើ/ចុះក្រោមដើម្បីរៀបចំ'
                : 'Click on items and use up/down buttons to arrange'}
            </p>
            {currentOrder.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => idx > 0 && moveItem(idx, idx - 1)}
                    disabled={idx === 0}
                    className="text-xs hover:bg-background p-1 rounded disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => idx < currentOrder.length - 1 && moveItem(idx, idx + 1)}
                    disabled={idx === currentOrder.length - 1}
                    className="text-xs hover:bg-background p-1 rounded disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        )
      }
      // Fallback
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {language === 'km'
              ? 'រៀបចំធាតុតាមលំដាប់ត្រឹមត្រូវ'
              : 'Arrange items in correct order'}
          </p>
          <Textarea
            value={answer || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={language === 'km' ? 'បញ្ចូលលំដាប់...' : 'Enter order...'}
            rows={4}
          />
        </div>
      )

    case 'image-choice':
      // Image with radio button options
      return (
        <div className="space-y-4">
          {question.imageUrl && (
            <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
              <Image
                src={question.imageUrl}
                alt="Question image"
                fill
                className="object-contain"
              />
            </div>
          )}
          <RadioGroup value={answer || ''} onValueChange={(val) => onChange(question.id, val)}>
            {options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                <Label htmlFor={`${question.id}-${idx}`} className="cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )

    case 'hotspot':
      // Clickable image hotspots
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {language === 'km'
              ? 'ចុចលើតំបន់ត្រឹមត្រូវនៅលើរូបភាព'
              : 'Click on the correct area on the image'}
          </p>
          {question.imageUrl && (
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden border-2">
              <Image
                src={question.imageUrl}
                alt="Hotspot question"
                fill
                className="object-contain"
              />
              {question.hotspots?.map((hotspot, idx) => {
                const label = language === 'km' && hotspot.labelKm ? hotspot.labelKm : hotspot.label
                const isSelected = answer === label
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(question.id, label)}
                    className={`absolute w-8 h-8 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-white/50 border-white hover:bg-white/80'
                    }`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={label}
                  />
                )
              })}
            </div>
          )}
          {answer && (
            <div className="p-3 bg-muted rounded">
              <span className="text-sm">
                {language === 'km' ? 'បានជ្រើសរើស: ' : 'Selected: '}
                <strong>{answer}</strong>
              </span>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="text-muted-foreground">
          {language === 'km'
            ? `ប្រភេទសំណួរ "${question.type}" មិនទាន់បានគាំទ្រនៅឡើយ`
            : `Question type "${question.type}" not yet supported`}
        </div>
      )
  }
}
