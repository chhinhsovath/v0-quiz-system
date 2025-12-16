"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { language, setLanguage, t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)

    if (!success) {
      setError(language === "km" ? "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ" : "Invalid credentials. Try the demo accounts below.")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{language === "km" ? "ចូលប្រព័ន្ធតេស្ត" : "Quiz System Login"}</CardTitle>
            <CardDescription>
              {language === "km" ? "បញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់របស់អ្នក" : "Enter your credentials to access the quiz system"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLanguage(language === "km" ? "en" : "km")}>
            <Globe className="h-4 w-4 mr-1" />
            {language === "km" ? "EN" : "ខ្មែរ"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{language === "km" ? "អ៊ីមែល" : "Email"}</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@quiz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{language === "km" ? "ពាក្យសម្ងាត់" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              placeholder={language === "km" ? "បញ្ចូលពាក្យសម្ងាត់" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            {t.login}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">{language === "km" ? "គណនីសាកល្បង:" : "Demo accounts:"}</p>
            <p>{t.admin}: admin@quiz.com</p>
            <p>{t.teacher}: teacher@quiz.com</p>
            <p>{t.student}: student@quiz.com</p>
            <p>{t.parent}: parent@quiz.com</p>
            <p className="text-xs mt-2">{language === "km" ? "(ពាក្យសម្ងាត់អ្វីក៏បាន)" : "(Any password works)"}</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
