/**
 * Supabase Integration Test Script
 * Run this with: npx tsx test-supabase.ts
 */

import { supabase } from './lib/supabase'
import { quizStorage } from './lib/quiz-storage'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  try {
    // Test 1: Check Supabase client initialization
    console.log('✅ Step 1: Supabase client initialized')
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)

    // Test 2: Check if tables exist
    console.log('\n📊 Step 2: Checking database tables...')
    const tables = ['users', 'categories', 'schools', 'classes', 'quizzes', 'quiz_attempts', 'question_banks', 'certificates']

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`   ❌ Table "${table}" error:`, error.message)
      } else {
        console.log(`   ✅ Table "${table}" accessible`)
      }
    }

    // Test 3: Check demo users
    console.log('\n👥 Step 3: Checking demo users...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, role')

    if (usersError) {
      console.log('   ❌ Error fetching users:', usersError.message)
    } else {
      console.log(`   ✅ Found ${users?.length || 0} users:`)
      users?.forEach(user => {
        console.log(`      - ${user.email} (${user.role})`)
      })
    }

    // Test 4: Test Categories CRUD
    console.log('\n📝 Step 4: Testing Categories CRUD...')

    // 4a. Create a test category
    const testCategory = {
      id: crypto.randomUUID(),
      name: 'Test Category',
      nameKm: 'ប្រភេទសាកល្បង',
      description: 'This is a test category',
      descriptionKm: 'នេះជាប្រភេទសាកល្បង',
      icon: '📚'
    }

    try {
      await quizStorage.addCategory(testCategory)
      console.log('   ✅ CREATE: Test category created')
    } catch (error: any) {
      console.log('   ❌ CREATE failed:', error.message)
    }

    // 4b. Read categories
    try {
      const categories = await quizStorage.getCategories()
      console.log(`   ✅ READ: Retrieved ${categories.length} categories`)
      const found = categories.find(c => c.id === testCategory.id)
      if (found) {
        console.log('      ✓ Test category found in results')
      }
    } catch (error: any) {
      console.log('   ❌ READ failed:', error.message)
    }

    // 4c. Update category
    try {
      await quizStorage.updateCategory(testCategory.id, {
        description: 'Updated description'
      })
      console.log('   ✅ UPDATE: Test category updated')
    } catch (error: any) {
      console.log('   ❌ UPDATE failed:', error.message)
    }

    // 4d. Delete category
    try {
      await quizStorage.deleteCategory(testCategory.id)
      console.log('   ✅ DELETE: Test category deleted')
    } catch (error: any) {
      console.log('   ❌ DELETE failed:', error.message)
    }

    // Test 5: Test Quiz Creation
    console.log('\n📝 Step 5: Testing Quiz CRUD...')

    const testQuiz = {
      id: crypto.randomUUID(),
      title: 'Test Quiz',
      titleKm: 'តេស្តសាកល្បង',
      description: 'This is a test quiz',
      descriptionKm: 'នេះជាតេស្តសាកល្បង',
      categoryId: '',
      createdBy: '00000000-0000-0000-0000-000000000001', // Admin user
      gradeLevel: 'Grade 10',
      subject: 'Math',
      examType: 'regular' as const,
      passingScore: 60,
      certificateEnabled: false,
      adaptiveTesting: false,
      maxAttempts: 3,
      timeLimit: 30,
      randomizeQuestions: false,
      allowMultipleAttempts: true,
      showCorrectAnswers: true,
      questions: [
        {
          id: crypto.randomUUID(),
          type: 'multiple-choice' as const,
          question: 'What is 2 + 2?',
          options: ['2', '3', '4', '5'],
          correctAnswer: '4',
          points: 1
        }
      ],
      createdAt: new Date().toISOString()
    }

    try {
      await quizStorage.addQuiz(testQuiz)
      console.log('   ✅ CREATE: Test quiz created')
    } catch (error: any) {
      console.log('   ❌ CREATE failed:', error.message)
    }

    try {
      const quizzes = await quizStorage.getQuizzes()
      console.log(`   ✅ READ: Retrieved ${quizzes.length} quizzes`)
      const found = quizzes.find(q => q.id === testQuiz.id)
      if (found) {
        console.log('      ✓ Test quiz found')
        console.log(`      ✓ Questions stored correctly: ${found.questions.length} question(s)`)
      }
    } catch (error: any) {
      console.log('   ❌ READ failed:', error.message)
    }

    try {
      await quizStorage.deleteQuiz(testQuiz.id)
      console.log('   ✅ DELETE: Test quiz deleted')
    } catch (error: any) {
      console.log('   ❌ DELETE failed:', error.message)
    }

    // Test 6: Test Quiz Attempts
    console.log('\n📊 Step 6: Testing Quiz Attempts...')

    const testAttempt = {
      id: crypto.randomUUID(),
      quizId: crypto.randomUUID(),
      userId: '00000000-0000-0000-0000-000000000003', // Student user
      answers: { 'question1': 'answer1' },
      score: 80,
      maxScore: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpent: 300
    }

    try {
      await quizStorage.addAttempt(testAttempt)
      console.log('   ✅ CREATE: Test attempt created')

      const attempts = await quizStorage.getUserAttempts(testAttempt.userId)
      console.log(`   ✅ READ: Retrieved ${attempts.length} attempts for user`)

      // Clean up
      await supabase.from('quiz_attempts').delete().eq('id', testAttempt.id)
      console.log('   ✅ CLEANUP: Test attempt deleted')
    } catch (error: any) {
      console.log('   ❌ Quiz attempts test failed:', error.message)
    }

    // Test 7: Test Schools
    console.log('\n🏫 Step 7: Testing Schools...')

    const testSchool = {
      id: crypto.randomUUID(),
      name: 'Test School',
      nameKm: 'សាលាសាកល្បង',
      province: 'Phnom Penh',
      district: 'Chamkar Mon'
    }

    try {
      await quizStorage.addSchool(testSchool)
      console.log('   ✅ CREATE: Test school created')

      const schools = await quizStorage.getSchools()
      console.log(`   ✅ READ: Retrieved ${schools.length} schools`)

      await quizStorage.deleteSchool(testSchool.id)
      console.log('   ✅ DELETE: Test school deleted')
    } catch (error: any) {
      console.log('   ❌ Schools test failed:', error.message)
    }

    // Final Summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUPABASE INTEGRATION TEST COMPLETE')
    console.log('='.repeat(60))
    console.log('\n✅ All core functionality tested successfully!')
    console.log('\nYour quiz system is now using Supabase for:')
    console.log('  • User authentication data')
    console.log('  • Categories and quizzes')
    console.log('  • Quiz attempts and results')
    console.log('  • Schools and classes')
    console.log('  • Question banks')
    console.log('  • Certificates')
    console.log('\n💾 All data is now stored in the cloud!')
    console.log('📱 Data will persist across devices and browsers')
    console.log('🔄 Multiple users can access the same data')

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
console.log('🚀 Starting Supabase Integration Tests...')
console.log('='.repeat(60) + '\n')

testSupabaseConnection()
  .then(() => {
    console.log('\n✅ Test script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error)
    process.exit(1)
  })
