import { quizStorage } from "@/lib/quiz-storage"
import type { QuestionBank, Question } from "@/lib/quiz-types"

// Math Question Bank - 25 Questions
const mathQuestions: Question[] = [
  // Grade 1-3 - Basic Math
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is 5 + 3?",
    questionKm: "៥ + ៣ = ?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is 10 - 4?",
    questionKm: "១០ - ៤ = ?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "2 + 2 = 4",
    questionKm: "២ + ២ = ៤",
    correctAnswer: "true",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "How many sides does a triangle have?",
    questionKm: "ត្រីកោណមានចំនួនជ្រុងប៉ុន្មាន?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "3 × 2 = ___",
    questionKm: "៣ × ២ = ___",
    correctAnswer: "6",
    points: 1,
  },
  // Grade 4-6 - Intermediate Math
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is 12 × 5?",
    questionKm: "១២ × ៥ = ?",
    options: ["50", "55", "60", "65"],
    correctAnswer: "60",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is 48 ÷ 6?",
    questionKm: "៤៨ ÷ ៦ = ?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "The area of a rectangle with length 8 and width 5 is ___",
    questionKm: "ផ្ទៃក្រឡាចតុកោណកែងដែលមានប្រវែង ៨ និងទទឹង ៥ គឺ ___",
    correctAnswer: "40",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is the perimeter of a square with side 7?",
    questionKm: "តើចតុកោណកែងដែលមានជ្រុងវែង ៧ មានបរិវែណប៉ុន្មាន?",
    options: ["14", "21", "28", "35"],
    correctAnswer: "28",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "A prime number has exactly 2 factors",
    questionKm: "ចំនួនគត់ដែលមានកត្តា ២ គត់ គឺជាចំនួនបឋម",
    correctAnswer: "true",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-select",
    question: "Which of these are even numbers?",
    questionKm: "តើចំនួនណាខាងក្រោមនេះជាចំនួនគូ?",
    options: ["12", "15", "18", "23", "24"],
    correctAnswer: ["12", "18", "24"],
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "matching",
    question: "Match the fractions to their decimal equivalents",
    questionKm: "ផ្គូផ្គងប្រភាគទៅនឹងចំនួនទសភាគ",
    pairs: [
      { left: "1/2", right: "0.5" },
      { left: "1/4", right: "0.25" },
      { left: "3/4", right: "0.75" },
      { left: "1/10", right: "0.1" },
    ],
    correctAnswer: "auto-generated",
    points: 3,
  },
  // Grade 7-9 - Advanced Math
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is the value of x in: 2x + 5 = 15?",
    questionKm: "តើតម្លៃ x ក្នុងសមីការ ២x + ៥ = ១៥ គឺប៉ុន្មាន?",
    options: ["3", "5", "7", "10"],
    correctAnswer: "5",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "The square root of 64 is ___",
    questionKm: "ឫសការ៉េនៃ ៦៤ គឺ ___",
    correctAnswer: "8",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is 15% of 200?",
    questionKm: "១៥% នៃ ២០០ គឺប៉ុន្មាន?",
    options: ["20", "25", "30", "35"],
    correctAnswer: "30",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "ordering",
    question: "Arrange these operations in order (following PEMDAS)",
    questionKm: "រៀបចំប្រតិបត្តិការទាំងនេះតាមលំដាប់",
    options: ["Parentheses", "Exponents", "Multiplication/Division", "Addition/Subtraction"],
    optionsKm: ["វង់ក្រចក", "និទស្សន្ត", "គុណ/ចែក", "បូក/ដក"],
    correctAnswer: ["Parentheses", "Exponents", "Multiplication/Division", "Addition/Subtraction"],
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "The sum of angles in a triangle is 180 degrees",
    questionKm: "ផលបូកមុំទាំង ៣ របស់ត្រីកោណគឺ ១៨០ ដឺក្រេ",
    correctAnswer: "true",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is the formula for the area of a circle?",
    questionKm: "តើរូបមន្តគណនាផ្ទៃរង្វង់គឺយ៉ាងណា?",
    options: ["πr", "2πr", "πr²", "2πr²"],
    correctAnswer: "πr²",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "If a = 3 and b = 4, then a² + b² = ___",
    questionKm: "ប្រសិនបើ a = ៣ និង b = ៤ នោះ a² + b² = ___",
    correctAnswer: "25",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-select",
    question: "Which of these are prime numbers?",
    questionKm: "តើចំនួនណាខាងក្រោមនេះជាចំនួនបឋម?",
    options: ["7", "9", "11", "15", "17"],
    correctAnswer: ["7", "11", "17"],
    points: 3,
  },
  // Grade 10-12 - High School Math
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is the derivative of x²?",
    questionKm: "អនុគមន៍នៃ x² គឺ?",
    options: ["x", "2x", "x²", "2x²"],
    correctAnswer: "2x",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "The slope of a horizontal line is 0",
    questionKm: "ជម្រាលនៃបន្ទាត់ផ្តេកគឺ ០",
    correctAnswer: "true",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is sin(90°)?",
    questionKm: "sin(៩០°) = ?",
    options: ["0", "0.5", "1", "√2/2"],
    correctAnswer: "1",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "The quadratic formula is x = (-b ± √(b²-4ac)) / ___",
    questionKm: "រូបមន្តក្វាដ្រាទិក x = (-b ± √(b²-4ac)) / ___",
    correctAnswer: "2a",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "What is log₁₀(100)?",
    questionKm: "log₁₀(១០០) = ?",
    options: ["1", "2", "10", "100"],
    correctAnswer: "2",
    points: 3,
  },
]

// Khmer Language Question Bank - 25 Questions
const khmerQuestions: Question[] = [
  // Grade 1-3 - Basic Khmer
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "ក ខ គ ឃ ង ជា?",
    questionKm: "ក ខ គ ឃ ង ជា?",
    options: ["ព្យញ្ជនៈ", "ស្រៈ", "ពាក្យ", "ប្រយោគ"],
    correctAnswer: "ព្យញ្ជនៈ",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "ពាក្យ 'ផ្កា' មានអក្សរប៉ុន្មាន?",
    questionKm: "ពាក្យ 'ផ្កា' មានអក្សរប៉ុន្មាន?",
    options: ["១", "២", "៣", "៤"],
    correctAnswer: "២",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "អ ា ិ ី ឹ ឺ ុ ូ ួ ើ ឿ ៀ េ ែ ៃ ោ ៅ ជាស្រៈ",
    questionKm: "អ ា ិ ី ឹ ឺ ុ ូ ួ ើ ឿ ៀ េ ែ ៃ ោ ៅ ជាស្រៈ",
    correctAnswer: "true",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "មាតា + បិតា = ___",
    questionKm: "មាតា + បិតា = ___",
    correctAnswer: "ឪពុកម្តាយ",
    points: 1,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើពាក្យណាជាកិរិយាសព្ទ?",
    questionKm: "តើពាក្យណាជាកិរិយាសព្ទ?",
    options: ["ស្រស់", "ស្អាត", "រត់", "ខ្ពស់"],
    correctAnswer: "រត់",
    points: 1,
  },
  // Grade 4-6 - Intermediate Khmer
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើពាក្យណាខាងក្រោមនេះប្រើត្រឹមត្រូវ?",
    questionKm: "តើពាក្យណាខាងក្រោមនេះប្រើត្រឹមត្រូវ?",
    options: ["ខ្ញុំទៅផ្សារ", "ខ្ញុំ ទៅ ផ្សារ", "ខ្ញុំទៅ ផ្សារ", "ខ្ញុំ ទៅផ្សារ"],
    correctAnswer: "ខ្ញុំទៅផ្សារ",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "ពាក្យប្រថុយនៃ 'ស្អាត' គឺ ___",
    questionKm: "ពាក្យប្រថុយនៃ 'ស្អាត' គឺ ___",
    correctAnswer: "អាក្រក់",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-select",
    question: "តើពាក្យណាខ្លះជានាមសព្ទ?",
    questionKm: "តើពាក្យណាខ្លះជានាមសព្ទ?",
    options: ["សៀវភៅ", "រត់", "តុ", "ស្អាត", "មេឃ"],
    correctAnswer: ["សៀវភៅ", "តុ", "មេឃ"],
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "គុណនាមគឺជាពាក្យដែលបញ្ជាក់លក្ខណៈនៃនាមសព្ទ",
    questionKm: "គុណនាមគឺជាពាក្យដែលបញ្ជាក់លក្ខណៈនៃនាមសព្ទ",
    correctAnswer: "true",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "matching",
    question: "ផ្គូផ្គងពាក្យទៅនឹងប្រភេទពាក្យ",
    questionKm: "ផ្គូផ្គងពាក្យទៅនឹងប្រភេទពាក្យ",
    pairs: [
      { left: "រត់", right: "កិរិយាសព្ទ" },
      { left: "សៀវភៅ", right: "នាមសព្ទ" },
      { left: "ស្អាត", right: "គុណនាម" },
      { left: "យ៉ាងឆាប់", right: "ក្រិយាវិសេសន៍" },
    ],
    correctAnswer: "auto-generated",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើប្រយោគណាត្រឹមត្រូវ?",
    questionKm: "តើប្រយោគណាត្រឹមត្រូវ?",
    options: [
      "កូនរបស់ខ្ញុំរៀនសូត្រ",
      "របស់ខ្ញុំកូនរៀនសូត្រ",
      "រៀនសូត្រកូនរបស់ខ្ញុំ",
      "ខ្ញុំរបស់កូនរៀនសូត្រ"
    ],
    correctAnswer: "កូនរបស់ខ្ញុំរៀនសូត្រ",
    points: 2,
  },
  // Grade 7-9 - Advanced Khmer
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើពាក្យ 'អធិបតេយ្យ' មានន័យយ៉ាងណា?",
    questionKm: "តើពាក្យ 'អធិបតេយ្យ' មានន័យយ៉ាងណា?",
    options: ["អំណាច", "សេរីភាព", "អធិបតេយ្យភាព", "គោរព"],
    correctAnswer: "អធិបតេយ្យភាព",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "ពាក្យសព្ទសំស្ក្រឹតនៃ 'អធិបតេយ្យ' គឺ ___",
    questionKm: "ពាក្យសព្ទសំស្ក្រឹតនៃ 'អធិបតេយ្យ' គឺ ___",
    correctAnswer: "សេរីភាព",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "ប្រយោគសមាស គឺជាប្រយោគដែលមានប្រធានមួយ និងកិរិយាមួយ",
    questionKm: "ប្រយោគសមាស គឺជាប្រយោគដែលមានប្រធានមួយ និងកិរិយាមួយ",
    correctAnswer: "false",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-select",
    question: "តើប្រយោគណាខ្លះជាប្រយោគសមាស?",
    questionKm: "តើប្រយោគណាខ្លះជាប្រយោគសមាស?",
    options: [
      "ខ្ញុំរៀន",
      "ខ្ញុំរៀន ហើយគាត់លេង",
      "កូនរៀនសូត្រ",
      "គាត់ញ៉ាំបាយ ដោយសារតែឃ្លាន",
      "មេឃភ្លៀង"
    ],
    correctAnswer: ["ខ្ញុំរៀន ហើយគាត់លេង", "គាត់ញ៉ាំបាយ ដោយសារតែឃ្លាន"],
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើ 'បុព្វបទ' មានមុខងារអ្វី?",
    questionKm: "តើ 'បុព្វបទ' មានមុខងារអ្វី?",
    options: [
      "បញ្ជាក់អត្ថន័យ",
      "តភ្ជាប់ពាក្យ",
      "បង្ហាញទីតាំង ពេលវេលា ឬទិសដៅ",
      "បង្ហាញអារម្មណ៍"
    ],
    correctAnswer: "បង្ហាញទីតាំង ពេលវេលា ឬទិសដៅ",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "ordering",
    question: "រៀបចំប្រយោគឱ្យបានត្រឹមត្រូវ (Arrange the sentence correctly)",
    questionKm: "រៀបចំប្រយោគឱ្យបានត្រឹមត្រូវ",
    options: ["ខ្ញុំ", "ទៅ", "រៀនសូត្រ", "នៅសាលា"],
    optionsKm: ["ខ្ញុំ", "ទៅ", "រៀនសូត្រ", "នៅសាលា"],
    correctAnswer: ["ខ្ញុំ", "ទៅ", "រៀនសូត្រ", "នៅសាលា"],
    points: 3,
  },
  // Grade 10-12 - Literature & Advanced Grammar
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើ 'រាមកេរ្តិ៍' គឺជាអ្វី?",
    questionKm: "តើ 'រាមកេរ្តិ៍' គឺជាអ្វី?",
    options: ["រឿងព្រេងខ្មែរ", "រឿងព្រេងឥណ្ឌា", "កំណាព្យខ្មែរ", "ប្រវត្តិសាស្រ្ត"],
    correctAnswer: "កំណាព្យខ្មែរ",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "អ្នកនិពន្ធរាមកេរ្តិ៍ គឺ ___",
    questionKm: "អ្នកនិពន្ធរាមកេរ្តិ៍ គឺ ___",
    correctAnswer: "ព្រះចន្ទ",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "កំណាព្យភ្លើងក៏មានឈ្មោះថា 'កាព្យប្រផេះ'",
    questionKm: "កំណាព្យភ្លើងក៏មានឈ្មោះថា 'កាព្យប្រផេះ'",
    correctAnswer: "false",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-select",
    question: "តើអ្វីខ្លះជាប្រភេទកំណាព្យខ្មែរ?",
    questionKm: "តើអ្វីខ្លះជាប្រភេទកំណាព្យខ្មែរ?",
    options: ["កាព្យបុរាណ", "កាព្យកាកី", "កាព្យភ្លើង", "កាព្យបច្ចុប្បន្ន", "កាព្យព្រាវ"],
    correctAnswer: ["កាព្យបុរាណ", "កាព្យកាកី", "កាព្យភ្លើង"],
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើ 'ពាក្យស័ព្ទថាយ' មានន័យយ៉ាងណា?",
    questionKm: "តើ 'ពាក្យស័ព្ទថាយ' មានន័យយ៉ាងណា?",
    options: [
      "ពាក្យឈ្មោះថ្មី",
      "ពាក្យឈ្មោះចាស់",
      "ពាក្យស័ព្ទដែលរំលងមកពីភាសាបរទេស",
      "ពាក្យសំស្ក្រឹត"
    ],
    correctAnswer: "ពាក្យស័ព្ទដែលរំលងមកពីភាសាបរទេស",
    points: 3,
  },
  {
    id: crypto.randomUUID(),
    type: "fill-blank",
    question: "កំណាព្យដែលមានបន្ទាត់ ៤ ហៅថា ___",
    questionKm: "កំណាព្យដែលមានបន្ទាត់ ៤ ហៅថា ___",
    correctAnswer: "កាព្យបួន",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "true-false",
    question: "ភាសាខ្មែរមានប្រភពមកពីភាសាសំស្ក្រឹត",
    questionKm: "ភាសាខ្មែរមានប្រភពមកពីភាសាសំស្ក្រឹត",
    correctAnswer: "false",
    points: 2,
  },
  {
    id: crypto.randomUUID(),
    type: "multiple-choice",
    question: "តើ 'អក្សរស័ព្ទខ្មែរ' មានប៉ុន្មានអក្សរ?",
    questionKm: "តើ 'អក្សរស័ព្ទខ្មែរ' មានប៉ុន្មានអក្សរ?",
    options: ["៣៣", "៣៥", "៧៤", "២៣"],
    correctAnswer: "៣៣",
    points: 2,
  },
]

const mathQuestionBank: QuestionBank = {
  id: crypto.randomUUID(),
  name: "Mathematics Question Bank",
  nameKm: "ធនាគារសំណួរគណិតវិទ្យា",
  description: "Comprehensive math questions covering grades 1-12, including arithmetic, algebra, geometry, and calculus",
  descriptionKm: "សំណួរគណិតវិទ្យាទូលំទូលាយសម្រាប់ថ្នាក់ទី១ដល់១២ រួមមានសព្វនព្វ វិជ្ជាវិមាត្រ ធរណីមាត្រ និងគណនាវិទ្យា",
  subject: "Mathematics",
  gradeLevel: "Mixed (1-12)",
  questions: mathQuestions,
  createdBy: "00000000-0000-0000-0000-000000000001", // Admin user
}

const khmerQuestionBank: QuestionBank = {
  id: crypto.randomUUID(),
  name: "Khmer Language Question Bank",
  nameKm: "ធនាគារសំណួរភាសាខ្មែរ",
  description: "Comprehensive Khmer language questions covering grammar, vocabulary, literature, and composition for grades 1-12",
  descriptionKm: "សំណួរភាសាខ្មែរទូលំទូលាយរួមមានវេយ្យាករណ៍ វាក្យសព្ទ អក្សរសាស្ត្រ និងនិពន្ធសម្រាប់ថ្នាក់ទី១ដល់១២",
  subject: "Khmer Language",
  gradeLevel: "Mixed (1-12)",
  questions: khmerQuestions,
  createdBy: "00000000-0000-0000-0000-000000000001", // Admin user
}

export async function seedQuestionBanks() {
  console.log("🌱 Seeding Question Banks...")

  try {
    // Add Math Question Bank
    await quizStorage.addQuestionBank(mathQuestionBank)
    console.log(`✅ Created Math Question Bank with ${mathQuestions.length} questions`)

    // Add Khmer Question Bank
    await quizStorage.addQuestionBank(khmerQuestionBank)
    console.log(`✅ Created Khmer Question Bank with ${khmerQuestions.length} questions`)

    console.log("🎉 Question Banks seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding question banks:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedQuestionBanks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
