import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { ToastContainer, ToastType } from '@/components/notifications/Toast'

interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string) => void
  success: (title: string, message: string) => void
  error: (title: string, message: string) => void
  info: (title: string, message: string) => void
  warning: (title: string, message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, title, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback(
    (title: string, message: string) => showToast('success', title, message),
    [showToast]
  )

  const error = useCallback(
    (title: string, message: string) => showToast('error', title, message),
    [showToast]
  )

  const info = useCallback(
    (title: string, message: string) => showToast('info', title, message),
    [showToast]
  )

  const warning = useCallback(
    (title: string, message: string) => showToast('warning', title, message),
    [showToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  )
}
