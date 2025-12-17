"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { quizStorage } from "./quiz-storage"
import type { User } from "./quiz-types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: boolean
  isTeacher: boolean
  isStudent: boolean
  isParent: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem("quiz_user")
    if (storedUser) {
      const parsed = JSON.parse(storedUser)

      // Migrate old simple IDs to UUIDs
      const idMigrationMap: Record<string, string> = {
        "1": "00000000-0000-0000-0000-000000000001", // Admin
        "2": "00000000-0000-0000-0000-000000000002", // Teacher
        "3": "00000000-0000-0000-0000-000000000003", // Student
        "4": "00000000-0000-0000-0000-000000000004", // Parent
      }

      // If stored ID is old format, migrate it
      if (parsed.id && idMigrationMap[parsed.id]) {
        const oldId = parsed.id
        parsed.id = idMigrationMap[parsed.id]
        localStorage.setItem("quiz_user", JSON.stringify(parsed))
        console.log(`✅ Migrated user ID from "${oldId}" to UUID format`)
      }

      setUser(parsed)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Get users from storage
    const users = await quizStorage.getUsers()

    // Simple authentication (in production, use proper auth)
    const foundUser = users.find((u) => u.email === email)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("quiz_user", JSON.stringify(foundUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("quiz_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student",
        isParent: user?.role === "parent",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
