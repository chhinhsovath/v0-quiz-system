"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useI18n } from "@/lib/i18n-context"
import { NavHeader } from "@/components/nav-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Award, Download, Printer } from "lucide-react"
import { certificateGenerator } from "@/lib/certificate-generator"

export default function CertificatePage() {
  const params = useParams()
  const certificateId = params.id as string
  const { language } = useI18n()
  const [certificateData, setCertificateData] =
    useState<ReturnType<typeof certificateGenerator.getCertificateData>>(null)

  useEffect(() => {
    const data = certificateGenerator.getCertificateData(certificateId)
    setCertificateData(data)
  }, [certificateId])

  const handlePrint = () => {
    window.print()
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{language === "km" ? "រកមិនឃើញវិញ្ញាបនប័ត្រ" : "Certificate not found"}</p>
      </div>
    )
  }

  const { certificate, quiz, user } = certificateData

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-end gap-2 mb-6 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
              <Printer className="h-4 w-4 mr-2" />
              {language === "km" ? "បោះពុម្ព" : "Print"}
            </Button>
            <Button onClick={handlePrint} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {language === "km" ? "ទាញយក" : "Download"}
            </Button>
          </div>

          <Card className="p-6 sm:p-8 md:p-12 border-4 border-primary/20">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  {language === "km" ? "វិញ្ញាបនប័ត្រនៃការសម្រេច" : "Certificate of Achievement"}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "km" ? "នេះគឺដើម្បីបញ្ជាក់ថា" : "This is to certify that"}
                </p>
              </div>

              <div className="py-4 sm:py-6 border-y">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{language === "km" && user?.nameKm ? user.nameKm : user?.name}</h2>
              </div>

              <div className="space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground">
                  {language === "km" ? "បានបញ្ចប់ដោយជោគជ័យ" : "has successfully completed"}
                </p>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold break-words px-4">
                  {language === "km" && quiz?.titleKm ? quiz.titleKm : quiz?.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 py-4 sm:py-6">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{language === "km" ? "ពិន្ទុ" : "Score"}</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {certificate.score}/{quiz?.questions.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{language === "km" ? "ភាគរយ" : "Percentage"}</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">{certificate.percentage.toFixed(1)}%</p>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-muted-foreground">
                <p>
                  {language === "km" ? "បានចេញនៅថ្ងៃទី:" : "Issued on:"}{" "}
                  {new Date(certificate.issuedAt).toLocaleDateString(language === "km" ? "km-KH" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-2 break-all">
                  {language === "km" ? "លេខវិញ្ញាបនប័ត្រ:" : "Certificate ID:"} {certificate.id}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
