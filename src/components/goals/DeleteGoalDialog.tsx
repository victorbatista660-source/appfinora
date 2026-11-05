import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Goal } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

interface DeleteGoalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  goal: Goal | null
}

export const DeleteGoalDialog: React.FC<DeleteGoalDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  goal,
}) => {
  if (!goal) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Meta Financeira"
      subtitle="Confirme a remoção deste objetivo financeiro."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg flex items-start gap-3">
          <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-text-primary leading-relaxed">
            Esta ação excluirá o registro desta meta e seu histórico de progresso.
          </div>
        </div>

        <div className="p-3.5 bg-muted-surface border border-border-line rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Nome:</span>
            <span className="font-semibold text-text-primary">{goal.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Valor desejado:</span>
            <span className="font-semibold text-text-primary num-financial">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Acumulado:</span>
            <span className="font-semibold text-primary num-financial">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" onClick={onConfirm}>
            Confirmar Exclusão
          </Button>
        </div>
      </div>
    </Modal>
  )
}
