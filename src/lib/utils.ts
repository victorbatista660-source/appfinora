import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact: boolean = false): string {
  if (compact && Math.abs(value) >= 1000000) {
    return `R$ ${(value / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`
  }
  if (compact && Math.abs(value) >= 10000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercentage(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
}

export function formatDateBR(dateString: string): string {
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    return `${day}/${month}/${year}`
  }
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDate(dateString: string): string {
  return formatDateBR(dateString)
}

export function formatDateShortBR(dateString: string): string {
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10)
    const monthIndex = parseInt(parts[1], 10) - 1
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    return `${day} de ${months[monthIndex] || parts[1]}`
  }
  return dateString
}
