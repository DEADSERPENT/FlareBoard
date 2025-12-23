import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-lg bg-white p-6'

    const variants = {
      default: 'border border-neutral-200',
      elevated: 'shadow-orange-md border border-neutral-100',
      bordered: 'border-2 border-primary-200',
    }

    return (
      <div ref={ref} className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
