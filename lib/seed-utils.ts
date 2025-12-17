import { quizStorage } from "./quiz-storage"
import { seedCategories, seedQuizzes } from "./seed-data"
import { seedQuestionBanks } from "./seed-question-banks-data"

export async function seedDemoData() {
  try {
    // Check if data already exists
    const existingCategories = await quizStorage.getCategories()
    const existingQuizzes = await quizStorage.getQuizzes()
    const existingQuestionBanks = await quizStorage.getQuestionBanks()

    // Only seed if no data exists or if explicitly requested
    let categoriesAdded = 0
    let quizzesAdded = 0
    let questionBanksAdded = 0

    // Seed categories
    for (const category of seedCategories) {
      const exists = existingCategories.find((c) => c.id === category.id)
      if (!exists) {
        await quizStorage.addCategory(category)
        categoriesAdded++
      }
    }

    // Seed quizzes
    for (const quiz of seedQuizzes) {
      const exists = existingQuizzes.find((q) => q.id === quiz.id)
      if (!exists) {
        await quizStorage.addQuiz(quiz)
        quizzesAdded++
      }
    }

    // Seed question banks
    for (const bank of seedQuestionBanks) {
      const exists = existingQuestionBanks.find((b) => b.id === bank.id)
      if (!exists) {
        await quizStorage.addQuestionBank(bank)
        questionBanksAdded++
      }
    }

    return {
      success: true,
      message: `Successfully seeded ${categoriesAdded} categories, ${quizzesAdded} quizzes, and ${questionBanksAdded} question banks`,
      categoriesAdded,
      quizzesAdded,
      questionBanksAdded,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error seeding data: ${error}`,
      categoriesAdded: 0,
      quizzesAdded: 0,
      questionBanksAdded: 0,
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
