import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Goal } from '../../types'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { ArrowDownRight, ArrowUpRight, History, Calendar, FileText } from 'lucide-react'

interface GoalHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
}

export const GoalHistoryModal: React.FC<GoalHistoryModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  if (!goal) return null

  const movements = goal.movements || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico de Movimentações: "${goal.title}"`}
      subtitle="Registro auditável de todos os aportes e retiradas realizados nesta meta."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Sumário da Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-muted-surface border border-border-line rounded-xl text-xs">
          <div>
            <span className="text-text-secondary block">Saldo Acumulado</span>
            <span className="font-display font-bold text-base text-primary num-financial block mt-0.5">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div>
            <span className="text-text-secondary block">Valor Desejado</span>
            <span className="font-display font-bold text-base text-text-primary num-financial block mt-0.5">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-text-secondary block">Total de Movimentações</span>
            <span className="font-display font-bold text-base text-text-primary block mt-0.5">
              {movements.length} {movements.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div className="max-h-[360px] overflow-y-auto space-y-2.5 pr-1">
          {movements.length === 0 ? (
            <div className="p-8 text-center bg-muted-surface/50 border border-border-line/70 rounded-xl space-y-2">
              <History size={24} className="text-text-secondary mx-auto opacity-60" />
              <p className="text-xs font-semibold text-text-primary">
                Nenhuma movimentação registrada
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Utilize o botão &quot;Movimentar&quot; no cartão da meta para registrar aportes ou retiradas.
              </p>
            </div>
          ) : (
            movements.map((mov) => {
              const isDeposit = mov.type === 'deposit'

              return (
                <div
                  key={mov.id}
                  className="p-3.5 bg-surface border border-border-line rounded-lg flex items-center justify-between gap-3 text-xs hover:border-border-line/90 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-danger/10 text-danger border border-danger/20'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownRight size={16} strokeWidth={2.2} />
                      ) : (
                        <ArrowUpRight size={16} strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-[11px] uppercase tracking-wider ${
                            isDeposit ? 'text-primary' : 'text-danger'
                          }`}
                        >
                          {isDeposit ? 'Aporte' : 'Retirada'}
                        </span>
                        <span className="text-[11px] text-text-secondary inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateBR(mov.date)}
                        </span>
                      </div>
                      {mov.notes && (
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {mov.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-display font-bold text-sm num-financial block ${
                        isDeposit ? 'text-primary' : 'text-danger'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}
                      {formatCurrency(mov.amount)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-border-line flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Fechar Histórico
          </Button>
        </div>
      </div>
    </Modal>
  )
}
