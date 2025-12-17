"use client"

import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const { language } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            {language === "km" ? "ការចុះឈ្មោះ" : "Registration"}
          </CardTitle>
          <CardDescription className="text-center">
            {language === "km"
              ? "មុខងារនេះនឹងមានក្នុងពេលឆាប់ៗនេះ"
              : "This feature will be available soon"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              {language === "km"
                ? "សម្រាប់ការចុះឈ្មោះនៅពេលនេះ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ"
                : "For registration, please contact the system administrator"}
            </p>
            <p className="font-medium">
              {language === "km" ? "ឬប្រើគណនីសាកល្បងដើម្បីចូលប្រើប្រាស់" : "Or use demo accounts to access the system"}
            </p>
          </div>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              {language === "km" ? "ត្រឡប់ទៅទំព័រចូល" : "Back to Login"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
