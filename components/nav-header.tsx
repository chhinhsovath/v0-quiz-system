"use client"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Shield, GraduationCap, Users, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function NavHeader() {
  const { user, logout, isAdmin, isTeacher, isParent } = useAuth()
  const { language, setLanguage, t } = useI18n()

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="h-4 w-4 text-primary" />
    if (isTeacher) return <GraduationCap className="h-4 w-4 text-blue-500" />
    if (isParent) return <Users className="h-4 w-4 text-green-500" />
    return <User className="h-4 w-4 text-muted-foreground" />
  }

  const getRoleLabel = () => {
    if (isAdmin) return t.admin
    if (isTeacher) return t.teacher
    if (isParent) return t.parent
    return t.student
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold truncate">
              {language === "km" ? "ប្រព័ន្ធតេស្ត" : "Quiz System"}
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 px-2 sm:px-3">
                    <Globe className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{language === "km" ? "ខ្មែរ" : "EN"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("km")}>ភាសាខ្មែរ (Khmer)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Info - Hidden on mobile, shown on tablet+ */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                {getRoleIcon()}
                <span className="font-medium">{language === "km" && user.nameKm ? user.nameKm : user.name}</span>
                <span className="text-muted-foreground">({getRoleLabel()})</span>
              </div>

              {/* Logout Button */}
              <Button variant="outline" size="sm" onClick={logout} className="h-9 px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.logout}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
