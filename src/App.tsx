import React, { useState, useMemo, useEffect, useCallback } from 'react'
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
import { dbService } from './services/dbService'
import {
  getCurrentPeriodLabel,
  getKeyFromPeriodLabel,
  getPreviousPeriodKey,
  generateAvailablePeriods,
  calculateMonthlyEvolutionWindow,
} from './lib/periodUtils'
import {
  calculateFinancialMetrics,
  FinancialCalculationResult,
  splitInstallments,
} from './lib/accountUtils'
import {
  NavPage,
  Transaction,
  Budget,
  Goal,
  MonthlyExpensePoint,
  CategoryDistribution,
  AccountSettings,
} from './types'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/auth/AuthPage'

function AppContent() {
  const { session, user, loading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState<NavPage>('overview')

  // Período selecionado inicializado com o mês atual real
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => getCurrentPeriodLabel())

  // Estados com dados do Supabase
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    creditCardLimit: 0,
    initialBalanceDebit: 0,
    initialBalanceMeal: 0,
  })
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Períodos disponíveis computados dinamicamente (histórico + atual + 12 meses futuros)
  const availablePeriods = useMemo(() => {
    return generateAvailablePeriods(transactions)
  }, [transactions])

  const currentPeriodKey = useMemo(() => {
    return getKeyFromPeriodLabel(selectedPeriod)
  }, [selectedPeriod])

  const previousPeriodKey = useMemo(() => {
    return getPreviousPeriodKey(currentPeriodKey)
  }, [currentPeriodKey])

  // Carrega todos os dados do Supabase para o usuário logado
  const fetchUserData = useCallback(async () => {
    if (!user) return
    setIsDataLoading(true)
    setDataError(null)

    try {
      const [txs, bgs, gls, cfg] = await Promise.all([
        dbService.getTransactions(),
        dbService.getBudgets(),
        dbService.getGoals(),
        dbService.getAccountSettings(user.id),
      ])
      setTransactions(txs)
      setBudgets(bgs)
      setGoals(gls)
      setAccountSettings(cfg)
    } catch (err: unknown) {
      console.error('Erro ao sincronizar dados com o Supabase:', err)
      setDataError(
        'Falha ao carregar dados do Supabase. Verifique sua conexão ou se a migração SQL foi aplicada.'
      )
    } finally {
      setIsDataLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user, fetchUserData])

  // Disparar feedback toast
  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Motor único de cálculo das 3 contas e totais para o período ativo
  const financialMetrics: FinancialCalculationResult = useMemo(() => {
    return calculateFinancialMetrics(
      transactions,
      currentPeriodKey,
      accountSettings,
      previousPeriodKey
    )
  }, [transactions, currentPeriodKey, accountSettings, previousPeriodKey])

  // Recalcular distribuição de categorias dinamicamente para o período selecionado
  const categoriesData: CategoryDistribution[] = useMemo(() => {
    const expenseTx = transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentPeriodKey)
    )
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
  }, [transactions, currentPeriodKey])

  // Gráfico com janela de 6 meses real calculada a partir do Supabase
  const evolutionData: MonthlyExpensePoint[] = useMemo(() => {
    return calculateMonthlyEvolutionWindow(currentPeriodKey, transactions)
  }, [currentPeriodKey, transactions])

  // --- CRUD DE TRANSAÇÕES ---
  const handleAddTransaction = async (
    newTxData: Omit<Transaction, 'id'>,
    options?: { installmentsCount?: number }
  ) => {
    if (!user) return
    try {
      const installmentsCount = options?.installmentsCount || 1

      if (
        installmentsCount > 1 &&
        newTxData.type === 'expense' &&
        newTxData.paymentMethod === 'Cartão de Crédito'
      ) {
        const groupId = crypto.randomUUID()
        const totalAmount = newTxData.amount
        const splits = splitInstallments(totalAmount, installmentsCount, newTxData.date)

        const batchRows = splits.map((split) => ({
          ...newTxData,
          amount: split.amount,
          date: split.date,
          installmentGroupId: groupId,
          installmentNumber: split.installmentNumber,
          installmentTotal: split.installmentTotal,
          totalAmount: totalAmount,
        }))

        const createdBatch = await dbService.createTransactionsBatch(batchRows, user.id)
        setTransactions((prev) => [...createdBatch, ...prev])
        showToast(`Compra no cartão em ${installmentsCount}x cadastrada com sucesso.`)
      } else {
        const created = await dbService.createTransaction(
          {
            ...newTxData,
            installmentNumber: 1,
            installmentTotal: 1,
            totalAmount: newTxData.amount,
          },
          user.id
        )
        setTransactions((prev) => [created, ...prev])
        showToast(`Lançamento "${created.description}" adicionado com sucesso.`)
      }
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao cadastrar transação no Supabase.')
    }
  }

  const handleUpdateTransaction = async (
    id: string,
    updatedTxData: Omit<Transaction, 'id'>,
    options?: { applyToGroup?: boolean }
  ) => {
    if (!user) return
    try {
      if (options?.applyToGroup && updatedTxData.installmentGroupId) {
        await dbService.updateInstallmentGroup(
          updatedTxData.installmentGroupId,
          {
            description: updatedTxData.description,
            amount: updatedTxData.amount,
          },
          user.id
        )
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.installmentGroupId === updatedTxData.installmentGroupId
              ? {
                  ...tx,
                  description: updatedTxData.description,
                  amount: updatedTxData.amount,
                  establishment: updatedTxData.establishment,
                  category: updatedTxData.category,
                }
              : tx
          )
        )
        showToast('Todas as parcelas do grupo foram atualizadas com sucesso.')
      } else {
        await dbService.updateTransaction(id, updatedTxData, user.id)
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? { ...updatedTxData, id } : tx))
        )
        showToast('Lançamento atualizado com sucesso.')
      }
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar transação no Supabase.')
    }
  }

  const handleDeleteTransaction = async (
    id: string,
    options?: { deleteMode?: 'single' | 'all'; groupId?: string }
  ) => {
    if (!user) return
    try {
      if (options?.deleteMode === 'all' && options.groupId) {
        await dbService.deleteInstallmentGroup(options.groupId, user.id)
        setTransactions((prev) => prev.filter((tx) => tx.installmentGroupId !== options.groupId))
        showToast('Todas as parcelas da compra foram removidas com sucesso.')
      } else {
        await dbService.deleteTransaction(id, user.id)
        setTransactions((prev) => prev.filter((tx) => tx.id !== id))
        showToast('Lançamento removido com sucesso.')
      }
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao excluir transação no Supabase.')
    }
  }

  const handleResetData = async () => {
    await fetchUserData()
    showToast('Dados sincronizados com o Supabase.')
  }

  // --- CRUD DE ORÇAMENTOS ---
  const handleAddBudget = async (budgetData: Omit<Budget, 'id'>) => {
    if (!user) return
    try {
      const created = await dbService.createBudget(budgetData, user.id)
      setBudgets((prev) => [created, ...prev])
      showToast('Orçamento registrado com sucesso.')
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao salvar orçamento no Supabase.')
    }
  }

  const handleUpdateBudget = async (id: string, budgetData: Omit<Budget, 'id'>) => {
    if (!user) return
    try {
      await dbService.updateBudget(id, budgetData, user.id)
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? { ...budgetData, id } : b))
      )
      showToast('Orçamento atualizado com sucesso.')
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar orçamento no Supabase.')
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!user) return
    try {
      await dbService.deleteBudget(id, user.id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
      showToast('Orçamento excluído com sucesso.')
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao excluir orçamento no Supabase.')
    }
  }

  // --- CRUD DE METAS ---
  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return
    try {
      const created = await dbService.createGoal(goalData, user.id)
      setGoals((prev) => [created, ...prev])
      showToast(`Meta "${created.title}" registrada com sucesso.`)
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao criar meta no Supabase.')
    }
  }

  const handleUpdateGoal = async (id: string, goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return
    try {
      await dbService.updateGoal(id, goalData, user.id)
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...goalData } : g))
      )
      showToast('Meta atualizada com sucesso.')
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar meta no Supabase.')
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (!user) return
    try {
      await dbService.deleteGoal(id, user.id)
      setGoals((prev) => prev.filter((g) => g.id !== id))
      showToast('Meta excluída com sucesso.')
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao excluir meta no Supabase.')
    }
  }

  const handleMovementGoal = async (
    goalId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    notes?: string
  ) => {
    if (!user) return
    try {
      await dbService.addGoalMovement(goalId, type, amount, date, user.id, notes)
      const freshGoals = await dbService.getGoals()
      setGoals(freshGoals)
      showToast(
        type === 'deposit'
          ? 'Aporte registrado com sucesso.'
          : 'Retirada registrada com sucesso.'
      )
    } catch (err: unknown) {
      console.error(err)
      showToast(err instanceof Error ? err.message : 'Erro ao registrar movimentação no Supabase.')
      throw err
    }
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

  if (authLoading) {
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
            periods={availablePeriods}
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
          {/* Alerta de erro de dados */}
          {dataError && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center justify-between gap-4 animate-fade-in"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium">{dataError}</span>
              </div>
              <button
                onClick={fetchUserData}
                className="px-3 py-1.5 bg-surface text-text-primary border border-border-line rounded-lg hover:bg-muted-surface transition-colors font-medium text-xs shrink-0 flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>Tentar novamente</span>
              </button>
            </div>
          )}

          {/* Loader sutil de sincronização */}
          {isDataLoading && (
            <div className="p-3 bg-muted-surface/70 border border-border-line rounded-lg text-xs text-text-secondary flex items-center justify-center gap-2 animate-fade-in">
              <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Sincronizando dados com o Supabase...</span>
            </div>
          )}

          {currentPage === 'overview' && (
            <>
              {/* Indicadores Financeiros */}
              <FinancialIndicators
                metrics={financialMetrics}
                periodLabel={selectedPeriod}
              />

              {/* Resumo Comparativo */}
              <ComparativeSummaryCard
                currentExpenses={financialMetrics.periodExpenses}
                previousExpenses={financialMetrics.previousMonthExpenses}
                rate={financialMetrics.comparisonRate}
              />

              {/* Seção Central em Grid: Gráfico de Evolução e Distribuição por Categoria */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7">
                  <MonthlyEvolutionChart data={evolutionData} />
                </div>
                <div className="lg:col-span-5">
                  <CategoryDistributionList
                    categories={categoriesData}
                    totalExpenses={financialMetrics.periodExpenses}
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
              accountSettings={accountSettings}
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
                totalExpenses={financialMetrics.periodExpenses}
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
            <SettingsPage
              onBackToOverview={() => setCurrentPage('overview')}
              onDataRefresh={fetchUserData}
            />
          )}
        </main>
      </div>

      {/* Modal Rápido de Criação no Header da Visão Geral */}
      <TransactionFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={(newTx, _id, options) => {
          handleAddTransaction(newTx, { installmentsCount: options?.installmentsCount })
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
