import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass'
  accent?: 'none' | 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'amber'
}

const accentBorder: Record<string, string> = {
  none:   '',
  orange: 'border-t-2 border-t-primary-500',
  blue:   'border-t-2 border-t-blue-500',
  green:  'border-t-2 border-t-emerald-500',
  purple: 'border-t-2 border-t-purple-500',
  red:    'border-t-2 border-t-red-500',
  amber:  'border-t-2 border-t-amber-500',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', accent = 'none', className = '', children, ...props }, ref) => {
    const base = 'rounded-xl bg-white p-6'

    const variants = {
      default:  'border border-neutral-200 shadow-sm',
      elevated: 'border border-neutral-100 shadow-md',
      bordered: 'border-2 border-primary-200',
      glass:    'glass',
    }

    return (
      <div
        ref={ref}
        className={`${base} ${variants[variant]} ${accentBorder[accent]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
