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
      setUser(JSON.parse(storedUser))
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
