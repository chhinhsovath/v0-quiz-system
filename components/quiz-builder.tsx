"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { quizStorage } from "@/lib/quiz-storage"
import type { Quiz, Question, QuestionType, Category } from "@/lib/quiz-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Trash2, GripVertical, MoveVertical, ImageIcon, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"

interface QuizBuilderProps {
  initialQuiz?: Quiz
}

export function QuizBuilder({ initialQuiz }: QuizBuilderProps) {
  const { isAdmin, user } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [quizData, setQuizData] = useState({
    title: initialQuiz?.title || "",
    titleKm: initialQuiz?.titleKm || "",
    description: initialQuiz?.description || "",
    descriptionKm: initialQuiz?.descriptionKm || "",
    categoryId: initialQuiz?.categoryId || "",
    gradeLevel: initialQuiz?.gradeLevel || "",
    subject: initialQuiz?.subject || "",
    examType: initialQuiz?.examType || "regular",
    passingScore: initialQuiz?.passingScore || 60,
    certificateEnabled: initialQuiz?.certificateEnabled || false,
    adaptiveTesting: initialQuiz?.adaptiveTesting || false,
    maxAttempts: initialQuiz?.maxAttempts || 3,
    timeLimit: initialQuiz?.timeLimit || 0,
    randomizeQuestions: initialQuiz?.randomizeQuestions || false,
    allowMultipleAttempts: initialQuiz?.allowMultipleAttempts || true,
    showCorrectAnswers: initialQuiz?.showCorrectAnswers || true,
  })
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || [])

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    const cats = quizStorage.getCategories()
    setCategories(cats)

    // Set default category if none selected
    if (!quizData.categoryId && cats.length > 0) {
      setQuizData((prev) => ({ ...prev, categoryId: cats[0].id }))
    }
  }, [isAdmin, router])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ""] }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex)
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSave = () => {
    if (!quizData.title.trim()) {
      alert("Please enter a quiz title")
      return
    }

    if (!quizData.categoryId) {
      alert("Please select a category")
      return
    }

    if (questions.length === 0) {
      alert("Please add at least one question")
      return
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question.trim()) {
        alert("Please fill in all question texts")
        return
      }

      if ((q.type === "multiple-choice" || q.type === "multiple-select") && q.options) {
        if (q.options.some((opt) => !opt.trim())) {
          alert("Please fill in all answer options")
          return
        }
      }

      if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
        alert("Please set correct answers for all questions")
        return
      }
    }

    const quiz: Quiz = {
      id: initialQuiz?.id || crypto.randomUUID(),
      ...quizData,
      questions,
      createdBy: user?.id || "",
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
    }

    if (initialQuiz) {
      quizStorage.updateQuiz(quiz.id, quiz)
    } else {
      quizStorage.addQuiz(quiz)
    }

    router.push("/admin/quizzes")
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push("/admin/quizzes")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToQuizzes}
            </Button>
            <h1 className="text-3xl font-bold mb-2">{initialQuiz ? t.editQuiz : t.createNewQuiz}</h1>
            <p className="text-muted-foreground">
              {initialQuiz ? t.updateQuizDetailsDesc : t.buildNewQuizDesc}
            </p>
          </div>

          <div className="space-y-6">
            {/* Quiz Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quizDetails}</CardTitle>
                <CardDescription>{t.basicInfoDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.quizTitle}</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Chapter 1: Introduction to Biology"
                    value={quizData.title}
                    onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleKm">{t.quizTitleKm}</Label>
                  <Input
                    id="titleKm"
                    placeholder="e.g., ជំពូកទី១៖ ការណែនាំអំពីជីវវិទ្យា"
                    value={quizData.titleKm}
                    onChange={(e) => setQuizData({ ...quizData, titleKm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this quiz covers"
                    value={quizData.description}
                    onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionKm">{t.descriptionKm}</Label>
                  <Textarea
                    id="descriptionKm"
                    placeholder="ការពិពណ៌នាខ្លីៗអំពីអ្វីដែលតេស្តនេះគ្របដណ្តប់"
                    value={quizData.descriptionKm}
                    onChange={(e) => setQuizData({ ...quizData, descriptionKm: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t.category}</Label>
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t.noCategoriesMessage}
                    </p>
                  ) : (
                    <Select
                      value={quizData.categoryId}
                      onValueChange={(value) => setQuizData({ ...quizData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">{t.gradeLevel}</Label>
                  <Input
                    id="gradeLevel"
                    placeholder="e.g., 10th Grade"
                    value={quizData.gradeLevel}
                    onChange={(e) => setQuizData({ ...quizData, gradeLevel: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t.subject}</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Biology"
                    value={quizData.subject}
                    onChange={(e) => setQuizData({ ...quizData, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examType">{t.examType}</Label>
                  <Select
                    value={quizData.examType}
                    onValueChange={(value) => setQuizData({ ...quizData, examType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectExamType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">{t.regular}</SelectItem>
                      <SelectItem value="national">{t.nationalExam}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passingScore">{t.passingScore}</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={(e) => setQuizData({ ...quizData, passingScore: Number.parseInt(e.target.value) || 60 })}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.certificateEnabled}</Label>
                      <p className="text-sm text-muted-foreground">{t.enableCertificateDesc}</p>
                    </div>
                    <Switch
                      checked={quizData.certificateEnabled}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, certificateEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.adaptiveTesting}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t.adaptiveTestingDesc}
                      </p>
                    </div>
                    <Switch
                      checked={quizData.adaptiveTesting}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, adaptiveTesting: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.maxAttempts}</Label>
                      <p className="text-sm text-muted-foreground">{t.maxAttemptsDesc}</p>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={quizData.maxAttempts}
                      onChange={(e) => setQuizData({ ...quizData, maxAttempts: Number.parseInt(e.target.value) || 3 })}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.randomizeQuestions}</Label>
                      <p className="text-sm text-muted-foreground">{t.randomizeQuestionsDesc}</p>
                    </div>
                    <Switch
                      checked={quizData.randomizeQuestions}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, randomizeQuestions: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.allowMultipleAttempts}</Label>
                      <p className="text-sm text-muted-foreground">{t.allowMultipleAttemptsDesc}</p>
                    </div>
                    <Switch
                      checked={quizData.allowMultipleAttempts}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, allowMultipleAttempts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.showCorrectAnswers}</Label>
                      <p className="text-sm text-muted-foreground">{t.showCorrectAnswersDesc}</p>
                    </div>
                    <Switch
                      checked={quizData.showCorrectAnswers}
                      onCheckedChange={(checked) => setQuizData({ ...quizData, showCorrectAnswers: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t.questions}</CardTitle>
                    <CardDescription>{questions.length} {t.questionAdded}</CardDescription>
                  </div>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addQuestion}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t.noQuestionsMessage}</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <QuestionEditor
                      key={question.id}
                      question={question}
                      index={index}
                      onUpdate={updateQuestion}
                      onDelete={deleteQuestion}
                      onUpdateOption={updateQuestionOption}
                      onAddOption={addOption}
                      onRemoveOption={removeOption}
                      t={t}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.push("/admin/quizzes")}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {initialQuiz ? t.updateQuiz : t.create + " " + t.quiz}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

interface QuestionEditorProps {
  question: Question
  index: number
  onUpdate: (id: string, updates: Partial<Question>) => void
  onDelete: (id: string) => void
  onUpdateOption: (questionId: string, optionIndex: number, value: string) => void
  onAddOption: (questionId: string) => void
  onRemoveOption: (questionId: string, optionIndex: number) => void
  t: any
}

function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  t,
}: QuestionEditorProps) {
  const handleTypeChange = (type: QuestionType) => {
    let options: string[] | undefined
    let correctAnswer: string | string[] | Record<string, string> = ""
    let blanksTemplate: string | undefined
    let blanksCount: number | undefined
    let pairs: Array<{ left: string; right: string }> | undefined
    let imageUrl: string | undefined
    let hotspots: Array<{ x: number; y: number; label: string }> | undefined

    if (type === "multiple-choice" || type === "multiple-select") {
      options = ["", "", "", ""]
      correctAnswer = type === "multiple-select" ? [] : ""
    } else if (type === "true-false") {
      options = ["True", "False"]
      correctAnswer = ""
    } else if (type === "drag-drop") {
      options = ["", "", "", ""]
      correctAnswer = []
    } else if (type === "fill-blanks") {
      blanksTemplate = "The ___ is ___."
      blanksCount = 2
      correctAnswer = ["", ""]
    } else if (type === "matching") {
      pairs = [
        { left: "", right: "" },
        { left: "", right: "" },
      ]
      correctAnswer = {}
    } else if (type === "ordering") {
      options = ["", "", ""]
      correctAnswer = []
    } else if (type === "image-choice") {
      options = ["", "", "", ""]
      correctAnswer = ""
      imageUrl = ""
    } else if (type === "hotspot") {
      imageUrl = ""
      hotspots = []
      correctAnswer = []
    } else if (type === "essay") {
      correctAnswer = ""
    } else {
      options = undefined
      correctAnswer = ""
    }

    onUpdate(question.id, {
      type,
      options,
      correctAnswer,
      blanksTemplate,
      blanksCount,
      pairs,
      imageUrl,
      hotspots,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">{t.question} {index + 1}</h3>
              <Select value={question.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[200px] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">{t.multipleChoice}</SelectItem>
                  <SelectItem value="multiple-select">{t.multipleSelect}</SelectItem>
                  <SelectItem value="true-false">{t.trueFalse}</SelectItem>
                  <SelectItem value="short-answer">{t.shortAnswer}</SelectItem>
                  <SelectItem value="fill-blanks">{t.fillBlanks}</SelectItem>
                  <SelectItem value="drag-drop">{t.dragDrop}</SelectItem>
                  <SelectItem value="matching">{t.matching}</SelectItem>
                  <SelectItem value="ordering">{t.ordering}</SelectItem>
                  <SelectItem value="essay">{t.essay}</SelectItem>
                  <SelectItem value="image-choice">{t.imageChoice}</SelectItem>
                  <SelectItem value="hotspot">{t.hotspot}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(question.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t.questionText}</Label>
          <Textarea
            placeholder="Enter your question here"
            value={question.question}
            onChange={(e) => onUpdate(question.id, { question: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>{t.points}</Label>
          <Input
            type="number"
            min="1"
            value={question.points}
            onChange={(e) => onUpdate(question.id, { points: Number.parseInt(e.target.value) || 1 })}
            className="w-24"
          />
        </div>

        {/* Multiple Choice */}
        {question.type === "multiple-choice" && question.options && (
          <div className="space-y-3">
            <Label>{t.answerOptions} ({t.selectCorrectAnswer})</Label>
            <RadioGroup
              value={question.correctAnswer as string}
              onValueChange={(value) => onUpdate(question.id, { correctAnswer: value })}
            >
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`${question.id}-option-${optIndex}`} />
                  <Input
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <Button variant="outline" size="sm" onClick={() => onAddOption(question.id)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
          </div>
        )}

        {/* Multiple Select */}
        {question.type === "multiple-select" && question.options && (
          <div className="space-y-3">
            <Label>{t.answerOptions} ({t.selectAllCorrectAnswers})</Label>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Checkbox
                    id={`${question.id}-option-${optIndex}`}
                    checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)}
                    onCheckedChange={(checked) => {
                      const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                      const newAnswers = checked
                        ? [...currentAnswers, option]
                        : currentAnswers.filter((a) => a !== option)
                      onUpdate(question.id, { correctAnswer: newAnswers })
                    }}
                  />
                  <Input
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onAddOption(question.id)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
          </div>
        )}

        {/* True/False */}
        {question.type === "true-false" && question.options && (
          <div className="space-y-2">
            <Label>{t.correctAnswerLabel}</Label>
            <RadioGroup
              value={question.correctAnswer as string}
              onValueChange={(value) => onUpdate(question.id, { correctAnswer: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="True" id={`${question.id}-true`} />
                <Label htmlFor={`${question.id}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="False" id={`${question.id}-false`} />
                <Label htmlFor={`${question.id}-false`}>False</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Short Answer */}
        {question.type === "short-answer" && (
          <div className="space-y-2">
            <Label>{t.correctAnswerLabel}</Label>
            <Input
              placeholder={t.enterCorrectAnswer}
              value={question.correctAnswer as string}
              onChange={(e) => onUpdate(question.id, { correctAnswer: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">{t.answerMatchingCaseInsensitive}</p>
          </div>
        )}

        {question.type === "fill-blanks" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t.templateUseBlanks}</Label>
              <Textarea
                placeholder="The capital of France is ___. It has a population of over ___ million."
                value={question.blanksTemplate || ""}
                onChange={(e) => {
                  const template = e.target.value
                  const count = (template.match(/___/g) || []).length
                  const answers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                  const newAnswers = Array(count)
                    .fill("")
                    .map((_, i) => answers[i] || "")
                  onUpdate(question.id, {
                    blanksTemplate: template,
                    blanksCount: count,
                    correctAnswer: newAnswers,
                  })
                }}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{question.blanksCount || 0} {t.blanksDetected}</p>
            </div>
            {question.blanksCount && question.blanksCount > 0 && (
              <div className="space-y-2">
                <Label>{t.correctAnswersInOrder}</Label>
                {Array.from({ length: question.blanksCount }).map((_, index) => (
                  <Input
                    key={index}
                    placeholder={`Answer for blank ${index + 1}`}
                    value={Array.isArray(question.correctAnswer) ? (question.correctAnswer[index] as string) || "" : ""}
                    onChange={(e) => {
                      const answers = Array.isArray(question.correctAnswer) ? [...question.correctAnswer] : []
                      answers[index] = e.target.value
                      onUpdate(question.id, { correctAnswer: answers })
                    }}
                  />
                ))}
                <p className="text-xs text-muted-foreground">{t.answerMatchingCaseInsensitive}</p>
              </div>
            )}
          </div>
        )}

        {question.type === "drag-drop" && question.options && (
          <div className="space-y-3">
            <Label>{t.itemsWillBeShuffled}</Label>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <MoveVertical className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Item ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onAddOption(question.id)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
            <div className="space-y-2 pt-2">
              <Label>{t.correctAnswersInOrder}</Label>
              <p className="text-xs text-muted-foreground">
                {t.correctOrderDesc}
              </p>
            </div>
          </div>
        )}

        {question.type === "matching" && question.pairs && (
          <div className="space-y-3">
            <Label>{t.matchingPairs}</Label>
            {question.pairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center gap-2">
                <Input
                  placeholder="Left side"
                  value={pair.left}
                  onChange={(e) => {
                    const newPairs = [...question.pairs!]
                    newPairs[pairIndex] = { ...newPairs[pairIndex], left: e.target.value }
                    onUpdate(question.id, { pairs: newPairs })
                  }}
                  className="flex-1"
                />
                <span className="text-muted-foreground">↔</span>
                <Input
                  placeholder="Right side"
                  value={pair.right}
                  onChange={(e) => {
                    const newPairs = [...question.pairs!]
                    newPairs[pairIndex] = { ...newPairs[pairIndex], right: e.target.value }
                    onUpdate(question.id, { pairs: newPairs })
                  }}
                  className="flex-1"
                />
                {question.pairs && question.pairs.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPairs = question.pairs!.filter((_, i) => i !== pairIndex)
                      onUpdate(question.id, { pairs: newPairs })
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newPairs = [...(question.pairs || []), { left: "", right: "" }]
                onUpdate(question.id, { pairs: newPairs })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
            <p className="text-xs text-muted-foreground">{t.rightSideShuffled}</p>
          </div>
        )}

        {question.type === "ordering" && question.options && (
          <div className="space-y-3">
            <Label>{t.itemsInCorrectOrder}</Label>
            <p className="text-xs text-muted-foreground">{t.enterItemsInSequence}</p>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{optIndex + 1}.</span>
                  <Input
                    placeholder={`Step ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => onAddOption(question.id)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
          </div>
        )}

        {question.type === "essay" && (
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t.essayManualGrading}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t.sampleAnswerRubric}</Label>
              <Textarea
                placeholder="Enter a sample answer or grading criteria for reference"
                value={question.correctAnswer as string}
                onChange={(e) => onUpdate(question.id, { correctAnswer: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">{t.sampleAnswerForInstructors}</p>
            </div>
          </div>
        )}

        {question.type === "image-choice" && question.options && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t.imageUrl || "Question Image"}</Label>
              <ImageUpload
                value={question.imageUrl || ""}
                onChange={(imageUrl) => onUpdate(question.id, { imageUrl })}
                maxSizeMB={5}
              />
            </div>
            <Label>{t.answerOptions} ({t.selectCorrectAnswer})</Label>
            <RadioGroup
              value={question.correctAnswer as string}
              onValueChange={(value) => onUpdate(question.id, { correctAnswer: value })}
            >
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <RadioGroupItem value={option} id={`${question.id}-option-${optIndex}`} />
                  <Input
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => onUpdateOption(question.id, optIndex, e.target.value)}
                    className="flex-1"
                  />
                  {question.options && question.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(question.id, optIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
            <Button variant="outline" size="sm" onClick={() => onAddOption(question.id)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addOption}
            </Button>
          </div>
        )}

        {question.type === "hotspot" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t.imageUrl || "Hotspot Image"}</Label>
              <ImageUpload
                value={question.imageUrl || ""}
                onChange={(imageUrl) => onUpdate(question.id, { imageUrl })}
                maxSizeMB={5}
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t.imageHotspotDesc}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t.hotspotsClickableAreas}</Label>
              {question.hotspots && question.hotspots.length > 0 ? (
                <div className="space-y-2">
                  {question.hotspots.map((hotspot, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm font-medium">Hotspot {index + 1}</span>
                      <Input
                        placeholder="Label"
                        value={hotspot.label}
                        onChange={(e) => {
                          const newHotspots = [...question.hotspots!]
                          newHotspots[index] = { ...newHotspots[index], label: e.target.value }
                          onUpdate(question.id, { hotspots: newHotspots })
                        }}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newHotspots = question.hotspots!.filter((_, i) => i !== index)
                          onUpdate(question.id, { hotspots: newHotspots })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noHotspotsYet}</p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newHotspots = [
                    ...(question.hotspots || []),
                    { x: 50, y: 50, label: `Hotspot ${(question.hotspots?.length || 0) + 1}` },
                  ]
                  onUpdate(question.id, { hotspots: newHotspots })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.addHotspot}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <Label>{t.explanationOptional}</Label>
          <Textarea
            placeholder={t.explanationAfterAnswer}
            value={question.explanation || ""}
            onChange={(e) => onUpdate(question.id, { explanation: e.target.value })}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}
