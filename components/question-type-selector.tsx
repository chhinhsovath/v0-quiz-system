"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  CheckSquare,
  Circle,
  FileText,
  PenLine,
  MoveVertical,
  Link,
  ImageIcon,
  Target,
  ArrowRightLeft,
  ListOrdered
} from "lucide-react"
import type { QuestionType } from "@/lib/quiz-types"
import { cn } from "@/lib/utils"

interface QuestionTypeSelectorProps {
  value: QuestionType
  onChange: (type: QuestionType) => void
  t: any
}

const questionTypes: Array<{
  type: QuestionType
  icon: any
  preview: React.ReactNode
  description: string
  difficulty: "easy" | "medium" | "hard"
}> = [
  {
    type: "multiple-choice",
    icon: CheckCircle2,
    description: "Single correct answer from multiple options",
    difficulty: "easy",
    preview: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
          <Circle className="h-3 w-3" />
          <span>Option A</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700">
          <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Option B ✓</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
          <Circle className="h-3 w-3" />
          <span>Option C</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
          <Circle className="h-3 w-3" />
          <span>Option D</span>
        </div>
      </div>
    )
  },
  {
    type: "multiple-select",
    icon: CheckSquare,
    description: "Multiple correct answers can be selected",
    difficulty: "medium",
    preview: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700">
          <CheckSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Option A ✓</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
          <div className="h-3 w-3 border border-muted-foreground rounded-sm" />
          <span>Option B</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700">
          <CheckSquare className="h-3 w-3 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Option C ✓</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-muted/50">
          <div className="h-3 w-3 border border-muted-foreground rounded-sm" />
          <span>Option D</span>
        </div>
      </div>
    )
  },
  {
    type: "true-false",
    icon: Circle,
    description: "Simple true or false question",
    difficulty: "easy",
    preview: (
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 p-2 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700">
          <Circle className="h-3 w-3 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">True ✓</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
          <Circle className="h-3 w-3" />
          <span>False</span>
        </div>
      </div>
    )
  },
  {
    type: "short-answer",
    icon: PenLine,
    description: "Open text input for short responses",
    difficulty: "easy",
    preview: (
      <div className="space-y-2">
        <div className="h-8 border border-dashed border-muted-foreground/50 rounded bg-muted/30 flex items-center px-2">
          <span className="text-xs text-muted-foreground">Type answer here...</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Example: "Paris" or "1945"
        </div>
      </div>
    )
  },
  {
    type: "fill-blanks",
    icon: FileText,
    description: "Fill in the missing words",
    difficulty: "medium",
    preview: (
      <div className="space-y-2">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span>The capital of France is</span>
            <div className="h-6 w-16 border border-dashed border-blue-400 rounded bg-blue-50 dark:bg-blue-950/30" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <span>and it was founded in</span>
            <div className="h-6 w-16 border border-dashed border-blue-400 rounded bg-blue-50 dark:bg-blue-950/30" />
          </div>
        </div>
      </div>
    )
  },
  {
    type: "essay",
    icon: FileText,
    description: "Long-form written response",
    difficulty: "hard",
    preview: (
      <div className="space-y-2">
        <div className="h-20 border border-dashed border-muted-foreground/50 rounded bg-muted/30 flex items-start p-2">
          <span className="text-xs text-muted-foreground">
            Write your essay here...
            <br />Multiple paragraphs allowed
          </span>
        </div>
      </div>
    )
  },
  {
    type: "matching",
    icon: Link,
    description: "Match items from two lists",
    difficulty: "medium",
    preview: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300">France</div>
          <ArrowRightLeft className="h-3 w-3 text-blue-600" />
          <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300">Paris</div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="p-1.5 rounded bg-muted/50">Japan</div>
          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
          <div className="p-1.5 rounded bg-muted/50">Tokyo</div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="p-1.5 rounded bg-muted/50">Italy</div>
          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
          <div className="p-1.5 rounded bg-muted/50">Rome</div>
        </div>
      </div>
    )
  },
  {
    type: "ordering",
    icon: ListOrdered,
    description: "Arrange items in correct order",
    difficulty: "medium",
    preview: (
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300">
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">1.</span>
          <span>First step</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300">
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">2.</span>
          <span>Second step</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded bg-blue-100 dark:bg-blue-950 border border-blue-300">
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300">3.</span>
          <span>Third step</span>
        </div>
      </div>
    )
  },
  {
    type: "drag-drop",
    icon: MoveVertical,
    description: "Drag and drop items into categories",
    difficulty: "hard",
    preview: (
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-dashed rounded p-1.5 bg-muted/30">
            <div className="text-muted-foreground mb-1">Category A</div>
            <div className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-center">Item 1</div>
          </div>
          <div className="border border-dashed rounded p-1.5 bg-muted/30">
            <div className="text-muted-foreground mb-1">Category B</div>
            <div className="p-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-center">Item 2</div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: "image-choice",
    icon: ImageIcon,
    description: "Select from image-based options",
    difficulty: "medium",
    preview: (
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="border-2 border-blue-500 rounded p-1 bg-blue-50 dark:bg-blue-950/30">
          <div className="aspect-square bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-900 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center mt-1 text-blue-700 dark:text-blue-300 font-medium">✓</div>
        </div>
        <div className="border rounded p-1 bg-muted/30">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="border rounded p-1 bg-muted/30">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>
        <div className="border rounded p-1 bg-muted/30">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    )
  },
  {
    type: "hotspot",
    icon: Target,
    description: "Click specific areas on an image",
    difficulty: "hard",
    preview: (
      <div className="space-y-2">
        <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
          <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Click the hotspots ●
        </div>
      </div>
    )
  }
]

export function QuestionTypeSelector({ value, onChange, t }: QuestionTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>(value)

  const handleSelect = (type: QuestionType) => {
    setSelectedType(type)
    onChange(type)
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {questionTypes.map((qt) => {
        const Icon = qt.icon
        const isSelected = selectedType === qt.type
        const translationKey = qt.type.replace(/-/g, "")
        const title = t[translationKey] || qt.type

        return (
          <Card
            key={qt.type}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]",
              isSelected
                ? "border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md"
                : "border hover:border-blue-300 dark:hover:border-blue-700"
            )}
            onClick={() => handleSelect(qt.type)}
          >
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={cn("text-xs", difficultyColors[qt.difficulty])}
                >
                  {qt.difficulty}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h3 className={cn(
                  "font-semibold text-sm mb-1",
                  isSelected && "text-blue-700 dark:text-blue-400"
                )}>
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {qt.description}
                </p>
              </div>

              {/* Preview */}
              <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border">
                {qt.preview}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
