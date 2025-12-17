"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, WifiOff, CheckCircle2, XCircle } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import { offlineManager } from "@/lib/offline-sync"
import type { Quiz } from "@/lib/quiz-types"
import Link from "next/link"

export default function OfflinePage() {
  const { user } = useAuth()
  const { language } = useI18n()
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([])
  const [downloadedQuizzes, setDownloadedQuizzes] = useState<Quiz[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize offline support
    offlineManager.initOfflineSupport()

    // Load available and downloaded quizzes
    loadQuizzes()

    // Set online status
    setIsOnline(offlineManager.isOnline())

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      offlineManager.processSyncQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      const allQuizzes = await quizStorage.getQuizzes()
      setAvailableQuizzes(allQuizzes)

      const offline = offlineManager.getOfflineQuizzes()
      setDownloadedQuizzes(offline)
    } catch (error) {
      console.error('Error loading quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (quizId: string) => {
    const success = offlineManager.downloadQuizForOffline(quizId)
    if (success) {
      loadQuizzes()
    }
  }

  const handleRemove = (quizId: string) => {
    const offline = offlineManager.getOfflineQuizzes()
    const filtered = offline.filter((q: Quiz) => q.id !== quizId)
    localStorage.setItem("offline_quizzes", JSON.stringify(filtered))
    loadQuizzes()
  }

  const isDownloaded = (quizId: string) => {
    return downloadedQuizzes.some((q) => q.id === quizId)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{language === "km" ? "ម៉ូដក្រៅបណ្តាញ" : "Offline Mode"}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "km" ? "ទាញយកតេស្តដើម្បីប្រើក្រៅបណ្តាញ" : "Download quizzes to take them without internet"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {language === "km" ? "មានបណ្តាញ" : "Online"}
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {language === "km" ? "គ្មានបណ្តាញ" : "Offline"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Downloaded Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <WifiOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  {language === "km" ? "តេស្តដែលបានទាញយក" : "Downloaded Quizzes"}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {language === "km" ? "តេស្តទាំងនេះអាចប្រើបានក្រៅបណ្តាញ" : "These quizzes are available offline"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : downloadedQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {downloadedQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-muted/30 gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {language === "km" && quiz.titleKm ? quiz.titleKm : quiz.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {quiz.questions.length} {language === "km" ? "សំណួរ" : "questions"} • {quiz.timeLimit}{" "}
                            {language === "km" ? "នាទី" : "minutes"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/quizzes/${quiz.id}`} className="flex-1 sm:flex-initial">
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              {language === "km" ? "ចាប់ផ្តើម" : "Start"}
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" onClick={() => handleRemove(quiz.id)} className="flex-shrink-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{language === "km" ? "មិនទាន់បានទាញយកតេស្តទេ" : "No quizzes downloaded yet"}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{language === "km" ? "តេស្តដែលមាន" : "Available Quizzes"}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {language === "km" ? "ទាញយកតេស្តដើម្បីប្រើក្រៅបណ្តាញ" : "Download quizzes for offline use"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {availableQuizzes.map((quiz) => {
                    const downloaded = isDownloaded(quiz.id)

                    return (
                      <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {language === "km" && quiz.titleKm ? quiz.titleKm : quiz.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {quiz.questions.length} {language === "km" ? "សំណួរ" : "questions"}
                            {quiz.timeLimit > 0 && ` • ${quiz.timeLimit} ${language === "km" ? "នាទី" : "minutes"}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {downloaded ? (
                            <Badge variant="secondary" className="w-full sm:w-auto justify-center">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {language === "km" ? "បានទាញយក" : "Downloaded"}
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(quiz.id)}
                              disabled={!isOnline}
                              className="w-full sm:w-auto"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {language === "km" ? "ទាញយក" : "Download"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {availableQuizzes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{language === "km" ? "មិនមានតេស្ត" : "No quizzes available"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
