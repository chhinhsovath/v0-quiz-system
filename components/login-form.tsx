"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, GraduationCap } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { language, setLanguage } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // For demo: map phone to email for existing auth system
    const emailMap: Record<string, string> = {
      "0123456789": "admin@quiz.com",
      "0987654321": "teacher@quiz.com",
      "0111111111": "student@quiz.com",
      "0999999999": "parent@quiz.com",
    }

    const email = emailMap[phoneNumber] || phoneNumber
    const success = await login(email, password)

    if (!success) {
      setError(
        language === "km"
          ? "លេខទូរសព្ទ ឬលេខកូដសម្ងាត់មិនត្រឹមត្រូវ"
          : "Invalid phone number or PIN. Try demo accounts below."
      )
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 relative">
      {/* Language Switcher - Fixed position outside main flow */}
      <div className="absolute -top-16 right-0 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "km" ? "en" : "km")}
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === "km" ? "EN" : "ខ្មែរ"}
        </Button>
      </div>

      {/* Header with Logos */}
      <div className="text-center space-y-6">
        {/* Logos */}
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <span className="text-xs mt-2 font-medium">MOEYS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center">
              <GraduationCap className="h-12 w-12 text-blue-500" />
            </div>
            <span className="text-xs mt-2 font-medium">PLP</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === "km" ? "ប្រព័ន្ធតាមដានវគ្គសិក្សា" : "Course Tracking System"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {language === "km" ? "ប្រព័ន្ធគ្រប់គ្រងតេស្ត និងវគ្គសិក្សា" : "Quiz and Course Management System"}
          </p>
        </div>
      </div>

      {/* Login Card */}
      <Card className="shadow-lg relative z-10">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{language === "km" ? "លេខទូរសព្ទ" : "Phone Number"}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={language === "km" ? "បញ្ចូលលេខទូរសព្ទ" : "Enter phone number"}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === "km" ? "លេខកូដសម្ងាត់ (៤ ខ្ទង់ចុងក្រោយ)" : "PIN (Last 4 digits)"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={language === "km" ? "បញ្ចូលលេខកូដសម្ងាត់" : "Enter PIN"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={4}
                required
                className="h-12"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 text-base font-medium">
              {language === "km" ? "ចូលប្រព័ន្ធ" : "Login"}
            </Button>

            {/* Registration Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {language === "km" ? "មិនមានគណនីទេ? " : "No account? "}
              </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                {language === "km" ? "ចុះឈ្មោះឥឡូវនេះ" : "Register now"}
              </Link>
            </div>

            {/* Demo Accounts */}
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p className="font-medium">{language === "km" ? "គណនីសាកល្បង:" : "Demo accounts:"}</p>
              <p>
                {language === "km" ? "អ្នកគ្រប់គ្រង" : "Admin"}: 0123456789
              </p>
              <p>
                {language === "km" ? "គ្រូបង្រៀន" : "Teacher"}: 0987654321
              </p>
              <p>
                {language === "km" ? "សិស្ស" : "Student"}: 0111111111
              </p>
              <p>
                {language === "km" ? "មាតាបិតា" : "Parent"}: 0999999999
              </p>
              <p className="text-xs mt-2 italic">
                {language === "km" ? "(លេខកូដសម្ងាត់អ្វីក៏បាន)" : "(Any PIN works)"}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>© {language === "km" ? "២០២៥" : "2025"} {language === "km" ? "ក្រសួងអប់រំ យុវជន និងកីឡា" : "Ministry of Education, Youth and Sports"}</p>
      </div>
    </div>
  )
}
