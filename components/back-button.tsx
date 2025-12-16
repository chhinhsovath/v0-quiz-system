"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label, className = "" }: BackButtonProps) {
  const router = useRouter()
  const { language } = useI18n()

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  const defaultLabel = language === "km" ? "ត្រឡប់ក្រោយ" : "Back"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`mb-4 ${className}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label || defaultLabel}
    </Button>
  )
}
