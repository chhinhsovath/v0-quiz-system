import { quizStorage } from './quiz-storage'
import { seedCategories, seedQuizzes } from './seed-data'

/**
 * Supabase-compatible demo data seeding
 * Seeds categories and quizzes into Supabase database
 */

export async function seedDemoDataSupabase() {
  try {
    console.log('🌱 Starting Supabase demo data seeding...')

    let categoriesAdded = 0
    let quizzesAdded = 0
    const categoryIdMap = new Map<string, string>() // Map old IDs to new UUIDs

    // Get existing data
    const existingCategories = await quizStorage.getCategories()
    const existingQuizzes = await quizStorage.getQuizzes()

    // Seed Categories
    for (const category of seedCategories) {
      // Check if category already exists by name (not ID, since IDs are UUIDs)
      const exists = existingCategories.find(c => c.name === category.name)
      if (!exists) {
        try {
          // Don't pass ID - let Supabase generate UUID
          const newCategory = await quizStorage.addCategory({
            name: category.name,
            nameKm: category.name, // Use same name for Khmer if not provided
            description: category.description,
            descriptionKm: category.description, // Use same description for Khmer
            icon: category.color // Store color as icon for now
          } as any)

          // Store the mapping of old ID to new UUID
          categoryIdMap.set(category.id, newCategory?.id || category.id)
          categoriesAdded++
          console.log(`✅ Added category: ${category.name}`)
        } catch (error) {
          console.error(`❌ Error adding category ${category.name}:`, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
      } else {
        console.log(`ℹ️ Category already exists: ${category.name}`)
        categoryIdMap.set(category.id, exists.id)
      }
    }

    // Wait a moment for categories to be fully inserted
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get fresh categories list with new UUIDs
    const updatedCategories = await quizStorage.getCategories()

    // Seed Quizzes
    for (const quiz of seedQuizzes) {
      // Check if quiz already exists by title
      const exists = existingQuizzes.find(q => q.title === quiz.title)
      if (!exists) {
        try {
          // Map the old category ID to the new UUID
          const newCategoryId = categoryIdMap.get(quiz.categoryId) ||
                                updatedCategories.find(c => c.name.includes(quiz.categoryId.includes('khmer') ? 'Khmer' :
                                                                             quiz.categoryId.includes('math') ? 'Math' :
                                                                             quiz.categoryId.includes('science') ? 'Science' :
                                                                             'General'))?.id

          if (!newCategoryId) {
            console.warn(`⚠️ Could not find category for ${quiz.title}, using first category`)
          }

          // Don't pass ID - let Supabase generate UUID
          // Use the demo admin user ID from schema
          await quizStorage.addQuiz({
            title: quiz.title,
            titleKm: quiz.titleKm || quiz.title,
            description: quiz.description,
            descriptionKm: quiz.descriptionKm || quiz.description,
            categoryId: newCategoryId || updatedCategories[0]?.id,
            createdBy: '00000000-0000-0000-0000-000000000001', // Admin user from schema
            gradeLevel: quiz.gradeLevel,
            subject: quiz.subject,
            examType: quiz.examType,
            passingScore: quiz.passingScore,
            certificateEnabled: quiz.certificateEnabled,
            adaptiveTesting: quiz.adaptiveTesting,
            maxAttempts: quiz.maxAttempts,
            timeLimit: quiz.timeLimit,
            randomizeQuestions: quiz.randomizeQuestions,
            allowMultipleAttempts: quiz.allowMultipleAttempts,
            showCorrectAnswers: quiz.showCorrectAnswers,
            questions: quiz.questions,
            createdAt: new Date().toISOString()
          } as any)
          quizzesAdded++
          console.log(`✅ Added quiz: ${quiz.title} (${quiz.questions.length} questions)`)
        } catch (error) {
          console.error(`❌ Error adding quiz ${quiz.title}:`, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
        }
      } else {
        console.log(`ℹ️ Quiz already exists: ${quiz.title}`)
      }
    }

    const message = `✨ Seeding complete! Added ${categoriesAdded} categories and ${quizzesAdded} quizzes (${seedQuizzes.reduce((sum, q) => sum + q.questions.length, 0)} total questions)`
    console.log(message)

    return {
      success: true,
      message,
      categoriesAdded,
      quizzesAdded
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    console.error('Full error:', JSON.stringify(error, null, 2))
    return {
      success: false,
      message: `Error seeding data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      categoriesAdded: 0,
      quizzesAdded: 0
    }
  }
}

/**
 * Clear all demo data from Supabase
 */
export async function clearDemoDataSupabase() {
  try {
    console.log('🗑️ Clearing demo data...')

    const categories = await quizStorage.getCategories()
    const quizzes = await quizStorage.getQuizzes()

    // Delete all quizzes
    for (const quiz of quizzes) {
      await quizStorage.deleteQuiz(quiz.id)
    }

    // Delete all categories
    for (const category of categories) {
      await quizStorage.deleteCategory(category.id)
    }

    console.log(`✅ Cleared ${quizzes.length} quizzes and ${categories.length} categories`)

    return {
      success: true,
      message: `Cleared ${quizzes.length} quizzes and ${categories.length} categories`
    }
  } catch (error) {
    console.error('❌ Clear failed:', error)
    return {
      success: false,
      message: `Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Reseed demo data (clear then seed)
 */
export async function reseedDemoDataSupabase() {
  console.log('🔄 Reseeding demo data...')
  const clearResult = await clearDemoDataSupabase()
  if (!clearResult.success) {
    return clearResult
  }

  const seedResult = await seedDemoDataSupabase()
  return seedResult
}
