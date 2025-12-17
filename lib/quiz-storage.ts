import { supabase } from './supabase'
import type { Quiz, Category, QuizAttempt, School, Class, User, QuestionBank, Certificate } from "./quiz-types"

/**
 * Supabase-powered storage for Quiz System
 * This replaces localStorage with a real database backend
 */

export const quizStorage = {
  // ==================== CATEGORIES ====================
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      nameKm: cat.name_km,
      description: cat.description,
      descriptionKm: cat.description_km,
      icon: cat.icon
    }))
  },

  saveCategories: async (categories: Category[]) => {
    // Not needed with Supabase - use add/update/delete instead
    console.warn('saveCategories is deprecated with Supabase')
  },

  addCategory: async (category: Partial<Category>) => {
    const insertData: any = {
      name: category.name,
      name_km: category.nameKm,
      description: category.description,
      description_km: category.descriptionKm,
      icon: category.icon
    }

    // Only include ID if it's provided (for backwards compatibility)
    if (category.id) {
      insertData.id = category.id
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error adding category:', error)
      throw error
    }

    return data ? {
      id: data.id,
      name: data.name,
      nameKm: data.name_km,
      description: data.description,
      descriptionKm: data.description_km,
      icon: data.icon
    } : null
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.nameKm !== undefined) updateData.name_km = updates.nameKm
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.descriptionKm !== undefined) updateData.description_km = updates.descriptionKm
    if (updates.icon !== undefined) updateData.icon = updates.icon

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  deleteCategory: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },

  // ==================== QUIZZES ====================
  getQuizzes: async (): Promise<Quiz[]> => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quizzes:', error)
      return []
    }

    return (data || []).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      titleKm: quiz.title_km,
      description: quiz.description,
      descriptionKm: quiz.description_km,
      categoryId: quiz.category_id,
      createdBy: quiz.created_by,
      gradeLevel: quiz.grade_level,
      subject: quiz.subject,
      examType: quiz.exam_type,
      passingScore: quiz.passing_score,
      certificateEnabled: quiz.certificate_enabled,
      adaptiveTesting: quiz.adaptive_testing,
      maxAttempts: quiz.max_attempts,
      timeLimit: quiz.time_limit,
      randomizeQuestions: quiz.randomize_questions,
      shuffleOptions: quiz.shuffle_options || false,
      allowMultipleAttempts: quiz.allow_multiple_attempts,
      showCorrectAnswers: quiz.show_correct_answers,
      questions: quiz.questions,
      createdAt: quiz.created_at
    }))
  },

  saveQuizzes: async (quizzes: Quiz[]) => {
    console.warn('saveQuizzes is deprecated with Supabase')
  },

  addQuiz: async (quiz: Partial<Quiz>) => {
    const insertData: any = {
      title: quiz.title,
      title_km: quiz.titleKm,
      description: quiz.description,
      description_km: quiz.descriptionKm,
      category_id: quiz.categoryId,
      created_by: quiz.createdBy,
      grade_level: quiz.gradeLevel,
      subject: quiz.subject,
      exam_type: quiz.examType,
      passing_score: quiz.passingScore,
      certificate_enabled: quiz.certificateEnabled,
      adaptive_testing: quiz.adaptiveTesting,
      max_attempts: quiz.maxAttempts,
      time_limit: quiz.timeLimit,
      randomize_questions: quiz.randomizeQuestions,
      shuffle_options: quiz.shuffleOptions || false,
      allow_multiple_attempts: quiz.allowMultipleAttempts,
      show_correct_answers: quiz.showCorrectAnswers,
      questions: quiz.questions
    }

    // Only include ID if it's provided (for backwards compatibility)
    if (quiz.id) {
      insertData.id = quiz.id
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error adding quiz:', error)
      throw error
    }

    return data ? {
      id: data.id,
      title: data.title,
      titleKm: data.title_km,
      description: data.description,
      descriptionKm: data.description_km,
      categoryId: data.category_id,
      createdBy: data.created_by,
      gradeLevel: data.grade_level,
      subject: data.subject,
      examType: data.exam_type,
      passingScore: data.passing_score,
      certificateEnabled: data.certificate_enabled,
      adaptiveTesting: data.adaptive_testing,
      maxAttempts: data.max_attempts,
      timeLimit: data.time_limit,
      randomizeQuestions: data.randomize_questions,
      shuffleOptions: data.shuffle_options || false,
      allowMultipleAttempts: data.allow_multiple_attempts,
      showCorrectAnswers: data.show_correct_answers,
      questions: data.questions,
      createdAt: data.created_at
    } : null
  },

  updateQuiz: async (id: string, updates: Partial<Quiz>) => {
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.titleKm !== undefined) updateData.title_km = updates.titleKm
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.descriptionKm !== undefined) updateData.description_km = updates.descriptionKm
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.gradeLevel !== undefined) updateData.grade_level = updates.gradeLevel
    if (updates.subject !== undefined) updateData.subject = updates.subject
    if (updates.examType !== undefined) updateData.exam_type = updates.examType
    if (updates.passingScore !== undefined) updateData.passing_score = updates.passingScore
    if (updates.certificateEnabled !== undefined) updateData.certificate_enabled = updates.certificateEnabled
    if (updates.adaptiveTesting !== undefined) updateData.adaptive_testing = updates.adaptiveTesting
    if (updates.maxAttempts !== undefined) updateData.max_attempts = updates.maxAttempts
    if (updates.timeLimit !== undefined) updateData.time_limit = updates.timeLimit
    if (updates.randomizeQuestions !== undefined) updateData.randomize_questions = updates.randomizeQuestions
    if (updates.shuffleOptions !== undefined) updateData.shuffle_options = updates.shuffleOptions
    if (updates.allowMultipleAttempts !== undefined) updateData.allow_multiple_attempts = updates.allowMultipleAttempts
    if (updates.showCorrectAnswers !== undefined) updateData.show_correct_answers = updates.showCorrectAnswers
    if (updates.questions !== undefined) updateData.questions = updates.questions

    const { error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating quiz:', error)
      throw error
    }
  },

  deleteQuiz: async (id: string) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting quiz:', error)
      throw error
    }
  },

  getQuizById: async (id: string): Promise<Quiz | undefined> => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching quiz:', error)
      return undefined
    }

    if (!data) return undefined

    return {
      id: data.id,
      title: data.title,
      titleKm: data.title_km,
      description: data.description,
      descriptionKm: data.description_km,
      categoryId: data.category_id,
      createdBy: data.created_by,
      gradeLevel: data.grade_level,
      subject: data.subject,
      examType: data.exam_type,
      passingScore: data.passing_score,
      certificateEnabled: data.certificate_enabled,
      adaptiveTesting: data.adaptive_testing,
      maxAttempts: data.max_attempts,
      timeLimit: data.time_limit,
      randomizeQuestions: data.randomize_questions,
      allowMultipleAttempts: data.allow_multiple_attempts,
      showCorrectAnswers: data.show_correct_answers,
      questions: data.questions,
      createdAt: data.created_at
    }
  },

  // ==================== QUIZ ATTEMPTS (Enhanced with Randomization) ====================

  /**
   * Create a new quiz attempt with randomized question order
   */
  createAttempt: async (data: {
    quiz_id: string
    user_id: string
    question_order: string[]
    max_score: number
    time_limit?: number
    ip_address?: string
    user_agent?: string
  }) => {
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: data.quiz_id,
        user_id: data.user_id,
        question_order: data.question_order,
        answers: {},
        max_score: data.max_score,
        time_limit: data.time_limit,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating attempt:', error)
      throw error
    }

    return attempt
  },

  /**
   * Get all attempts (admin view)
   */
  getAttempts: async (): Promise<QuizAttempt[]> => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching attempts:', error)
      return []
    }

    return (data || []).map(attempt => ({
      id: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      questionOrder: attempt.question_order,
      answers: attempt.answers,
      score: attempt.score,
      maxScore: attempt.max_score,
      percentage: attempt.percentage,
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      timeSpent: attempt.time_spent,
      timeLimit: attempt.time_limit
    }))
  },

  /**
   * Get a specific attempt by ID with full details
   */
  getAttemptById: async (attemptId: string) => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quizzes!inner (
          id,
          title,
          title_km,
          description,
          description_km,
          questions,
          passing_score,
          show_correct_answers,
          certificate_enabled,
          category_id,
          categories (
            id,
            name,
            name_km,
            icon
          )
        ),
        users!inner (
          id,
          name,
          name_km,
          email
        )
      `)
      .eq('id', attemptId)
      .single()

    if (error) {
      console.error('Error fetching attempt:', error)
      throw error
    }

    return data
  },

  /**
   * Update an attempt (for submitting answers or updating progress)
   */
  updateAttempt: async (attemptId: string, updates: {
    answers?: any
    score?: number
    status?: string
    completed_at?: string
    time_spent?: number
  }) => {
    const updateData: any = {}
    if (updates.answers !== undefined) updateData.answers = updates.answers
    if (updates.score !== undefined) updateData.score = updates.score
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at
    if (updates.time_spent !== undefined) updateData.time_spent = updates.time_spent

    const { data, error } = await supabase
      .from('quiz_attempts')
      .update(updateData)
      .eq('id', attemptId)
      .select()
      .single()

    if (error) {
      console.error('Error updating attempt:', error)
      throw error
    }

    return data
  },

  /**
   * Delete an attempt
   */
  deleteAttempt: async (attemptId: string) => {
    const { error } = await supabase
      .from('quiz_attempts')
      .delete()
      .eq('id', attemptId)

    if (error) {
      console.error('Error deleting attempt:', error)
      throw error
    }
  },

  /**
   * @deprecated Use createAttempt instead
   */
  saveAttempts: async (attempts: QuizAttempt[]) => {
    console.warn('saveAttempts is deprecated with Supabase - use createAttempt instead')
  },

  /**
   * @deprecated Use createAttempt instead
   */
  addAttempt: async (attempt: QuizAttempt) => {
    console.warn('addAttempt is deprecated - use createAttempt instead')
    const { error } = await supabase
      .from('quiz_attempts')
      .insert({
        id: attempt.id,
        quiz_id: attempt.quizId,
        user_id: attempt.userId,
        answers: attempt.answers,
        score: attempt.score,
        max_score: attempt.maxScore,
        started_at: attempt.startedAt,
        completed_at: attempt.completedAt,
        time_spent: attempt.timeSpent
      })

    if (error) {
      console.error('Error adding attempt:', error)
      throw error
    }
  },

  getUserAttempts: async (userId: string): Promise<QuizAttempt[]> => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching user attempts:', error)
      return []
    }

    return (data || []).map(attempt => ({
      id: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      answers: attempt.answers,
      score: attempt.score,
      maxScore: attempt.max_score,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      timeSpent: attempt.time_spent
    }))
  },

  getQuizAttempts: async (quizId: string, userId: string): Promise<QuizAttempt[]> => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching quiz attempts:', error)
      return []
    }

    return (data || []).map(attempt => ({
      id: attempt.id,
      quizId: attempt.quiz_id,
      userId: attempt.user_id,
      answers: attempt.answers,
      score: attempt.score,
      maxScore: attempt.max_score,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      timeSpent: attempt.time_spent
    }))
  },

  // ==================== SCHOOLS ====================
  getSchools: async (): Promise<School[]> => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching schools:', error)
      return []
    }

    return (data || []).map(school => ({
      id: school.id,
      name: school.name,
      nameKm: school.name_km,
      province: school.province,
      district: school.district
    }))
  },

  saveSchools: async (schools: School[]) => {
    console.warn('saveSchools is deprecated with Supabase')
  },

  addSchool: async (school: School) => {
    const { error } = await supabase
      .from('schools')
      .insert({
        id: school.id,
        name: school.name,
        name_km: school.nameKm,
        province: school.province,
        district: school.district
      })

    if (error) {
      console.error('Error adding school:', error)
      throw error
    }
  },

  updateSchool: async (id: string, updates: Partial<School>) => {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.nameKm !== undefined) updateData.name_km = updates.nameKm
    if (updates.province !== undefined) updateData.province = updates.province
    if (updates.district !== undefined) updateData.district = updates.district

    const { error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating school:', error)
      throw error
    }
  },

  deleteSchool: async (id: string) => {
    const { error} = await supabase
      .from('schools')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting school:', error)
      throw error
    }
  },

  // ==================== CLASSES ====================
  getClasses: async (): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      return []
    }

    return (data || []).map(cls => ({
      id: cls.id,
      name: cls.name,
      nameKm: cls.name_km,
      schoolId: cls.school_id,
      teacherId: cls.teacher_id,
      gradeLevel: cls.grade_level
    }))
  },

  saveClasses: async (classes: Class[]) => {
    console.warn('saveClasses is deprecated with Supabase')
  },

  addClass: async (classItem: Class) => {
    const { error } = await supabase
      .from('classes')
      .insert({
        id: classItem.id,
        name: classItem.name,
        name_km: classItem.nameKm,
        school_id: classItem.schoolId,
        teacher_id: classItem.teacherId,
        grade_level: classItem.gradeLevel
      })

    if (error) {
      console.error('Error adding class:', error)
      throw error
    }
  },

  updateClass: async (id: string, updates: Partial<Class>) => {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.nameKm !== undefined) updateData.name_km = updates.nameKm
    if (updates.schoolId !== undefined) updateData.school_id = updates.schoolId
    if (updates.teacherId !== undefined) updateData.teacher_id = updates.teacherId
    if (updates.gradeLevel !== undefined) updateData.grade_level = updates.gradeLevel

    const { error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating class:', error)
      throw error
    }
  },

  deleteClass: async (id: string) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting class:', error)
      throw error
    }
  },

  getClassesBySchool: async (schoolId: string): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching classes by school:', error)
      return []
    }

    return (data || []).map(cls => ({
      id: cls.id,
      name: cls.name,
      nameKm: cls.name_km,
      schoolId: cls.school_id,
      teacherId: cls.teacher_id,
      gradeLevel: cls.grade_level
    }))
  },

  getClassesByTeacher: async (teacherId: string): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching classes by teacher:', error)
      return []
    }

    return (data || []).map(cls => ({
      id: cls.id,
      name: cls.name,
      nameKm: cls.name_km,
      schoolId: cls.school_id,
      teacherId: cls.teacher_id,
      gradeLevel: cls.grade_level
    }))
  },

  // ==================== USERS ====================
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nameKm: user.name_km,
      schoolId: user.school_id,
      childrenIds: user.children_ids,
      createdAt: user.created_at
    }))
  },

  saveUsers: async (users: User[]) => {
    console.warn('saveUsers is deprecated with Supabase')
  },

  addUser: async (user: User) => {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        name_km: user.nameKm,
        school_id: user.schoolId,
        children_ids: user.childrenIds
      })

    if (error) {
      console.error('Error adding user:', error)
      throw error
    }
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    const updateData: any = {}
    if (updates.email !== undefined) updateData.email = updates.email
    if (updates.role !== undefined) updateData.role = updates.role
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.nameKm !== undefined) updateData.name_km = updates.nameKm
    if (updates.schoolId !== undefined) updateData.school_id = updates.schoolId
    if (updates.childrenIds !== undefined) updateData.children_ids = updates.childrenIds

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  getUsersBySchool: async (schoolId: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users by school:', error)
      return []
    }

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nameKm: user.name_km,
      schoolId: user.school_id,
      childrenIds: user.children_ids,
      createdAt: user.created_at
    }))
  },

  getUsersByRole: async (role: string): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching users by role:', error)
      return []
    }

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      nameKm: user.name_km,
      schoolId: user.school_id,
      childrenIds: user.children_ids,
      createdAt: user.created_at
    }))
  },

  // ==================== QUESTION BANKS ====================
  getQuestionBanks: async (): Promise<QuestionBank[]> => {
    const { data, error } = await supabase
      .from('question_banks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching question banks:', error)
      return []
    }

    return (data || []).map(bank => ({
      id: bank.id,
      name: bank.name,
      nameKm: bank.name_km,
      description: bank.description,
      descriptionKm: bank.description_km,
      subject: bank.subject,
      gradeLevel: bank.grade_level,
      categoryId: bank.category_id,
      createdBy: bank.created_by,
      sharedWith: bank.shared_with || [],
      questions: bank.questions || [],
      createdAt: bank.created_at
    }))
  },

  saveQuestionBanks: async (banks: QuestionBank[]) => {
    console.warn('saveQuestionBanks is deprecated with Supabase')
  },

  addQuestionBank: async (bank: QuestionBank) => {
    const { error } = await supabase
      .from('question_banks')
      .insert({
        id: bank.id,
        name: bank.name,
        name_km: bank.nameKm,
        description: bank.description,
        description_km: bank.descriptionKm,
        subject: bank.subject,
        grade_level: bank.gradeLevel,
        category_id: bank.categoryId,
        created_by: bank.createdBy,
        shared_with: bank.sharedWith || [],
        questions: bank.questions || []
      })

    if (error) {
      console.error('Error adding question bank:', error)
      throw error
    }
  },

  updateQuestionBank: async (id: string, updates: Partial<QuestionBank>) => {
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.nameKm !== undefined) updateData.name_km = updates.nameKm
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.descriptionKm !== undefined) updateData.description_km = updates.descriptionKm
    if (updates.subject !== undefined) updateData.subject = updates.subject
    if (updates.gradeLevel !== undefined) updateData.grade_level = updates.gradeLevel
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith
    if (updates.questions !== undefined) updateData.questions = updates.questions

    const { error } = await supabase
      .from('question_banks')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating question bank:', error)
      throw error
    }
  },

  deleteQuestionBank: async (id: string) => {
    const { error } = await supabase
      .from('question_banks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting question bank:', error)
      throw error
    }
  },

  // ==================== CERTIFICATES ====================
  getCertificates: async (): Promise<Certificate[]> => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching certificates:', error)
      return []
    }

    return (data || []).map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      quizId: cert.quiz_id,
      attemptId: cert.attempt_id,
      score: cert.score,
      maxScore: cert.max_score,
      percentage: cert.percentage,
      issuedAt: cert.issued_at,
      certificateNumber: cert.certificate_number
    }))
  },

  saveCertificates: async (certificates: Certificate[]) => {
    console.warn('saveCertificates is deprecated with Supabase')
  },

  addCertificate: async (certificate: Certificate) => {
    const { error } = await supabase
      .from('certificates')
      .insert({
        id: certificate.id,
        user_id: certificate.userId,
        quiz_id: certificate.quizId,
        attempt_id: certificate.attemptId,
        score: certificate.score,
        max_score: certificate.maxScore,
        percentage: certificate.percentage,
        issued_at: certificate.issuedAt,
        certificate_number: certificate.certificateNumber
      })

    if (error) {
      console.error('Error adding certificate:', error)
      throw error
    }
  },

  getUserCertificates: async (userId: string): Promise<Certificate[]> => {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false })

    if (error) {
      console.error('Error fetching user certificates:', error)
      return []
    }

    return (data || []).map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      quizId: cert.quiz_id,
      attemptId: cert.attempt_id,
      score: cert.score,
      maxScore: cert.max_score,
      percentage: cert.percentage,
      issuedAt: cert.issued_at,
      certificateNumber: cert.certificate_number
    }))
  },
}
