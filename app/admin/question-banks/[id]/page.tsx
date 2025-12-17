"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Save, GripVertical } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import type { QuestionBank, Question, QuestionType } from "@/lib/quiz-types"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/components/ui/toast-notification"
import { QuestionEditor } from "@/components/question-editor"

export default function QuestionBankEditorPage() {
  const { user, isAdmin, isTeacher } = useAuth()
  const { language } = useI18n()
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const [bank, setBank] = useState<QuestionBank | null>(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)

  useEffect(() => {
    if (isAdmin || isTeacher) {
      loadBank()
    }
  }, [isAdmin, isTeacher, params.id])

  const loadBank = async () => {
    try {
      setLoading(true)
      const banks = await quizStorage.getQuestionBanks()
      const foundBank = banks.find((b) => b.id === params.id)
      if (foundBank) {
        setBank(foundBank)
        setQuestions(foundBank.questions || [])
      } else {
        toast.error(language === "km" ? "រកមិនឃើញធនាគារសំណួរ" : "Question bank not found")
        router.push("/admin/question-banks")
      }
    } catch (error) {
      console.error('Error loading question bank:', error)
      toast.error(language === "km" ? "មានបញ្ហាក្នុងការផ្ទុកធនាគារសំណួរ" : "Error loading question bank")
    } finally {
      setLoading(false)
    }
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
    setIsQuestionDialogOpen(true)
  }

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question })
    setIsQuestionDialogOpen(true)
  }

  const saveQuestion = async () => {
    if (!editingQuestion || !bank) return

    // Auto-generate correct answer for matching questions
    let questionToSave = { ...editingQuestion }
    if (editingQuestion.type === "matching" && editingQuestion.pairs) {
      const correctAnswerMap: Record<string, string> = {}
      editingQuestion.pairs.forEach(pair => {
        correctAnswerMap[pair.left] = pair.right
      })
      questionToSave.correctAnswer = correctAnswerMap
    }

    // Auto-generate correct answer for ordering/drag-drop
    if ((editingQuestion.type === "ordering" || editingQuestion.type === "drag-drop") && editingQuestion.options) {
      questionToSave.correctAnswer = [...editingQuestion.options]
    }

    const existingIndex = questions.findIndex(q => q.id === editingQuestion.id)
    let updatedQuestions: Question[]

    if (existingIndex >= 0) {
      // Update existing
      updatedQuestions = [...questions]
      updatedQuestions[existingIndex] = questionToSave
    } else {
      // Add new
      updatedQuestions = [...questions, questionToSave]
    }

    try {
      await quizStorage.updateQuestionBank(bank.id, { questions: updatedQuestions })
      setQuestions(updatedQuestions)
      setIsQuestionDialogOpen(false)
      setEditingQuestion(null)
      toast.success(language === "km" ? "បានរក្សាទុកសំណួរ" : "Question saved successfully")
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error(language === "km" ? "មានបញ្ហាក្នុងការរក្សាទុកសំណួរ" : "Error saving question")
    }
  }

  const deleteQuestion = async (id: string) => {
    if (!bank) return

    if (confirm(language === "km" ? "តើអ្នកប្រាកដទេចង់លុបសំណួរនេះ?" : "Are you sure you want to delete this question?")) {
      try {
        const updatedQuestions = questions.filter((q) => q.id !== id)
        await quizStorage.updateQuestionBank(bank.id, { questions: updatedQuestions })
        setQuestions(updatedQuestions)
        toast.success(language === "km" ? "បានលុបសំណួរ" : "Question deleted successfully")
      } catch (error) {
        console.error('Error deleting question:', error)
        toast.error(language === "km" ? "មានបញ្ហាក្នុងការលុបសំណួរ" : "Error deleting question")
      }
    }
  }

  const cancelQuestionEdit = () => {
    setIsQuestionDialogOpen(false)
    setEditingQuestion(null)
  }

  const updateEditingQuestion = (updates: Partial<Question>) => {
    if (!editingQuestion) return
    setEditingQuestion({ ...editingQuestion, ...updates })
  }

  if (!isAdmin && !isTeacher) {
    return <div>{language === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើ" : "Access denied"}</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!bank) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <BackButton href="/admin/question-banks" />

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              {language === "km" && bank.nameKm ? bank.nameKm : bank.name}
            </h1>
            <p className="text-muted-foreground">
              {language === "km" ? "គ្រប់គ្រងសំណួរក្នុងធនាគារសំណួរនេះ" : "Manage questions in this question bank"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Questions List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {language === "km" ? "សំណួរ" : "Questions"} ({questions.length})
                    </CardTitle>
                  </div>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "km" ? "បន្ថែមសំណួរ" : "Add Question"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {language === "km" ? "មិនទាន់មានសំណួរ" : "No questions yet"}
                    </p>
                    <Button onClick={addQuestion} variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "km" ? "បន្ថែមសំណួរទីមួយ" : "Add your first question"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <Card key={q.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-muted-foreground">
                                    Q{index + 1}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                    {q.type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {q.points} {language === "km" ? "ពិន្ទុ" : "pts"}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editQuestion(q)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteQuestion(q.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm font-medium line-clamp-2">
                                {language === "km" && q.questionKm ? q.questionKm : q.question}
                              </p>
                              {q.options && q.options.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {q.options.slice(0, 2).map((opt, i) => (
                                    <div key={i} className="truncate">• {opt}</div>
                                  ))}
                                  {q.options.length > 2 && (
                                    <div>... +{q.options.length - 2} more</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question Editor Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
              if (!open) cancelQuestionEdit()
            }}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion && questions.find(q => q.id === editingQuestion.id)
                      ? `${language === "km" ? "កែសម្រួលសំណួរ" : "Edit Question"} ${questions.findIndex(q => q.id === editingQuestion.id) + 1}`
                      : language === "km" ? "បន្ថែមសំណួរថ្មី" : "Add New Question"}
                  </DialogTitle>
                </DialogHeader>

                {editingQuestion && (
                  <QuestionEditor
                    question={editingQuestion}
                    onUpdate={updateEditingQuestion}
                    language={language}
                  />
                )}

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={cancelQuestionEdit}>
                    {language === "km" ? "បោះបង់" : "Cancel"}
                  </Button>
                  <Button onClick={saveQuestion} disabled={!editingQuestion?.question?.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingQuestion && questions.find(q => q.id === editingQuestion.id)
                      ? language === "km" ? "ធ្វើបច្ចុប្បន្នភាព" : "Update Question"
                      : language === "km" ? "បន្ថែមសំណួរ" : "Add Question"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
    </div>
  )
}
