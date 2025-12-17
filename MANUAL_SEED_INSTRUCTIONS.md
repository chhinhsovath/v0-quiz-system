# Manual Seed Instructions

## Automatic Seeding (Default)
The app now automatically seeds demo data on first run. Just refresh your browser and check the console for:
```
🌱 Auto-seeding demo data...
✅ Demo data seeded successfully!
   - 3 categories added
   - 4 quizzes added
```

## Manual Seeding via Browser Console

If you need to manually seed or reseed the data, follow these steps:

### Method 1: Using Browser Console (Easiest)

1. Open your app in the browser: `http://localhost:3001`
2. Open Browser DevTools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Copy and paste this code:

```javascript
// Seed demo data (safe, won't duplicate)
(function() {
  const seedCategories = [
    {
      id: "cat-khmer",
      name: "Khmer Language / អក្សរសាស្ត្រខ្មែរ",
      description: "Khmer language and literature courses",
      color: "#3b82f6",
    },
    {
      id: "cat-math",
      name: "Mathematics / គណិតវិទ្យា",
      description: "Mathematics courses for all grade levels",
      color: "#10b981",
    },
    {
      id: "cat-science",
      name: "Science / វិទ្យាសាស្ត្រ",
      description: "General science courses",
      color: "#8b5cf6",
    },
  ];

  // Get existing categories
  const existingCats = JSON.parse(localStorage.getItem('quiz_system_categories') || '[]');

  // Add only new categories
  seedCategories.forEach(cat => {
    if (!existingCats.find(c => c.id === cat.id)) {
      existingCats.push(cat);
    }
  });

  localStorage.setItem('quiz_system_categories', JSON.stringify(existingCats));
  console.log('✅ Categories seeded!');

  // Note: For full quiz seeding, use the seed page at /admin/seed
  // or wait for the auto-seed to complete

  window.location.reload();
})();
```

### Method 2: Force Reseed Everything

To clear all data and reseed fresh:

```javascript
// Clear all quiz data
localStorage.removeItem('quiz_system_categories');
localStorage.removeItem('quiz_system_quizzes');
localStorage.removeItem('quiz_system_attempts');
localStorage.removeItem('quiz_system_schools');
localStorage.removeItem('quiz_system_classes');
localStorage.removeItem('quiz_system_question_banks');
localStorage.removeItem('quiz_system_certificates');
localStorage.removeItem('quiz_system_auto_seeded');

console.log('✅ All data cleared! Reloading to trigger auto-seed...');
window.location.reload();
```

### Method 3: Check Current Data

To see what data exists:

```javascript
// Check categories
console.log('Categories:', JSON.parse(localStorage.getItem('quiz_system_categories') || '[]'));

// Check quizzes
console.log('Quizzes:', JSON.parse(localStorage.getItem('quiz_system_quizzes') || '[]'));

// Check if auto-seeded
console.log('Auto-seeded:', localStorage.getItem('quiz_system_auto_seeded'));
```

## Verification

After seeding, verify the data:

1. Go to Categories page: `http://localhost:3001/admin/categories`
   - Should see: **3 categories** (Khmer, Math, Science)

2. Go to Quizzes page: `http://localhost:3001/admin/quizzes`
   - Should see: **4 quizzes** (Grade 3 & 4, Khmer & Math)

3. Open any quiz to see questions with Khmer translations

## Troubleshooting

### Issue: "No data showing"
**Solution:** Clear browser cache and reload:
```javascript
localStorage.clear();
window.location.reload();
```

### Issue: "Duplicate data"
**Solution:** The seed functions check for duplicates automatically. If you see duplicates, manually clear and reseed:
```javascript
localStorage.removeItem('quiz_system_auto_seeded');
window.location.reload();
```

### Issue: "Cannot access /admin/seed page"
**Reason:** You need admin privileges. The auto-seed runs for all users on first visit.

## What Gets Seeded

- ✅ 3 Categories (Khmer, Math, Science)
- ✅ 4 Complete Quizzes
  - Grade 3 Khmer (5 questions)
  - Grade 3 Math (5 questions)
  - Grade 4 Khmer (5 questions)
  - Grade 4 Math (5 questions)
- ✅ 20 Total Questions
- ✅ Full Bilingual Support (EN/KM)
- ✅ 9 Question Types Demonstrated

## Auto-Seed Status

The auto-seed runs **once** when you first load the app. To check if it ran:

```javascript
console.log('Auto-seed status:', localStorage.getItem('quiz_system_auto_seeded'));
// Output: "true" if already seeded, null if not yet run
```

To force it to run again:
```javascript
localStorage.removeItem('quiz_system_auto_seeded');
window.location.reload();
```
