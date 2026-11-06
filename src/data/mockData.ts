import { PaymentMethod, Transaction, Budget, Goal } from '../types'

export const FINORA_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Contas e serviços',
  'Saúde',
  'Educação',
  'Lazer',
  'Compras pessoais',
  'Assinaturas',
  'Investimentos e reservas',
  'Outros',
] as const

export const FINORA_PAYMENT_METHODS: PaymentMethod[] = [
  'Cartão de Crédito',
  'Pix',
  'Cartão de Débito',
  'Transferência',
  'Boleto',
  'Dinheiro',
  'Vale Alimentação/Refeição',
  'Outros',
]

export const CATEGORIES_LIST = [
  ...FINORA_CATEGORIES,
  'Receita',
]

export const PAYMENT_METHODS_LIST = FINORA_PAYMENT_METHODS

// Dados iniciais limpos: Nenhuma transação, meta ou orçamento fictício pré-carregado
export const EMPTY_TRANSACTIONS: Transaction[] = []
export const EMPTY_BUDGETS: Budget[] = []
export const EMPTY_GOALS: Goal[] = []

export const DEMO_TRANSACTIONS: Transaction[] = EMPTY_TRANSACTIONS
export const DEMO_BUDGETS: Budget[] = EMPTY_BUDGETS
export const DEMO_GOALS: Goal[] = EMPTY_GOALS

export const DEMO_SUMMARY = {
  periodLabel: 'Outubro de 2026',
  income: 0,
  expenses: 0,
  balance: 0,
  incomeCommittedRate: 0,
  previousMonthExpenses: 0,
  comparisonRate: 0,
  hasPreviousData: false,
}

export const MONTHLY_EVOLUTION = [
  { month: 'Mai', fullLabel: 'Maio', expenses: 0 },
  { month: 'Jun', fullLabel: 'Junho', expenses: 0 },
  { month: 'Jul', fullLabel: 'Julho', expenses: 0 },
  { month: 'Ago', fullLabel: 'Agosto', expenses: 0 },
  { month: 'Set', fullLabel: 'Setembro', expenses: 0 },
  { month: 'Out', fullLabel: 'Outubro', expenses: 0 },
]

