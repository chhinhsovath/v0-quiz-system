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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Plus, Trash2, GripVertical, MoveVertical, ImageIcon, Save, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/components/ui/toast-notification"
import { QuestionTypeSelector } from "@/components/question-type-selector"

interface QuizBuilderProps {
  initialQuiz?: Quiz
}

export function QuizBuilder({ initialQuiz }: QuizBuilderProps) {
  const { isAdmin, user } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [questionBanks, setQuestionBanks] = useState<any[]>([])
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
    shuffleOptions: initialQuiz?.shuffleOptions || false,
    allowMultipleAttempts: initialQuiz?.allowMultipleAttempts || true,
    showCorrectAnswers: initialQuiz?.showCorrectAnswers || true,
    questionBankIds: initialQuiz?.questionBankIds || [],
    randomPoolSize: initialQuiz?.randomPoolSize || 0,
  })
  const [questions, setQuestions] = useState<Question[]>(initialQuiz?.questions || [])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [showTypeSelector, setShowTypeSelector] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
      return
    }
    loadCategories()
    loadQuestionBanks()
  }, [isAdmin, router])

  const loadCategories = async () => {
    try {
      const cats = await quizStorage.getCategories()
      setCategories(cats)

      // Set default category if none selected
      if (!quizData.categoryId && cats.length > 0) {
        setQuizData((prev) => ({ ...prev, categoryId: cats[0].id }))
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadQuestionBanks = async () => {
    try {
      const banks = await quizStorage.getQuestionBanks()
      // Filter to show only user's banks or shared banks
      const filtered = banks.filter((b: any) => b.createdBy === user?.id || b.sharedWith?.includes(user?.id || ""))
      setQuestionBanks(filtered)
    } catch (error) {
      console.error('Error loading question banks:', error)
    }
  }

  const addQuestionsFromBank = (bankId: string) => {
    const bank = questionBanks.find((b) => b.id === bankId)
    if (!bank || !bank.questions || bank.questions.length === 0) {
      toast.warning("This question bank is empty")
      return
    }

    const poolSize = quizData.randomPoolSize || bank.questions.length
    const questionsToAdd = quizData.randomPoolSize > 0 && quizData.randomPoolSize < bank.questions.length
      ? bank.questions.sort(() => Math.random() - 0.5).slice(0, poolSize)
      : bank.questions

    // Add new questions with unique IDs
    const newQuestions = questionsToAdd.map((q: any) => ({
      ...q,
      id: crypto.randomUUID() // Generate new ID to avoid conflicts
    }))

    setQuestions([...questions, ...newQuestions])
    toast.success(`Added ${newQuestions.length} questions from question bank`)
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    }
    setEditingQuestion(newQuestion)
    setShowTypeSelector(true) // Show type selector for new questions
    setIsQuestionDialogOpen(true)
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question })
    setShowTypeSelector(false) // Don't show type selector when editing
    setIsQuestionDialogOpen(true)
  }

  const saveQuestion = () => {
    if (!editingQuestion) return

    // Auto-generate correct answer for matching questions
    let questionToSave = { ...editingQuestion }
    if (editingQuestion.type === "matching" && editingQuestion.pairs) {
      const correctAnswerMap: Record<string, string> = {}
      editingQuestion.pairs.forEach(pair => {
        correctAnswerMap[pair.left] = pair.right
      })
      questionToSave.correctAnswer = correctAnswerMap
    }

    // Auto-generate correct answer for ordering/drag-drop (array of correct order)
    if ((editingQuestion.type === "ordering" || editingQuestion.type === "drag-drop") && editingQuestion.options) {
      questionToSave.correctAnswer = [...editingQuestion.options]
    }

    const existingIndex = questions.findIndex(q => q.id === editingQuestion.id)
    if (existingIndex >= 0) {
      // Update existing
      const updated = [...questions]
      updated[existingIndex] = questionToSave
      setQuestions(updated)
    } else {
      // Add new
      setQuestions([...questions, questionToSave])
    }

    setIsQuestionDialogOpen(false)
    setEditingQuestion(null)
  }

  const cancelQuestionEdit = () => {
    setIsQuestionDialogOpen(false)
    setEditingQuestion(null)
  }

  const updateEditingQuestion = (updates: Partial<Question>) => {
    if (!editingQuestion) return

    // If type is being changed, set up appropriate fields
    if (updates.type && updates.type !== editingQuestion.type) {
      const type = updates.type
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

      setEditingQuestion({
        ...editingQuestion,
        ...updates,
        options,
        correctAnswer,
        blanksTemplate,
        blanksCount,
        pairs,
        imageUrl,
        hotspots,
      })
    } else {
      setEditingQuestion({ ...editingQuestion, ...updates })
    }
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

  const handleSave = async () => {
    if (!quizData.title.trim()) {
      toast.error("Please enter a quiz title")
      return
    }

    if (!quizData.categoryId) {
      toast.error("Please select a category")
      return
    }

    if (questions.length === 0) {
      toast.warning("Please add at least one question")
      return
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const questionNumber = i + 1

      if (!q.question.trim()) {
        toast.error(`Question ${questionNumber}: Please fill in the question text`)
        return
      }

      // Validate options for question types that use them
      if ((q.type === "multiple-choice" || q.type === "multiple-select" || q.type === "true-false") && q.options) {
        if (q.options.some((opt) => !opt.trim())) {
          toast.error(`Question ${questionNumber}: Please fill in all answer options`)
          return
        }
      }

      // Validate matching pairs (correct answer is auto-generated from pairs)
      if (q.type === "matching") {
        if (!q.pairs || q.pairs.length === 0) {
          toast.error(`Question ${questionNumber}: Please add matching pairs`)
          return
        }
        if (q.pairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
          toast.error(`Question ${questionNumber}: Please fill in all matching pairs`)
          return
        }
        // Skip correctAnswer check - it's auto-generated
        continue
      }

      // Validate ordering/drag-drop (correct answer is auto-generated from options)
      if (q.type === "ordering" || q.type === "drag-drop") {
        if (!q.options || q.options.length === 0) {
          toast.error(`Question ${questionNumber}: Please add items to order`)
          return
        }
        if (q.options.some(opt => !opt.trim())) {
          toast.error(`Question ${questionNumber}: Please fill in all items`)
          return
        }
        // Skip correctAnswer check - it's auto-generated
        continue
      }

      // Validate correct answers for other question types
      const needsCorrectAnswer = [
        "multiple-choice",
        "multiple-select",
        "true-false",
        "short-answer",
        "fill-blanks",
        "image-choice"
      ]

      if (needsCorrectAnswer.includes(q.type)) {
        if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
          toast.error(`Question ${questionNumber}: Please set the correct answer`)
          return
        }
      }

      // Validate hotspot areas
      if (q.type === "hotspot" && (!q.hotspots || q.hotspots.length === 0)) {
        toast.error(`Question ${questionNumber}: Please add at least one hotspot area`)
        return
      }

      // Validate image for image-based questions
      if ((q.type === "image-choice" || q.type === "hotspot") && !q.imageUrl) {
        toast.error(`Question ${questionNumber}: Please upload an image`)
        return
      }
    }

    // Auto-generate correct answers for matching and ordering questions
    const processedQuestions = questions.map(q => {
      if (q.type === "matching" && q.pairs) {
        const correctAnswerMap: Record<string, string> = {}
        q.pairs.forEach(pair => {
          correctAnswerMap[pair.left] = pair.right
        })
        return { ...q, correctAnswer: correctAnswerMap }
      }
      if ((q.type === "ordering" || q.type === "drag-drop") && q.options) {
        return { ...q, correctAnswer: [...q.options] }
      }
      return q
    })

    const quiz: Quiz = {
      id: initialQuiz?.id || crypto.randomUUID(),
      ...quizData,
      questions: processedQuestions,
      createdBy: user?.id || "",
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
    }

    try {
      if (initialQuiz) {
        await quizStorage.updateQuiz(quiz.id, quiz)
        toast.success("Quiz updated successfully!")
      } else {
        await quizStorage.addQuiz(quiz)
        toast.success("Quiz created successfully!")
      }

      // Delay navigation to show toast
      setTimeout(() => {
        router.push("/admin/quizzes")
      }, 500)
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error(initialQuiz ? "Failed to update quiz" : "Failed to create quiz")
    }
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
            {/* Quiz Details - Compact Tabbed Design */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quizDetails}</CardTitle>
                <CardDescription>{t.basicInfoDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">
                      {language === "km" ? "ព័ត៌មានមូលដ្ឋាន" : "Basic Info"}
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      {language === "km" ? "ការកំណត់" : "Settings"}
                    </TabsTrigger>
                    <TabsTrigger value="options">
                      {language === "km" ? "ជម្រើស" : "Options"}
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">{t.description}</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description..."
                          value={quizData.description}
                          onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descriptionKm">{t.descriptionKm}</Label>
                        <Textarea
                          id="descriptionKm"
                          placeholder="ការពិពណ៌នាខ្លីៗ..."
                          value={quizData.descriptionKm}
                          onChange={(e) => setQuizData({ ...quizData, descriptionKm: e.target.value })}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
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
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="grid md:grid-cols-3 gap-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="maxAttempts">{t.maxAttempts}</Label>
                        <Input
                          id="maxAttempts"
                          type="number"
                          min="1"
                          value={quizData.maxAttempts}
                          onChange={(e) => setQuizData({ ...quizData, maxAttempts: Number.parseInt(e.target.value) || 3 })}
                        />
                        <p className="text-xs text-muted-foreground">{t.maxAttemptsDesc}</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Options Tab */}
                  <TabsContent value="options" className="space-y-3 mt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{t.certificateEnabled}</Label>
                          <p className="text-xs text-muted-foreground">{t.enableCertificateDesc}</p>
                        </div>
                        <Switch
                          checked={quizData.certificateEnabled}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, certificateEnabled: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{t.adaptiveTesting}</Label>
                          <p className="text-xs text-muted-foreground">{t.adaptiveTestingDesc}</p>
                        </div>
                        <Switch
                          checked={quizData.adaptiveTesting}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, adaptiveTesting: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{t.randomizeQuestions}</Label>
                          <p className="text-xs text-muted-foreground">{t.randomizeQuestionsDesc}</p>
                        </div>
                        <Switch
                          checked={quizData.randomizeQuestions}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, randomizeQuestions: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">
                            {language === "km" ? "ច្របល់ជម្រើសចម្លើយ" : "Shuffle Answer Options"}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {language === "km"
                              ? "ច្របល់លំដាប់ជម្រើសសម្រាប់សិស្សនីមួយៗ"
                              : "Randomize option order for each student"}
                          </p>
                        </div>
                        <Switch
                          checked={quizData.shuffleOptions}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, shuffleOptions: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{t.allowMultipleAttempts}</Label>
                          <p className="text-xs text-muted-foreground">{t.allowMultipleAttemptsDesc}</p>
                        </div>
                        <Switch
                          checked={quizData.allowMultipleAttempts}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, allowMultipleAttempts: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">{t.showCorrectAnswers}</Label>
                          <p className="text-xs text-muted-foreground">{t.showCorrectAnswersDesc}</p>
                        </div>
                        <Switch
                          checked={quizData.showCorrectAnswers}
                          onCheckedChange={(checked) => setQuizData({ ...quizData, showCorrectAnswers: checked })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Question Banks */}
            {questionBanks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Question Banks</CardTitle>
                  <CardDescription>Import questions from your question banks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Select Question Bank</Label>
                      <Select onValueChange={addQuestionsFromBank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a question bank..." />
                        </SelectTrigger>
                        <SelectContent>
                          {questionBanks.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.name} ({bank.questions?.length || 0} questions)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Random Pool Size (0 = all)</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quizData.randomPoolSize || ""}
                        onChange={(e) => setQuizData({ ...quizData, randomPoolSize: Number.parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">
                        If set, will randomly select this many questions from the bank
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Database className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Questions imported from banks will be added to your quiz. You can edit them individually after import.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
              <CardContent className="space-y-3">
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t.noQuestionsMessage}</p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <Card key={question.id} className="border-l-4 border-l-primary/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm bg-primary/10 px-2 py-1 rounded">
                                Q{index + 1}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {question.type.replace("-", " ")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                • {question.points} {question.points === 1 ? "point" : "points"}
                              </span>
                            </div>
                            <p className="text-sm font-medium line-clamp-2">
                              {question.question || <span className="text-muted-foreground italic">No question text</span>}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => editQuestion(question)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(question.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

            {/* Question Editor Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
              if (!open) cancelQuestionEdit()
            }}>
              <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {showTypeSelector
                      ? "Choose Question Type"
                      : editingQuestion && questions.find(q => q.id === editingQuestion.id)
                      ? `Edit Question ${questions.findIndex(q => q.id === editingQuestion.id) + 1}`
                      : "Add New Question"}
                  </DialogTitle>
                  {showTypeSelector && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Select the question type that best fits your needs. Each type has unique features and difficulty levels.
                    </p>
                  )}
                </DialogHeader>

                <div className="min-h-[80vh]">
                  {showTypeSelector && editingQuestion ? (
                    <div className="py-8">
                      <QuestionTypeSelector
                        value={editingQuestion.type}
                        onChange={(type) => {
                          // Update the question type and show the editor
                          updateEditingQuestion({ type })
                          setShowTypeSelector(false)
                        }}
                        t={t}
                      />
                    </div>
                  ) : (
                    editingQuestion && (
                      <QuestionEditor
                        question={editingQuestion}
                        index={questions.length}
                        onUpdate={(_, updates) => updateEditingQuestion(updates)}
                        onDelete={() => {}}
                        onUpdateOption={(_, index, value) => updateQuestionOption(index, value)}
                        onAddOption={() => addOption()}
                        onRemoveOption={(_, index) => removeOption(index)}
                        t={t}
                        onChangeType={() => setShowTypeSelector(true)}
                      />
                    )
                  )}
                </div>

                {!showTypeSelector && (
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={cancelQuestionEdit}>
                      Cancel
                    </Button>
                    <Button onClick={saveQuestion} disabled={!editingQuestion?.question?.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingQuestion && questions.find(q => q.id === editingQuestion.id) ? "Update Question" : "Add Question"}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
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
  onChangeType?: () => void
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
  onChangeType,
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
              {onChangeType ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={onChangeType}
                >
                  {t[question.type.replace(/-/g, "")] || question.type}
                  <span className="ml-2 text-xs text-muted-foreground">• Click to change type</span>
                </Button>
              ) : (
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
              )}
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
