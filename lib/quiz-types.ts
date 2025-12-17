export type QuestionType =
  | "multiple-choice"
  | "multiple-select"
  | "true-false"
  | "short-answer"
  | "fill-blanks"
  | "drag-drop"
  | "matching"
  | "ordering"
  | "essay"
  | "image-choice"
  | "hotspot"

export interface Question {
  id: string
  type: QuestionType
  question: string
  questionKm?: string // Khmer translation
  options?: string[]
  optionsKm?: string[] // Khmer options
  correctAnswer: string | string[] | Record<string, string>
  points: number
  blanksTemplate?: string
  blanksTemplateKm?: string
  blanksCount?: number
  pairs?: Array<{ left: string; right: string; leftKm?: string; rightKm?: string }>
  imageUrl?: string
  hotspots?: Array<{ x: number; y: number; label: string; labelKm?: string }>
  explanation?: string
  explanationKm?: string
  difficulty?: "easy" | "medium" | "hard" // For adaptive testing
  tags?: string[] // For categorization
  mathFormula?: string // LaTeX formula
  _originalOptions?: string[] // Original options before shuffle (internal use)
  _shuffleSeed?: string // Seed used for shuffle (internal use)
}

export interface Quiz {
  id: string
  title: string
  titleKm?: string
  description: string
  descriptionKm?: string
  categoryId: string
  questions: Question[]
  questionBankIds?: string[] // Reference to question banks for random pools
  randomPoolSize?: number // How many questions to pull from banks
  timeLimit: number // in minutes, 0 for no limit
  randomizeQuestions: boolean
  shuffleOptions: boolean // Shuffle answer options for each student
  allowMultipleAttempts: boolean
  maxAttempts?: number
  showCorrectAnswers: boolean
  passingScore?: number // Percentage needed to pass
  certificateEnabled?: boolean
  adaptiveTesting?: boolean // Adjust difficulty based on performance
  gradeLevel?: string
  subject?: string
  examType?: string // regular, grade9, grade12
  assignedToClasses?: string[] // Class IDs
  createdBy: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description: string
  color: string
}

export type UserRole = "admin" | "teacher" | "student" | "parent"

export interface School {
  id: string
  name: string
  nameKm?: string
  address: string
  province: string
  district: string
  createdAt: string
}

export interface Class {
  id: string
  schoolId: string
  name: string
  nameKm?: string
  gradeLevel: string
  teacherId: string
  studentIds: string[]
  createdAt: string
}

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  nameKm?: string
  schoolId?: string
  classIds?: string[]
  parentId?: string // For students, link to parent account
  childrenIds?: string[] // For parents, link to children accounts
  createdAt: string
}

export interface QuestionBank {
  id: string
  name: string
  nameKm?: string
  description?: string
  descriptionKm?: string
  subject?: string
  gradeLevel?: string
  categoryId?: string
  questions: Question[]
  createdBy: string
  sharedWith: string[] // User IDs who can access this bank
  createdAt: string
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  answers: Record<string, string | string[]>
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  startedAt: string
  completedAt: string
  timeSpent: number // in seconds
  questionTimings: Record<string, number> // Time spent per question
  attemptNumber: number
  certificateIssued?: boolean
  certificateId?: string
}

export interface Certificate {
  id: string
  userId: string
  quizId: string
  attemptId: string
  issuedAt: string
  score: number
  percentage: number
}

export interface QuestionAnalytics {
  questionId: string
  totalAttempts: number
  correctAttempts: number
  averageTime: number
  difficulty: number // Calculated difficulty (0-1)
  discrimination: number // How well it separates high/low performers
}

export interface StudentAnalytics {
  userId: string
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  averageTime: number
  strongSubjects: string[]
  weakSubjects: string[]
  progressOverTime: Array<{ date: string; score: number }>
  recentActivity: QuizAttempt[]
}
