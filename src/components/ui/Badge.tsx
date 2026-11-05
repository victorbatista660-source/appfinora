import React from 'react'
import { cn } from '../../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'primary' | 'danger' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center font-medium rounded-full transition-colors whitespace-nowrap'

  const variants = {
    neutral: 'bg-muted-surface text-text-secondary border border-border-line',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    danger: 'bg-danger/10 text-danger border border-danger/20',
    outline: 'border border-border-line text-text-secondary bg-transparent',
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide uppercase',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  )
}
