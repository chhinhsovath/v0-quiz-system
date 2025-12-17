import { quizStorage } from "./quiz-storage"
import { seedCategories, seedQuizzes } from "./seed-data"

export function seedDemoData() {
  try {
    // Check if data already exists
    const existingCategories = quizStorage.getCategories()
    const existingQuizzes = quizStorage.getQuizzes()

    // Only seed if no data exists or if explicitly requested
    let categoriesAdded = 0
    let quizzesAdded = 0

    // Seed categories
    seedCategories.forEach((category) => {
      const exists = existingCategories.find((c) => c.id === category.id)
      if (!exists) {
        quizStorage.addCategory(category)
        categoriesAdded++
      }
    })

    // Seed quizzes
    seedQuizzes.forEach((quiz) => {
      const exists = existingQuizzes.find((q) => q.id === quiz.id)
      if (!exists) {
        quizStorage.addQuiz(quiz)
        quizzesAdded++
      }
    })

    return {
      success: true,
      message: `Successfully seeded ${categoriesAdded} categories and ${quizzesAdded} quizzes`,
      categoriesAdded,
      quizzesAdded,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error seeding data: ${error}`,
      categoriesAdded: 0,
      quizzesAdded: 0,
    }
  }
}

export function clearAllData() {
  try {
    localStorage.removeItem("quiz_system_categories")
    localStorage.removeItem("quiz_system_quizzes")
    localStorage.removeItem("quiz_system_attempts")
    localStorage.removeItem("quiz_system_schools")
    localStorage.removeItem("quiz_system_classes")
    localStorage.removeItem("quiz_system_question_banks")
    localStorage.removeItem("quiz_system_certificates")

    return {
      success: true,
      message: "All quiz data has been cleared successfully",
    }
  } catch (error) {
    return {
      success: false,
      message: `Error clearing data: ${error}`,
    }
  }
}

export function reseedData() {
  const clearResult = clearAllData()
  if (!clearResult.success) {
    return clearResult
  }
  return seedDemoData()
}
