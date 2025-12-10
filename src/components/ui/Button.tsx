import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[#c2703e] hover:bg-[#a85d32] text-white focus:ring-[#c2703e]',
      secondary: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 focus:ring-slate-300',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button
