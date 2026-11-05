import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-fast select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.99]'

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-subtle',
      secondary: 'bg-surface text-text-primary border border-border-line hover:bg-muted-surface shadow-subtle',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-muted-surface',
      accent: 'bg-accent text-white hover:bg-primary-hover shadow-subtle',
      danger: 'bg-danger text-white hover:opacity-95 shadow-subtle',
    }

    const sizes = {
      sm: 'text-xs h-9 px-3 rounded-md gap-1.5 min-h-[36px]',
      md: 'text-sm h-11 px-4 rounded-md gap-2 min-h-[44px]',
      lg: 'text-base h-12 px-6 rounded-lg gap-2.5 min-h-[48px]',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
