export type TransactionType = 'income' | 'expense'

export type PaymentMethod =
  | 'Cartão de Crédito'
  | 'Pix'
  | 'Cartão de Débito'
  | 'Transferência'
  | 'Boleto'
  | 'Dinheiro'
  | 'Vale Alimentação/Refeição'
  | 'Outros'

export type TransactionOrigin = 'manual' | 'whatsapp'

export type NavPage =
  | 'overview'
  | 'transactions'
  | 'categories'
  | 'comparatives'
  | 'budgets'
  | 'goals'
  | 'whatsapp'
  | 'settings'

export interface Category {
  id: string
  name: string
  color?: string
}

export interface Transaction {
  id: string
  description: string
  establishment?: string
  amount: number
  type: TransactionType
  category: string
  date: string // YYYY-MM-DD
  paymentMethod: PaymentMethod
  origin?: TransactionOrigin
  notes?: string
}

export interface Budget {
  id: string
  category: string
  allocated: number
  spent?: number
  month: string // YYYY-MM (ex: "2026-10")
  notes?: string
  createdAt?: string
}

export interface GoalMovement {
  id: string
  goalId: string
  type: 'deposit' | 'withdrawal'
  amount: number
  date: string // YYYY-MM-DD
  notes?: string
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  initialAmount?: number
  deadline?: string // YYYY-MM-DD
  category?: string
  notes?: string
  createdAt: string
  movements?: GoalMovement[]
}

export interface FinancialSummary {
  netWorth: number
  netWorthChangeMonth: number
  cashBalance: number
  investmentsBalance: number
  emergencyFundBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
}

export interface CategoryDistribution {
  name: string
  amount: number
  percentage: number
}

export interface MonthlyExpensePoint {
  month: string
  fullLabel: string
  expenses: number
}

export interface PeriodSummary {
  periodLabel: string
  income: number
  expenses: number
  balance: number
  incomeCommittedRate: number
  previousMonthExpenses: number
  comparisonRate: number
  hasPreviousData: boolean
}

export interface AccountSettings {
  id?: string
  userId?: string
  creditCardLimit: number
  initialBalanceDebit: number
  initialBalanceMeal: number
}
