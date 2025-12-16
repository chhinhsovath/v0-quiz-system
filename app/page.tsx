"use client"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { LoginForm } from "@/components/login-form"
import { NavHeader } from "@/components/nav-header"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ClipboardList, BarChart3, Building2, Database, Award, Users, WifiOff, FileText } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { user, isAdmin, isTeacher, isParent } = useAuth()
  const { language } = useI18n()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <LoginForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === "km" ? "សូមស្វាគមន៍" : "Welcome back"},{" "}
              {language === "km" && user.nameKm ? user.nameKm : user.name}
            </h2>
            <p className="text-muted-foreground">
              {isAdmin || isTeacher
                ? language === "km"
                  ? "គ្រប់គ្រងតេស្ត ប្រភេទ និងមើលវឌ្ឍនភាពសិស្ស"
                  : "Manage quizzes, categories, and track student progress"
                : language === "km"
                  ? "រកមើលតេស្តដែលមាន និងតាមដានវឌ្ឍនភាពរបស់អ្នក"
                  : "Browse available quizzes and track your progress"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAdmin ? (
              <>
                <Link href="/admin/schools">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardTitle>{language === "km" ? "សាលារៀន" : "Schools"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "គ្រប់គ្រងសាលា និងថ្នាក់រៀន" : "Manage schools and classes"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/categories">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-purple-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ប្រភេទ" : "Categories"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "តម្រៀបតេស្តតាមប្រធានបទ" : "Organize quizzes by subject"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/quizzes">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-green-500" />
                        </div>
                        <CardTitle>{language === "km" ? "តេស្ត" : "Quizzes"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "បង្កើត និងគ្រប់គ្រងមាតិកាតេស្ត" : "Create and manage quiz content"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/question-banks">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Database className="h-5 w-5 text-purple-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ធនាគារសំណួរ" : "Question Banks"}</CardTitle>
                      </div>
                      <CardDescription>{language === "km" ? "គ្រប់គ្រងបណ្តុំសំណួរ" : "Manage question pools"}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/analytics">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-orange-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ការវិភាគ" : "Analytics"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "របាយការណ៍លម្អិត និងស្ថិតិ" : "Detailed reports and statistics"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/results">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-red-500" />
                        </div>
                        <CardTitle>{language === "km" ? "លទ្ធផល" : "Results"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "មើលការប្រឡង និងពិន្ទុសិស្ស" : "View student attempts and scores"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/reports">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-indigo-500" />
                        </div>
                        <CardTitle>{language === "km" ? "របាយការណ៍" : "Reports"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "នាំចេញរបាយការណ៍" : "Export comprehensive reports"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            ) : isTeacher ? (
              <>
                <Link href="/admin/schools">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ថ្នាក់របស់ខ្ញុំ" : "My Classes"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "គ្រប់គ្រងថ្នាក់ និងសិស្ស" : "Manage classes and students"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/quizzes">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <ClipboardList className="h-5 w-5 text-green-500" />
                        </div>
                        <CardTitle>{language === "km" ? "តេស្ត" : "Quizzes"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "បង្កើត និងគ្រប់គ្រងតេស្ត" : "Create and manage quizzes"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/question-banks">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Database className="h-5 w-5 text-purple-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ធនាគារសំណួរ" : "Question Banks"}</CardTitle>
                      </div>
                      <CardDescription>{language === "km" ? "គ្រប់គ្រងបណ្តុំសំណួរ" : "Manage question pools"}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/analytics">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-orange-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ការវិភាគ" : "Analytics"}</CardTitle>
                      </div>
                      <CardDescription>{language === "km" ? "វឌ្ឍនភាពថ្នាក់" : "Class performance"}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/results">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-red-500" />
                        </div>
                        <CardTitle>{language === "km" ? "លទ្ធផល" : "Results"}</CardTitle>
                      </div>
                      <CardDescription>{language === "km" ? "មើលលទ្ធផលសិស្ស" : "View student results"}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/admin/reports">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-indigo-500" />
                        </div>
                        <CardTitle>{language === "km" ? "របាយការណ៍" : "Reports"}</CardTitle>
                      </div>
                      <CardDescription>{language === "km" ? "នាំចេញរបាយការណ៍" : "Export reports"}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            ) : isParent ? (
              <>
                <Link href="/parent/children">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardTitle>{language === "km" ? "កូនរបស់ខ្ញុំ" : "My Children"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "មើលវឌ្ឍនភាពកូន" : "View children's progress"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/parent/results">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-green-500" />
                        </div>
                        <CardTitle>{language === "km" ? "លទ្ធផល" : "Results"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "លទ្ធផលតេស្ត និងពិន្ទុ" : "Quiz results and scores"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            ) : (
              <>
                <Link href="/quizzes">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <CardTitle>{language === "km" ? "តេស្តដែលមាន" : "Available Quizzes"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "រកមើល និងធ្វើតេស្ត" : "Browse and take quizzes"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/my-results">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-green-500" />
                        </div>
                        <CardTitle>{language === "km" ? "លទ្ធផលរបស់ខ្ញុំ" : "My Results"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "មើលការប្រឡង និងពិន្ទុរបស់អ្នក" : "View your quiz attempts and scores"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/my-certificates">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Award className="h-5 w-5 text-purple-500" />
                        </div>
                        <CardTitle>{language === "km" ? "វិញ្ញាបនប័ត្រ" : "Certificates"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "មើលវិញ្ញាបនប័ត្ររបស់អ្នក" : "View your earned certificates"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                <Link href="/offline">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <WifiOff className="h-5 w-5 text-cyan-500" />
                        </div>
                        <CardTitle>{language === "km" ? "ម៉ូដក្រៅបណ្តាញ" : "Offline Mode"}</CardTitle>
                      </div>
                      <CardDescription>
                        {language === "km" ? "ទាញយកតេស្តសម្រាប់ប្រើក្រៅបណ្តាញ" : "Download quizzes for offline use"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
