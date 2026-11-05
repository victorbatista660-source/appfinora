import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted' | 'flat'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface border border-border-line shadow-card rounded-xl',
      muted: 'bg-muted-surface border border-border-line rounded-xl',
      flat: 'bg-surface border border-border-line rounded-xl',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], 'p-6 transition-all duration-fast', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
