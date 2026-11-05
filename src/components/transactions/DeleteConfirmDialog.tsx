import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Transaction } from '../../types'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  transaction: Transaction | null
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) => {
  if (!transaction) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Transação"
      subtitle="Confirme se realmente deseja remover este lançamento financeiro."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-text-primary leading-relaxed">
            Esta ação removerá o registro contábil e atualizará automaticamente o saldo e os totais do período.
          </div>
        </div>

        {/* Resumo da transação a ser excluída */}
        <div className="p-3.5 bg-muted-surface border border-border-line rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Descrição:</span>
            <span className="font-semibold text-text-primary">{transaction.description}</span>
          </div>
          {transaction.establishment && (
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Estabelecimento:</span>
              <span className="text-text-primary">{transaction.establishment}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Data:</span>
            <span className="text-text-primary font-medium">{formatDateBR(transaction.date)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-line/70">
            <span className="text-text-secondary font-medium">Valor:</span>
            <span
              className={`font-display font-bold num-financial text-sm ${
                transaction.type === 'expense' ? 'text-danger' : 'text-primary'
              }`}
            >
              {transaction.type === 'expense' ? '- ' : '+ '}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Ações */}
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
