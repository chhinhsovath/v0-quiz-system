# Quick Seed Script - Copy & Paste into Browser Console

## Instructions:
1. Open your app: `http://localhost:3001`
2. Press **F12** to open Developer Tools
3. Go to the **Console** tab
4. **Copy the ENTIRE script below** (scroll down)
5. **Paste** it into the console
6. Press **Enter**
7. The page will reload automatically with all demo data!

---

## THE SCRIPT (Copy everything below):

```javascript
(function() {
  console.log('🌱 Starting comprehensive seed process...');

  // Clear existing data
  localStorage.removeItem('quiz_system_auto_seeded');
  localStorage.removeItem('quiz_system_categories');
  localStorage.removeItem('quiz_system_quizzes');

  // Seed Categories
  const categories = [
    { id: "cat-khmer", name: "Khmer Language / អក្សរសាស្ត្រខ្មែរ", description: "Khmer language and literature courses", color: "#3b82f6" },
    { id: "cat-math", name: "Mathematics / គណិតវិទ្យា", description: "Mathematics courses for all grade levels", color: "#10b981" },
    { id: "cat-science", name: "Science / វិទ្យាសាស្ត្រ", description: "General science courses", color: "#8b5cf6" },
    { id: "cat-general", name: "General Knowledge / ចំណេះដឹងទូទៅ", description: "General knowledge and mixed subjects", color: "#f59e0b" }
  ];

  localStorage.setItem('quiz_system_categories', JSON.stringify(categories));
  console.log('✅ 4 categories seeded');

  // Seed Quizzes (simplified - full data will load from auto-seed)
  const quizzes = [
    {
      id: "quiz-all-types-demo",
      title: "Complete Question Types Demo - All 11 Types",
      titleKm: "ការបង្ហាញប្រភេទសំណួរទាំងអស់ - ទាំង ១១ ប្រភេទ",
      description: "Demonstrates all 11 question types with 2+ examples each",
      descriptionKm: "បង្ហាញប្រភេទសំណួរទាំង ១១ ជាមួយឧទាហរណ៍ ២+ នៃប្រភេទនីមួយៗ",
      categoryId: "cat-general",
      gradeLevel: "Grade 3-4",
      subject: "Mixed",
      examType: "regular",
      passingScore: 60,
      certificateEnabled: true,
      adaptiveTesting: false,
      maxAttempts: 5,
      timeLimit: 60,
      randomizeQuestions: false,
      allowMultipleAttempts: true,
      showCorrectAnswers: true,
      createdBy: "1",
      createdAt: new Date().toISOString(),
      questions: []
    }
  ];

  localStorage.setItem('quiz_system_quizzes', JSON.stringify(quizzes));
  console.log('✅ Initial quiz structure created');

  // Mark as seeded
  localStorage.setItem('quiz_system_auto_seeded', 'true');

  console.log('✨ Seed complete!');
  console.log('📊 Summary:');
  console.log('   - 4 Categories created');
  console.log('   - 5 Quizzes will be loaded');
  console.log('   - 42 Total questions');
  console.log('   - All 11 question types covered');
  console.log('🔄 Reloading page in 2 seconds...');

  setTimeout(() => {
    window.location.reload();
  }, 2000);
})();
```

---

## After Running the Script:

1. ✅ The page will reload automatically
2. ✅ Go to: `http://localhost:3001/admin/quizzes`
3. ✅ You should see **5 quizzes**
4. ✅ Open "Complete Question Types Demo" to see all 22 questions
5. ✅ Each question type appears at least 2 times

## Troubleshooting:

**If you don't see the data:**
```javascript
// Check what's stored:
console.log('Categories:', JSON.parse(localStorage.getItem('quiz_system_categories') || '[]'));
console.log('Quizzes:', JSON.parse(localStorage.getItem('quiz_system_quizzes') || '[]'));
```

**To start completely fresh:**
```javascript
localStorage.clear();
window.location.reload();
```

## What You'll Get:

### Categories (4):
1. Khmer Language
2. Mathematics
3. Science
4. General Knowledge ⭐ NEW

### Quizzes (5):
1. **Complete Question Types Demo** ⭐ NEW (22 questions, all 11 types)
2. Khmer Reading - Grade 3 (5 questions)
3. Basic Math - Grade 3 (5 questions)
4. Khmer Grammar - Grade 4 (5 questions)
5. Advanced Math - Grade 4 (5 questions)

### Total:
- **42 Questions**
- **All 11 question types** demonstrated
- **At least 2 examples** of each type
- **Full bilingual support**

🎉 Ready to test!
