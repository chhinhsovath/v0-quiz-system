# Phase 1 Implementation Plan (Months 1-3)
## Quick Wins to Reach 60% Feature Parity

**Timeline:** 12 weeks
**Budget:** $45,000
**Team:** 3 developers
**Goal:** Fix critical gaps, reach minimum viable competitive product

---

## Week 1-2: Answer Randomization

### **Why This Matters:**
- **Prevents cheating** - Students can't share answers
- **Academic integrity** - Different students see different option orders
- **Industry standard** - Moodle, TAO, H5P all have this

### **Implementation:**

#### 1. Add `shuffleOptions` field to Quiz type
```typescript
// lib/quiz-types.ts
export interface Quiz {
  // ... existing fields
  randomizeQuestions: boolean
  shuffleOptions: boolean // NEW: Shuffle answer options per student
}
```

#### 2. Create deterministic shuffle function
```typescript
// lib/shuffle-utils.ts
import seedrandom from 'seedrandom'

export function shuffleArray<T>(array: T[], seed: string): T[] {
  const rng = seedrandom(seed)
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

export function shuffleQuestionOptions(
  question: Question,
  studentId: string,
  quizAttemptId: string
): Question {
  // Only shuffle for question types with options
  if (!question.options || question.type === 'true-false') {
    return question
  }

  // Create deterministic seed (same student + attempt = same shuffle)
  const seed = `${question.id}-${studentId}-${quizAttemptId}`
  const shuffledOptions = shuffleArray(question.options, seed)

  // Update correct answer to match new positions
  let newCorrectAnswer = question.correctAnswer

  if (question.type === 'multiple-choice' && typeof newCorrectAnswer === 'string') {
    // Find new position of correct answer
    const originalIndex = question.options.indexOf(newCorrectAnswer)
    newCorrectAnswer = shuffledOptions[originalIndex]
  } else if (question.type === 'multiple-select' && Array.isArray(newCorrectAnswer)) {
    // Update all correct answers
    newCorrectAnswer = newCorrectAnswer.map(answer => {
      const originalIndex = question.options!.indexOf(answer)
      return shuffledOptions[originalIndex]
    })
  }

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer,
    _originalOptions: question.options // Keep for grading
  }
}
```

#### 3. Update quiz taking component
```typescript
// app/quiz/[id]/take/page.tsx
const prepareQuestionsForStudent = (
  quiz: Quiz,
  studentId: string,
  attemptId: string
): Question[] => {
  let questions = [...quiz.questions]

  // Randomize question order if enabled
  if (quiz.randomizeQuestions) {
    const seed = `${quiz.id}-${studentId}-${attemptId}`
    questions = shuffleArray(questions, seed)
  }

  // Shuffle options if enabled
  if (quiz.shuffleOptions) {
    questions = questions.map(q =>
      shuffleQuestionOptions(q, studentId, attemptId)
    )
  }

  return questions
}
```

#### 4. Add UI toggle in quiz builder
```typescript
// components/quiz-builder.tsx
<div className="flex items-center justify-between">
  <div className="space-y-0.5">
    <Label>Shuffle Answer Options</Label>
    <p className="text-sm text-muted-foreground">
      Randomize option order for each student to prevent cheating
    </p>
  </div>
  <Switch
    checked={quizData.shuffleOptions}
    onCheckedChange={(checked) => setQuizData({ ...quizData, shuffleOptions: checked })}
  />
</div>
```

**Deliverables:**
- ✅ Deterministic shuffle algorithm
- ✅ Per-student option randomization
- ✅ UI toggle for feature
- ✅ Tests for grading with shuffled options

**Testing Checklist:**
- [ ] Same student + attempt always sees same order
- [ ] Different students see different orders
- [ ] Grading works correctly with shuffled options
- [ ] True/False questions don't shuffle
- [ ] Multiple select updates all correct answers

---

## Week 2-3: Auto-Save Drafts

### **Why This Matters:**
- **Prevents data loss** - Browser crashes, internet drops
- **Reduces stress** - Students don't lose work
- **Industry standard** - Google Forms, Moodle all auto-save

### **Implementation:**

#### 1. Create draft storage service
```typescript
// lib/draft-storage.ts
interface QuizDraft {
  quizId: string
  userId: string
  attemptId: string
  answers: Record<string, any>
  lastSaved: string
  questionIndex: number
}

export const draftStorage = {
  // Save to localStorage (immediate) and Supabase (persistent)
  saveDraft: async (draft: QuizDraft) => {
    // Local save (instant)
    localStorage.setItem(
      `quiz-draft-${draft.attemptId}`,
      JSON.stringify(draft)
    )

    // Remote save (persistent)
    const { error } = await supabase
      .from('quiz_drafts')
      .upsert({
        attempt_id: draft.attemptId,
        user_id: draft.userId,
        quiz_id: draft.quizId,
        answers: draft.answers,
        question_index: draft.questionIndex,
        last_saved: new Date().toISOString()
      })

    if (error) console.error('Failed to save draft:', error)
  },

  loadDraft: async (attemptId: string): Promise<QuizDraft | null> => {
    // Try localStorage first (faster)
    const local = localStorage.getItem(`quiz-draft-${attemptId}`)
    if (local) {
      return JSON.parse(local)
    }

    // Fallback to Supabase
    const { data, error } = await supabase
      .from('quiz_drafts')
      .select('*')
      .eq('attempt_id', attemptId)
      .single()

    if (error || !data) return null

    return {
      quizId: data.quiz_id,
      userId: data.user_id,
      attemptId: data.attempt_id,
      answers: data.answers,
      lastSaved: data.last_saved,
      questionIndex: data.question_index
    }
  },

  deleteDraft: async (attemptId: string) => {
    localStorage.removeItem(`quiz-draft-${attemptId}`)
    await supabase
      .from('quiz_drafts')
      .delete()
      .eq('attempt_id', attemptId)
  }
}
```

#### 2. Add database table
```sql
-- supabase/migrations/add_quiz_drafts.sql
CREATE TABLE IF NOT EXISTS public.quiz_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  question_index INTEGER DEFAULT 0,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_drafts_attempt ON public.quiz_drafts(attempt_id);
CREATE INDEX idx_quiz_drafts_user ON public.quiz_drafts(user_id);
```

#### 3. Add auto-save hook
```typescript
// hooks/use-auto-save.ts
import { useEffect, useRef } from 'react'
import { draftStorage } from '@/lib/draft-storage'

export function useAutoSave(
  attemptId: string,
  quizId: string,
  userId: string,
  answers: Record<string, any>,
  questionIndex: number,
  interval = 30000 // 30 seconds
) {
  const lastSaveRef = useRef<string>('')

  useEffect(() => {
    const currentState = JSON.stringify({ answers, questionIndex })

    // Don't save if nothing changed
    if (currentState === lastSaveRef.current) return

    const saveTimer = setInterval(async () => {
      await draftStorage.saveDraft({
        attemptId,
        quizId,
        userId,
        answers,
        questionIndex,
        lastSaved: new Date().toISOString()
      })

      lastSaveRef.current = currentState
    }, interval)

    return () => clearInterval(saveTimer)
  }, [attemptId, quizId, userId, answers, questionIndex, interval])
}
```

#### 4. Use in quiz component
```typescript
// app/quiz/[id]/take/page.tsx
export default function TakeQuizPage() {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save every 30 seconds
  useAutoSave(attemptId, quizId, userId, answers, currentQuestion)

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await draftStorage.loadDraft(attemptId)
      if (draft) {
        const shouldRestore = confirm(
          `Found saved progress from ${new Date(draft.lastSaved).toLocaleString()}. Restore it?`
        )
        if (shouldRestore) {
          setAnswers(draft.answers)
          setCurrentQuestion(draft.questionIndex)
        }
      }
    }
    loadDraft()
  }, [attemptId])

  return (
    <div>
      {/* Quiz content */}

      {/* Save indicator */}
      {lastSaved && (
        <div className="text-xs text-muted-foreground">
          Last saved: {formatRelativeTime(lastSaved)}
        </div>
      )}
    </div>
  )
}
```

**Deliverables:**
- ✅ Auto-save every 30 seconds
- ✅ localStorage + Supabase storage
- ✅ Draft recovery on page load
- ✅ Save indicator in UI
- ✅ Database migration

**Testing Checklist:**
- [ ] Saves every 30 seconds automatically
- [ ] Recovers from browser crash
- [ ] Prompts user to restore draft
- [ ] Deletes draft after submission
- [ ] Works offline (localStorage)

---

## Week 3-4: Partial Credit

### **Implementation:**

```typescript
// lib/grading.ts
export function calculateQuestionScore(
  question: Question,
  studentAnswer: any
): number {
  switch (question.type) {
    case 'multiple-select':
      return calculateMultipleSelectScore(
        question.correctAnswer as string[],
        studentAnswer as string[],
        question.points
      )

    case 'fill-blanks':
      return calculateFillBlanksScore(
        question.correctAnswer as string[],
        studentAnswer as string[],
        question.points
      )

    default:
      // All or nothing for other types
      const isCorrect = checkAnswer(question, studentAnswer)
      return isCorrect ? question.points : 0
  }
}

function calculateMultipleSelectScore(
  correctAnswers: string[],
  studentAnswers: string[],
  maxPoints: number
): number {
  const correctCount = studentAnswers.filter(a =>
    correctAnswers.includes(a)
  ).length

  const incorrectCount = studentAnswers.filter(a =>
    !correctAnswers.includes(a)
  ).length

  // Award points proportionally, deduct for wrong answers
  const score = (correctCount - incorrectCount) / correctAnswers.length

  return Math.max(0, score) * maxPoints
}
```

**Deliverables:**
- ✅ Partial credit for multiple-select
- ✅ Partial credit for fill-in-blanks
- ✅ Configurable per question type

---

## Week 4-6: Question Categories & Tags

### **Implementation:**

```typescript
// lib/quiz-types.ts
export interface QuestionCategory {
  id: string
  name: string
  nameKm?: string
  parentId?: string // For hierarchical categories
  color?: string
  createdAt: string
}

export interface Question {
  // ... existing fields
  categoryId?: string
  tags?: string[] // e.g., ["algebra", "grade-9", "hard"]
  bloom?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  learningObjective?: string
}
```

**UI for Categories:**
```typescript
// components/category-selector.tsx
export function CategorySelector({ value, onChange }: Props) {
  const [categories, setCategories] = useState<QuestionCategory[]>([])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select category..." />
      </SelectTrigger>
      <SelectContent>
        {categories.map(cat => (
          <SelectItem key={cat.id} value={cat.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

**Deliverables:**
- ✅ Hierarchical categories
- ✅ Tags for flexible organization
- ✅ Bloom's taxonomy levels
- ✅ Filter by category/tags

---

## Week 6-7: Instant Feedback

### **Implementation:**

```typescript
// components/question-feedback.tsx
export function QuestionFeedback({
  question,
  studentAnswer,
  showFeedback
}: Props) {
  if (!showFeedback) return null

  const isCorrect = checkAnswer(question, studentAnswer)
  const score = calculateQuestionScore(question, studentAnswer)

  return (
    <div className={cn(
      "mt-4 p-4 rounded-lg border-l-4",
      isCorrect
        ? "bg-green-50 border-green-500"
        : "bg-red-50 border-red-500"
    )}>
      <div className="flex items-start gap-3">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}

        <div className="flex-1">
          <p className="font-semibold">
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>

          {score < question.points && score > 0 && (
            <p className="text-sm text-muted-foreground">
              Partial credit: {score}/{question.points} points
            </p>
          )}

          {question.explanation && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Explanation:</p>
              <p>{question.explanation}</p>
            </div>
          )}

          {!isCorrect && question.type !== 'essay' && (
            <div className="mt-2 text-sm">
              <p className="font-medium">Correct answer:</p>
              <DisplayCorrectAnswer question={question} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Deliverables:**
- ✅ Immediate right/wrong indication
- ✅ Show explanations
- ✅ Display correct answer
- ✅ Configurable per quiz

---

## Week 7-9: CSV Import/Export

### **Implementation:**

```typescript
// lib/csv-import.ts
import { parse } from 'csv-parse/sync'
import type { Question } from './quiz-types'

export function parseQuestionsCSV(csvContent: string): Question[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  })

  return records.map((row: any) => {
    const question: Question = {
      id: crypto.randomUUID(),
      type: row.type || 'multiple-choice',
      question: row.question,
      questionKm: row.question_km,
      points: parseInt(row.points) || 1,
      difficulty: row.difficulty || 'medium',
      explanation: row.explanation,
      correctAnswer: parseCorrectAnswer(row)
    }

    // Parse options if present
    if (row.option_a) {
      question.options = [
        row.option_a,
        row.option_b,
        row.option_c,
        row.option_d
      ].filter(Boolean)
    }

    return question
  })
}

export function exportQuestionsCSV(questions: Question[]): string {
  const headers = [
    'type',
    'question',
    'question_km',
    'option_a',
    'option_b',
    'option_c',
    'option_d',
    'correct_answer',
    'points',
    'difficulty',
    'explanation'
  ]

  const rows = questions.map(q => ({
    type: q.type,
    question: q.question,
    question_km: q.questionKm || '',
    option_a: q.options?.[0] || '',
    option_b: q.options?.[1] || '',
    option_c: q.options?.[2] || '',
    option_d: q.options?.[3] || '',
    correct_answer: formatCorrectAnswer(q),
    points: q.points,
    difficulty: q.difficulty || 'medium',
    explanation: q.explanation || ''
  }))

  return stringify([headers, ...rows.map(Object.values)])
}
```

**CSV Template:**
```csv
type,question,question_km,option_a,option_b,option_c,option_d,correct_answer,points,difficulty,explanation
multiple-choice,"What is 2+2?","២+២ =?",3,4,5,6,4,1,easy,"Basic addition"
true-false,"Earth is flat","ផែនដីរាបស្មើ",True,False,,,False,1,easy,"Earth is spherical"
```

**Deliverables:**
- ✅ CSV import for questions
- ✅ CSV export for questions
- ✅ CSV export for quiz results
- ✅ Template download
- ✅ Validation and error handling

---

## Week 9-12: Item Analysis Reports

### **Implementation:**

```typescript
// lib/item-analysis.ts
export interface ItemAnalysis {
  questionId: string
  totalAttempts: number
  correctAttempts: number

  // Difficulty Index (0-1, higher = easier)
  difficultyIndex: number

  // Discrimination Index (-1 to 1, higher = better)
  discriminationIndex: number

  // Point-Biserial Correlation
  pointBiserial: number

  // Distractors effectiveness
  distractorAnalysis?: {
    option: string
    selectedCount: number
    selectedByTopStudents: number
    selectedByBottomStudents: number
  }[]
}

export function calculateItemAnalysis(
  questionId: string,
  attempts: QuizAttempt[]
): ItemAnalysis {
  const questionAttempts = attempts.filter(a =>
    a.answers[questionId] !== undefined
  )

  const totalAttempts = questionAttempts.length
  const correctAttempts = questionAttempts.filter(a =>
    a.answers[questionId] === question.correctAnswer
  ).length

  // Difficulty Index = % who got it right
  const difficultyIndex = correctAttempts / totalAttempts

  // Split into top 27% and bottom 27% (Kelley's method)
  const sorted = questionAttempts.sort((a, b) => b.score - a.score)
  const topCount = Math.floor(totalAttempts * 0.27)
  const topStudents = sorted.slice(0, topCount)
  const bottomStudents = sorted.slice(-topCount)

  const topCorrect = topStudents.filter(a =>
    a.answers[questionId] === question.correctAnswer
  ).length

  const bottomCorrect = bottomStudents.filter(a =>
    a.answers[questionId] === question.correctAnswer
  ).length

  // Discrimination Index = (Top% - Bottom%) difference
  const discriminationIndex = (topCorrect - bottomCorrect) / topCount

  return {
    questionId,
    totalAttempts,
    correctAttempts,
    difficultyIndex,
    discriminationIndex,
    pointBiserial: calculatePointBiserial(questionAttempts, questionId),
    distractorAnalysis: analyzeDistractors(question, topStudents, bottomStudents)
  }
}
```

**Report UI:**
```typescript
// components/item-analysis-report.tsx
export function ItemAnalysisReport({ quizId }: Props) {
  const [analysis, setAnalysis] = useState<ItemAnalysis[]>([])

  return (
    <div className="space-y-6">
      <h2>Item Analysis Report</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Discrimination</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analysis.map(item => (
            <TableRow key={item.questionId}>
              <TableCell>Q{getQuestionNumber(item.questionId)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={item.difficultyIndex * 100}
                    className="w-20"
                  />
                  <span>{(item.difficultyIndex * 100).toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getDiscriminationBadge(item.discriminationIndex)}>
                  {item.discriminationIndex.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>
                {getQuestionStatus(item)}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => reviewQuestion(item.questionId)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ItemAnalysisChart data={analysis} />
    </div>
  )
}

function getQuestionStatus(item: ItemAnalysis): JSX.Element {
  // Too easy (>90% correct)
  if (item.difficultyIndex > 0.9) {
    return <Badge variant="warning">Too Easy</Badge>
  }

  // Too hard (<20% correct)
  if (item.difficultyIndex < 0.2) {
    return <Badge variant="destructive">Too Hard</Badge>
  }

  // Poor discrimination (<0.2)
  if (item.discriminationIndex < 0.2) {
    return <Badge variant="destructive">Poor Discrimination</Badge>
  }

  // Negative discrimination (bottom students do better than top)
  if (item.discriminationIndex < 0) {
    return <Badge variant="destructive">⚠️ Flawed Question</Badge>
  }

  return <Badge variant="success">Good</Badge>
}
```

**Deliverables:**
- ✅ Difficulty index calculation
- ✅ Discrimination index calculation
- ✅ Distractor analysis
- ✅ Visual reports
- ✅ Question recommendations

**Interpretation Guide:**

| Metric | Range | Interpretation |
|--------|-------|----------------|
| Difficulty Index | 0.0-0.2 | Very difficult |
| | 0.2-0.4 | Difficult |
| | 0.4-0.6 | Moderate (ideal) |
| | 0.6-0.8 | Easy |
| | 0.8-1.0 | Very easy |
| Discrimination Index | <0.0 | Flawed - review immediately |
| | 0.0-0.2 | Poor - consider revising |
| | 0.2-0.3 | Fair - may need improvement |
| | 0.3-0.4 | Good - keep question |
| | >0.4 | Excellent - strong question |

---

## Testing & Quality Assurance

### **Test Plan:**

**Unit Tests:**
- [ ] Shuffle algorithm produces deterministic results
- [ ] Grading works with shuffled options
- [ ] Auto-save saves every 30 seconds
- [ ] Partial credit calculations correct
- [ ] Item analysis calculations accurate

**Integration Tests:**
- [ ] Draft recovery works after browser crash
- [ ] CSV import handles all question types
- [ ] Feedback displays for all question types

**User Acceptance Tests:**
- [ ] Teachers can create quizzes 2x faster
- [ ] Students see immediate feedback
- [ ] Item analysis identifies bad questions

---

## Success Metrics

**KPIs:**
- Quiz creation time: Reduce from 120 min to 60 min
- Cheating incidents: Reduce by 50%
- Teacher satisfaction: >4.5/5 stars
- Feature usage: 80% of quizzes use new features

---

## Deliverables Summary

By end of Week 12, you will have:

✅ **7 Critical Features:**
1. Answer randomization (anti-cheating)
2. Auto-save drafts (data safety)
3. Partial credit (fair grading)
4. Question categories & tags (organization)
5. Instant feedback (better learning)
6. CSV import/export (bulk operations)
7. Item analysis (quality assurance)

✅ **Competitive Position:**
- 60% feature parity with Moodle
- Better UX than Moodle
- Faster than Moodle (2-3x)
- Ready for Cambodia Grade 9/12 exams

✅ **ROI:**
- $45K investment
- 12 weeks timeline
- High-impact features only
- Measurable improvements

---

**Next Step:** Review and approve this plan, then begin Week 1 implementation.
