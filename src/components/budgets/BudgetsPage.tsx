import React, { useState, useMemo } from 'react'
import { Budget, Transaction } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../ui/Button'
import { BudgetModal } from './BudgetModal'
import {
  PieChart,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Clock,
} from 'lucide-react'

interface BudgetsPageProps {
  budgets: Budget[]
  transactions: Transaction[]
  onAddBudget: (budgetData: Omit<Budget, 'id'>) => void
  onUpdateBudget: (id: string, budgetData: Omit<Budget, 'id'>) => void
  onDeleteBudget: (id: string) => void
  showToast: (msg: string) => void
}

function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(month: string): string {
  if (!month) return ''
  const [year, m] = month.split('-')
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  const idx = parseInt(m, 10) - 1
  return `${months[idx] ?? m} de ${year}`
}

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  transactions,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  showToast,
}) => {
  const currentMonthStr = useMemo(() => getCurrentMonth(), [])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null)
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)

  // Orçamentos filtrados pelo mês selecionado
  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === selectedMonth),
    [budgets, selectedMonth]
  )

  // Gastos reais por categoria no mês selecionado (usando despesas reais registradas)
  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    transactions
      .filter((t) => t.type === 'expense' && t.date && t.date.startsWith(selectedMonth))
      .forEach((t) => {
        const catKey = t.category.trim().toLowerCase()
        map[catKey] = (map[catKey] || 0) + t.amount
      })
    return map
  }, [transactions, selectedMonth])

  // Função auxiliar para pegar despesa real de uma categoria
  const getCategorySpent = (categoryName: string): number => {
    const key = categoryName.trim().toLowerCase()
    return spentByCategory[key] || 0
  }

  // Totais consolidados
  const totals = useMemo(() => {
    const totalAllocated = monthBudgets.reduce((s, b) => s + b.allocated, 0)
    const totalSpent = monthBudgets.reduce(
      (s, b) => s + getCategorySpent(b.category),
      0
    )
    const totalRemaining = totalAllocated - totalSpent

    // Alertas por limite
    let warningCount = 0 // 80% até 99.9%
    let exceededCount = 0 // 100%+

    monthBudgets.forEach((b) => {
      const spent = getCategorySpent(b.category)
      const pct = b.allocated > 0 ? (spent / b.allocated) * 100 : 0
      if (pct >= 100) {
        exceededCount++
      } else if (pct >= 80) {
        warningCount++
      }
    })

    const overallPct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

    return {
      totalAllocated,
      totalSpent,
      totalRemaining,
      warningCount,
      exceededCount,
      overallPct,
    }
  }, [monthBudgets, spentByCategory])

  const handleSave = (data: Omit<Budget, 'id'>, idToEdit?: string) => {
    if (idToEdit) {
      onUpdateBudget(idToEdit, data)
      showToast(`Orçamento de "${data.category}" atualizado com sucesso.`)
    } else {
      onAddBudget(data)
      showToast(`Orçamento para "${data.category}" definido com sucesso.`)
    }
    setBudgetToEdit(null)
    setIsCreateOpen(false)
  }

  const handleConfirmDelete = () => {
    if (budgetToDelete) {
      onDeleteBudget(budgetToDelete.id)
      showToast(`Orçamento de "${budgetToDelete.category}" removido com sucesso.`)
      setBudgetToDelete(null)
    }
  }

  const isCurrentMonthSelected = selectedMonth === currentMonthStr

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-line gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Orçamentos
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Defina tetos mensais por categoria e acompanhe o consumo real baseado nas despesas registradas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Mês */}
          <div className="inline-flex items-center gap-1 bg-muted-surface border border-border-line rounded-lg px-1 py-1">
            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
              aria-label="Mês anterior"
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Mês anterior"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <div className="relative flex items-center">
              <input
                type="month"
                id="budget-month-picker"
                aria-label="Selecionar mês de referência"
                value={selectedMonth}
                onChange={(e) => {
                  if (e.target.value) setSelectedMonth(e.target.value)
                }}
                className="opacity-0 absolute inset-0 cursor-pointer w-full"
              />
              <span className="px-3 text-xs font-medium text-text-primary min-w-[140px] text-center pointer-events-none flex items-center justify-center gap-1.5">
                <Calendar size={13} className="text-text-secondary" />
                {formatMonthLabel(selectedMonth)}
              </span>
            </div>
            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
              aria-label="Próximo mês"
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Próximo mês"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>

          {!isCurrentMonthSelected && (
            <button
              onClick={() => setSelectedMonth(currentMonthStr)}
              className="text-xs font-semibold text-primary hover:underline bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Clock size={13} />
              Mês Atual
            </button>
          )}

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={() => setIsCreateOpen(true)}
          >
            Novo orçamento
          </Button>
        </div>
      </div>

      {/* 2. Resumo Superior */}
      {monthBudgets.length > 0 && (
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-border-line/70">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Total Alocado
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block mt-1">
                {formatCurrency(totals.totalAllocated)}
              </span>
              <span className="text-xs text-text-secondary mt-0.5 block">
                em {monthBudgets.length}{' '}
                {monthBudgets.length === 1 ? 'categoria' : 'categorias'}
              </span>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Total Gasto
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block mt-1">
                {formatCurrency(totals.totalSpent)}
              </span>
              <span className="text-xs text-text-secondary mt-0.5 block">
                {totals.totalRemaining >= 0 ? (
                  <span className="text-primary font-medium">
                    Saldo restante: {formatCurrency(totals.totalRemaining)}
                  </span>
                ) : (
                  <span className="text-danger font-medium">
                    Excedido em {formatCurrency(Math.abs(totals.totalRemaining))}
                  </span>
                )}
              </span>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Utilização Geral
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block mt-1">
                {totals.overallPct.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </span>
              <div className="h-1.5 w-full bg-muted-surface rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${Math.min(totals.overallPct, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-fast ${
                    totals.overallPct >= 100
                      ? 'bg-danger'
                      : totals.overallPct >= 80
                      ? 'bg-[#b8860b]'
                      : 'bg-primary'
                  }`}
                />
              </div>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Alertas de Consumo
              </span>
              <div className="mt-1 flex items-center gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-display font-bold num-financial ${
                      totals.exceededCount > 0 ? 'text-danger' : 'text-text-primary'
                    }`}
                  >
                    {totals.exceededCount}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {totals.exceededCount === 1 ? 'estourada' : 'estouradas'}
                  </span>
                </div>
                {totals.warningCount > 0 && (
                  <div className="flex items-baseline gap-1.5 pl-3 border-l border-border-line">
                    <span className="text-2xl font-display font-bold num-financial text-[#b8860b]">
                      {totals.warningCount}
                    </span>
                    <span className="text-[11px] text-text-secondary">em alerta (≥80%)</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-text-secondary mt-1 block">
                {totals.exceededCount === 0 && totals.warningCount === 0
                  ? 'Todas dentro do limite estipulado'
                  : 'Acompanhamento recomendado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lista de Orçamentos */}
      {monthBudgets.length === 0 ? (
        <div className="bg-surface border border-border-line rounded-xl p-16 text-center shadow-subtle">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-muted-surface border border-border-line flex items-center justify-center mx-auto text-primary">
              <PieChart size={22} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Nenhum orçamento definido para {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Estabeleça limites mensais por categoria de despesa e monitore automaticamente o saldo restante e o percentual utilizado.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={15} strokeWidth={2.2} />}
                onClick={() => setIsCreateOpen(true)}
              >
                Definir primeiro orçamento
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {monthBudgets.map((budget) => {
            const spent = getCategorySpent(budget.category)
            const pct = budget.allocated > 0 ? (spent / budget.allocated) * 100 : 0
            const remaining = budget.allocated - spent
            const isExceeded = pct >= 100
            const isWarning = pct >= 80 && !isExceeded

            return (
              <div
                key={budget.id}
                className={`bg-surface border rounded-xl p-6 shadow-subtle transition-colors ${
                  isExceeded
                    ? 'border-danger/40 hover:border-danger'
                    : isWarning
                    ? 'border-[#b8860b]/40 hover:border-[#b8860b]'
                    : 'border-border-line hover:border-accent/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Informações da Categoria */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <h3 className="font-display font-semibold text-base text-text-primary truncate">
                        {budget.category}
                      </h3>

                      {/* Alerta 100% atingido / estourado */}
                      {isExceeded && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger bg-danger/10 px-2.5 py-0.5 rounded-full border border-danger/20 shrink-0">
                          <AlertCircle size={12} />
                          Limite Atingido (100%+)
                        </span>
                      )}

                      {/* Alerta 80% do limite */}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b8860b] bg-[#b8860b]/10 px-2.5 py-0.5 rounded-full border border-[#b8860b]/20 shrink-0">
                          <AlertTriangle size={12} />
                          Atenção (80% atingido)
                        </span>
                      )}

                      {!isExceeded && !isWarning && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                          <CheckCircle2 size={12} />
                          No limite
                        </span>
                      )}
                    </div>

                    {/* Valores: Orçado, Gasto, Saldo Restante */}
                    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-xs text-text-secondary mt-2">
                      <span>
                        Orçado:{' '}
                        <strong className="font-display font-semibold text-text-primary num-financial">
                          {formatCurrency(budget.allocated)}
                        </strong>
                      </span>
                      <span>
                        Gasto Real:{' '}
                        <strong
                          className={`font-display font-semibold num-financial ${
                            isExceeded ? 'text-danger' : 'text-text-primary'
                          }`}
                        >
                          {formatCurrency(spent)}
                        </strong>
                      </span>
                      <span>
                        Saldo Restante:{' '}
                        {remaining >= 0 ? (
                          <strong className="font-display font-semibold text-primary num-financial">
                            {formatCurrency(remaining)}
                          </strong>
                        ) : (
                          <strong className="font-display font-semibold text-danger num-financial">
                            -{formatCurrency(Math.abs(remaining))} (excedido)
                          </strong>
                        )}
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="h-2 w-full bg-muted-surface rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(pct, 100)}%` }}
                          className={`h-full rounded-full transition-all duration-fast ${
                            isExceeded
                              ? 'bg-danger'
                              : isWarning
                              ? 'bg-[#b8860b]'
                              : 'bg-primary'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-text-secondary">
                        <span className="font-medium">
                          {pct.toLocaleString('pt-BR', {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}%
                          {' '}utilizado
                        </span>
                        {budget.notes && (
                          <span className="italic truncate max-w-[280px]">
                            {budget.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setBudgetToEdit(budget)}
                      aria-label={`Editar orçamento de ${budget.category}`}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-muted-surface rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Editar orçamento"
                    >
                      <Edit2 size={15} strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => setBudgetToDelete(budget)}
                      aria-label={`Excluir orçamento de ${budget.category}`}
                      className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Excluir orçamento"
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <BudgetModal
        isOpen={isCreateOpen || Boolean(budgetToEdit)}
        onClose={() => {
          setIsCreateOpen(false)
          setBudgetToEdit(null)
        }}
        onSave={handleSave}
        budgetToEdit={budgetToEdit}
        defaultMonth={selectedMonth}
        existingBudgets={budgets}
      />

      {/* Diálogo de Exclusão */}
      {budgetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div
            className="fixed inset-0 bg-text-primary/30 backdrop-blur-xs"
            onClick={() => setBudgetToDelete(null)}
          />
          <div className="relative z-10 bg-surface border border-border-line rounded-xl p-6 shadow-dropdown max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-display font-semibold text-lg text-text-primary">
              Excluir Orçamento
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Tem certeza de que deseja remover o teto orçamentário de{' '}
              <strong className="text-text-primary">
                {budgetToDelete.category}
              </strong>{' '}
              ({formatCurrency(budgetToDelete.allocated)}) para o mês de{' '}
              <strong className="text-text-primary">
                {formatMonthLabel(budgetToDelete.month)}
              </strong>?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setBudgetToDelete(null)}
              >
                Cancelar
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
