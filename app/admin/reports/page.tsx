"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Printer, FileSpreadsheet } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import { reportGenerator } from "@/lib/report-generator"
import type { Class, Quiz } from "@/lib/quiz-types"

export default function ReportsPage() {
  const { isAdmin, isTeacher, user } = useAuth()
  const { language } = useI18n()
  const [classes, setClasses] = useState<Class[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedQuiz, setSelectedQuiz] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    if (isAdmin || isTeacher) {
      const allClasses = quizStorage.getClasses()
      const teacherClasses = isTeacher ? allClasses.filter((c) => c.teacherId === user?.id) : allClasses
      setClasses(teacherClasses)

      const allQuizzes = quizStorage.getQuizzes()
      setQuizzes(allQuizzes)
    }
  }, [isAdmin, isTeacher, user])

  useEffect(() => {
    if (selectedClass) {
      const classData = classes.find((c) => c.id === selectedClass)
      if (classData) {
        const studentList = quizStorage.getUsersByRole("student").filter((s) => classData.studentIds.includes(s.id))
        setStudents(studentList.map((s) => ({ id: s.id, name: s.name })))
      }
    }
  }, [selectedClass, classes])

  const handleExportStudentCSV = () => {
    if (!selectedStudent) return

    const csv = reportGenerator.generateStudentReportCSV(selectedStudent)
    const student = students.find((s) => s.id === selectedStudent)
    reportGenerator.downloadCSV(`${student?.name}_report.csv`, csv)
  }

  const handleExportClassCSV = () => {
    if (!selectedClass) return

    const csv = reportGenerator.generateClassReportCSV(selectedClass)
    const classData = classes.find((c) => c.id === selectedClass)
    reportGenerator.downloadCSV(`${classData?.name}_report.csv`, csv)
  }

  const handleExportQuizCSV = () => {
    if (!selectedQuiz) return

    const csv = reportGenerator.generateQuizAnalyticsCSV(selectedQuiz)
    const quiz = quizzes.find((q) => q.id === selectedQuiz)
    reportGenerator.downloadCSV(`${quiz?.title}_analytics.csv`, csv)
  }

  const handlePrintStudentReport = () => {
    if (!selectedStudent) return

    const html = reportGenerator.generateStudentHTMLReport(selectedStudent)
    reportGenerator.printHTMLReport(html)
  }

  if (!isAdmin && !isTeacher) {
    return <div>{language === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើ" : "Access denied"}</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{language === "km" ? "របាយការណ៍ និងការនាំចេញ" : "Reports & Export"}</h1>
              <p className="text-muted-foreground">
                {language === "km" ? "នាំចេញរបាយការណ៍លម្អិតជា CSV ឬ PDF" : "Export comprehensive reports as CSV or PDF"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="student" className="space-y-6">
            <TabsList>
              <TabsTrigger value="student">{language === "km" ? "របាយការណ៍សិស្ស" : "Student Reports"}</TabsTrigger>
              <TabsTrigger value="class">{language === "km" ? "របាយការណ៍ថ្នាក់" : "Class Reports"}</TabsTrigger>
              <TabsTrigger value="quiz">{language === "km" ? "វិភាគតេស្ត" : "Quiz Analytics"}</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "របាយការណ៍សិស្សម្នាក់ៗ" : "Individual Student Report"}</CardTitle>
                  <CardDescription>
                    {language === "km"
                      ? "នាំចេញរបាយការណ៍លម្អិតសម្រាប់សិស្សម្នាក់"
                      : "Export detailed performance report for a student"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "km" ? "ជ្រើសរើសថ្នាក់" : "Select Class"}
                      </label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "km" ? "ជ្រើសរើសថ្នាក់" : "Select class"} />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {language === "km" && c.nameKm ? c.nameKm : c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {language === "km" ? "ជ្រើសរើសសិស្ស" : "Select Student"}
                      </label>
                      <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={!selectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "km" ? "ជ្រើសរើសសិស្ស" : "Select student"} />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleExportStudentCSV} disabled={!selectedStudent}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {language === "km" ? "នាំចេញជា CSV" : "Export CSV"}
                    </Button>
                    <Button onClick={handlePrintStudentReport} variant="outline" disabled={!selectedStudent}>
                      <Printer className="h-4 w-4 mr-2" />
                      {language === "km" ? "បោះពុម្ព / PDF" : "Print / PDF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="class" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "របាយការណ៍ថ្នាក់" : "Class Performance Report"}</CardTitle>
                  <CardDescription>
                    {language === "km" ? "នាំចេញទិន្នន័យសិស្សទាំងអស់ក្នុងថ្នាក់" : "Export data for all students in a class"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === "km" ? "ជ្រើសរើសថ្នាក់" : "Select Class"}</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "km" ? "ជ្រើសរើសថ្នាក់" : "Select class"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {language === "km" && c.nameKm ? c.nameKm : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleExportClassCSV} disabled={!selectedClass}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {language === "km" ? "នាំចេញជា CSV" : "Export CSV"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "វិភាគតេស្ត" : "Quiz Analytics Report"}</CardTitle>
                  <CardDescription>
                    {language === "km" ? "នាំចេញការវិភាគសំណួរ និងស្ថិតិ" : "Export question analysis and statistics"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{language === "km" ? "ជ្រើសរើសតេស្ត" : "Select Quiz"}</label>
                    <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "km" ? "ជ្រើសរើសតេស្ត" : "Select quiz"} />
                      </SelectTrigger>
                      <SelectContent>
                        {quizzes.map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {language === "km" && q.titleKm ? q.titleKm : q.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleExportQuizCSV} disabled={!selectedQuiz}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {language === "km" ? "នាំចេញជា CSV" : "Export CSV"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
