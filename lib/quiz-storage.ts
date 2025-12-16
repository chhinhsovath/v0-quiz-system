import type { Quiz, Category, QuizAttempt, School, Class, User, QuestionBank, Certificate } from "./quiz-types"

const STORAGE_KEYS = {
  QUIZZES: "quiz_system_quizzes",
  CATEGORIES: "quiz_system_categories",
  ATTEMPTS: "quiz_system_attempts",
  SCHOOLS: "quiz_system_schools",
  CLASSES: "quiz_system_classes",
  USERS: "quiz_system_users",
  QUESTION_BANKS: "quiz_system_question_banks",
  CERTIFICATES: "quiz_system_certificates",
}

export const quizStorage = {
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : []
  },

  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  addCategory: (category: Category) => {
    const categories = quizStorage.getCategories()
    categories.push(category)
    quizStorage.saveCategories(categories)
  },

  updateCategory: (id: string, updates: Partial<Category>) => {
    const categories = quizStorage.getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      quizStorage.saveCategories(categories)
    }
  },

  deleteCategory: (id: string) => {
    const categories = quizStorage.getCategories().filter((c) => c.id !== id)
    quizStorage.saveCategories(categories)
  },

  // Quizzes
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES)
    return data ? JSON.parse(data) : []
  },

  saveQuizzes: (quizzes: Quiz[]) => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes))
  },

  addQuiz: (quiz: Quiz) => {
    const quizzes = quizStorage.getQuizzes()
    quizzes.push(quiz)
    quizStorage.saveQuizzes(quizzes)
  },

  updateQuiz: (id: string, updates: Partial<Quiz>) => {
    const quizzes = quizStorage.getQuizzes()
    const index = quizzes.findIndex((q) => q.id === id)
    if (index !== -1) {
      quizzes[index] = { ...quizzes[index], ...updates }
      quizStorage.saveQuizzes(quizzes)
    }
  },

  deleteQuiz: (id: string) => {
    const quizzes = quizStorage.getQuizzes().filter((q) => q.id !== id)
    quizStorage.saveQuizzes(quizzes)
  },

  getQuizById: (id: string): Quiz | undefined => {
    return quizStorage.getQuizzes().find((q) => q.id === id)
  },

  // Attempts
  getAttempts: (): QuizAttempt[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS)
    return data ? JSON.parse(data) : []
  },

  saveAttempts: (attempts: QuizAttempt[]) => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts))
  },

  addAttempt: (attempt: QuizAttempt) => {
    const attempts = quizStorage.getAttempts()
    attempts.push(attempt)
    quizStorage.saveAttempts(attempts)
  },

  getUserAttempts: (userId: string): QuizAttempt[] => {
    return quizStorage.getAttempts().filter((a) => a.userId === userId)
  },

  getQuizAttempts: (quizId: string, userId: string): QuizAttempt[] => {
    return quizStorage.getAttempts().filter((a) => a.quizId === quizId && a.userId === userId)
  },

  getSchools: (): School[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SCHOOLS)
    return data ? JSON.parse(data) : []
  },

  saveSchools: (schools: School[]) => {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools))
  },

  addSchool: (school: School) => {
    const schools = quizStorage.getSchools()
    schools.push(school)
    quizStorage.saveSchools(schools)
  },

  updateSchool: (id: string, updates: Partial<School>) => {
    const schools = quizStorage.getSchools()
    const index = schools.findIndex((s) => s.id === id)
    if (index !== -1) {
      schools[index] = { ...schools[index], ...updates }
      quizStorage.saveSchools(schools)
    }
  },

  deleteSchool: (id: string) => {
    const schools = quizStorage.getSchools().filter((s) => s.id !== id)
    quizStorage.saveSchools(schools)
  },

  // Classes
  getClasses: (): Class[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES)
    return data ? JSON.parse(data) : []
  },

  saveClasses: (classes: Class[]) => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes))
  },

  addClass: (classItem: Class) => {
    const classes = quizStorage.getClasses()
    classes.push(classItem)
    quizStorage.saveClasses(classes)
  },

  updateClass: (id: string, updates: Partial<Class>) => {
    const classes = quizStorage.getClasses()
    const index = classes.findIndex((c) => c.id === id)
    if (index !== -1) {
      classes[index] = { ...classes[index], ...updates }
      quizStorage.saveClasses(classes)
    }
  },

  deleteClass: (id: string) => {
    const classes = quizStorage.getClasses().filter((c) => c.id !== id)
    quizStorage.saveClasses(classes)
  },

  getClassesBySchool: (schoolId: string): Class[] => {
    return quizStorage.getClasses().filter((c) => c.schoolId === schoolId)
  },

  getClassesByTeacher: (teacherId: string): Class[] => {
    return quizStorage.getClasses().filter((c) => c.teacherId === teacherId)
  },

  // Users (enhanced)
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    if (data) {
      return JSON.parse(data)
    }

    // Create default users if none exist
    const defaultUsers: User[] = [
      {
        id: "1",
        email: "admin@quiz.com",
        role: "admin",
        name: "Admin User",
        nameKm: "អ្នកគ្រប់គ្រង",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        email: "teacher@quiz.com",
        role: "teacher",
        name: "Teacher Demo",
        nameKm: "គ្រូសាកល្បង",
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        email: "student@quiz.com",
        role: "student",
        name: "Student Demo",
        nameKm: "សិស្សសាកល្បង",
        createdAt: new Date().toISOString(),
      },
      {
        id: "4",
        email: "parent@quiz.com",
        role: "parent",
        name: "Parent Demo",
        nameKm: "មាតាបិតាសាកល្បង",
        childrenIds: ["3"],
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers))
    return defaultUsers
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  addUser: (user: User) => {
    const users = quizStorage.getUsers()
    users.push(user)
    quizStorage.saveUsers(users)
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const users = quizStorage.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      quizStorage.saveUsers(users)
    }
  },

  getUsersBySchool: (schoolId: string): User[] => {
    return quizStorage.getUsers().filter((u) => u.schoolId === schoolId)
  },

  getUsersByRole: (role: string): User[] => {
    return quizStorage.getUsers().filter((u) => u.role === role)
  },

  // Question Banks
  getQuestionBanks: (): QuestionBank[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTION_BANKS)
    return data ? JSON.parse(data) : []
  },

  saveQuestionBanks: (banks: QuestionBank[]) => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks))
  },

  addQuestionBank: (bank: QuestionBank) => {
    const banks = quizStorage.getQuestionBanks()
    banks.push(bank)
    quizStorage.saveQuestionBanks(banks)
  },

  updateQuestionBank: (id: string, updates: Partial<QuestionBank>) => {
    const banks = quizStorage.getQuestionBanks()
    const index = banks.findIndex((b) => b.id === id)
    if (index !== -1) {
      banks[index] = { ...banks[index], ...updates }
      quizStorage.saveQuestionBanks(banks)
    }
  },

  deleteQuestionBank: (id: string) => {
    const banks = quizStorage.getQuestionBanks().filter((b) => b.id !== id)
    quizStorage.saveQuestionBanks(banks)
  },

  // Certificates
  getCertificates: (): Certificate[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES)
    return data ? JSON.parse(data) : []
  },

  saveCertificates: (certificates: Certificate[]) => {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates))
  },

  addCertificate: (certificate: Certificate) => {
    const certificates = quizStorage.getCertificates()
    certificates.push(certificate)
    quizStorage.saveCertificates(certificates)
  },

  getUserCertificates: (userId: string): Certificate[] => {
    return quizStorage.getCertificates().filter((c) => c.userId === userId)
  },
}
