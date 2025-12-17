"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { quizStorage } from "@/lib/quiz-storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  details?: string
}

export default function TestSupabasePage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const updateResult = (name: string, status: 'success' | 'error', message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name)
      if (existing) {
        return prev.map(r => r.name === name ? { name, status, message, details } : r)
      }
      return [...prev, { name, status, message, details }]
    })
  }

  const runTests = async () => {
    setTesting(true)
    setResults([])

    // Test 1: Supabase Client Initialization
    updateResult('client', 'pending', 'Checking Supabase client...')
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (url) {
        updateResult('client', 'success', 'Supabase client initialized', `Connected to: ${url}`)
      } else {
        updateResult('client', 'error', 'Missing Supabase URL')
      }
    } catch (error: any) {
      updateResult('client', 'error', 'Client initialization failed', error.message)
    }

    // Test 2: Database Connection
    updateResult('connection', 'pending', 'Testing database connection...')
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1)
      if (error) throw error
      updateResult('connection', 'success', 'Database connection successful')
    } catch (error: any) {
      updateResult('connection', 'error', 'Connection failed', error.message)
    }

    // Test 3: Check all tables exist
    updateResult('tables', 'pending', 'Checking database tables...')
    try {
      const tables = ['users', 'categories', 'schools', 'classes', 'quizzes', 'quiz_attempts', 'question_banks', 'certificates']
      const tableChecks = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabase.from(table).select('*').limit(1)
          return { table, exists: !error }
        })
      )

      const allExist = tableChecks.every(t => t.exists)
      const missing = tableChecks.filter(t => !t.exists).map(t => t.table)

      if (allExist) {
        updateResult('tables', 'success', `All 8 tables found`, tableChecks.map(t => t.table).join(', '))
      } else {
        updateResult('tables', 'error', `Missing tables: ${missing.join(', ')}`)
      }
    } catch (error: any) {
      updateResult('tables', 'error', 'Table check failed', error.message)
    }

    // Test 4: Check demo users
    updateResult('users', 'pending', 'Checking demo users...')
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('email, role')

      if (error) throw error

      const expectedUsers = ['admin@quiz.com', 'teacher@quiz.com', 'student@quiz.com', 'parent@quiz.com']
      const foundEmails = users?.map(u => u.email) || []
      const allFound = expectedUsers.every(email => foundEmails.includes(email))

      if (allFound && users) {
        updateResult('users', 'success', `Found ${users.length} demo users`, users.map(u => `${u.email} (${u.role})`).join(', '))
      } else {
        updateResult('users', 'error', 'Some demo users missing', `Found: ${foundEmails.join(', ')}`)
      }
    } catch (error: any) {
      updateResult('users', 'error', 'User check failed', error.message)
    }

    // Test 5: Test Categories CRUD
    updateResult('categories', 'pending', 'Testing categories CRUD...')
    try {
      const testId = crypto.randomUUID()

      // Create
      await quizStorage.addCategory({
        id: testId,
        name: 'Test Category',
        nameKm: 'ប្រភេទសាកល្បង',
        description: 'Test',
        descriptionKm: 'សាកល្បង',
        icon: '📚'
      })

      // Read
      const categories = await quizStorage.getCategories()
      const found = categories.find(c => c.id === testId)

      if (!found) throw new Error('Created category not found')

      // Update
      await quizStorage.updateCategory(testId, { description: 'Updated' })

      // Delete
      await quizStorage.deleteCategory(testId)

      updateResult('categories', 'success', 'Categories CRUD working', 'Create, Read, Update, Delete all successful')
    } catch (error: any) {
      updateResult('categories', 'error', 'Categories CRUD failed', error.message)
    }

    // Test 6: Test Quizzes
    updateResult('quizzes', 'pending', 'Testing quizzes...')
    try {
      const quizzes = await quizStorage.getQuizzes()
      updateResult('quizzes', 'success', `Quiz storage working`, `Retrieved ${quizzes.length} quizzes`)
    } catch (error: any) {
      updateResult('quizzes', 'error', 'Quiz retrieval failed', error.message)
    }

    // Test 7: Test Schools
    updateResult('schools', 'pending', 'Testing schools...')
    try {
      const schools = await quizStorage.getSchools()
      updateResult('schools', 'success', `School storage working`, `Retrieved ${schools.length} schools`)
    } catch (error: any) {
      updateResult('schools', 'error', 'School retrieval failed', error.message)
    }

    setTesting(false)
  }

  const allPassed = results.length > 0 && results.every(r => r.status === 'success')
  const anyFailed = results.some(r => r.status === 'error')

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Database className="h-10 w-10" />
            Supabase Integration Test
          </h1>
          <p className="text-muted-foreground">
            Verify that your quiz system is connected to Supabase database
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Suite</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runTests}
              disabled={testing}
              size="lg"
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className={
                result.status === 'success' ? 'border-green-500' :
                result.status === 'error' ? 'border-red-500' :
                'border-yellow-500'
              }>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                      {result.status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
                      {result.status === 'pending' && <Loader2 className="h-6 w-6 text-yellow-500 animate-spin" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">
                        {result.name.charAt(0).toUpperCase() + result.name.slice(1)} Test
                      </h3>
                      <p className={
                        result.status === 'success' ? 'text-green-700' :
                        result.status === 'error' ? 'text-red-700' :
                        'text-yellow-700'
                      }>
                        {result.message}
                      </p>
                      {result.details && (
                        <p className="text-sm text-muted-foreground mt-2 font-mono bg-muted p-2 rounded">
                          {result.details}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!testing && (
              <Card className={
                allPassed ? 'border-green-500 bg-green-50' :
                anyFailed ? 'border-red-500 bg-red-50' :
                'border-gray-500'
              }>
                <CardContent className="p-8 text-center">
                  {allPassed ? (
                    <>
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-green-800 mb-2">
                        🎉 All Tests Passed!
                      </h2>
                      <p className="text-green-700">
                        Your Supabase integration is working perfectly. All data is now stored in the cloud!
                      </p>
                    </>
                  ) : anyFailed ? (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-red-800 mb-2">
                        ❌ Some Tests Failed
                      </h2>
                      <p className="text-red-700 mb-4">
                        Please check the error messages above and ensure you've run the schema.sql in Supabase.
                      </p>
                      <div className="text-left bg-white p-4 rounded border border-red-200">
                        <p className="font-semibold mb-2">Troubleshooting:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                          <li>Go to https://ywiuptsshhuazbqsabvp.supabase.co</li>
                          <li>Click SQL Editor → New Query</li>
                          <li>Copy all contents from supabase/schema.sql</li>
                          <li>Paste and click Run</li>
                          <li>Refresh this page and run tests again</li>
                        </ol>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
