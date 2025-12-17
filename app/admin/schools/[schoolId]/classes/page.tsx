"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { useParams } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Trash2, Edit } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import { gradelevels } from "@/lib/i18n"
import type { Class, School, User } from "@/lib/quiz-types"
import Link from "next/link"

export default function ClassesPage() {
  const params = useParams()
  const schoolId = params.schoolId as string
  const { user, isAdmin, isTeacher } = useAuth()
  const { language } = useI18n()
  const [school, setSchool] = useState<School | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameKm: "",
    gradeLevel: "",
    teacherId: "",
  })

  useEffect(() => {
    loadData()
  }, [schoolId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [schools, classesData, teachersData] = await Promise.all([
        quizStorage.getSchools(),
        quizStorage.getClassesBySchool(schoolId),
        quizStorage.getUsersByRole("teacher")
      ])

      const schoolData = schools.find((s) => s.id === schoolId)
      setSchool(schoolData || null)
      setClasses(classesData)
      setTeachers(teachersData.filter((t) => !t.schoolId || t.schoolId === schoolId))
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingClass) {
        await quizStorage.updateClass(editingClass.id, formData)
      } else {
        const newClass: Class = {
          id: `class-${Date.now()}`,
          schoolId,
          ...formData,
          studentIds: [],
          createdAt: new Date().toISOString(),
        }
        await quizStorage.addClass(newClass)
      }

      await loadData()
      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving class:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(language === "km" ? "តើអ្នកប្រាកដទេ?" : "Are you sure?")) {
      try {
        await quizStorage.deleteClass(id)
        await loadData()
      } catch (error) {
        console.error('Error deleting class:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", nameKm: "", gradeLevel: "", teacherId: user?.id || "" })
    setEditingClass(null)
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      nameKm: classItem.nameKm || "",
      gradeLevel: classItem.gradeLevel,
      teacherId: classItem.teacherId,
    })
    setIsOpen(true)
  }

  if (!school) {
    return <div>{language === "km" ? "រកមិនឃើញសាលា" : "School not found"}</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <BackButton
              href="/admin/schools"
              label={language === "km" ? "ត្រឡប់ទៅសាលា" : "Back to Schools"}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {language === "km" && school.nameKm ? school.nameKm : school.name}
                </h1>
                <p className="text-muted-foreground">{language === "km" ? "ថ្នាក់ទាំងអស់" : "All Classes"}</p>
              </div>

              {(isAdmin || isTeacher) && (
                <Dialog
                  open={isOpen}
                  onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) resetForm()
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === "km" ? "បន្ថែមថ្នាក់" : "Add Class"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingClass
                          ? language === "km"
                            ? "កែសម្រួលថ្នាក់"
                            : "Edit Class"
                          : language === "km"
                            ? "បន្ថែមថ្នាក់"
                            : "Add Class"}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{language === "km" ? "ឈ្មោះថ្នាក់ (English)" : "Class Name (English)"}</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Class A"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>{language === "km" ? "ឈ្មោះថ្នាក់ (ខ្មែរ)" : "Class Name (Khmer)"}</Label>
                          <Input
                            value={formData.nameKm}
                            onChange={(e) => setFormData({ ...formData, nameKm: e.target.value })}
                            placeholder="ថ្នាក់ក"
                            className="font-khmer"
                          />
                        </div>
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

                      {isAdmin && (
                        <div className="space-y-2">
                          <Label>{language === "km" ? "គ្រូបង្រៀន" : "Teacher"}</Label>
                          <Select
                            value={formData.teacherId}
                            onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={language === "km" ? "ជ្រើសរើសគ្រូ" : "Select teacher"} />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {language === "km" && teacher.nameKm ? teacher.nameKm : teacher.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button onClick={handleSubmit} className="w-full">
                        {editingClass
                          ? language === "km"
                            ? "រក្សាទុក"
                            : "Save Changes"
                          : language === "km"
                            ? "បន្ថែមថ្នាក់"
                            : "Add Class"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{language === "km" ? "មិនទាន់មានថ្នាក់" : "No classes yet"}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => {
              const teacher = teachers.find((t) => t.id === classItem.teacherId)
              const gradeLevel = gradelevels.find((g) => g.id === classItem.gradeLevel)

              return (
                <Card key={classItem.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {language === "km" && classItem.nameKm ? classItem.nameKm : classItem.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {gradeLevel && (language === "km" ? gradeLevel.nameKm : gradeLevel.nameEn)}
                          </p>
                        </div>
                      </div>

                      {(isAdmin || (isTeacher && user?.id === classItem.teacherId)) && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(classItem)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(classItem.id)} className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">{language === "km" ? "គ្រូបង្រៀន:" : "Teacher:"}</span>{" "}
                        {teacher && (language === "km" && teacher.nameKm ? teacher.nameKm : teacher?.name)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{language === "km" ? "សិស្ស:" : "Students:"}</span>{" "}
                        {classItem.studentIds.length}
                      </p>
                    </div>

                    <Link href={`/admin/schools/${schoolId}/classes/${classItem.id}/students`}>
                      <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                        {language === "km" ? "គ្រប់គ្រងសិស្ស" : "Manage Students"}
                      </Button>
                    </Link>
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
