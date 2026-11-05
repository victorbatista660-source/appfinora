import { Transaction, Budget, Goal } from '../types'

const KEYS = {
  LEGACY_DEMO: 'finora_demo_transactions_v1',
  TRANSACTIONS: 'finora_transactions_v2',
  BUDGETS: 'finora_budgets_v2',
  GOALS: 'finora_goals_v2',
  SETTINGS: 'finora_settings_v2',
} as const

// Limpeza automática da chave legada de dados fictícios
function cleanLegacyDemoData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (localStorage.getItem(KEYS.LEGACY_DEMO)) {
        localStorage.removeItem(KEYS.LEGACY_DEMO)
      }
    }
  } catch {
    // Ignorar falhas de storage em ambientes restritos
  }
}

cleanLegacyDemoData()

export const storageService = {
  // Transações
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar transações locais:', err)
    }
    return []
  },

  saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions))
    } catch (err) {
      console.warn('Erro ao salvar transações locais:', err)
    }
  },

  // Orçamentos
  getBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(KEYS.BUDGETS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar orçamentos locais:', err)
    }
    return []
  },

  saveBudgets(budgets: Budget[]): void {
    try {
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(budgets))
    } catch (err) {
      console.warn('Erro ao salvar orçamentos locais:', err)
    }
  },

  // Metas
  getGoals(): Goal[] {
    try {
      const data = localStorage.getItem(KEYS.GOALS)
      if (data) {
        const parsed = JSON.parse(data)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar metas locais:', err)
    }
    return []
  },

  saveGoals(goals: Goal[]): void {
    try {
      localStorage.setItem(KEYS.GOALS, JSON.stringify(goals))
    } catch (err) {
      console.warn('Erro ao salvar metas locais:', err)
    }
  },

  // Limpar todos os dados locais
  clearAll(): void {
    try {
      localStorage.removeItem(KEYS.TRANSACTIONS)
      localStorage.removeItem(KEYS.BUDGETS)
      localStorage.removeItem(KEYS.GOALS)
    } catch (err) {
      console.warn('Erro ao limpar storage local:', err)
    }
  },
}
