"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { NavHeader } from "@/components/nav-header"
import { quizStorage } from "@/lib/quiz-storage"
import type { Quiz, Question, QuizAttempt } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle2, XCircle, AlertCircle, MoveVertical } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function TakeQuizPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string | string[] | Record<string, string>>>({})
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [orderedItems, setOrderedItems] = useState<Record<string, string[]>>({})
  const [draggedMatchItem, setDraggedMatchItem] = useState<string | null>(null)
  const [availableMatches, setAvailableMatches] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const loadQuizData = async () => {
      if (!user) {
        router.push("/")
        return
      }

      try {
        setLoading(true)
        const quizId = params.id as string
        const foundQuiz = await quizStorage.getQuizById(quizId)

        if (!foundQuiz) {
          router.push("/quizzes")
          return
        }

        setQuiz(foundQuiz)

        // Check if multiple attempts are allowed
        const previousAttempts = await quizStorage.getQuizAttempts(quizId, user.id)
        if (!foundQuiz.allowMultipleAttempts && previousAttempts.length > 0) {
          router.push(`/quizzes/${quizId}/result/${previousAttempts[0].id}`)
          return
        }

        // Randomize questions if enabled
        const quizQuestions = foundQuiz.randomizeQuestions
          ? [...foundQuiz.questions].sort(() => Math.random() - 0.5)
          : foundQuiz.questions

        setQuestions(quizQuestions)
        setStartTime(new Date())

        // Initialize available matches for matching questions
        const matchesMap: Record<string, string[]> = {}
        quizQuestions.forEach((question) => {
          if (question.type === "matching" && question.pairs) {
            // Randomize right items for each matching question
            matchesMap[question.id] = [...question.pairs]
              .map(p => p.right)
              .sort(() => Math.random() - 0.5)
          }
        })
        setAvailableMatches(matchesMap)

        if (foundQuiz.timeLimit > 0) {
          setTimeRemaining(foundQuiz.timeLimit * 60) // Convert to seconds
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
        router.push("/quizzes")
      } finally {
        setLoading(false)
      }
    }

    loadQuizData()
  }, [params.id, user, router])

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, submitted])

  const handleAnswerChange = (questionId: string, answer: string | string[] | Record<string, string>) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleMultiSelectChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || []
    const newAnswers = checked ? [...currentAnswers, option] : currentAnswers.filter((a) => a !== option)
    setAnswers({ ...answers, [questionId]: newAnswers })
  }

  const checkAnswer = (
    question: Question,
    userAnswer: string | string[] | Record<string, string> | undefined,
  ): boolean => {
    if (!userAnswer) return false

    if (question.type === "short-answer") {
      return (userAnswer as string).toLowerCase().trim() === (question.correctAnswer as string).toLowerCase().trim()
    }

    if (question.type === "multiple-select") {
      const userAnswers = (userAnswer as string[]).sort()
      const correctAnswers = (question.correctAnswer as string[]).sort()
      return JSON.stringify(userAnswers) === JSON.stringify(correctAnswers)
    }

    if (question.type === "fill-blanks") {
      const userAnswers = userAnswer as string[]
      const correctAnswers = question.correctAnswer as string[]
      if (userAnswers.length !== correctAnswers.length) return false
      return userAnswers.every((ans, idx) => ans.toLowerCase().trim() === correctAnswers[idx].toLowerCase().trim())
    }

    if (question.type === "drag-drop" || question.type === "ordering") {
      const userOrder = userAnswer as string[]
      const correctOrder = question.options || []
      return JSON.stringify(userOrder) === JSON.stringify(correctOrder)
    }

    if (question.type === "matching") {
      const userPairs = userAnswer as Record<string, string>
      const correctPairs = question.pairs?.reduce(
        (acc, pair) => {
          acc[pair.left] = pair.right
          return acc
        },
        {} as Record<string, string>,
      )
      return JSON.stringify(userPairs) === JSON.stringify(correctPairs)
    }

    if (question.type === "essay") {
      // Essays need manual grading
      return false
    }

    if (question.type === "hotspot") {
      // Simplified: just check if any hotspot was clicked
      return Array.isArray(userAnswer) && userAnswer.length > 0
    }

    return userAnswer === question.correctAnswer
  }

  const handleSubmit = async () => {
    if (!quiz || !user || !startTime) return

    let totalScore = 0
    let totalMaxScore = 0

    questions.forEach((question) => {
      totalMaxScore += question.points
      if (checkAnswer(question, answers[question.id])) {
        totalScore += question.points
      }
    })

    setScore(totalScore)
    setMaxScore(totalMaxScore)
    setSubmitted(true)

    const attempt: QuizAttempt = {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      userId: user.id,
      answers,
      score: totalScore,
      maxScore: totalMaxScore,
      startedAt: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
    }

    try {
      await quizStorage.addAttempt(attempt)
    } catch (error: any) {
      console.error('Error saving attempt:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: error
      })
      // Show user-friendly error message
      alert('Failed to save quiz attempt. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quiz...</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (!quiz || !user) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (Object.keys(answers).length / questions.length) * 100

  if (submitted) {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

    return (
      <div className="min-h-screen bg-muted/30">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Quiz Completed!</CardTitle>
                <CardDescription className="text-sm sm:text-base">{quiz?.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="text-4xl sm:text-5xl font-bold mb-2">{percentage.toFixed(0)}%</div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    You scored {score} out of {maxScore} points
                  </p>
                </div>

                {quiz?.showCorrectAnswers && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Answer Review</h3>
                    {questions.map((question, index) => {
                      const userAnswer = answers[question.id]
                      const isCorrect = checkAnswer(question, userAnswer)

                      return (
                        <Card key={question.id} className={isCorrect ? "border-green-500" : "border-destructive"}>
                          <CardHeader>
                            <div className="flex items-start gap-2">
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  Question {index + 1} ({question.points} point{question.points > 1 ? "s" : ""})
                                </CardTitle>
                                <CardDescription className="mt-1">{question.question}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Your Answer:</p>
                              <p className="text-sm">
                                {userAnswer
                                  ? typeof userAnswer === "object" && !Array.isArray(userAnswer)
                                    ? JSON.stringify(userAnswer, null, 2)
                                    : Array.isArray(userAnswer)
                                      ? userAnswer.join(", ")
                                      : userAnswer
                                  : "Not answered"}
                              </p>
                            </div>
                            {!isCorrect && question.type !== "essay" && (
                              <div>
                                <p className="text-sm font-medium text-green-600">Correct Answer:</p>
                                <p className="text-sm text-green-600">
                                  {typeof question.correctAnswer === "object" && !Array.isArray(question.correctAnswer)
                                    ? JSON.stringify(question.correctAnswer, null, 2)
                                    : Array.isArray(question.correctAnswer)
                                      ? question.correctAnswer.join(", ")
                                      : question.correctAnswer}
                                </p>
                              </div>
                            )}
                            {question.explanation && (
                              <div className="pt-2 border-t">
                                <p className="text-sm font-medium text-blue-600">Explanation:</p>
                                <p className="text-sm text-muted-foreground">{question.explanation}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => router.push("/quizzes")} className="w-full sm:flex-1">
                    Back to Quizzes
                  </Button>
                  {quiz?.allowMultipleAttempts && (
                    <Button onClick={() => router.push(`/quizzes/${quiz.id}`)} variant="outline" className="w-full sm:flex-1">
                      Retake Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base">{quiz.description}</CardDescription>
                </div>
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2 text-sm sm:text-base bg-muted px-3 py-1.5 rounded-lg">
                    <Clock className="h-4 w-4" />
                    <span className={timeRemaining < 60 ? "text-destructive font-bold" : "font-semibold"}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {Object.keys(answers).length} / {questions.length} answered
                  </span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    Question {index + 1} of {questions.length}
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-foreground mt-2 leading-relaxed">{question.question}</CardDescription>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {question.points} point{question.points > 1 ? "s" : ""}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Multiple Choice */}
                  {question.type === "multiple-choice" && question.options && (
                    <RadioGroup
                      value={answers[question.id] as string}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="space-y-3"
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors min-h-[48px]">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} className="flex-shrink-0" />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Multiple Select */}
                  {question.type === "multiple-select" && question.options && (
                    <div className="space-y-3">
                      <p className="text-sm sm:text-base text-muted-foreground mb-2">Select all that apply</p>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors min-h-[48px]">
                          <Checkbox
                            id={`${question.id}-${optIndex}`}
                            checked={((answers[question.id] as string[]) || []).includes(option)}
                            onCheckedChange={(checked) => {
                              const currentAnswers = (answers[question.id] as string[]) || []
                              const newAnswers = checked
                                ? [...currentAnswers, option]
                                : currentAnswers.filter((a) => a !== option)
                              handleAnswerChange(question.id, newAnswers)
                            }}
                            className="flex-shrink-0"
                          />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* True/False */}
                  {question.type === "true-false" && question.options && (
                    <RadioGroup
                      value={answers[question.id] as string}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="space-y-3"
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors min-h-[48px]">
                          <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} className="flex-shrink-0" />
                          <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Short Answer */}
                  {question.type === "short-answer" && (
                    <Input
                      placeholder="Type your answer here"
                      value={(answers[question.id] as string) || ""}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-full text-base min-h-[48px]"
                    />
                  )}

                  {question.type === "fill-blanks" && question.blanksTemplate && (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-base leading-relaxed">
                          {question.blanksTemplate.split("___").map((part, index, arr) => (
                            <span key={index}>
                              {part}
                              {index < arr.length - 1 && (
                                <Input
                                  className="inline-flex w-32 mx-1 h-8"
                                  placeholder={`Blank ${index + 1}`}
                                  value={
                                    (Array.isArray(answers[question.id])
                                      ? (answers[question.id] as string[])[index]
                                      : "") || ""
                                  }
                                  onChange={(e) => {
                                    const currentAnswers = Array.isArray(answers[question.id])
                                      ? [...(answers[question.id] as string[])]
                                      : []
                                    currentAnswers[index] = e.target.value
                                    handleAnswerChange(question.id, currentAnswers)
                                  }}
                                />
                              )}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  )}

                  {(question.type === "drag-drop" || question.type === "ordering") && question.options && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {question.type === "drag-drop"
                          ? "Drag items to arrange them in the correct order"
                          : "Arrange items in the correct sequence"}
                      </p>
                      <div className="space-y-2">
                        {(orderedItems[question.id] || [...question.options].sort(() => Math.random() - 0.5)).map(
                          (item, idx) => (
                            <div
                              key={idx}
                              draggable
                              onDragStart={() => setDraggedItem(item)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => {
                                if (!draggedItem) return
                                const currentOrder = orderedItems[question.id] || [...question.options!]
                                const draggedIdx = currentOrder.indexOf(draggedItem)
                                const targetIdx = idx
                                const newOrder = [...currentOrder]
                                newOrder.splice(draggedIdx, 1)
                                newOrder.splice(targetIdx, 0, draggedItem)
                                setOrderedItems({ ...orderedItems, [question.id]: newOrder })
                                handleAnswerChange(question.id, newOrder)
                                setDraggedItem(null)
                              }}
                              className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-move hover:bg-muted/80 transition-colors"
                            >
                              <MoveVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{idx + 1}.</span>
                              <span>{item}</span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {question.type === "matching" && question.pairs && (
                    <div className="space-y-4">
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Drag items from the right and drop them onto the matching items on the left
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Left side - Items to match */}
                        <div className="space-y-3">
                          <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Items to Match</h4>
                          {question.pairs.map((pair, pairIdx) => {
                            const currentMatches = (answers[question.id] as Record<string, string>) || {}
                            const matchedValue = currentMatches[pair.left]

                            return (
                              <div
                                key={pairIdx}
                                className="relative"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (!draggedMatchItem) return
                                  const currentPairs = (answers[question.id] as Record<string, string>) || {}

                                  // Remove the item from available matches
                                  const newAvailable = availableMatches[question.id].filter(item => item !== draggedMatchItem)

                                  // If there was already a match, return it to available
                                  if (currentPairs[pair.left]) {
                                    newAvailable.push(currentPairs[pair.left])
                                  }

                                  setAvailableMatches({ ...availableMatches, [question.id]: newAvailable })
                                  handleAnswerChange(question.id, { ...currentPairs, [pair.left]: draggedMatchItem })
                                  setDraggedMatchItem(null)
                                }}
                              >
                                <div className={`p-3 sm:p-4 rounded-lg border-2 transition-all min-h-[64px] ${
                                  matchedValue
                                    ? 'bg-green-50 dark:bg-green-950/20 border-green-500'
                                    : 'bg-muted border-dashed border-muted-foreground/30 hover:border-primary'
                                }`}>
                                  <p className="font-medium text-sm sm:text-base">{pair.left}</p>
                                  {matchedValue && (
                                    <div className="mt-2 flex items-center justify-between">
                                      <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                                        <span>→</span>
                                        <span className="font-semibold">{matchedValue}</span>
                                      </p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                                        onClick={() => {
                                          const currentPairs = { ...currentMatches }
                                          delete currentPairs[pair.left]

                                          // Return item to available
                                          const newAvailable = [...availableMatches[question.id], matchedValue]
                                            .sort(() => Math.random() - 0.5)
                                          setAvailableMatches({ ...availableMatches, [question.id]: newAvailable })

                                          handleAnswerChange(question.id, currentPairs)
                                        }}
                                      >
                                        <XCircle className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Right side - Available matches */}
                        <div className="space-y-3">
                          <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Drag to Match ({
                              (availableMatches[question.id] ||
                               question.pairs?.map(p => p.right).filter(right => {
                                 const currentMatches = (answers[question.id] as Record<string, string>) || {}
                                 return !Object.values(currentMatches).includes(right)
                               }) || []
                              ).length
                            } remaining)
                          </h4>
                          <div className="space-y-2">
                            {(availableMatches[question.id] && availableMatches[question.id].length > 0
                              ? availableMatches[question.id]
                              : question.pairs?.map(p => p.right).filter(right => {
                                  const currentMatches = (answers[question.id] as Record<string, string>) || {}
                                  return !Object.values(currentMatches).includes(right)
                                }) || []
                            ).map((item, idx) => (
                              <div
                                key={idx}
                                draggable
                                onDragStart={() => setDraggedMatchItem(item)}
                                onDragEnd={() => setDraggedMatchItem(null)}
                                className={`p-3 sm:p-4 rounded-lg border-2 cursor-move transition-all min-h-[64px] flex items-center ${
                                  draggedMatchItem === item
                                    ? 'opacity-50 border-primary scale-95'
                                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 hover:scale-105 hover:shadow-md'
                                }`}
                              >
                                <MoveVertical className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                                <span className="text-sm sm:text-base font-medium">{item}</span>
                              </div>
                            ))}
                            {((availableMatches[question.id] ||
                               question.pairs?.map(p => p.right).filter(right => {
                                 const currentMatches = (answers[question.id] as Record<string, string>) || {}
                                 return !Object.values(currentMatches).includes(right)
                               }) || []
                            ).length === 0) && (
                              <div className="p-4 text-center text-muted-foreground text-sm rounded-lg border-2 border-dashed">
                                All items have been matched!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.type === "essay" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write your answer here..."
                        value={(answers[question.id] as string) || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        rows={8}
                        className="resize-none w-full text-base"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">This will be manually graded by your instructor</p>
                    </div>
                  )}

                  {question.type === "image-choice" && question.imageUrl && question.options && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-2 sm:p-4 bg-muted/30">
                        <img
                          src={question.imageUrl || "/placeholder.svg"}
                          alt="Question"
                          className="w-full max-h-64 sm:max-h-96 object-contain rounded"
                        />
                      </div>
                      <RadioGroup
                        value={answers[question.id] as string}
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        className="space-y-3"
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors min-h-[48px]">
                            <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} className="flex-shrink-0" />
                            <Label htmlFor={`${question.id}-${optIndex}`} className="flex-1 cursor-pointer text-sm sm:text-base leading-relaxed">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {question.type === "hotspot" && question.imageUrl && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Click on the correct area(s) of the image</p>
                      <div className="relative border rounded-lg p-4 bg-muted/30">
                        <img
                          src={question.imageUrl || "/placeholder.svg"}
                          alt="Hotspot"
                          className="w-full max-h-96 object-contain rounded cursor-crosshair"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = ((e.clientX - rect.left) / rect.width) * 100
                            const y = ((e.clientY - rect.top) / rect.height) * 100
                            const clicked = { x, y }
                            const currentClicks = (answers[question.id] as any[]) || []
                            handleAnswerChange(question.id, [...currentClicks, clicked])
                          }}
                        />
                        {question.hotspots?.map((hotspot, idx) => (
                          <div
                            key={idx}
                            className="absolute w-8 h-8 bg-blue-500/30 border-2 border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Clicks: {((answers[question.id] as any[]) || []).length}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="pt-6">
              {Object.keys(answers).length < questions.length && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>You have unanswered questions</span>
                </div>
              )}
              <Button onClick={handleSubmit} className="w-full min-h-[48px] text-base" size="lg">
                Submit Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
