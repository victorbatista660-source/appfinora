import { formatCurrency, formatPercentage } from './utils'

export interface VariationResult {
  absolute: number
  percentage: number | null
  hasBase: boolean
  label: string
}

export function calculateVariation(current: number, previous: number): VariationResult {
  const absolute = current - previous

  if (previous === 0) {
    if (current === 0) {
      return {
        absolute: 0,
        percentage: 0,
        hasBase: true,
        label: 'Estável (0%)',
      }
    }
    return {
      absolute,
      percentage: null,
      hasBase: false,
      label: 'Novo lançamento (Sem base anterior)',
    }
  }

  const percentage = (absolute / previous) * 100
  const isPositive = percentage > 0
  const isZero = percentage === 0

  return {
    absolute,
    percentage,
    hasBase: true,
    label: isZero
      ? '0,0%'
      : `${isPositive ? '+' : ''}${percentage.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}%`,
  }
}

export interface CategoryComparison {
  category: string
  currentAmount: number
  previousAmount: number
  absoluteDiff: number
  percentDiff: number | null
  hasBase: boolean
  percentageOfCurrentTotal: number
}

export interface EstablishmentComparison {
  establishment: string
  category: string
  currentAmount: number
  previousAmount: number
  absoluteDiff: number
  percentDiff: number | null
  hasBase: boolean
}

export interface AutomaticObservation {
  id: string
  type: 'neutral' | 'positive' | 'attention'
  title: string
  description: string
}

export function generateObservations(
  currentExpenses: number,
  previousExpenses: number,
  currentIncome: number,
  categories: CategoryComparison[]
): AutomaticObservation[] {
  const observations: AutomaticObservation[] = []

  // 1. Variação global de gastos
  const totalVar = calculateVariation(currentExpenses, previousExpenses)
  if (totalVar.hasBase && totalVar.percentage !== null) {
    const isHigher = totalVar.absolute > 0
    const isLower = totalVar.absolute < 0

    if (isHigher) {
      observations.push({
        id: 'obs-total',
        type: 'attention',
        title: 'Variação global de despesas',
        description: `Seus gastos totais aumentaram ${Math.abs(totalVar.percentage).toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}% (${formatCurrency(totalVar.absolute)}) em relação ao período anterior.`,
      })
    } else if (isLower) {
      observations.push({
        id: 'obs-total',
        type: 'positive',
        title: 'Economia no período',
        description: `Seus gastos totais foram ${Math.abs(totalVar.percentage).toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}% (${formatCurrency(Math.abs(totalVar.absolute))}) menores em relação ao período anterior.`,
      })
    } else {
      observations.push({
        id: 'obs-total',
        type: 'neutral',
        title: 'Estabilidade nos gastos',
        description: 'O montante total de despesas permaneceu no mesmo patamar do período anterior.',
      })
    }
  }

  // 2. Maior redução por categoria (se houver)
  const reducedCategories = [...categories]
    .filter((c) => c.absoluteDiff < 0)
    .sort((a, b) => a.absoluteDiff - b.absoluteDiff)

  if (reducedCategories.length > 0) {
    const topReduction = reducedCategories[0]
    observations.push({
      id: 'obs-reduction',
      type: 'positive',
      title: 'Redução relevante em categoria',
      description: `Você gastou ${formatCurrency(Math.abs(topReduction.absoluteDiff))} a menos com ${topReduction.category} neste período.`,
    })
  }

  // 3. Maior centro de custo proporcional (representatividade)
  const sortedByAmount = [...categories].sort((a, b) => b.currentAmount - a.currentAmount)
  if (sortedByAmount.length > 0 && currentExpenses > 0) {
    const topCat = sortedByAmount[0]
    const pct = Math.round((topCat.currentAmount / currentExpenses) * 100)
    observations.push({
      id: 'obs-weight',
      type: 'neutral',
      title: 'Concentração de despesas',
      description: `${topCat.category} representa ${pct}% das despesas registradas no período selecionado (${formatCurrency(topCat.currentAmount)}).`,
    })
  }

  // 4. Comprometimento da renda
  if (currentIncome > 0) {
    const rate = Math.round((currentExpenses / currentIncome) * 1000) / 10
    observations.push({
      id: 'obs-income-rate',
      type: rate > 80 ? 'attention' : 'neutral',
      title: 'Comprometimento da receita',
      description: `As despesas equivalem a ${rate.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}% da receita total do período.`,
    })
  }

  return observations
}
