"use client"

import { seedDemoData } from "./seed-utils"

// This function will run once to seed demo data automatically
export function autoSeedOnFirstRun() {
  if (typeof window === "undefined") return

  const AUTO_SEED_KEY = "quiz_system_auto_seeded"
  const hasSeeded = localStorage.getItem(AUTO_SEED_KEY)

  if (!hasSeeded) {
    console.log("🌱 Auto-seeding demo data...")
    const result = seedDemoData()

    if (result.success) {
      localStorage.setItem(AUTO_SEED_KEY, "true")
      console.log("✅ Demo data seeded successfully!")
      console.log(`   - ${result.categoriesAdded} categories added`)
      console.log(`   - ${result.quizzesAdded} quizzes added`)
    } else {
      console.error("❌ Failed to seed demo data:", result.message)
    }
  }
}

// Force reseed (useful for development)
export function forceReseed() {
  if (typeof window === "undefined") return

  localStorage.removeItem("quiz_system_auto_seeded")
  autoSeedOnFirstRun()
}
