import { Transaction, PaymentMethod } from '../types'

export interface AccountSettings {
  creditCardLimit: number
  initialBalanceDebit: number
  initialBalanceMeal: number
}

export type AccountCategory = 'debit' | 'credit' | 'meal'

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
  // Transações do período selecionado
  const periodTransactions = allTransactions.filter((tx) =>
    tx.date.startsWith(selectedPeriodKey)
  )

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
  // Limite disponível = limite total − todas as despesas em crédito em aberto
  // ----------------------------------------------------
  let allCreditExpenses = 0
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
        allCreditExpenses += tx.amount
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
  const creditUsedTotal = allCreditExpenses
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
