import { quizStorage } from "./quiz-storage"
import { analyticsEngine } from "./analytics"

export const reportGenerator = {
  // Generate CSV report for individual student
  generateStudentReportCSV: (studentId: string): string => {
    const analytics = analyticsEngine.getStudentAnalytics(studentId)
    const user = quizStorage.getUsers().find((u) => u.id === studentId)

    let csv = "Date,Quiz,Score,Percentage,Time Spent (min)\n"

    analytics.recentActivity.forEach((attempt) => {
      const quiz = quizStorage.getQuizById(attempt.quizId)
      const date = new Date(attempt.completedAt).toLocaleDateString()
      const timeMin = Math.round(attempt.timeSpent / 60)

      csv += `${date},"${quiz?.title}",${attempt.score},${attempt.percentage.toFixed(1)}%,${timeMin}\n`
    })

    return csv
  },

  // Generate CSV report for entire class
  generateClassReportCSV: (classId: string): string => {
    const classData = quizStorage.getClasses().find((c) => c.id === classId)
    if (!classData) return ""

    let csv = "Student Name,Quizzes Completed,Average Score,Strong Subjects,Weak Subjects\n"

    classData.studentIds.forEach((studentId) => {
      const user = quizStorage.getUsers().find((u) => u.id === studentId)
      const analytics = analyticsEngine.getStudentAnalytics(studentId)

      csv += `"${user?.name}",${analytics.completedQuizzes},${analytics.averageScore.toFixed(1)}%,"${analytics.strongSubjects.join(", ")}","${analytics.weakSubjects.join(", ")}"\n`
    })

    return csv
  },

  // Generate CSV with quiz analytics
  generateQuizAnalyticsCSV: (quizId: string): string => {
    const quiz = quizStorage.getQuizById(quizId)
    if (!quiz) return ""

    let csv = "Question,Type,Difficulty,Discrimination Index,Avg Time (s),Total Attempts,Correct Attempts\n"

    quiz.questions.forEach((question, index) => {
      const analytics = analyticsEngine.getQuestionAnalytics(question.id)

      csv += `"Question ${index + 1}",${question.type},${analytics.difficulty.toFixed(2)},${analytics.discrimination.toFixed(2)},${Math.round(analytics.averageTime)},${analytics.totalAttempts},${analytics.correctAttempts}\n`
    })

    return csv
  },

  // Download CSV file
  downloadCSV: (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  // Generate HTML report for printing/PDF
  generateStudentHTMLReport: (studentId: string): string => {
    const analytics = analyticsEngine.getStudentAnalytics(studentId)
    const user = quizStorage.getUsers().find((u) => u.id === studentId)

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Report - ${user?.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-item { margin: 10px 0; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>Student Performance Report</h1>
        <p><strong>Student:</strong> ${user?.name}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-item"><strong>Total Quizzes:</strong> ${analytics.totalQuizzes}</div>
          <div class="summary-item"><strong>Completed:</strong> ${analytics.completedQuizzes}</div>
          <div class="summary-item"><strong>Average Score:</strong> ${analytics.averageScore.toFixed(1)}%</div>
          <div class="summary-item"><strong>Average Time:</strong> ${Math.round(analytics.averageTime / 60)} minutes</div>
          <div class="summary-item"><strong>Strong Subjects:</strong> ${analytics.strongSubjects.join(", ") || "N/A"}</div>
          <div class="summary-item"><strong>Weak Subjects:</strong> ${analytics.weakSubjects.join(", ") || "N/A"}</div>
        </div>

        <h2>Recent Activity</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Quiz</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${analytics.recentActivity
              .map((attempt) => {
                const quiz = quizStorage.getQuizById(attempt.quizId)
                return `
                  <tr>
                    <td>${new Date(attempt.completedAt).toLocaleDateString()}</td>
                    <td>${quiz?.title}</td>
                    <td>${attempt.score}/${attempt.maxScore}</td>
                    <td>${attempt.percentage.toFixed(1)}%</td>
                    <td>${Math.round(attempt.timeSpent / 60)} min</td>
                  </tr>
                `
              })
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `
  },

  // Print HTML report
  printHTMLReport: (html: string) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  },
}
