export type Language = "en" | "km"

export interface Translation {
  // Navigation & Common
  dashboard: string
  categories: string
  quizzes: string
  myResults: string
  allResults: string
  logout: string
  login: string
  welcome: string
  search: string
  filter: string
  save: string
  cancel: string
  delete: string
  edit: string
  create: string
  submit: string
  back: string
  next: string
  previous: string

  // Quiz specific
  quiz: string
  question: string
  questions: string
  answer: string
  answers: string
  score: string
  timeLimit: string
  attempts: string
  startQuiz: string
  submitQuiz: string
  reviewAnswers: string
  correctAnswer: string
  yourAnswer: string

  // Roles
  admin: string
  teacher: string
  student: string
  parent: string

  // Curriculum
  grade: string
  subject: string
  nationalExam: string

  // Question types
  multipleChoice: string
  multipleSelect: string
  trueFalse: string
  shortAnswer: string
  fillBlanks: string
  dragDrop: string
  matching: string
  ordering: string
  essay: string
  imageChoice: string
  hotspot: string
}

export const translations: Record<Language, Translation> = {
  en: {
    dashboard: "Dashboard",
    categories: "Categories",
    quizzes: "Quizzes",
    myResults: "My Results",
    allResults: "All Results",
    logout: "Logout",
    login: "Login",
    welcome: "Welcome",
    search: "Search",
    filter: "Filter",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    submit: "Submit",
    back: "Back",
    next: "Next",
    previous: "Previous",

    quiz: "Quiz",
    question: "Question",
    questions: "Questions",
    answer: "Answer",
    answers: "Answers",
    score: "Score",
    timeLimit: "Time Limit",
    attempts: "Attempts",
    startQuiz: "Start Quiz",
    submitQuiz: "Submit Quiz",
    reviewAnswers: "Review Answers",
    correctAnswer: "Correct Answer",
    yourAnswer: "Your Answer",

    admin: "Admin",
    teacher: "Teacher",
    student: "Student",
    parent: "Parent",

    grade: "Grade",
    subject: "Subject",
    nationalExam: "National Exam",

    multipleChoice: "Multiple Choice",
    multipleSelect: "Multiple Select",
    trueFalse: "True/False",
    shortAnswer: "Short Answer",
    fillBlanks: "Fill in the Blanks",
    dragDrop: "Drag & Drop",
    matching: "Matching",
    ordering: "Ordering",
    essay: "Essay",
    imageChoice: "Image Choice",
    hotspot: "Hotspot",
  },
  km: {
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    categories: "ប្រភេទ",
    quizzes: "តេស្ត",
    myResults: "លទ្ធផលរបស់ខ្ញុំ",
    allResults: "លទ្ធផលទាំងអស់",
    logout: "ចាកចេញ",
    login: "ចូល",
    welcome: "សូមស្វាគមន៍",
    search: "ស្វែងរក",
    filter: "តម្រង",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    delete: "លុប",
    edit: "កែសម្រួល",
    create: "បង្កើត",
    submit: "ដាក់ស្នើ",
    back: "ត្រលប់ក្រោយ",
    next: "បន្ទាប់",
    previous: "មុន",

    quiz: "តេស្ត",
    question: "សំណួរ",
    questions: "សំណួរ",
    answer: "ចម្លើយ",
    answers: "ចម្លើយ",
    score: "ពិន្ទុ",
    timeLimit: "ពេលវេលាកំណត់",
    attempts: "ចំនួនដង",
    startQuiz: "ចាប់ផ្តើមតេស្ត",
    submitQuiz: "ដាក់ស្នើតេស្ត",
    reviewAnswers: "ពិនិត្យចម្លើយ",
    correctAnswer: "ចម្លើយត្រឹមត្រូវ",
    yourAnswer: "ចម្លើយរបស់អ្នក",

    admin: "អ្នកគ្រប់គ្រង",
    teacher: "គ្រូ",
    student: "សិស្ស",
    parent: "មាតាបិតា",

    grade: "ថ្នាក់",
    subject: "មុខវិជ្ជា",
    nationalExam: "ប្រឡងជាតិ",

    multipleChoice: "ជម្រើសច្រើន",
    multipleSelect: "ជម្រើសច្រើន (ចម្លើយច្រើន)",
    trueFalse: "ពិត/មិនពិត",
    shortAnswer: "ចម្លើយខ្លី",
    fillBlanks: "បំពេញចន្លោះ",
    dragDrop: "អូស និង ទម្លាក់",
    matching: "ផ្គូផ្គង",
    ordering: "តម្រៀបតាមលំដាប់",
    essay: "សន្និដ្ឋាន",
    imageChoice: "ជ្រើសរើសរូបភាព",
    hotspot: "ចុចលើចំណុច",
  },
}

// Cambodian curriculum subjects
export const cambodianSubjects = [
  { id: "khmer", nameEn: "Khmer Literature", nameKm: "អក្សរសាស្ត្រខ្មែរ" },
  { id: "math", nameEn: "Mathematics", nameKm: "គណិតវិទ្យា" },
  { id: "physics", nameEn: "Physics", nameKm: "រូបវិទ្យា" },
  { id: "chemistry", nameEn: "Chemistry", nameKm: "គីមីវិទ្យា" },
  { id: "biology", nameEn: "Biology", nameKm: "ជីវវិទ្យា" },
  { id: "history", nameEn: "History", nameKm: "ប្រវត្តិសាស្ត្រ" },
  { id: "geography", nameEn: "Geography", nameKm: "ភូមិសាស្ត្រ" },
  { id: "english", nameEn: "English", nameKm: "អង់គ្លេស" },
  { id: "french", nameEn: "French", nameKm: "បារាំង" },
  { id: "chinese", nameEn: "Chinese", nameKm: "ចិន" },
  { id: "civic", nameEn: "Civic Education", nameKm: "សីលធម៌-ពលរដ្ឋ" },
  { id: "economics", nameEn: "Economics", nameKm: "សេដ្ឋកិច្ច" },
]

// Grade levels in Cambodian education
export const gradelevels = [
  { id: "grade7", nameEn: "Grade 7", nameKm: "ថ្នាក់ទី៧" },
  { id: "grade8", nameEn: "Grade 8", nameKm: "ថ្នាក់ទី៨" },
  { id: "grade9", nameEn: "Grade 9", nameKm: "ថ្នាក់ទី៩" },
  { id: "grade10", nameEn: "Grade 10", nameKm: "ថ្នាក់ទី១០" },
  { id: "grade11", nameEn: "Grade 11", nameKm: "ថ្នាក់ទី១១" },
  { id: "grade12", nameEn: "Grade 12", nameKm: "ថ្នាក់ទី១២" },
]

// National exam types
export const examTypes = [
  { id: "regular", nameEn: "Regular Quiz", nameKm: "តេស្តធម្មតា" },
  { id: "grade9", nameEn: "Grade 9 Exam Prep", nameKm: "រៀបចំប្រឡងថ្នាក់ទី៩" },
  { id: "grade12", nameEn: "Grade 12 Baccalaureate Prep", nameKm: "រៀបចំប្រឡងបាក់ឌុប" },
]
