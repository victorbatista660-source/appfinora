import React, { useState, useMemo } from 'react'
import { Goal } from '../../types'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { Button } from '../ui/Button'
import { GoalModal } from './GoalModal'
import { GoalMovementModal } from './GoalMovementModal'
import { GoalHistoryModal } from './GoalHistoryModal'
import { DeleteGoalDialog } from './DeleteGoalDialog'
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  History,
  TrendingUp,
  Clock,
} from 'lucide-react'

interface GoalsPageProps {
  goals: Goal[]
  onAddGoal: (goalData: Omit<Goal, 'id' | 'createdAt'>) => void
  onUpdateGoal: (id: string, goalData: Omit<Goal, 'id' | 'createdAt'>) => void
  onDeleteGoal: (id: string) => void
  onMovementGoal: (
    id: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    notes?: string
  ) => void
  showToast: (msg: string) => void
}

type GoalFilterTab = 'all' | 'in_progress' | 'completed'

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onMovementGoal,
  showToast,
}) => {
  const [filterTab, setFilterTab] = useState<GoalFilterTab>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  const [goalToMove, setGoalToMove] = useState<Goal | null>(null)
  const [goalToHistory, setGoalToHistory] = useState<Goal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)

  // Métricas Consolidadas
  const totals = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
    const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0)
    const overallProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0
    const completedCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length
    const inProgressCount = goals.length - completedCount

    return {
      totalTarget,
      totalAccumulated,
      overallProgress: Math.min(overallProgress, 100),
      completedCount,
      inProgressCount,
    }
  }, [goals])

  // Filtragem das Metas por aba
  const filteredGoals = useMemo(() => {
    if (filterTab === 'completed') {
      return goals.filter((g) => g.currentAmount >= g.targetAmount)
    }
    if (filterTab === 'in_progress') {
      return goals.filter((g) => g.currentAmount < g.targetAmount)
    }
    return goals
  }, [goals, filterTab])

  const handleSaveForm = (goalData: Omit<Goal, 'id' | 'createdAt'>, idToEdit?: string) => {
    if (idToEdit) {
      onUpdateGoal(idToEdit, goalData)
      showToast(`Meta "${goalData.title}" atualizada com sucesso.`)
    } else {
      onAddGoal(goalData)
      showToast(`Meta "${goalData.title}" criada com sucesso.`)
    }
    setGoalToEdit(null)
    setIsCreateOpen(false)
  }

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete.id)
      showToast(`Meta "${goalToDelete.title}" excluída com sucesso.`)
      setGoalToDelete(null)
    }
  }

  const handleConfirmMovement = (
    goalId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    notes?: string
  ) => {
    try {
      onMovementGoal(goalId, type, amount, date, notes)
      const actionLabel = type === 'deposit' ? 'Aporte' : 'Retirada'
      showToast(`${actionLabel} de ${formatCurrency(amount)} registrado com sucesso.`)
      // Manter referência atualizada se histórico estiver aberto
      if (goalToHistory && goalToHistory.id === goalId) {
        const updated = goals.find((g) => g.id === goalId)
        if (updated) setGoalToHistory(updated)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar movimentação.'
      showToast(msg)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-line gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Metas
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Defina objetivos patrimoniais, registre aportes e retiradas e acompanhe o progresso em tempo real.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} strokeWidth={2.2} />}
          onClick={() => setIsCreateOpen(true)}
        >
          Nova meta
        </Button>
      </div>

      {/* 2. Resumo Superior */}
      {goals.length > 0 && (
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-border-line/70">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Total Acumulado
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-primary num-financial block mt-1">
                {formatCurrency(totals.totalAccumulated)}
              </span>
              <span className="text-xs text-text-secondary mt-0.5 block">
                em {goals.length} {goals.length === 1 ? 'meta cadastrada' : 'metas cadastradas'}
              </span>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Valor Desejado Consolidado
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block mt-1">
                {formatCurrency(totals.totalTarget)}
              </span>
              <span className="text-xs text-text-secondary mt-0.5 block">
                objetivo financeiro total
              </span>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Progresso Geral
              </span>
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block mt-1">
                {totals.overallProgress.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </span>
              <div className="h-1.5 w-full bg-muted-surface rounded-full overflow-hidden mt-2">
                <div
                  style={{ width: `${totals.overallProgress}%` }}
                  className="h-full bg-primary rounded-full transition-all duration-fast"
                />
              </div>
            </div>

            <div className="pt-4 sm:pt-0 lg:pl-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block">
                Status das Metas
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-display font-bold text-primary num-financial">
                  {totals.completedCount}
                </span>
                <span className="text-xs text-text-secondary">
                  concluída(s) de {goals.length}
                </span>
              </div>
              <span className="text-xs text-text-secondary mt-1 block">
                {totals.inProgressCount} em andamento
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filtros por Aba */}
      {goals.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border-line pb-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterTab === 'all'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-muted-surface'
            }`}
          >
            Todas ({goals.length})
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterTab === 'in_progress'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-muted-surface'
            }`}
          >
            <Clock size={13} />
            Em andamento ({totals.inProgressCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterTab === 'completed'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-muted-surface'
            }`}
          >
            <CheckCircle2 size={13} />
            Concluídas ({totals.completedCount})
          </button>
        </div>
      )}

      {/* 4. Lista de Metas */}
      {goals.length === 0 ? (
        <div className="bg-surface border border-border-line rounded-xl p-16 text-center shadow-subtle">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-muted-surface border border-border-line flex items-center justify-center mx-auto text-primary">
              <Target size={22} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Nenhuma meta cadastrada
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Crie objetivos para sua reserva de emergência, aquisições importantes ou viagens, defina um saldo inicial e registre aportes e retiradas com histórico completo.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={<Plus size={15} strokeWidth={2.2} />}
                onClick={() => setIsCreateOpen(true)}
              >
                Cadastrar primeira meta
              </Button>
            </div>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="bg-surface border border-border-line rounded-xl p-12 text-center shadow-subtle">
          <p className="text-xs text-text-secondary">
            Nenhuma meta encontrada nesta categoria de filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress =
              goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
            const isCompleted = goal.currentAmount >= goal.targetAmount
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
            const movementsCount = goal.movements?.length || 0

            return (
              <div
                key={goal.id}
                className={`bg-surface border rounded-xl p-6 shadow-subtle flex flex-col justify-between space-y-5 transition-colors ${
                  isCompleted
                    ? 'border-primary/40 hover:border-primary'
                    : 'border-border-line hover:border-accent/40'
                }`}
              >
                <div>
                  {/* Cabeçalho da Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="overflow-hidden">
                      <h3 className="font-display font-semibold text-base text-text-primary truncate">
                        {goal.title}
                      </h3>
                      {goal.category && (
                        <span className="text-[11px] text-text-secondary mt-0.5 inline-block">
                          {goal.category}
                        </span>
                      )}
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 shrink-0">
                        <CheckCircle2 size={12} />
                        Concluída
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-muted-surface px-2 py-0.5 rounded-md border border-border-line shrink-0">
                        <TrendingUp size={11} className="text-primary" />
                        Em andamento
                      </span>
                    )}
                  </div>

                  {/* Valores Financeiros */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-text-secondary">Acumulado:</span>
                      <span className="font-display font-bold text-lg text-primary num-financial">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-text-secondary">
                      <span>Valor desejado:</span>
                      <span className="font-display font-semibold num-financial text-text-primary">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs text-text-secondary">
                      <span>Saldo restante:</span>
                      <span
                        className={`font-display font-medium num-financial ${
                          isCompleted ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {isCompleted ? 'R$ 0,00 (Meta Atingida)' : formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="h-2 w-full bg-muted-surface rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(progress, 100)}%` }}
                        className={`h-full rounded-full transition-all duration-fast ${
                          isCompleted ? 'bg-primary' : 'bg-primary'
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-secondary pt-0.5">
                      <span className="font-medium text-text-primary">
                        {progress.toLocaleString('pt-BR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}%
                        {' '}concluído
                      </span>
                      {goal.deadline && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateBR(goal.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-[11px] text-text-secondary/90 italic mt-3 pt-2 border-t border-border-line/60 line-clamp-2">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Ações da Meta */}
                <div className="pt-4 border-t border-border-line flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ArrowUpDown size={13} className="text-primary" />}
                      onClick={() => setGoalToMove(goal)}
                    >
                      Movimentar
                    </Button>
                    <button
                      onClick={() => setGoalToHistory(goal)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary hover:bg-muted-surface border border-border-line transition-colors min-h-[32px]"
                      title="Ver histórico de movimentações"
                    >
                      <History size={13} />
                      <span className="hidden sm:inline">Histórico</span> ({movementsCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setGoalToEdit(goal)}
                      aria-label={`Editar meta ${goal.title}`}
                      className="p-2 text-text-secondary hover:text-primary hover:bg-muted-surface rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Editar meta"
                    >
                      <Edit2 size={14} strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      aria-label={`Excluir meta ${goal.title}`}
                      className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Excluir meta"
                    >
                      <Trash2 size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <GoalModal
        isOpen={isCreateOpen || Boolean(goalToEdit)}
        onClose={() => {
          setIsCreateOpen(false)
          setGoalToEdit(null)
        }}
        onSave={handleSaveForm}
        goalToEdit={goalToEdit}
      />

      {/* Modal de Movimentação (Aporte / Retirada) */}
      <GoalMovementModal
        isOpen={Boolean(goalToMove)}
        onClose={() => setGoalToMove(null)}
        goal={goalToMove}
        onMovement={handleConfirmMovement}
      />

      {/* Modal de Histórico de Movimentações */}
      <GoalHistoryModal
        isOpen={Boolean(goalToHistory)}
        onClose={() => setGoalToHistory(null)}
        goal={goalToHistory}
      />

      {/* Diálogo de Exclusão */}
      <DeleteGoalDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleConfirmDelete}
        goal={goalToDelete}
      />
    </div>
  )
}
