"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Users, BookOpen, Award, AlertTriangle } from "lucide-react"
import { analyticsEngine } from "@/lib/analytics"
import { quizStorage } from "@/lib/quiz-storage"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { StudentAnalytics } from "@/lib/quiz-types"

export default function AnalyticsPage() {
  const { isAdmin, isTeacher, user } = useAuth()
  const { language } = useI18n()
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null)
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClasses = async () => {
      if (isAdmin || isTeacher) {
        try {
          setLoading(true)
          const allClasses = await quizStorage.getClasses()
          const teacherClasses = isTeacher ? allClasses.filter((c) => c.teacherId === user?.id) : allClasses
          setClasses(teacherClasses.map((c) => ({ id: c.id, name: c.name })))
        } catch (error) {
          console.error('Error loading classes:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadClasses()
  }, [isAdmin, isTeacher, user])

  useEffect(() => {
    const loadStudents = async () => {
      if (selectedClass) {
        try {
          const allClasses = await quizStorage.getClasses()
          const classData = allClasses.find((c) => c.id === selectedClass)
          if (classData) {
            const studentList = await quizStorage.getUsersByRole("student")
            setStudents(studentList.filter((s) => classData.studentIds.includes(s.id)).map((s) => ({ id: s.id, name: s.name })))
          }
        } catch (error) {
          console.error('Error loading students:', error)
        }
      }
    }
    loadStudents()
  }, [selectedClass])

  useEffect(() => {
    if (selectedStudent) {
      const analytics = analyticsEngine.getStudentAnalytics(selectedStudent)
      setStudentAnalytics(analytics)
    }
  }, [selectedStudent])

  if (!isAdmin && !isTeacher) {
    return <div>{language === "km" ? "អ្នកមិនមានសិទ្ធិចូលប្រើ" : "Access denied"}</div>
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <BackButton href="/" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold">{language === "km" ? "ការវិភាគទិន្នន័យ" : "Analytics Dashboard"}</h1>
              <p className="text-muted-foreground">
                {language === "km" ? "របាយការណ៍លម្អិតអំពីការអនុវត្ត" : "Comprehensive performance reports"}
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:min-w-0">
                <TabsTrigger value="overview" className="whitespace-nowrap">{language === "km" ? "ទិដ្ឋភាពទូទៅ" : "Overview"}</TabsTrigger>
                <TabsTrigger value="students" className="whitespace-nowrap">{language === "km" ? "សិស្ស" : "Students"}</TabsTrigger>
                <TabsTrigger value="questions" className="whitespace-nowrap">{language === "km" ? "សំណួរ" : "Questions"}</TabsTrigger>
                <TabsTrigger value="comparison" className="whitespace-nowrap">{language === "km" ? "ប្រៀបធៀប" : "Comparison"}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === "km" ? "សិស្សសរុប" : "Total Students"}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : "0"}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === "km" ? "តេស្តសរុប" : "Total Quizzes"}
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : "0"}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === "km" ? "ការធ្វើតេស្ត" : "Total Attempts"}
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : "0"}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === "km" ? "ពិន្ទុមធ្យម" : "Average Score"}
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{loading ? "..." : "0"}%</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "វិភាគសិស្ស" : "Student Analytics"}</CardTitle>
                  <CardDescription>
                    {language === "km" ? "ជ្រើសរើសថ្នាក់ និងសិស្ស" : "Select class and student"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === "km" ? "ថ្នាក់" : "Class"}</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "km" ? "ជ្រើសរើសថ្នាក់" : "Select class"} />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{language === "km" ? "សិស្ស" : "Student"}</label>
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

                  {studentAnalytics && (
                    <div className="space-y-6 mt-6">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{language === "km" ? "ពិន្ទុមធ្យម" : "Average Score"}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{studentAnalytics.averageScore.toFixed(1)}%</div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{language === "km" ? "តេស្តបានបញ្ចប់" : "Completed"}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {studentAnalytics.completedQuizzes}/{studentAnalytics.totalQuizzes}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{language === "km" ? "ពេលវេលាមធ្យម" : "Avg Time"}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{Math.round(studentAnalytics.averageTime / 60)}m</div>
                          </CardContent>
                        </Card>
                      </div>

                      {studentAnalytics.progressOverTime.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              {language === "km" ? "វឌ្ឍនភាពតាមពេល" : "Progress Over Time"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={studentAnalytics.progressOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke="#3b82f6"
                                  name={language === "km" ? "ពិន្ទុ" : "Score"}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              {language === "km" ? "មុខវិជ្ជាខ្លាំង" : "Strong Subjects"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {studentAnalytics.strongSubjects.map((subject) => (
                                <li key={subject} className="text-sm">
                                  • {subject}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              {language === "km" ? "មុខវិជ្ជាខ្សោយ" : "Weak Subjects"}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {studentAnalytics.weakSubjects.map((subject) => (
                                <li key={subject} className="text-sm">
                                  • {subject}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "វិភាគសំណួរ" : "Question Analytics"}</CardTitle>
                  <CardDescription>
                    {language === "km" ? "កម្រិតលំបាក និងការបែងចែក" : "Difficulty and discrimination analysis"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    {language === "km" ? "ជ្រើសរើសតេស្តដើម្បីមើលការវិភាគសំណួរ" : "Select a quiz to view question analytics"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{language === "km" ? "ប្រៀបធៀបថ្នាក់" : "Class Comparison"}</CardTitle>
                  <CardDescription>
                    {language === "km" ? "ប្រៀបធៀបការអនុវត្តរវាងថ្នាក់" : "Compare performance across classes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    {language === "km" ? "ជ្រើសរើសថ្នាក់ដើម្បីប្រៀបធៀប" : "Select classes to compare"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
