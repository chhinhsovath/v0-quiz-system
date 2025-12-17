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

  // Quiz Builder
  createNewQuiz: string
  editQuiz: string
  quizDetails: string
  quizTitle: string
  quizTitleKm: string
  description: string
  descriptionKm: string
  category: string
  gradeLevel: string
  examType: string
  passingScore: string
  certificateEnabled: string
  adaptiveTesting: string
  maxAttempts: string
  randomizeQuestions: string
  allowMultipleAttempts: string
  showCorrectAnswers: string
  addQuestion: string
  questionText: string
  points: string
  answerOptions: string
  correctAnswerLabel: string
  addOption: string
  removeOption: string
  explanation: string
  saveQuiz: string
  updateQuiz: string
  backToQuizzes: string
  noCategoriesMessage: string
  noQuestionsMessage: string
  questionAdded: string
  selectCategory: string
  selectExamType: string
  regular: string
  enableCertificateDesc: string
  adaptiveTestingDesc: string
  maxAttemptsDesc: string
  randomizeQuestionsDesc: string
  allowMultipleAttemptsDesc: string
  showCorrectAnswersDesc: string
  basicInfoDesc: string
  buildNewQuizDesc: string
  updateQuizDetailsDesc: string
  selectCorrectAnswer: string
  selectAllCorrectAnswers: string
  enterCorrectAnswer: string
  answerMatchingCaseInsensitive: string
  templateUseBlanks: string
  blanksDetected: string
  correctAnswersInOrder: string
  itemsWillBeShuffled: string
  correctOrderDesc: string
  matchingPairs: string
  rightSideShuffled: string
  itemsInCorrectOrder: string
  enterItemsInSequence: string
  essayManualGrading: string
  sampleAnswerRubric: string
  sampleAnswerForInstructors: string
  imageUrl: string
  imageHotspotDesc: string
  hotspotsClickableAreas: string
  noHotspotsYet: string
  addHotspot: string
  explanationOptional: string
  explanationAfterAnswer: string
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

    createNewQuiz: "Create New Quiz",
    editQuiz: "Edit Quiz",
    quizDetails: "Quiz Details",
    quizTitle: "Quiz Title",
    quizTitleKm: "Quiz Title (Khmer)",
    description: "Description",
    descriptionKm: "Description (Khmer)",
    category: "Category",
    gradeLevel: "Grade Level",
    examType: "Exam Type",
    passingScore: "Passing Score (%)",
    certificateEnabled: "Certificate Enabled",
    adaptiveTesting: "Adaptive Testing",
    maxAttempts: "Max Attempts",
    randomizeQuestions: "Randomize Questions",
    allowMultipleAttempts: "Allow Multiple Attempts",
    showCorrectAnswers: "Show Correct Answers",
    addQuestion: "Add Question",
    questionText: "Question Text",
    points: "Points",
    answerOptions: "Answer Options",
    correctAnswerLabel: "Correct Answer",
    addOption: "Add Option",
    removeOption: "Remove Option",
    explanation: "Explanation",
    saveQuiz: "Save Quiz",
    updateQuiz: "Update Quiz",
    backToQuizzes: "Back to Quizzes",
    noCategoriesMessage: "No categories available. Please create a category first.",
    noQuestionsMessage: 'No questions yet. Click "Add Question" to get started.',
    questionAdded: "question(s) added",
    selectCategory: "Select a category",
    selectExamType: "Select an exam type",
    regular: "Regular",
    enableCertificateDesc: "Enable certificate issuance upon passing",
    adaptiveTestingDesc: "Enable adaptive testing based on student performance",
    maxAttemptsDesc: "Maximum number of attempts allowed",
    randomizeQuestionsDesc: "Show questions in random order for each attempt",
    allowMultipleAttemptsDesc: "Users can retake this quiz multiple times",
    showCorrectAnswersDesc: "Display correct answers after completion",
    basicInfoDesc: "Basic information about your quiz",
    buildNewQuizDesc: "Build a new quiz for your students",
    updateQuizDetailsDesc: "Update your quiz details and questions",
    selectCorrectAnswer: "select the correct one",
    selectAllCorrectAnswers: "select all correct answers",
    enterCorrectAnswer: "Enter the correct answer",
    answerMatchingCaseInsensitive: "Answer matching is case-insensitive",
    templateUseBlanks: "Template (use ___ for blanks)",
    blanksDetected: "blank(s) detected",
    correctAnswersInOrder: "Correct Answers (in order)",
    itemsWillBeShuffled: "Items (will be shuffled for students)",
    correctOrderDesc: "Students will arrange items in this order. Leave as is to use current order.",
    matchingPairs: "Matching Pairs",
    rightSideShuffled: "Right side will be shuffled for students to match",
    itemsInCorrectOrder: "Items in Correct Order",
    enterItemsInSequence: "Enter items in the correct sequence from first to last",
    essayManualGrading: "Essay questions require manual grading by the instructor. Students will have a text area to write their response.",
    sampleAnswerRubric: "Sample Answer / Grading Rubric (optional)",
    sampleAnswerForInstructors: "This will only be visible to instructors",
    imageUrl: "Image URL",
    imageHotspotDesc: "Image hotspot questions let students click on specific areas of an image. Define correct clickable areas below.",
    hotspotsClickableAreas: "Hotspots (clickable areas)",
    noHotspotsYet: "No hotspots defined yet",
    addHotspot: "Add Hotspot",
    explanationOptional: "Explanation (optional)",
    explanationAfterAnswer: "Provide additional context or explanation that will be shown after answering",
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

    createNewQuiz: "បង្កើតតេស្តថ្មី",
    editQuiz: "កែសម្រួលតេស្ត",
    quizDetails: "ព័ត៌មានលម្អិតតេស្ត",
    quizTitle: "ចំណងជើងតេស្ត",
    quizTitleKm: "ចំណងជើងតេស្ត (ខ្មែរ)",
    description: "ការពិពណ៌នា",
    descriptionKm: "ការពិពណ៌នា (ខ្មែរ)",
    category: "ប្រភេទ",
    gradeLevel: "កម្រិតថ្នាក់",
    examType: "ប្រភេទប្រឡង",
    passingScore: "ពិន្ទុជាប់ (%)",
    certificateEnabled: "បើកវិញ្ញាបនបត្រ",
    adaptiveTesting: "ការធ្វើតេស្តបែបសម្រួល",
    maxAttempts: "ចំនួនដងអតិបរមា",
    randomizeQuestions: "សូរសំណួរចៃដន្យ",
    allowMultipleAttempts: "អនុញ្ញាតធ្វើតេស្តច្រើនដង",
    showCorrectAnswers: "បង្ហាញចម្លើយត្រឹមត្រូវ",
    addQuestion: "បន្ថែមសំណួរ",
    questionText: "អត្ថបទសំណួរ",
    points: "ពិន្ទុ",
    answerOptions: "ជម្រើសចម្លើយ",
    correctAnswerLabel: "ចម្លើយត្រឹមត្រូវ",
    addOption: "បន្ថែមជម្រើស",
    removeOption: "លុបជម្រើស",
    explanation: "ការពន្យល់",
    saveQuiz: "រក្សាទុកតេស្ត",
    updateQuiz: "ធ្វើបច្ចុប្បន្នភាពតេស្ត",
    backToQuizzes: "ត្រលប់ទៅតេស្ត",
    noCategoriesMessage: "មិនមានប្រភេទទេ។ សូមបង្កើតប្រភេទមុនសិន។",
    noQuestionsMessage: 'មិនទាន់មានសំណួរទេ។ ចុច "បន្ថែមសំណួរ" ដើម្បីចាប់ផ្តើម។',
    questionAdded: "សំណួរបានបន្ថែម",
    selectCategory: "ជ្រើសរើសប្រភេទ",
    selectExamType: "ជ្រើសរើសប្រភេទប្រឡង",
    regular: "ធម្មតា",
    enableCertificateDesc: "បើកការចេញវិញ្ញាបនបត្រពេលប្រឡងជាប់",
    adaptiveTestingDesc: "បើកការធ្វើតេស្តបែបសម្រួលដោយផ្អែកលើការអនុវត្តរបស់សិស្ស",
    maxAttemptsDesc: "ចំនួនដងអតិបរមាដែលអនុញ្ញាត",
    randomizeQuestionsDesc: "បង្ហាញសំណួរតាមលំដាប់ចៃដន្យសម្រាប់ការធ្វើតេស្តនីមួយៗ",
    allowMultipleAttemptsDesc: "អ្នកប្រើប្រាស់អាចធ្វើតេស្តនេះច្រើនដង",
    showCorrectAnswersDesc: "បង្ហាញចម្លើយត្រឹមត្រូវបន្ទាប់ពីបញ្ចប់",
    basicInfoDesc: "ព័ត៌មានមូលដ្ឋានអំពីតេស្តរបស់អ្នក",
    buildNewQuizDesc: "បង្កើតតេស្តថ្មីសម្រាប់សិស្សរបស់អ្នក",
    updateQuizDetailsDesc: "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិត និងសំណួររបស់តេស្ត",
    selectCorrectAnswer: "ជ្រើសរើសចម្លើយត្រឹមត្រូវ",
    selectAllCorrectAnswers: "ជ្រើសរើសចម្លើយត្រឹមត្រូវទាំងអស់",
    enterCorrectAnswer: "បញ្ចូលចម្លើយត្រឹមត្រូវ",
    answerMatchingCaseInsensitive: "ការផ្គូផ្គងចម្លើយមិនអាស្រ័យលើអក្សរធំតូច",
    templateUseBlanks: "គំរូ (ប្រើ ___ សម្រាប់ចន្លោះ)",
    blanksDetected: "ចន្លោះត្រូវបានរកឃើញ",
    correctAnswersInOrder: "ចម្លើយត្រឹមត្រូវ (តាមលំដាប់)",
    itemsWillBeShuffled: "ធាតុ (នឹងត្រូវសូរចៃដន្យសម្រាប់សិស្ស)",
    correctOrderDesc: "សិស្សនឹងរៀបចំធាតុតាមលំដាប់នេះ។ ទុកដូចដើមដើម្បីប្រើលំដាប់បច្ចុប្បន្ន។",
    matchingPairs: "គូផ្គូផ្គង",
    rightSideShuffled: "ផ្នែកខាងស្តាំនឹងត្រូវសូរសម្រាប់សិស្សផ្គូផ្គង",
    itemsInCorrectOrder: "ធាតុក្នុងលំដាប់ត្រឹមត្រូវ",
    enterItemsInSequence: "បញ្ចូលធាតុតាមលំដាប់ត្រឹមត្រូវពីដំបូងដល់ចុងក្រោយ",
    essayManualGrading: "សំណួរសន្និដ្ឋានតម្រូវឱ្យគ្រូដាក់ពិន្ទុដោយដៃ។ សិស្សនឹងមានកន្លែងសរសេរចម្លើយ។",
    sampleAnswerRubric: "គំរូចម្លើយ / លក្ខណៈវិនិច្ឆ័យការដាក់ពិន្ទុ (ស្រេចចិត្ត)",
    sampleAnswerForInstructors: "នេះនឹងមើលឃើញដោយគ្រូប៉ុណ្ណោះ",
    imageUrl: "URL រូបភាព",
    imageHotspotDesc: "សំណួរចំណុចរូបភាពអនុញ្ញាតឱ្យសិស្សចុចលើតំបន់ជាក់លាក់នៃរូបភាព។ កំណត់តំបន់ចុចត្រឹមត្រូវខាងក្រោម។",
    hotspotsClickableAreas: "ចំណុច (តំបន់អាចចុចបាន)",
    noHotspotsYet: "មិនទាន់មានចំណុចទេ",
    addHotspot: "បន្ថែមចំណុច",
    explanationOptional: "ការពន្យល់ (ស្រេចចិត្ត)",
    explanationAfterAnswer: "ផ្តល់បរិបទ ឬការពន្យល់បន្ថែមដែលនឹងបង្ហាញបន្ទាប់ពីឆ្លើយ",
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
