import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose, type])

  const icons = {
    success: <CheckCircle className="text-green-600" size={20} />,
    error: <AlertCircle className="text-red-600" size={20} />,
    info: <Info className="text-blue-600" size={20} />,
    loading: <Loader2 className="text-primary animate-spin" size={20} />,
  }

  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-primary/5 border-primary/20',
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[9999] min-w-[320px] max-w-md p-4 rounded-lg border-2 shadow-lg',
        'animate-fade-in-up',
        styles[type]
      )}
      style={{
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-sm font-medium text-text-primary">{message}</p>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
