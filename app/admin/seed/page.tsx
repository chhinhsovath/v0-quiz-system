"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { NavHeader } from "@/components/nav-header"
import { BackButton } from "@/components/back-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { seedDemoData, clearAllData, reseedData } from "@/lib/seed-utils"
import { Database, Trash2, RefreshCw, CheckCircle, XCircle, Info } from "lucide-react"

export default function SeedDataPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [result, setResult] = useState<{
    success: boolean
    message: string
    categoriesAdded?: number
    quizzesAdded?: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
    }
  }, [isAdmin, router])

  if (!isAdmin) {
    return null
  }

  const handleSeedData = async () => {
    setIsLoading(true)
    setResult(null)
    setTimeout(() => {
      const seedResult = seedDemoData()
      setResult(seedResult)
      setIsLoading(false)
    }, 500)
  }

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear ALL quiz data? This action cannot be undone.")) {
      return
    }
    setIsLoading(true)
    setResult(null)
    setTimeout(() => {
      const clearResult = clearAllData()
      setResult(clearResult)
      setIsLoading(false)
    }, 500)
  }

  const handleReseedData = async () => {
    if (!confirm("This will clear all existing data and reseed. Are you sure?")) {
      return
    }
    setIsLoading(true)
    setResult(null)
    setTimeout(() => {
      const reseedResult = reseedData()
      setResult(reseedResult)
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <BackButton href="/admin/quizzes" />
            <h1 className="text-3xl font-bold mb-2 mt-4">Seed Demo Data</h1>
            <p className="text-muted-foreground">
              Manage demo quiz data for testing and demonstration purposes
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Demo Data Information</AlertTitle>
            <AlertDescription>
              This tool will seed demo quizzes for Grade 3 and 4 in both Khmer and Math subjects. Each quiz contains
              various question types including multiple choice, multiple select, true/false, short answer, fill in the
              blanks, matching, ordering, drag & drop, and essay questions.
            </AlertDescription>
          </Alert>

          {/* Demo Data Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Demo Data Contents</CardTitle>
              <CardDescription>What will be seeded into the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Categories (3):</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Khmer Language / អក្សរសាស្ត្រខ្មែរ</li>
                  <li>Mathematics / គណិតវិទ្យា</li>
                  <li>Science / វិទ្យាសាស្ត្រ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Quizzes (4):</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Grade 3 - Khmer Reading Comprehension (5 questions)</li>
                  <li>Grade 3 - Basic Addition and Subtraction (5 questions)</li>
                  <li>Grade 4 - Khmer Grammar and Composition (5 questions)</li>
                  <li>Grade 4 - Multiplication, Division, and Fractions (5 questions)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Question Types Included:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Multiple Choice</li>
                  <li>Multiple Select</li>
                  <li>True/False</li>
                  <li>Short Answer</li>
                  <li>Fill in the Blanks</li>
                  <li>Matching</li>
                  <li>Ordering/Sequence</li>
                  <li>Drag & Drop</li>
                  <li>Essay</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Seed, clear, or reseed demo data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSeedData} disabled={isLoading} className="w-full" size="lg">
                <Database className="h-4 w-4 mr-2" />
                {isLoading ? "Seeding..." : "Seed Demo Data"}
              </Button>
              <p className="text-sm text-muted-foreground px-1">
                Adds demo data without removing existing quizzes. Safe to run multiple times.
              </p>

              <Button
                onClick={handleReseedData}
                disabled={isLoading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isLoading ? "Reseeding..." : "Clear & Reseed All Data"}
              </Button>
              <p className="text-sm text-muted-foreground px-1">
                Removes all existing data and adds fresh demo data. Use this for a clean start.
              </p>

              <Button
                onClick={handleClearData}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isLoading ? "Clearing..." : "Clear All Data"}
              </Button>
              <p className="text-sm text-muted-foreground px-1">
                Removes all quiz data from the system. This action cannot be undone!
              </p>
            </CardContent>
          </Card>

          {/* Result Alert */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.categoriesAdded !== undefined && (
                  <div className="mt-2 space-y-1">
                    <p>Categories added: {result.categoriesAdded}</p>
                    <p>Quizzes added: {result.quizzesAdded}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => router.push("/admin/categories")}>
              View Categories
            </Button>
            <Button onClick={() => router.push("/admin/quizzes")}>View Quizzes</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
