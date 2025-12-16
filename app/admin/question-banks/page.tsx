"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Database, Trash2, Edit, Share2 } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import { cambodianSubjects, gradelevels } from "@/lib/i18n"
import type { QuestionBank } from "@/lib/quiz-types"
import Link from "next/link"

export default function QuestionBanksPage() {
  const { user, isAdmin, isTeacher } = useAuth()
  const { language } = useI18n()
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<QuestionBank | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameKm: "",
    subject: "",
    gradeLevel: "",
  })

  useEffect(() => {
    if (isAdmin || isTeacher) {
      loadBanks()
    }
  }, [isAdmin, isTeacher])

  const loadBanks = () => {
    const allBanks = quizStorage.getQuestionBanks()
    // Filter banks created by user or shared with user
    const filtered = allBanks.filter((b) => b.createdBy === user?.id || b.sharedWith.includes(user?.id || ""))
    setBanks(filtered)
  }

  const handleSubmit = () => {
    if (editingBank) {
      quizStorage.updateQuestionBank(editingBank.id, formData)
    } else {
      const newBank: QuestionBank = {
        id: `bank-${Date.now()}`,
        ...formData,
        questions: [],
        createdBy: user?.id || "",
        sharedWith: [],
        createdAt: new Date().toISOString(),
      }
      quizStorage.addQuestionBank(newBank)
    }

    loadBanks()
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm(language === "km" ? "តើអ្នកប្រាកដទេ?" : "Are you sure?")) {
      quizStorage.deleteQuestionBank(id)
      loadBanks()
    }
  }

  const resetForm = () => {
    setFormData({ name: "", nameKm: "", subject: "", gradeLevel: "" })
    setEditingBank(null)
  }

  const handleEdit = (bank: QuestionBank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      nameKm: bank.nameKm || "",
      subject: bank.subject,
      gradeLevel: bank.gradeLevel,
    })
    setIsOpen(true)
  }

  if (!isAdmin && !isTeacher) {
    return <div>{language === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើ" : "Access denied"}</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{language === "km" ? "ធនាគារសំណួរ" : "Question Banks"}</h1>
              <p className="text-muted-foreground">
                {language === "km" ? "គ្រប់គ្រងបណ្តុំសំណួរដើម្បីប្រើឡើងវិញ" : "Manage reusable question pools"}
              </p>
            </div>

            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "km" ? "បង្កើតធនាគារ" : "Create Bank"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBank
                      ? language === "km"
                        ? "កែសម្រួលធនាគារសំណួរ"
                        : "Edit Question Bank"
                      : language === "km"
                        ? "បង្កើតធនាគារសំណួរ"
                        : "Create Question Bank"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === "km" ? "ឈ្មោះ (English)" : "Name (English)"}</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Grade 9 Math"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === "km" ? "ឈ្មោះ (ខ្មែរ)" : "Name (Khmer)"}</Label>
                      <Input
                        value={formData.nameKm}
                        onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                        placeholder="គណិតវិទ្យាថ្នាក់ទី៩"
                        className="font-khmer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === "km" ? "មុខវិជ្ជា" : "Subject"}</Label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "km" ? "ជ្រើសរើសមុខវិជ្ជា" : "Select subject"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cambodianSubjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {language === "km" ? subject.nameKm : subject.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === "km" ? "កម្រិតថ្នាក់" : "Grade Level"}</Label>
                    <Select
                      value={formData.gradeLevel}
                      onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "km" ? "ជ្រើសរើសកម្រិតថ្នាក់" : "Select grade level"} />
                      </SelectTrigger>
                      <SelectContent>
                        {gradelevels.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {language === "km" ? grade.nameKm : grade.nameEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    {editingBank
                      ? language === "km"
                        ? "រក្សាទុក"
                        : "Save Changes"
                      : language === "km"
                        ? "បង្កើតធនាគារ"
                        : "Create Bank"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.map((bank) => {
              const subject = cambodianSubjects.find((s) => s.id === bank.subject)
              const grade = gradelevels.find((g) => g.id === bank.gradeLevel)

              return (
                <Card key={bank.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Database className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {language === "km" && bank.nameKm ? bank.nameKm : bank.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {bank.questions.length} {language === "km" ? "សំណួរ" : "questions"}
                          </p>
                        </div>
                      </div>

                      {bank.createdBy === user?.id && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(bank)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(bank.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">{language === "km" ? "មុខវិជ្ជា:" : "Subject:"}</span>{" "}
                        {subject && (language === "km" ? subject.nameKm : subject.nameEn)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{language === "km" ? "ថ្នាក់:" : "Grade:"}</span>{" "}
                        {grade && (language === "km" ? grade.nameKm : grade.nameEn)}
                      </p>
                      {bank.sharedWith.length > 0 && (
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Share2 className="h-3 w-3" />
                          {language === "km" ? "ចែករំលែក" : "Shared"}
                        </p>
                      )}
                    </div>

                    <Link href={`/admin/question-banks/${bank.id}/edit`}>
                      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                        {language === "km" ? "គ្រប់គ្រងសំណួរ" : "Manage Questions"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {banks.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "km" ? "មិនទាន់មានធនាគារសំណួរ" : "No question banks yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
