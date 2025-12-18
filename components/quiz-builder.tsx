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
import { ArrowLeft, Plus, Trash2, GripVertical, MoveVertical, ImageIcon, Save, Database, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/components/ui/toast-notification"
import { QuestionTypeSelector } from "@/components/question-type-selector"

interface QuizBuilderProps {
  initialQuiz?: Quiz
}

export function QuizBuilder({ initialQuiz }: QuizBuilderProps) {
  const { isAdmin, user } = useAuth()
  const { t, language } = useI18n()
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
  const [addQuestionTab, setAddQuestionTab] = useState<"types" | "banks">("types")
  const [questionSortOrder, setQuestionSortOrder] = useState<"newest" | "oldest">("newest")
  const [questionsPerPage, setQuestionsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0)
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())
  const [isSingleQuestionPreviewOpen, setIsSingleQuestionPreviewOpen] = useState(false)
  const [previewAnswer, setPreviewAnswer] = useState<any>(null)
  const [previewFeedback, setPreviewFeedback] = useState<{ show: boolean; correct: boolean } | null>(null)

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

  const toggleQuestionSelection = (questionId: string) => {
    const newSelection = new Set(selectedQuestionIds)
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId)
    } else {
      newSelection.add(questionId)
    }
    setSelectedQuestionIds(newSelection)
  }

  const selectAllQuestionsInBank = (bankId: string) => {
    const bank = questionBanks.find((b) => b.id === bankId)
    if (!bank) return

    const newSelection = new Set(selectedQuestionIds)
    bank.questions.forEach((q: Question) => newSelection.add(q.id))
    setSelectedQuestionIds(newSelection)
  }

  const deselectAllQuestionsInBank = (bankId: string) => {
    const bank = questionBanks.find((b) => b.id === bankId)
    if (!bank) return

    const newSelection = new Set(selectedQuestionIds)
    bank.questions.forEach((q: Question) => newSelection.delete(q.id))
    setSelectedQuestionIds(newSelection)
  }

  const importSelectedQuestions = () => {
    if (selectedQuestionIds.size === 0) {
      toast.warning(language === "km" ? "សូមជ្រើសរើសសំណួរយ៉ាងហោចណាស់មួយ" : "Please select at least one question")
      return
    }

    const selectedBank = questionBanks.find((b) => b.id === selectedBankId)
    if (!selectedBank) return

    const questionsToImport = selectedBank.questions.filter((q: Question) => selectedQuestionIds.has(q.id))

    // Add new questions with unique IDs
    const newQuestions = questionsToImport.map((q: any) => ({
      ...q,
      id: crypto.randomUUID() // Generate new ID to avoid conflicts
    }))

    setQuestions([...questions, ...newQuestions])
    toast.success(`${language === "km" ? "បានបន្ថែម" : "Added"} ${newQuestions.length} ${language === "km" ? "សំណួរ" : "questions"}`)

    // Reset selection and close dialog
    setSelectedQuestionIds(new Set())
    setSelectedBankId(null)
    setIsQuestionDialogOpen(false)
    setShowTypeSelector(false)
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
    setAddQuestionTab("types") // Default to Question Types tab
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

  // Functions for editing the current question being edited in dialog
  const updateEditingQuestionOption = (optionIndex: number, value: string) => {
    if (!editingQuestion || !editingQuestion.options) return
    const newOptions = [...editingQuestion.options]
    newOptions[optionIndex] = value
    setEditingQuestion({ ...editingQuestion, options: newOptions })
  }

  const addEditingQuestionOption = () => {
    if (!editingQuestion || !editingQuestion.options) return
    setEditingQuestion({ ...editingQuestion, options: [...editingQuestion.options, ""] })
  }

  const removeEditingQuestionOption = (optionIndex: number) => {
    if (!editingQuestion || !editingQuestion.options || editingQuestion.options.length <= 2) return
    const newOptions = editingQuestion.options.filter((_, i) => i !== optionIndex)
    setEditingQuestion({ ...editingQuestion, options: newOptions })
  }

  // Check preview answer and show feedback
  const checkPreviewAnswer = () => {
    if (!editingQuestion || previewAnswer === null || previewAnswer === undefined) {
      toast.warning(language === "km" ? "សូមជ្រើសរើសចម្លើយមុន" : "Please select an answer first")
      return
    }

    let isCorrect = false
    const correctAnswer = editingQuestion.correctAnswer

    // Check based on question type
    switch (editingQuestion.type) {
      case 'multiple-choice':
      case 'true-false':
      case 'short-answer':
      case 'image-choice':
        isCorrect = previewAnswer === correctAnswer
        break

      case 'multiple-select':
        if (Array.isArray(previewAnswer) && Array.isArray(correctAnswer)) {
          isCorrect = JSON.stringify(previewAnswer.sort()) === JSON.stringify(correctAnswer.sort())
        }
        break

      case 'fill-blanks':
        if (Array.isArray(previewAnswer) && Array.isArray(correctAnswer)) {
          isCorrect = previewAnswer.every((ans, idx) => ans.trim().toLowerCase() === correctAnswer[idx]?.trim().toLowerCase())
        }
        break

      case 'ordering':
      case 'drag-drop':
        if (Array.isArray(previewAnswer) && Array.isArray(correctAnswer)) {
          isCorrect = JSON.stringify(previewAnswer) === JSON.stringify(correctAnswer)
        }
        break

      case 'matching':
        if (typeof previewAnswer === 'object' && typeof correctAnswer === 'object') {
          isCorrect = JSON.stringify(previewAnswer) === JSON.stringify(correctAnswer)
        }
        break

      default:
        isCorrect = previewAnswer === correctAnswer
    }

    // Show Khmer feedback
    if (isCorrect) {
      toast.success(language === "km" ? "ត្រឹមត្រូវ! 🎉" : "Correct! 🎉")
    } else {
      toast.error(language === "km" ? "មិនត្រឹមត្រូវ! សូមព្យាយាមម្តងទៀត" : "Incorrect! Try again")
    }

    setPreviewFeedback({ show: true, correct: isCorrect })
  }

  // Reset preview state when opening/closing
  const openPreviewDialog = () => {
    setPreviewAnswer(null)
    setPreviewFeedback(null)
    setIsSingleQuestionPreviewOpen(true)
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

            {/* Questions - Compact List with Pagination */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{t.questions}</CardTitle>
                    <CardDescription>{questions.length} {t.questionAdded}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {questions.length > 0 && (
                      <>
                        <Select value={questionSortOrder} onValueChange={(value: any) => {
                          setQuestionSortOrder(value)
                          setCurrentPage(1)
                        }}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">
                              {language === "km" ? "ថ្មីបំផុត" : "Newest"}
                            </SelectItem>
                            <SelectItem value="oldest">
                              {language === "km" ? "ចាស់បំផុត" : "Oldest"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={questionsPerPage.toString()} onValueChange={(value) => {
                          setQuestionsPerPage(Number(value))
                          setCurrentPage(1)
                        }}>
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 / {language === "km" ? "ទំព័រ" : "page"}</SelectItem>
                            <SelectItem value="20">20 / {language === "km" ? "ទំព័រ" : "page"}</SelectItem>
                            <SelectItem value="50">50 / {language === "km" ? "ទំព័រ" : "page"}</SelectItem>
                            <SelectItem value="999999">{language === "km" ? "ទាំងអស់" : "All"}</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    <Button onClick={addQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t.addQuestion}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t.noQuestionsMessage}</p>
                  </div>
                ) : (
                  <>
                    {/* Compact Table View */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50 border-b">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold w-16">#</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold">
                                {language === "km" ? "សំណួរ" : "Question"}
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold w-32">
                                {language === "km" ? "ប្រភេទ" : "Type"}
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold w-20">
                                {language === "km" ? "ពិន្ទុ" : "Points"}
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold w-32">
                                {language === "km" ? "សកម្មភាព" : "Actions"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              // Sort and paginate questions
                              const sortedQuestions = questionSortOrder === "newest"
                                ? [...questions].reverse()
                                : questions
                              const startIndex = (currentPage - 1) * questionsPerPage
                              const endIndex = startIndex + questionsPerPage
                              const paginatedQuestions = sortedQuestions.slice(startIndex, endIndex)

                              return paginatedQuestions.map((question, displayIndex) => {
                                const actualIndex = questionSortOrder === "newest"
                                  ? questions.length - (startIndex + displayIndex)
                                  : startIndex + displayIndex + 1

                                return (
                                  <tr key={question.id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="px-3 py-3">
                                      <span className="font-semibold text-sm bg-primary/10 px-2 py-1 rounded">
                                        Q{actualIndex}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3">
                                      <p className="text-sm font-medium line-clamp-2">
                                        {question.question || <span className="text-muted-foreground italic">No question text</span>}
                                      </p>
                                    </td>
                                    <td className="px-3 py-3">
                                      <span className="text-xs text-muted-foreground capitalize">
                                        {question.type.replace("-", " ")}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3">
                                      <span className="text-xs text-muted-foreground">
                                        {question.points}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-right">
                                      <div className="flex gap-1 justify-end">
                                        <Button variant="outline" size="sm" onClick={() => editQuestion(question)}>
                                          {language === "km" ? "កែ" : "Edit"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteQuestion(question.id)}
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    {questions.length > questionsPerPage && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          {language === "km" ? "បង្ហាញ" : "Showing"}{" "}
                          {Math.min((currentPage - 1) * questionsPerPage + 1, questions.length)} -{" "}
                          {Math.min(currentPage * questionsPerPage, questions.length)}{" "}
                          {language === "km" ? "នៃ" : "of"} {questions.length}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            {language === "km" ? "មុន" : "Previous"}
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(questions.length / questionsPerPage) }, (_, i) => i + 1)
                              .filter(page => {
                                // Show first, last, current, and adjacent pages
                                return page === 1 ||
                                       page === Math.ceil(questions.length / questionsPerPage) ||
                                       Math.abs(page - currentPage) <= 1
                              })
                              .map((page, index, arr) => (
                                <span key={page}>
                                  {index > 0 && arr[index - 1] !== page - 1 && (
                                    <span className="px-2 text-muted-foreground">...</span>
                                  )}
                                  <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </Button>
                                </span>
                              ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === Math.ceil(questions.length / questionsPerPage)}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            {language === "km" ? "បន្ទាប់" : "Next"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (questions.length === 0) {
                    toast.error(language === "km" ? "សូមបន្ថែមសំណួរមុន" : "Please add questions first")
                    return
                  }
                  setPreviewQuestionIndex(0)
                  setIsPreviewOpen(true)
                }}
                disabled={questions.length === 0}
              >
                {language === "km" ? "មើលជាមុន" : "Preview Quiz"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push("/admin/quizzes")}>
                  {t.cancel}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {initialQuiz ? t.updateQuiz : t.create + " " + t.quiz}
                </Button>
              </div>
            </div>

            {/* Question Editor Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
              if (!open) cancelQuestionEdit()
            }}>
              <DialogContent className="max-w-[99vw] w-[99vw] max-h-[99vh] h-[99vh] overflow-y-auto p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {showTypeSelector
                      ? (language === "km" ? "បន្ថែមសំណួរ" : "Add Question")
                      : editingQuestion && questions.find(q => q.id === editingQuestion.id)
                      ? `${language === "km" ? "កែសម្រួលសំណួរ" : "Edit Question"} ${questions.findIndex(q => q.id === editingQuestion.id) + 1}`
                      : (language === "km" ? "បន្ថែមសំណួរថ្មី" : "Add New Question")}
                  </DialogTitle>
                  {showTypeSelector && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === "km"
                        ? "ជ្រើសរើសប្រភេទសំណួរ ឬនាំចូលសំណួរពីធនាគារសំណួររបស់អ្នក"
                        : "Choose a question type to create or import questions from your question banks"}
                    </p>
                  )}
                </DialogHeader>

                <div className="min-h-[80vh]">
                  {showTypeSelector && editingQuestion ? (
                    <Tabs value={addQuestionTab} onValueChange={(value: any) => setAddQuestionTab(value)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="types">
                          {language === "km" ? "ប្រភេទសំណួរ" : "Question Types"}
                        </TabsTrigger>
                        <TabsTrigger value="banks">
                          <Database className="h-4 w-4 mr-2" />
                          {language === "km" ? "ធនាគារសំណួរ" : "Question Banks"}
                        </TabsTrigger>
                      </TabsList>

                      {/* Question Types Tab */}
                      <TabsContent value="types" className="py-8">
                        <QuestionTypeSelector
                          value={editingQuestion.type}
                          onChange={(type) => {
                            // Update the question type and show the editor
                            updateEditingQuestion({ type })
                            setShowTypeSelector(false)
                          }}
                          t={t}
                        />
                      </TabsContent>

                      {/* Question Banks Tab */}
                      <TabsContent value="banks" className="py-8">
                        <div className="space-y-6">
                          {questionBanks.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                              <Database className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-semibold mb-2">
                                {language === "km" ? "មិនទាន់មានធនាគារសំណួរ" : "No Question Banks Yet"}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                {language === "km"
                                  ? "បង្កើតធនាគារសំណួរដើម្បីប្រើសំណួរឡើងវិញនៅក្នុងតេស្តជាច្រើន"
                                  : "Create question banks to reuse questions across multiple quizzes"}
                              </p>
                              <div className="flex gap-3 justify-center">
                                <Button
                                  variant="outline"
                                  onClick={() => router.push("/admin/question-banks")}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {language === "km" ? "បង្កើតធនាគារសំណួរ" : "Create Question Bank"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => window.open("/admin/question-banks", "_blank")}
                                >
                                  <Database className="h-4 w-4 mr-2" />
                                  {language === "km" ? "គ្រប់គ្រងធនាគារ" : "Manage Banks"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {language === "km" ? "នាំចូលសំណួរពីធនាគារ" : "Import Questions from Banks"}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {language === "km"
                                      ? "ជ្រើសរើសសំណួរពីធនាគារសំណួររបស់អ្នក"
                                      : "Select questions from your question banks"}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open("/admin/question-banks", "_blank")}
                                >
                                  <Database className="h-4 w-4 mr-2" />
                                  {language === "km" ? "គ្រប់គ្រង" : "Manage"}
                                </Button>
                              </div>

                              {/* Question Banks List */}
                              <div className="space-y-3">
                                {questionBanks.map((bank: any) => (
                                  <Card key={bank.id} className={`border-2 transition-all ${selectedBankId === bank.id ? "border-primary" : ""}`}>
                                    <CardHeader className="pb-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <CardTitle className="text-base flex items-center gap-2">
                                            <Database className="h-4 w-4" />
                                            {language === "km" && bank.nameKm ? bank.nameKm : bank.name}
                                          </CardTitle>
                                          <p className="text-sm text-muted-foreground mt-1">
                                            {bank.questions?.length || 0} {language === "km" ? "សំណួរ" : "questions"}
                                            {bank.subject && ` • ${bank.subject}`}
                                            {bank.gradeLevel && ` • ${bank.gradeLevel}`}
                                          </p>
                                        </div>
                                        <Button
                                          variant={selectedBankId === bank.id ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => {
                                            if (selectedBankId === bank.id) {
                                              setSelectedBankId(null)
                                              deselectAllQuestionsInBank(bank.id)
                                            } else {
                                              setSelectedBankId(bank.id)
                                            }
                                          }}
                                        >
                                          {selectedBankId === bank.id
                                            ? (language === "km" ? "បិទ" : "Close")
                                            : (language === "km" ? "មើលសំណួរ" : "View Questions")}
                                        </Button>
                                      </div>
                                    </CardHeader>

                                    {selectedBankId === bank.id && (
                                      <CardContent className="space-y-3">
                                        {/* Select All / Deselect All */}
                                        <div className="flex items-center justify-between py-2 border-t">
                                          <span className="text-sm font-medium">
                                            {selectedQuestionIds.size} {language === "km" ? "បានជ្រើសរើស" : "selected"}
                                          </span>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => selectAllQuestionsInBank(bank.id)}
                                            >
                                              {language === "km" ? "ជ្រើសរើសទាំងអស់" : "Select All"}
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => deselectAllQuestionsInBank(bank.id)}
                                            >
                                              {language === "km" ? "លុបចោលទាំងអស់" : "Deselect All"}
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Questions List with Checkboxes */}
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                          {bank.questions && bank.questions.length > 0 ? (
                                            bank.questions.map((q: Question, idx: number) => (
                                              <div
                                                key={q.id}
                                                className="flex items-start gap-3 p-3 border rounded hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => toggleQuestionSelection(q.id)}
                                              >
                                                <Checkbox
                                                  checked={selectedQuestionIds.has(q.id)}
                                                  onCheckedChange={() => toggleQuestionSelection(q.id)}
                                                  className="mt-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                      Q{idx + 1}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                      {q.type}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      {q.points} {language === "km" ? "ពិន្ទុ" : "pts"}
                                                    </span>
                                                  </div>
                                                  <p className="text-sm line-clamp-2">
                                                    {language === "km" && q.questionKm ? q.questionKm : q.question}
                                                  </p>
                                                  {q.options && q.options.length > 0 && (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                      {q.options.slice(0, 2).map((opt, i) => (
                                                        <div key={i} className="truncate">• {opt}</div>
                                                      ))}
                                                      {q.options.length > 2 && (
                                                        <div>... +{q.options.length - 2} {language === "km" ? "ច្រើនទៀត" : "more"}</div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-center py-8 text-muted-foreground text-sm">
                                              {language === "km" ? "មិនមានសំណួរក្នុងធនាគារនេះ" : "No questions in this bank"}
                                            </p>
                                          )}
                                        </div>
                                      </CardContent>
                                    )}
                                  </Card>
                                ))}
                              </div>

                              {/* Import Button */}
                              {selectedQuestionIds.size > 0 && (
                                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4">
                                  <Button
                                    onClick={importSelectedQuestions}
                                    className="w-full h-12"
                                    size="lg"
                                  >
                                    <Plus className="h-5 w-5 mr-2" />
                                    {language === "km" ? "នាំចូល" : "Import"} {selectedQuestionIds.size} {language === "km" ? "សំណួរ" : "Questions"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    editingQuestion && (
                      <QuestionEditor
                        question={editingQuestion}
                        index={questions.length}
                        onUpdate={(_, updates) => updateEditingQuestion(updates)}
                        onDelete={() => {}}
                        onUpdateOption={(_, index, value) => updateEditingQuestionOption(index, value)}
                        onAddOption={() => addEditingQuestionOption()}
                        onRemoveOption={(_, index) => removeEditingQuestionOption(index)}
                        t={t}
                        onChangeType={() => setShowTypeSelector(true)}
                      />
                    )
                  )}
                </div>

                {!showTypeSelector && (
                  <DialogFooter className="gap-2">
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        onClick={openPreviewDialog}
                        disabled={!editingQuestion?.question?.trim()}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {language === "km" ? "មើលជាមុន" : "Preview"}
                      </Button>
                    </div>
                    <Button variant="outline" onClick={cancelQuestionEdit}>
                      {language === "km" ? "បោះបង់" : "Cancel"}
                    </Button>
                    <Button onClick={saveQuestion} disabled={!editingQuestion?.question?.trim()}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingQuestion && questions.find(q => q.id === editingQuestion.id)
                        ? (language === "km" ? "ធ្វើបច្ចុប្បន្នភាពសំណួរ" : "Update Question")
                        : (language === "km" ? "បន្ថែមសំណួរ" : "Add Question")}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>

            {/* Single Question Preview Dialog */}
            <Dialog open={isSingleQuestionPreviewOpen} onOpenChange={setIsSingleQuestionPreviewOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === "km" ? "មើលជាមុនសំណួរ" : "Question Preview"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === "km"
                      ? "នេះជារូបរាងដែលសិស្សនឹងឃើញសំណួរនេះ"
                      : "This is how students will see this question"}
                  </p>
                </DialogHeader>

                {editingQuestion && (
                  <div className="space-y-6 py-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-primary/10 rounded font-medium">
                                {editingQuestion.type}
                              </span>
                            </div>
                            <CardTitle className="text-xl">
                              {language === "km" && editingQuestion.questionKm
                                ? editingQuestion.questionKm
                                : editingQuestion.question || (language === "km" ? "សំណួរ" : "Question")}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm">{editingQuestion.points || 1}</span>
                            <span className="text-sm">{language === "km" ? "ពិន្ទុ" : "points"}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Multiple Choice */}
                        {editingQuestion.type === "multiple-choice" && editingQuestion.options && (
                          <RadioGroup value={previewAnswer || ""} onValueChange={setPreviewAnswer}>
                            {(language === "km" && editingQuestion.optionsKm ? editingQuestion.optionsKm : editingQuestion.options).map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem value={option} id={`preview-${idx}`} />
                                <Label htmlFor={`preview-${idx}`} className="cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {/* Multiple Select */}
                        {editingQuestion.type === "multiple-select" && editingQuestion.options && (
                          <div className="space-y-2">
                            {(language === "km" && editingQuestion.optionsKm ? editingQuestion.optionsKm : editingQuestion.options).map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`preview-check-${idx}`}
                                  checked={(previewAnswer || []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const current = previewAnswer || []
                                    if (checked) {
                                      setPreviewAnswer([...current, option])
                                    } else {
                                      setPreviewAnswer(current.filter((o: string) => o !== option))
                                    }
                                  }}
                                />
                                <Label htmlFor={`preview-check-${idx}`} className="cursor-pointer">{option}</Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* True/False */}
                        {editingQuestion.type === "true-false" && (
                          <RadioGroup value={previewAnswer || ""} onValueChange={setPreviewAnswer}>
                            <div className="flex items-center space-x-2 mb-2">
                              <RadioGroupItem value="true" id="preview-true" />
                              <Label htmlFor="preview-true" className="cursor-pointer">
                                {language === "km" ? "ត្រូវ" : "True"}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="preview-false" />
                              <Label htmlFor="preview-false" className="cursor-pointer">
                                {language === "km" ? "ខុស" : "False"}
                              </Label>
                            </div>
                          </RadioGroup>
                        )}

                        {/* Short Answer */}
                        {editingQuestion.type === "short-answer" && (
                          <Input
                            placeholder={language === "km" ? "វាយចម្លើយរបស់អ្នក..." : "Type your answer..."}
                            value={previewAnswer || ""}
                            onChange={(e) => setPreviewAnswer(e.target.value)}
                          />
                        )}

                        {/* Essay */}
                        {editingQuestion.type === "essay" && (
                          <Textarea
                            placeholder={language === "km" ? "សរសេរចម្លើយរបស់អ្នក..." : "Write your answer..."}
                            rows={6}
                            disabled
                          />
                        )}

                        {/* Fill Blanks */}
                        {(editingQuestion.type === "fill-blank" || editingQuestion.type === "fill-blanks") && (
                          <div className="space-y-3">
                            {editingQuestion.blanksTemplate && (
                              <p className="text-sm mb-2">
                                {language === "km" && editingQuestion.blanksTemplateKm
                                  ? editingQuestion.blanksTemplateKm
                                  : editingQuestion.blanksTemplate}
                              </p>
                            )}
                            {editingQuestion.blanksCount && editingQuestion.blanksCount > 1 ? (
                              <div className="space-y-2">
                                {Array.from({ length: editingQuestion.blanksCount }, (_, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Label className="w-24 text-sm">
                                      {language === "km" ? "ចន្លោះ" : "Blank"} {idx + 1}:
                                    </Label>
                                    <Input placeholder={language === "km" ? "បំពេញចម្លើយ" : "Fill answer"} disabled />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <Input placeholder={language === "km" ? "បំពេញចម្លើយ" : "Fill in the blank"} disabled />
                            )}
                          </div>
                        )}

                        {/* Matching */}
                        {editingQuestion.type === "matching" && editingQuestion.pairs && editingQuestion.pairs.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-3">
                              {language === "km"
                                ? "ផ្គូផ្គងធាតុខាងឆ្វេងជាមួយធាតុខាងស្តាំ"
                                : "Match items on the left with items on the right"}
                            </p>
                            {editingQuestion.pairs.map((pair, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="flex-1 p-2 bg-muted rounded">
                                  {language === "km" && pair.leftKm ? pair.leftKm : pair.left}
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <select className="flex-1 p-2 border rounded" disabled>
                                  <option>{language === "km" ? "ជ្រើសរើស..." : "Select..."}</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ordering / Drag-Drop */}
                        {(editingQuestion.type === "ordering" || editingQuestion.type === "drag-drop") && editingQuestion.options && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground mb-3">
                              {language === "km"
                                ? "ចុចលើធាតុហើយប្រើប៊ូតុងឡើងលើ/ចុះក្រោមដើម្បីរៀបចំ"
                                : "Click on items and use up/down buttons to arrange"}
                            </p>
                            {(language === "km" && editingQuestion.optionsKm ? editingQuestion.optionsKm : editingQuestion.options).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-3 bg-muted rounded">
                                <div className="flex flex-col gap-1">
                                  <button type="button" className="text-xs p-1 rounded disabled:opacity-30" disabled>▲</button>
                                  <button type="button" className="text-xs p-1 rounded disabled:opacity-30" disabled>▼</button>
                                </div>
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="font-semibold text-muted-foreground">{idx + 1}.</span>
                                  <span>{item}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Image Choice */}
                        {editingQuestion.type === "image-choice" && (
                          <div className="space-y-4">
                            {editingQuestion.imageUrl && (
                              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden border">
                                <img src={editingQuestion.imageUrl} alt="Question" className="w-full h-full object-contain" />
                              </div>
                            )}
                            {editingQuestion.options && (
                              <RadioGroup value={previewAnswer || ""} onValueChange={setPreviewAnswer}>
                                {(language === "km" && editingQuestion.optionsKm ? editingQuestion.optionsKm : editingQuestion.options).map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 mb-2">
                                    <RadioGroupItem value={option} id={`preview-img-${idx}`} />
                                    <Label htmlFor={`preview-img-${idx}`} className="cursor-pointer">{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}
                          </div>
                        )}

                        {/* Hotspot */}
                        {editingQuestion.type === "hotspot" && (
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {language === "km"
                                ? "ចុចលើតំបន់ត្រឹមត្រូវនៅលើរូបភាព"
                                : "Click on the correct area on the image"}
                            </p>
                            {editingQuestion.imageUrl && (
                              <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden border-2">
                                <img src={editingQuestion.imageUrl} alt="Hotspot Question" className="w-full h-full object-contain" />
                                {editingQuestion.hotspots?.map((hotspot, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled
                                    className="absolute w-8 h-8 rounded-full border-2 bg-white/50 border-white"
                                    style={{
                                      left: `${hotspot.x}%`,
                                      top: `${hotspot.y}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                    title={language === "km" && hotspot.labelKm ? hotspot.labelKm : hotspot.label}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  {!previewFeedback && (
                    <Button onClick={checkPreviewAnswer} variant="default">
                      {language === "km" ? "ពិនិត្យចម្លើយ" : "Check Answer"}
                    </Button>
                  )}
                  {previewFeedback && (
                    <Button
                      onClick={() => {
                        setPreviewAnswer(null)
                        setPreviewFeedback(null)
                      }}
                      variant="outline"
                    >
                      {language === "km" ? "ព្យាយាមម្តងទៀត" : "Try Again"}
                    </Button>
                  )}
                  <Button onClick={() => setIsSingleQuestionPreviewOpen(false)} variant="outline">
                    {language === "km" ? "បិទមើលជាមុន" : "Close Preview"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Quiz Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === "km" ? "មើលជាមុនតេស្ត" : "Quiz Preview"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === "km"
                      ? "នេះជារូបរាងដែលសិស្សនឹងឃើញ"
                      : "This is how students will see the quiz"}
                  </p>
                </DialogHeader>

                {questions.length > 0 && (
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {language === "km" ? "សំណួរ" : "Question"} {previewQuestionIndex + 1} {language === "km" ? "នៃ" : "of"} {questions.length}
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round(((previewQuestionIndex + 1) / questions.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${((previewQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Question */}
                    {(() => {
                      const q = questions[previewQuestionIndex]
                      return (
                        <Card>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs px-2 py-1 bg-primary/10 rounded font-medium">
                                    Q{previewQuestionIndex + 1}
                                  </span>
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {q.type.replace("-", " ")}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    • {q.points} {language === "km" ? "ពិន្ទុ" : "points"}
                                  </span>
                                </div>
                                <h3 className="text-lg font-medium">{q.question}</h3>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* Multiple Choice */}
                            {q.type === "multiple-choice" && q.options && (
                              <RadioGroup>
                                {q.options.map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                                    <RadioGroupItem value={option} id={`preview-${idx}`} disabled />
                                    <Label htmlFor={`preview-${idx}`} className="flex-1 cursor-pointer">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {/* Multiple Select */}
                            {q.type === "multiple-select" && q.options && (
                              <div className="space-y-2">
                                {q.options.map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                                    <Checkbox id={`preview-multi-${idx}`} disabled />
                                    <Label htmlFor={`preview-multi-${idx}`} className="flex-1 cursor-pointer">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* True/False */}
                            {q.type === "true-false" && (
                              <RadioGroup>
                                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                                  <RadioGroupItem value="true" id="preview-true" disabled />
                                  <Label htmlFor="preview-true" className="flex-1 cursor-pointer">
                                    {language === "km" ? "ត្រូវ" : "True"}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                                  <RadioGroupItem value="false" id="preview-false" disabled />
                                  <Label htmlFor="preview-false" className="flex-1 cursor-pointer">
                                    {language === "km" ? "ខុស" : "False"}
                                  </Label>
                                </div>
                              </RadioGroup>
                            )}

                            {/* Short Answer */}
                            {q.type === "short-answer" && (
                              <Input
                                placeholder={language === "km" ? "វាយចម្លើយរបស់អ្នកនៅទីនេះ..." : "Type your answer here..."}
                                disabled
                                className="w-full"
                              />
                            )}

                            {/* Essay */}
                            {q.type === "essay" && (
                              <Textarea
                                placeholder={language === "km" ? "សរសេរអត្ថបទរបស់អ្នកនៅទីនេះ..." : "Write your essay here..."}
                                disabled
                                rows={6}
                                className="w-full"
                              />
                            )}

                            {/* Fill Blanks */}
                            {q.type === "fill-blanks" && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  {language === "km" ? "បំពេញនៅក្នុងចន្លោះទទេ:" : "Fill in the blanks:"}
                                </p>
                                <div className="p-4 border rounded bg-muted/20">
                                  {q.blanksTemplate || language === "km" ? "គំរូនឹងត្រូវបានបង្ហាញនៅទីនេះ" : "Template will be shown here"}
                                </div>
                              </div>
                            )}

                            {/* Matching */}
                            {q.type === "matching" && q.pairs && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  {language === "km" ? "ផ្គូផ្គងធាតុពីសងខាង:" : "Match items from both columns:"}
                                </p>
                                <div className="grid gap-2">
                                  {q.pairs.map((pair, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                      <div className="flex-1 p-3 border rounded bg-muted/20">
                                        {pair.left}
                                      </div>
                                      <span className="text-muted-foreground">↔</span>
                                      <div className="flex-1 p-3 border rounded bg-muted/20">
                                        {pair.right}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ordering */}
                            {q.type === "ordering" && q.options && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  {language === "km" ? "តម្រៀបធាតុទាំងនេះតាមលំដាប់ត្រឹមត្រូវ:" : "Arrange these items in correct order:"}
                                </p>
                                {q.options.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-3 border rounded bg-muted/20">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Image Choice */}
                            {q.type === "image-choice" && q.imageUrl && (
                              <div className="space-y-4">
                                <img src={q.imageUrl} alt="Question" className="w-full rounded-lg border" />
                                {q.options && (
                                  <RadioGroup>
                                    {q.options.map((option, idx) => (
                                      <div key={idx} className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                                        <RadioGroupItem value={option} id={`preview-img-${idx}`} disabled />
                                        <Label htmlFor={`preview-img-${idx}`} className="flex-1 cursor-pointer">
                                          {option}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                )}
                              </div>
                            )}

                            {/* Hotspot */}
                            {q.type === "hotspot" && q.imageUrl && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  {language === "km" ? "ចុចលើតំបន់ត្រឹមត្រូវនៅលើរូបភាព:" : "Click on the correct areas in the image:"}
                                </p>
                                <img src={q.imageUrl} alt="Hotspot Question" className="w-full rounded-lg border" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })()}

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewQuestionIndex(Math.max(0, previewQuestionIndex - 1))}
                        disabled={previewQuestionIndex === 0}
                      >
                        {language === "km" ? "មុន" : "Previous"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {previewQuestionIndex + 1} / {questions.length}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setPreviewQuestionIndex(Math.min(questions.length - 1, previewQuestionIndex + 1))}
                        disabled={previewQuestionIndex === questions.length - 1}
                      >
                        {language === "km" ? "បន្ទាប់" : "Next"}
                      </Button>
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => setIsPreviewOpen(false)}>
                        {language === "km" ? "បិទមើលជាមុន" : "Close Preview"}
                      </Button>
                    </div>
                  </div>
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
