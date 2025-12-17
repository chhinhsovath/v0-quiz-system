"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string) => addToast(message, "success"), [addToast])
  const error = useCallback((message: string) => addToast(message, "error"), [addToast])
  const warning = useCallback((message: string) => addToast(message, "warning"), [addToast])
  const info = useCallback((message: string) => addToast(message, "info"), [addToast])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-950/20 border-green-500"
      case "error":
        return "bg-red-50 dark:bg-red-950/20 border-red-500"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500"
      case "info":
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
    }
  }

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
              animate-in slide-in-from-top-5 duration-300
              ${getBgColor(toast.type)}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
