/**
 * Shuffle Utilities for Quiz Randomization
 *
 * Provides deterministic shuffling algorithms to randomize:
 * - Question order in quizzes
 * - Answer options for multiple choice questions
 *
 * Uses hash-based PRNG for reproducibility - same student + attempt = same shuffle
 * No external dependencies required
 */

import type { Question } from './quiz-types'

/**
 * Simple hash function to convert string seed to number
 * Uses cyrb53 algorithm for good distribution
 */
function hashString(str: string): number {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

/**
 * Seeded pseudo-random number generator
 * Returns a function that generates deterministic random numbers
 */
function createSeededRandom(seed: string): () => number {
  let state = hashString(seed)

  return function() {
    // Linear congruential generator (LCG)
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

/**
 * Shuffle an array using Fisher-Yates algorithm with deterministic seeding
 *
 * @param array - Array to shuffle
 * @param seed - Seed string for deterministic randomness
 * @returns Shuffled copy of array
 *
 * @example
 * const items = ['A', 'B', 'C', 'D']
 * const shuffled = shuffleArray(items, 'user-123-attempt-456')
 * // Same seed always produces same shuffle
 */
export function shuffleArray<T>(array: T[], seed: string): T[] {
  const rng = createSeededRandom(seed)
  const shuffled = [...array]

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

/**
 * Shuffle question options for a student while maintaining correctness
 *
 * @param question - Question to shuffle
 * @param studentId - Student ID for seeding
 * @param attemptId - Attempt ID for seeding
 * @returns Question with shuffled options and updated correct answer
 *
 * @example
 * const question = {
 *   id: 'q1',
 *   type: 'multiple-choice',
 *   question: 'What is 2+2?',
 *   options: ['3', '4', '5', '6'],
 *   correctAnswer: '4',
 *   points: 1
 * }
 *
 * const shuffled = shuffleQuestionOptions(question, 'student-123', 'attempt-456')
 * // Options are shuffled, but correctAnswer is updated to match new position
 */
export function shuffleQuestionOptions(
  question: Question,
  studentId: string,
  attemptId: string
): Question {
  // Don't shuffle if question doesn't have options
  if (!question.options || question.options.length === 0) {
    return question
  }

  // Don't shuffle True/False questions (order matters for semantics)
  if (question.type === 'true-false') {
    return question
  }

  // Don't shuffle ordering/sequencing questions (the task is to order them)
  if (question.type === 'ordering') {
    return question
  }

  // Create deterministic seed (same student + attempt = same shuffle)
  const seed = `${question.id}-${studentId}-${attemptId}`

  // Keep original options for reference
  const originalOptions = [...question.options]
  const shuffledOptions = shuffleArray(originalOptions, seed)

  // Update correct answer(s) to match new positions
  let newCorrectAnswer = question.correctAnswer

  if (question.type === 'multiple-choice' && typeof newCorrectAnswer === 'string') {
    // Find the shuffled option that matches the original correct answer
    newCorrectAnswer = shuffledOptions.find(opt => opt === question.correctAnswer) || question.correctAnswer

  } else if (question.type === 'multiple-select' && Array.isArray(newCorrectAnswer)) {
    // For multiple select, keep the same correct answers (they're values, not positions)
    // No change needed as we compare values, not indices
    newCorrectAnswer = newCorrectAnswer

  } else if (question.type === 'image-choice' && typeof newCorrectAnswer === 'string') {
    // Similar to multiple choice
    newCorrectAnswer = shuffledOptions.find(opt => opt === question.correctAnswer) || question.correctAnswer
  }

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswer,
    _originalOptions: originalOptions, // Keep for debugging/grading verification
    _shuffleSeed: seed // Store seed for reproducibility verification
  }
}

/**
 * Shuffle all questions in a quiz
 *
 * @param questions - Array of questions
 * @param studentId - Student ID for seeding
 * @param attemptId - Attempt ID for seeding
 * @returns Shuffled questions array
 *
 * @example
 * const questions = [q1, q2, q3, q4, q5]
 * const shuffled = shuffleQuestions(questions, 'student-123', 'attempt-456')
 * // Different order for each student, but same order for same student+attempt
 */
export function shuffleQuestions(
  questions: Question[],
  studentId: string,
  attemptId: string
): Question[] {
  const seed = `questions-${studentId}-${attemptId}`
  return shuffleArray(questions, seed)
}

/**
 * Prepare quiz questions for a specific student
 * Combines question shuffling and option shuffling based on quiz settings
 *
 * @param questions - Original quiz questions
 * @param shuffleQuestions - Whether to shuffle question order
 * @param shuffleOptions - Whether to shuffle answer options
 * @param studentId - Student ID
 * @param attemptId - Attempt ID
 * @returns Prepared questions for student
 *
 * @example
 * const prepared = prepareQuestionsForStudent(
 *   quiz.questions,
 *   quiz.randomizeQuestions,
 *   quiz.shuffleOptions,
 *   'student-123',
 *   'attempt-456'
 * )
 */
export function prepareQuestionsForStudent(
  questions: Question[],
  shouldShuffleQuestions: boolean,
  shouldShuffleOptions: boolean,
  studentId: string,
  attemptId: string
): Question[] {
  let prepared = [...questions]

  // Shuffle question order if enabled
  if (shouldShuffleQuestions) {
    prepared = shuffleQuestions(prepared, studentId, attemptId)
  }

  // Shuffle answer options if enabled
  if (shouldShuffleOptions) {
    prepared = prepared.map(q => shuffleQuestionOptions(q, studentId, attemptId))
  }

  return prepared
}

/**
 * Verify shuffle reproducibility (for testing/debugging)
 *
 * @param array - Array to test
 * @param seed - Seed to use
 * @param iterations - Number of shuffles to verify
 * @returns true if all shuffles are identical
 */
export function verifyShuffleReproducibility<T>(
  array: T[],
  seed: string,
  iterations: number = 10
): boolean {
  const firstShuffle = shuffleArray(array, seed)

  for (let i = 0; i < iterations; i++) {
    const shuffle = shuffleArray(array, seed)
    if (JSON.stringify(shuffle) !== JSON.stringify(firstShuffle)) {
      return false
    }
  }

  return true
}

/**
 * Generate a seed for shuffle operations
 *
 * @param components - Components to include in seed
 * @returns Seed string
 */
export function generateShuffleSeed(...components: string[]): string {
  return components.filter(Boolean).join('-')
}
