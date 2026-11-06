import { Transaction, PaymentMethod } from '../types'

export interface AccountSettings {
  creditCardLimit: number
  initialBalanceDebit: number
  initialBalanceMeal: number
}

export type AccountCategory = 'debit' | 'credit' | 'meal'

export interface InstallmentSplit {
  installmentNumber: number
  installmentTotal: number
  amount: number
  date: string // YYYY-MM-DD
}

/**
 * Divide o valor total em N parcelas sem perder centavos:
 * - Realiza todos os cálculos usando centavos inteiros (integers)
 * - Ajusta qualquer resto de centavos na última parcela para fechar o valor exato
 * - Avança os meses preservando o dia limite (ex: dia 31 em fevereiro cai no último dia do mês)
 */
export function splitInstallments(
  totalAmount: number,
  installmentsCount: number,
  startDateStr: string
): InstallmentSplit[] {
  const totalCents = Math.round(totalAmount * 100)
  const baseCents = Math.floor(totalCents / installmentsCount)
  const remainderCents = totalCents - baseCents * installmentsCount

  const [yearStr, monthStr, dayStr] = startDateStr.split('-')
  const baseYear = parseInt(yearStr, 10)
  const baseMonth = parseInt(monthStr, 10) // 1-12
  const baseDay = parseInt(dayStr, 10)

  const result: InstallmentSplit[] = []

  for (let i = 0; i < installmentsCount; i++) {
    const isLast = i === installmentsCount - 1
    const cents = isLast ? baseCents + remainderCents : baseCents
    const amount = cents / 100

    // Avanço dos meses com proteção contra overflow de dias
    const targetMonthIndex = baseMonth - 1 + i // 0-indexed
    const targetYear = baseYear + Math.floor(targetMonthIndex / 12)
    const targetMonth = (targetMonthIndex % 12) + 1 // 1-12

    const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate()
    const targetDay = Math.min(baseDay, daysInTargetMonth)

    const dateFormatted = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`

    result.push({
      installmentNumber: i + 1,
      installmentTotal: installmentsCount,
      amount,
      date: dateFormatted,
    })
  }

  return result
}

/**
 * Identifica a qual conta um método de pagamento pertence:
 * - credit: Cartão de Crédito
 * - meal: Vale Alimentação/Refeição
 * - debit: Pix, Débito, Transferência, Boleto, Dinheiro, Outros
 */
export function getAccountCategory(paymentMethod: PaymentMethod | string): AccountCategory {
  if (paymentMethod === 'Cartão de Crédito') {
    return 'credit'
  }
  if (
    paymentMethod === 'Vale Alimentação/Refeição' ||
    paymentMethod === 'Vale Refeição/Alimentação' ||
    paymentMethod?.toLowerCase().includes('vale')
  ) {
    return 'meal'
  }
  return 'debit'
}

export interface FinancialCalculationResult {
  // 1. Conta Débito (Corrente / Dinheiro / Pix)
  debitBalance: number
  debitIncomePeriod: number
  debitExpensesPeriod: number
  debitInitial: number

  // 2. Cartão de Crédito
  creditLimit: number
  creditUsedTotal: number // Despesas abertas totais (impactam limite)
  creditUsedPeriod: number // Despesas de crédito no mês filtrado
  creditAvailable: number
  creditUsedPercentage: number

  // 3. Vale Alimentação / Refeição
  mealBalance: number
  mealIncomePeriod: number
  mealExpensesPeriod: number
  mealInitial: number

  // 4. Totais Consolidados do Período Filtrado
  periodIncome: number
  periodExpenses: number
  periodNetResult: number
  incomeCommittedRate: number

  // Mês anterior (para comparativo)
  previousMonthExpenses: number
  comparisonRate: number
  hasPreviousData: boolean
}

/**
 * Motor único e auditável de cálculo financeiro do Finora.
 * Utilizado de forma idêntica pela Visão Geral e pela página de Transações.
 */
export function calculateFinancialMetrics(
  allTransactions: Transaction[],
  selectedPeriodKey: string, // "YYYY-MM"
  settings: AccountSettings = {
    creditCardLimit: 0,
    initialBalanceDebit: 0,
    initialBalanceMeal: 0,
  },
  previousPeriodKey?: string
): FinancialCalculationResult {
  // ----------------------------------------------------
  // 1. CÁLCULO DA CONTA DÉBITO
  // Saldo = saldo inicial + todas receitas em débito − todas despesas em débito
  // (Despesas no crédito NÃO abatem deste saldo)
  // ----------------------------------------------------
  let allDebitIncome = 0
  let allDebitExpenses = 0
  let periodDebitIncome = 0
  let periodDebitExpenses = 0

  // ----------------------------------------------------
  // 2. CÁLCULO DO CARTÃO DE CRÉDITO
  // Limite disponível = limite total − soma das despesas de crédito a partir do mês atual
  // Parcelas de meses anteriores liberam o limite (faturas passadas pagas)
  // ----------------------------------------------------
  const currentMonthKey = new Date().toISOString().slice(0, 7)
  let activeCreditExpenses = 0
  let periodCreditExpenses = 0

  // ----------------------------------------------------
  // 3. CÁLCULO DO VALE ALIMENTAÇÃO/REFEIÇÃO
  // Saldo = saldo inicial + receitas no vale − despesas no vale
  // ----------------------------------------------------
  let allMealIncome = 0
  let allMealExpenses = 0
  let periodMealIncome = 0
  let periodMealExpenses = 0

  // ----------------------------------------------------
  // 4. TOTAIS CONSOLIDADOS DO PERÍODO
  // ----------------------------------------------------
  let periodIncome = 0
  let periodExpenses = 0

  // Itera sobre todas as transações para saldos acumulados e em aberto
  for (const tx of allTransactions) {
    const accType = getAccountCategory(tx.paymentMethod)
    const isPeriod = tx.date.startsWith(selectedPeriodKey)

    if (accType === 'credit') {
      if (tx.type === 'expense') {
        const txMonth = tx.date.slice(0, 7)
        if (txMonth >= currentMonthKey) {
          activeCreditExpenses += tx.amount
        }
        if (isPeriod) {
          periodCreditExpenses += tx.amount
        }
      }
    } else if (accType === 'meal') {
      if (tx.type === 'income') {
        allMealIncome += tx.amount
        if (isPeriod) {
          periodMealIncome += tx.amount
        }
      } else {
        allMealExpenses += tx.amount
        if (isPeriod) {
          periodMealExpenses += tx.amount
        }
      }
    } else {
      // Débito (Pix, Débito, Transferência, Boleto, Dinheiro, etc.)
      if (tx.type === 'income') {
        allDebitIncome += tx.amount
        if (isPeriod) {
          periodDebitIncome += tx.amount
        }
      } else {
        allDebitExpenses += tx.amount
        if (isPeriod) {
          periodDebitExpenses += tx.amount
        }
      }
    }

    if (isPeriod) {
      if (tx.type === 'income') {
        periodIncome += tx.amount
      } else {
        periodExpenses += tx.amount
      }
    }
  }

  // Cálculos finais de saldos
  const debitBalance = settings.initialBalanceDebit + allDebitIncome - allDebitExpenses
  const mealBalance = settings.initialBalanceMeal + allMealIncome - allMealExpenses

  const creditLimit = settings.creditCardLimit
  const creditUsedTotal = activeCreditExpenses
  const creditAvailable = creditLimit - creditUsedTotal
  const creditUsedPercentage =
    creditLimit > 0 ? (creditUsedTotal / creditLimit) * 100 : 0

  // Totais do período
  const periodNetResult = periodIncome - periodExpenses
  const incomeCommittedRate =
    periodIncome > 0 ? (periodExpenses / periodIncome) * 100 : 0

  // Despesas do mês anterior
  let previousMonthExpenses = 0
  let hasPreviousData = false
  if (previousPeriodKey) {
    const prevExpenses = allTransactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(previousPeriodKey))
      .reduce((sum, t) => sum + t.amount, 0)

    previousMonthExpenses = prevExpenses
    hasPreviousData = allTransactions.some(
      (t) => t.type === 'expense' && t.date.startsWith(previousPeriodKey)
    )
  }

  const comparisonRate =
    previousMonthExpenses > 0
      ? ((periodExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0

  return {
    debitBalance,
    debitIncomePeriod: periodDebitIncome,
    debitExpensesPeriod: periodDebitExpenses,
    debitInitial: settings.initialBalanceDebit,

    creditLimit,
    creditUsedTotal,
    creditUsedPeriod: periodCreditExpenses,
    creditAvailable,
    creditUsedPercentage,

    mealBalance,
    mealIncomePeriod: periodMealIncome,
    mealExpensesPeriod: periodMealExpenses,
    mealInitial: settings.initialBalanceMeal,

    periodIncome,
    periodExpenses,
    periodNetResult,
    incomeCommittedRate,

    previousMonthExpenses,
    comparisonRate,
    hasPreviousData,
  }
}
