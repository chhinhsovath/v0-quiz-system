/**
 * Tests for shuffle-utils.ts
 * Answer Randomization Feature - Phase 1, Week 1
 */

import {
  shuffleArray,
  shuffleQuestionOptions,
  shuffleQuestions,
  prepareQuestionsForStudent,
  verifyShuffleReproducibility,
  generateShuffleSeed
} from '../lib/shuffle-utils'
import type { Question } from '../lib/quiz-types'

describe('shuffleArray', () => {
  test('should shuffle array deterministically with same seed', () => {
    const array = ['A', 'B', 'C', 'D', 'E']
    const seed = 'test-seed-123'

    const shuffle1 = shuffleArray(array, seed)
    const shuffle2 = shuffleArray(array, seed)

    expect(shuffle1).toEqual(shuffle2)
  })

  test('should produce different shuffles with different seeds', () => {
    const array = ['A', 'B', 'C', 'D', 'E']

    const shuffle1 = shuffleArray(array, 'seed-1')
    const shuffle2 = shuffleArray(array, 'seed-2')

    expect(shuffle1).not.toEqual(shuffle2)
  })

  test('should not modify original array', () => {
    const array = ['A', 'B', 'C', 'D']
    const original = [...array]

    shuffleArray(array, 'test-seed')

    expect(array).toEqual(original)
  })

  test('should contain all original elements', () => {
    const array = ['A', 'B', 'C', 'D', 'E']
    const shuffled = shuffleArray(array, 'test-seed')

    expect(shuffled.sort()).toEqual(array.sort())
  })
})

describe('shuffleQuestionOptions', () => {
  test('should shuffle multiple choice options', () => {
    const question: Question = {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      points: 1
    }

    const shuffled = shuffleQuestionOptions(question, 'student-123', 'attempt-456')

    // Options should be shuffled
    expect(shuffled.options).not.toBeUndefined()
    expect(shuffled.options).toHaveLength(4)
    expect(shuffled.options).toContain('4')

    // Correct answer should still be '4'
    expect(shuffled.correctAnswer).toBe('4')

    // Should have tracking fields
    expect(shuffled._originalOptions).toEqual(['3', '4', '5', '6'])
    expect(shuffled._shuffleSeed).toBe('q1-student-123-attempt-456')
  })

  test('should not shuffle true/false questions', () => {
    const question: Question = {
      id: 'q2',
      type: 'true-false',
      question: 'Earth is flat',
      options: ['True', 'False'],
      correctAnswer: 'False',
      points: 1
    }

    const shuffled = shuffleQuestionOptions(question, 'student-123', 'attempt-456')

    // Options should NOT be shuffled for true/false
    expect(shuffled.options).toEqual(['True', 'False'])
  })

  test('should not shuffle ordering questions', () => {
    const question: Question = {
      id: 'q3',
      type: 'ordering',
      question: 'Order these events',
      options: ['First', 'Second', 'Third'],
      correctAnswer: ['First', 'Second', 'Third'],
      points: 1
    }

    const shuffled = shuffleQuestionOptions(question, 'student-123', 'attempt-456')

    // Options should NOT be shuffled for ordering
    expect(shuffled.options).toEqual(['First', 'Second', 'Third'])
  })

  test('should handle multiple select correctly', () => {
    const question: Question = {
      id: 'q4',
      type: 'multiple-select',
      question: 'Select all prime numbers',
      options: ['2', '3', '4', '5'],
      correctAnswer: ['2', '3', '5'],
      points: 1
    }

    const shuffled = shuffleQuestionOptions(question, 'student-123', 'attempt-456')

    // All correct answers should still be present
    expect(shuffled.correctAnswer).toEqual(expect.arrayContaining(['2', '3', '5']))
  })

  test('should be deterministic for same student and attempt', () => {
    const question: Question = {
      id: 'q5',
      type: 'multiple-choice',
      question: 'Test',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',
      points: 1
    }

    const shuffle1 = shuffleQuestionOptions(question, 'student-123', 'attempt-456')
    const shuffle2 = shuffleQuestionOptions(question, 'student-123', 'attempt-456')

    expect(shuffle1.options).toEqual(shuffle2.options)
  })
})

describe('shuffleQuestions', () => {
  const questions: Question[] = [
    { id: 'q1', type: 'multiple-choice', question: 'Q1', correctAnswer: 'A', points: 1 },
    { id: 'q2', type: 'multiple-choice', question: 'Q2', correctAnswer: 'B', points: 1 },
    { id: 'q3', type: 'multiple-choice', question: 'Q3', correctAnswer: 'C', points: 1 },
  ]

  test('should shuffle questions deterministically', () => {
    const shuffle1 = shuffleQuestions(questions, 'student-123', 'attempt-456')
    const shuffle2 = shuffleQuestions(questions, 'student-123', 'attempt-456')

    expect(shuffle1.map(q => q.id)).toEqual(shuffle2.map(q => q.id))
  })

  test('should contain all original questions', () => {
    const shuffled = shuffleQuestions(questions, 'student-123', 'attempt-456')

    expect(shuffled).toHaveLength(questions.length)
    expect(shuffled.map(q => q.id).sort()).toEqual(['q1', 'q2', 'q3'])
  })
})

describe('prepareQuestionsForStudent', () => {
  const questions: Question[] = [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is 1+1?',
      options: ['1', '2', '3', '4'],
      correctAnswer: '2',
      points: 1
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What is 2+2?',
      options: ['2', '3', '4', '5'],
      correctAnswer: '4',
      points: 1
    }
  ]

  test('should shuffle both questions and options when both enabled', () => {
    const prepared = prepareQuestionsForStudent(
      questions,
      true,  // shuffle questions
      true,  // shuffle options
      'student-123',
      'attempt-456'
    )

    expect(prepared).toHaveLength(2)
    expect(prepared[0]._originalOptions).toBeDefined()
    expect(prepared[1]._originalOptions).toBeDefined()
  })

  test('should only shuffle questions when shuffleOptions is false', () => {
    const prepared = prepareQuestionsForStudent(
      questions,
      true,  // shuffle questions
      false, // don't shuffle options
      'student-123',
      'attempt-456'
    )

    expect(prepared).toHaveLength(2)
    expect(prepared[0]._originalOptions).toBeUndefined()
  })

  test('should only shuffle options when randomizeQuestions is false', () => {
    const prepared = prepareQuestionsForStudent(
      questions,
      false, // don't shuffle questions
      true,  // shuffle options
      'student-123',
      'attempt-456'
    )

    expect(prepared).toHaveLength(2)
    expect(prepared[0].id).toBe('q1') // Questions in original order
    expect(prepared[1].id).toBe('q2')
    expect(prepared[0]._originalOptions).toBeDefined() // But options shuffled
  })

  test('should not shuffle anything when both disabled', () => {
    const prepared = prepareQuestionsForStudent(
      questions,
      false, // don't shuffle questions
      false, // don't shuffle options
      'student-123',
      'attempt-456'
    )

    expect(prepared[0].id).toBe('q1')
    expect(prepared[1].id).toBe('q2')
    expect(prepared[0].options).toEqual(['1', '2', '3', '4'])
    expect(prepared[1].options).toEqual(['2', '3', '4', '5'])
  })
})

describe('verifyShuffleReproducibility', () => {
  test('should verify shuffle is reproducible', () => {
    const array = ['A', 'B', 'C', 'D', 'E']
    const seed = 'test-seed'

    const isReproducible = verifyShuffleReproducibility(array, seed, 100)

    expect(isReproducible).toBe(true)
  })
})

describe('generateShuffleSeed', () => {
  test('should generate seed from components', () => {
    const seed = generateShuffleSeed('question-1', 'student-123', 'attempt-456')

    expect(seed).toBe('question-1-student-123-attempt-456')
  })

  test('should filter out falsy values', () => {
    const seed = generateShuffleSeed('question-1', '', 'attempt-456')

    expect(seed).toBe('question-1-attempt-456')
  })
})
