// Offline mode support with service worker sync
export const offlineManager = {
  // Check if app is online
  isOnline: () => {
    return typeof navigator !== "undefined" ? navigator.onLine : true
  },

  // Queue data for sync when back online
  queueForSync: (key: string, data: unknown) => {
    const queue = localStorage.getItem("offline_sync_queue")
    const queueData = queue ? JSON.parse(queue) : []
    queueData.push({ key, data, timestamp: new Date().toISOString() })
    localStorage.setItem("offline_sync_queue", JSON.stringify(queueData))
  },

  // Process sync queue
  processSyncQueue: () => {
    if (!offlineManager.isOnline()) return

    const queue = localStorage.getItem("offline_sync_queue")
    if (!queue) return

    const queueData = JSON.parse(queue)
    // Process each queued item
    queueData.forEach((item: { key: string; data: unknown }) => {
      // Here you would sync to a backend if available
      console.log("[v0] Syncing offline data:", item.key)
    })

    // Clear queue after sync
    localStorage.removeItem("offline_sync_queue")
  },

  // Download quiz for offline use
  downloadQuizForOffline: (quizId: string) => {
    const quizzes = localStorage.getItem("quiz_system_quizzes")
    if (!quizzes) return false

    const allQuizzes = JSON.parse(quizzes)
    const quiz = allQuizzes.find((q: { id: string }) => q.id === quizId)

    if (quiz) {
      const offlineQuizzes = localStorage.getItem("offline_quizzes")
      const offline = offlineQuizzes ? JSON.parse(offlineQuizzes) : []
      if (!offline.find((q: { id: string }) => q.id === quizId)) {
        offline.push(quiz)
        localStorage.setItem("offline_quizzes", JSON.stringify(offline))
        return true
      }
    }
    return false
  },

  // Get offline quizzes
  getOfflineQuizzes: () => {
    const offlineQuizzes = localStorage.getItem("offline_quizzes")
    return offlineQuizzes ? JSON.parse(offlineQuizzes) : []
  },

  // Initialize offline support
  initOfflineSupport: () => {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[v0] Back online, syncing data...")
        offlineManager.processSyncQueue()
      })

      window.addEventListener("offline", () => {
        console.log("[v0] App is now offline")
      })
    }
  },
}
