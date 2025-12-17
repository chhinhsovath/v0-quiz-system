"use client"

import { seedDemoData } from "./seed-utils"
import { quizStorage } from "./quiz-storage"

// This function will run once to seed demo data automatically
export async function autoSeedOnFirstRun() {
  if (typeof window === "undefined") return

  const AUTO_SEED_KEY = "quiz_system_auto_seeded"
  const hasSeeded = localStorage.getItem(AUTO_SEED_KEY)

  // Skip if localStorage flag is set (optimization)
  if (hasSeeded) return

  try {
    // Check database to see if data already exists (cross-domain check)
    const [categories, quizzes, questionBanks] = await Promise.all([
      quizStorage.getCategories(),
      quizStorage.getQuizzes(),
      quizStorage.getQuestionBanks()
    ])

    // If database already has data, just set the flag and skip seeding
    if (categories.length > 0 || quizzes.length > 0 || questionBanks.length > 0) {
      localStorage.setItem(AUTO_SEED_KEY, "true")
      console.log("✅ Demo data already exists in database, skipping auto-seed")
      return
    }

    // Database is empty, proceed with seeding
    console.log("🌱 Auto-seeding demo data...")
    const result = await seedDemoData()

    if (result.success) {
      localStorage.setItem(AUTO_SEED_KEY, "true")
      console.log("✅ Demo data seeded successfully!")
      console.log(`   - ${result.categoriesAdded} categories added`)
      console.log(`   - ${result.quizzesAdded} quizzes added`)
      console.log(`   - ${result.questionBanksAdded} question banks added`)
    } else {
      console.error("❌ Failed to seed demo data:", result.message)
    }
  } catch (error) {
    console.error("❌ Failed to seed demo data:", error)
  }
}

// Force reseed (useful for development)
export async function forceReseed() {
  if (typeof window === "undefined") return

  localStorage.removeItem("quiz_system_auto_seeded")
  await autoSeedOnFirstRun()
}
