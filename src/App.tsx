import React, { useState, useMemo, useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { FinancialIndicators } from './components/dashboard/FinancialIndicators'
import { MonthlyEvolutionChart } from './components/dashboard/MonthlyEvolutionChart'
import { CategoryDistributionList } from './components/dashboard/CategoryDistributionList'
import { ComparativeSummaryCard } from './components/dashboard/ComparativeSummaryCard'
import { RecentTransactionsTable } from './components/transactions/RecentTransactionsTable'
import { TransactionsPage } from './components/transactions/TransactionsPage'
import { ComparativesPage } from './components/comparatives/ComparativesPage'
import { WhatsAppPage } from './components/whatsapp/WhatsAppPage'
import { BudgetsPage } from './components/budgets/BudgetsPage'
import { GoalsPage } from './components/goals/GoalsPage'
import { SettingsPage } from './components/settings/SettingsPage'
import { TransactionFormModal } from './components/transactions/TransactionFormModal'
import { storageService } from './services/storageService'
import {
  DEMO_SUMMARY,
  MONTHLY_EVOLUTION,
} from './data/mockData'
import {
  NavPage,
  Transaction,
  Budget,
  Goal,
  GoalMovement,
  PeriodSummary,
  MonthlyExpensePoint,
  CategoryDistribution,
} from './types'
import { CheckCircle2 } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/auth/AuthPage'

function AppContent() {
  const { session, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<NavPage>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('Outubro de 2026')

  // Carrega transações a partir do storage local seguro
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return storageService.getTransactions()
  })

  // Carrega orçamentos persistidos
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    return storageService.getBudgets()
  })

  // Carrega metas financeiras persistidas
  const [goals, setGoals] = useState<Goal[]>(() => {
    return storageService.getGoals()
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Salvar transações localmente
  useEffect(() => {
    storageService.saveTransactions(transactions)
  }, [transactions])

  // Salvar orçamentos localmente
  useEffect(() => {
    storageService.saveBudgets(budgets)
  }, [budgets])

  // Salvar metas localmente
  useEffect(() => {
    storageService.saveGoals(goals)
  }, [goals])

  // Disparar feedback toast
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Recalcular métricas dinamicamente com base nas transações reais
  const summary: PeriodSummary = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)

    const balance = income - expenses
    const incomeCommittedRate = income > 0 ? (expenses / income) * 100 : 0
    const previousMonthExpenses = DEMO_SUMMARY.previousMonthExpenses
    const comparisonRate =
      previousMonthExpenses > 0
        ? ((expenses - previousMonthExpenses) / previousMonthExpenses) * 100
        : 0

    return {
      periodLabel: selectedPeriod,
      income,
      expenses,
      balance,
      incomeCommittedRate,
      previousMonthExpenses,
      comparisonRate,
      hasPreviousData: previousMonthExpenses > 0,
    }
  }, [transactions, selectedPeriod])

  // Recalcular distribuição de categorias dinamicamente com base nas transações reais
  const categoriesData: CategoryDistribution[] = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === 'expense')
    const totalExp = expenseTx.reduce((acc, t) => acc + t.amount, 0)

    const categoryTotals: Record<string, number> = {}
    expenseTx.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
    })

    const categoriesOrder = [
      'Alimentação',
      'Moradia',
      'Transporte',
      'Lazer',
      'Assinaturas',
      'Saúde',
      'Contas e serviços',
      'Outros',
    ]

    return categoriesOrder
      .map((catName) => {
        const amount = categoryTotals[catName] || 0
        const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0
        return {
          name: catName,
          amount,
          percentage,
        }
      })
      .filter(
        (c) =>
          c.amount > 0 ||
          ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Assinaturas', 'Outros'].includes(
            c.name
          )
      )
  }, [transactions])

  // Dados do gráfico atualizados com a despesa atual calculada
  const evolutionData: MonthlyExpensePoint[] = useMemo(() => {
    return MONTHLY_EVOLUTION.map((point: MonthlyExpensePoint) => {
      if (point.month === 'Out') {
        return {
          ...point,
          expenses: summary.expenses,
        }
      }
      return point
    })
  }, [summary.expenses])

  // --- CRUD DE TRANSAÇÕES ---
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    }
    setTransactions((prev) => [newTx, ...prev])
  }

  const handleUpdateTransaction = (id: string, updatedTxData: Omit<Transaction, 'id'>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...updatedTxData, id } : tx))
    )
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  const handleResetData = () => {
    storageService.clearAll()
    setTransactions([])
    setBudgets([])
    setGoals([])
    showToast('Dados reiniciados para o estado inicial limpo.')
  }

  // --- CRUD DE ORÇAMENTOS ---
  const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `bg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setBudgets((prev) => [newBudget, ...prev])
  }

  const handleUpdateBudget = (id: string, budgetData: Omit<Budget, 'id'>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...budgetData, id } : b))
    )
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  // --- CRUD DE METAS ---
  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const goalId = `gl-${Date.now()}`
    const movements: GoalMovement[] = []

    if (goalData.currentAmount > 0) {
      movements.push({
        id: `mov-${Date.now()}`,
        goalId,
        type: 'deposit',
        amount: goalData.currentAmount,
        date: new Date().toISOString().split('T')[0],
        notes: 'Saldo inicial registrado',
      })
    }

    const newGoal: Goal = {
      ...goalData,
      id: goalId,
      initialAmount: goalData.currentAmount,
      createdAt: new Date().toISOString(),
      movements,
    }
    setGoals((prev) => [newGoal, ...prev])
  }

  const handleUpdateGoal = (id: string, goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...goalData } : g))
    )
  }

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const handleMovementGoal = (
    goalId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    notes?: string
  ) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g

        if (type === 'withdrawal' && amount > g.currentAmount) {
          throw new Error('Valor da retirada superior ao saldo acumulado disponível.')
        }

        const newCurrent =
          type === 'deposit'
            ? g.currentAmount + amount
            : g.currentAmount - amount

        const movement: GoalMovement = {
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          goalId,
          type,
          amount,
          date,
          notes,
        }

        return {
          ...g,
          currentAmount: newCurrent,
          movements: [movement, ...(g.movements || [])],
        }
      })
    )
  }

  // Exportar dados para CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Descrição',
      'Estabelecimento',
      'Categoria',
      'Data',
      'Método de Pagamento',
      'Tipo',
      'Valor (R$)',
    ]
    const rows = transactions.map((t) => [
      t.id,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${(t.establishment || '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.date,
      `"${t.paymentMethod}"`,
      t.type === 'expense' ? 'Despesa' : 'Receita',
      t.amount.toFixed(2).replace('.', ','),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `finora_extrato_${selectedPeriod.toLowerCase().replace(/\s+/g, '_')}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast('Relatório CSV exportado com sucesso.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/20">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-4 shadow-subtle animate-pulse">
          <span className="font-display font-bold text-2xl tracking-tighter">F</span>
        </div>
        <p className="text-xs text-text-secondary font-medium tracking-wide">
          Carregando Finora...
        </p>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex">
      {/* 1. Navegação Lateral */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Cabeçalho Principal (na visão geral) */}
        {currentPage === 'overview' && (
          <Header
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenNewTransaction={() => setIsQuickAddOpen(true)}
            selectedPeriod={selectedPeriod}
            onSelectPeriod={setSelectedPeriod}
            onResetData={handleResetData}
            onExportCSV={handleExportCSV}
          />
        )}

        {/* Feedback Toast */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 bg-surface border border-primary/30 text-text-primary px-4 py-3 rounded-xl shadow-dropdown flex items-center gap-2.5 text-xs animate-fade-in"
          >
            <CheckCircle2 size={16} className="text-primary shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
          {currentPage === 'overview' && (
            <>
              {/* Indicadores Financeiros */}
              <FinancialIndicators summary={summary} />

              {/* Resumo Comparativo */}
              <ComparativeSummaryCard
                currentExpenses={summary.expenses}
                previousExpenses={summary.previousMonthExpenses}
                rate={summary.comparisonRate}
              />

              {/* Seção Central em Grid: Gráfico de Evolução e Distribuição por Categoria */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7">
                  <MonthlyEvolutionChart data={evolutionData} />
                </div>
                <div className="lg:col-span-5">
                  <CategoryDistributionList
                    categories={categoriesData}
                    totalExpenses={summary.expenses}
                  />
                </div>
              </div>

              {/* Transações Recentes */}
              <RecentTransactionsTable
                transactions={transactions}
                onOpenNewTransaction={() => setIsQuickAddOpen(true)}
                onViewAll={() => setCurrentPage('transactions')}
              />
            </>
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              showToast={showToast}
            />
          )}

          {currentPage === 'categories' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-line">
                <div>
                  <h1 className="text-2xl font-display font-bold text-text-primary">
                    Categorias
                  </h1>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Centros de custo e alocação orçamentária do período.
                  </p>
                </div>
              </div>
              <CategoryDistributionList
                categories={categoriesData}
                totalExpenses={summary.expenses}
              />
            </div>
          )}

          {currentPage === 'comparatives' && (
            <ComparativesPage transactions={transactions} />
          )}

          {currentPage === 'budgets' && (
            <BudgetsPage
              budgets={budgets}
              transactions={transactions}
              onAddBudget={handleAddBudget}
              onUpdateBudget={handleUpdateBudget}
              onDeleteBudget={handleDeleteBudget}
              showToast={showToast}
            />
          )}

          {currentPage === 'goals' && (
            <GoalsPage
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onMovementGoal={handleMovementGoal}
              showToast={showToast}
            />
          )}

          {currentPage === 'whatsapp' && (
            <WhatsAppPage />
          )}

          {currentPage === 'settings' && (
            <SettingsPage onBackToOverview={() => setCurrentPage('overview')} />
          )}
        </main>
      </div>

      {/* Modal Rápido de Criação no Header da Visão Geral */}
      <TransactionFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={(newTx) => {
          handleAddTransaction(newTx)
          showToast(`Lançamento "${newTx.description}" adicionado com sucesso.`)
        }}
      />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
