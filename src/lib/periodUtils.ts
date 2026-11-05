import { MonthlyExpensePoint, Transaction } from '../types'

export interface PeriodOption {
  key: string // "YYYY-MM"
  label: string // "Novembro de 2026"
  shortLabel: string // "Nov 26"
  year: number
  month: number // 1-12
}

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function getPeriodKeyFromDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getPeriodLabelFromKey(key: string): string {
  if (!key || !/^\d{4}-\d{2}$/.test(key)) {
    return key || ''
  }
  const [yearStr, monthStr] = key.split('-')
  const monthIndex = parseInt(monthStr, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return key
  return `${MONTH_NAMES[monthIndex]} de ${yearStr}`
}

export function getKeyFromPeriodLabel(label: string): string {
  if (!label) return getCurrentPeriodKey()
  // Exemplo: "Novembro de 2026" ou "2026-11"
  if (/^\d{4}-\d{2}$/.test(label)) return label

  const parts = label.split(' de ')
  if (parts.length === 2) {
    const monthName = parts[0].trim()
    const year = parts[1].trim()
    const monthIdx = MONTH_NAMES.findIndex(
      (m) => m.toLowerCase() === monthName.toLowerCase()
    )
    if (monthIdx !== -1) {
      return `${year}-${String(monthIdx + 1).padStart(2, '0')}`
    }
  }
  return getCurrentPeriodKey()
}

export function getCurrentPeriodKey(): string {
  return getPeriodKeyFromDate(new Date())
}

export function getCurrentPeriodLabel(): string {
  return getPeriodLabelFromKey(getCurrentPeriodKey())
}

export function getPreviousPeriodKey(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return getPeriodKeyFromDate(d)
}

/**
 * Gera a lista de períodos dinâmicos:
 * - Todos os meses com transações existentes
 * - Mês atual
 * - Próximos 12 meses futuros
 * Ordenados do mais recente para o mais antigo.
 */
export function generateAvailablePeriods(
  transactions: { date: string }[]
): PeriodOption[] {
  const now = new Date()
  const keysSet = new Set<string>()

  // 1. Mês atual + próximos 12 meses futuros
  for (let i = 0; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    keysSet.add(getPeriodKeyFromDate(d))
  }

  // 2. Meses com transações já registradas
  for (const tx of transactions) {
    if (tx.date && typeof tx.date === 'string' && tx.date.length >= 7) {
      const monthKey = tx.date.slice(0, 7)
      if (/^\d{4}-\d{2}$/.test(monthKey)) {
        keysSet.add(monthKey)
      }
    }
  }

  // 3. Ordenação decrescente (mais recente ao mais antigo)
  const sortedKeys = Array.from(keysSet).sort((a, b) => b.localeCompare(a))

  return sortedKeys.map((key) => {
    const [yearStr, monthStr] = key.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr)
    const monthIdx = month - 1
    return {
      key,
      label: `${MONTH_NAMES[monthIdx]} de ${year}`,
      shortLabel: `${MONTH_SHORT_NAMES[monthIdx]} ${String(year).slice(2)}`,
      year,
      month,
    }
  })
}

/**
 * Calcula a janela de 6 meses de evolução de despesas terminando no mês selecionado.
 */
export function calculateMonthlyEvolutionWindow(
  selectedPeriodKey: string,
  transactions: Transaction[]
): MonthlyExpensePoint[] {
  const normalizedKey = /^\d{4}-\d{2}$/.test(selectedPeriodKey)
    ? selectedPeriodKey
    : getKeyFromPeriodLabel(selectedPeriodKey)

  const [selYear, selMonth] = normalizedKey.split('-').map(Number)
  const points: MonthlyExpensePoint[] = []

  // Janela de 6 meses: 5 meses antes até o mês selecionado
  for (let i = 5; i >= 0; i--) {
    const d = new Date(selYear, selMonth - 1 - i, 1)
    const key = getPeriodKeyFromDate(d)
    const monthIdx = d.getMonth()

    const expenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(key))
      .reduce((acc, t) => acc + t.amount, 0)

    points.push({
      month: MONTH_SHORT_NAMES[monthIdx],
      fullLabel: `${MONTH_NAMES[monthIdx]} ${d.getFullYear()}`,
      expenses,
    })
  }

  return points
}

