// COPY THIS ENTIRE FILE AND PASTE INTO BROWSER CONSOLE
// This will seed all demo data immediately

(function seedAllDemoData() {
  console.log('🌱 Starting manual seed process...');

  // Check if already seeded
  const autoSeeded = localStorage.getItem('quiz_system_auto_seeded');
  if (autoSeeded === 'true') {
    const reseed = confirm('Demo data already exists. Do you want to CLEAR and RESEED all data?');
    if (reseed) {
      localStorage.removeItem('quiz_system_categories');
      localStorage.removeItem('quiz_system_quizzes');
      localStorage.removeItem('quiz_system_auto_seeded');
      console.log('🗑️ Existing data cleared');
    } else {
      console.log('ℹ️ Keeping existing data');
      return;
    }
  }

  // Seed Categories
  const categories = [
    { id: "cat-khmer", name: "Khmer Language / អក្សរសាស្ត្រខ្មែរ", description: "Khmer language and literature courses", color: "#3b82f6" },
    { id: "cat-math", name: "Mathematics / គណិតវិទ្យា", description: "Mathematics courses for all grade levels", color: "#10b981" },
    { id: "cat-science", name: "Science / វិទ្យាសាស្ត្រ", description: "General science courses", color: "#8b5cf6" }
  ];

  localStorage.setItem('quiz_system_categories', JSON.stringify(categories));
  console.log('✅ 3 categories seeded');

  // Mark as seeded
  localStorage.setItem('quiz_system_auto_seeded', 'true');

  console.log('✨ Seed complete! Reloading page...');
  setTimeout(() => window.location.reload(), 1000);
})();
