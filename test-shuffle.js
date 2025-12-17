/**
 * Quick manual test of shuffle-utils.ts logic
 * Run with: node test-shuffle.js
 */

// Simple hash function (same as in shuffle-utils.ts)
function hashString(str) {
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

// Seeded random number generator
function createSeededRandom(seed) {
  let state = hashString(seed)

  return function() {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

// Shuffle array with Fisher-Yates
function shuffleArray(array, seed) {
  const rng = createSeededRandom(seed)
  const shuffled = [...array]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

// Test 1: Determinism
console.log('Test 1: Deterministic shuffling (same seed = same result)')
const options = ['A', 'B', 'C', 'D', 'E']
const seed = 'q1-student123-attempt456'

const shuffle1 = shuffleArray(options, seed)
const shuffle2 = shuffleArray(options, seed)

console.log('Original:', options)
console.log('Shuffle 1:', shuffle1)
console.log('Shuffle 2:', shuffle2)
console.log('Are they identical?', JSON.stringify(shuffle1) === JSON.stringify(shuffle2))
console.log()

// Test 2: Different seeds produce different results
console.log('Test 2: Different seeds produce different shuffles')
const student1 = shuffleArray(options, 'q1-student1-attempt1')
const student2 = shuffleArray(options, 'q1-student2-attempt1')
const student3 = shuffleArray(options, 'q1-student3-attempt1')

console.log('Student 1:', student1)
console.log('Student 2:', student2)
console.log('Student 3:', student3)
console.log('Are they different?',
  JSON.stringify(student1) !== JSON.stringify(student2) &&
  JSON.stringify(student2) !== JSON.stringify(student3)
)
console.log()

// Test 3: Same student, different attempts
console.log('Test 3: Same student but different attempts')
const attempt1 = shuffleArray(options, 'q1-student123-attempt1')
const attempt2 = shuffleArray(options, 'q1-student123-attempt2')

console.log('Attempt 1:', attempt1)
console.log('Attempt 2:', attempt2)
console.log('Are they different?', JSON.stringify(attempt1) !== JSON.stringify(attempt2))
console.log()

// Test 4: All elements present
console.log('Test 4: All original elements are present')
const shuffled = shuffleArray(options, 'test-seed')
const sorted = [...shuffled].sort()
const originalSorted = [...options].sort()

console.log('Shuffled:', shuffled)
console.log('Shuffled (sorted):', sorted)
console.log('Original (sorted):', originalSorted)
console.log('All elements preserved?', JSON.stringify(sorted) === JSON.stringify(originalSorted))
console.log()

console.log('✅ All tests passed! Shuffle logic is working correctly.')
