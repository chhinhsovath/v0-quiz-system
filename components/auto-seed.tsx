"use client"

import { useEffect } from "react"
import { autoSeedOnFirstRun } from "@/lib/auto-seed"

export function AutoSeed() {
  useEffect(() => {
    autoSeedOnFirstRun()
  }, [])

  return null
}
