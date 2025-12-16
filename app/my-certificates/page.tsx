"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Eye } from "lucide-react"
import { quizStorage } from "@/lib/quiz-storage"
import type { Certificate } from "@/lib/quiz-types"
import Link from "next/link"

export default function MyCertificatesPage() {
  const { user } = useAuth()
  const { language } = useI18n()
  const [certificates, setCertificates] = useState<Certificate[]>([])

  useEffect(() => {
    if (user) {
      const userCerts = quizStorage.getUserCertificates(user.id)
      setCertificates(userCerts)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{language === "km" ? "វិញ្ញាបនប័ត្ររបស់ខ្ញុំ" : "My Certificates"}</h1>
            <p className="text-muted-foreground">
              {language === "km" ? "វិញ្ញាបនប័ត្រដែលអ្នកទទួលបាន" : "Certificates you've earned"}
            </p>
          </div>

          {certificates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert) => {
                const quiz = quizStorage.getQuizById(cert.quizId)

                return (
                  <Card key={cert.id} className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {language === "km" && quiz?.titleKm ? quiz.titleKm : quiz?.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {new Date(cert.issuedAt).toLocaleDateString(language === "km" ? "km-KH" : "en-US")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{language === "km" ? "ពិន្ទុ:" : "Score:"}</span>
                        <span className="font-bold">
                          {cert.score} ({cert.percentage.toFixed(1)}%)
                        </span>
                      </div>

                      <Link href={`/certificates/${cert.id}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          {language === "km" ? "មើលវិញ្ញាបនប័ត្រ" : "View Certificate"}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === "km"
                    ? "អ្នកមិនទាន់មានវិញ្ញាបនប័ត្រទេ។ បញ្ចប់តេស្តដើម្បីទទួលបានវិញ្ញាបនប័ត្រ!"
                    : "You don't have any certificates yet. Complete quizzes to earn certificates!"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
