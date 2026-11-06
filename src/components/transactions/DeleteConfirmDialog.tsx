import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Transaction } from '../../types'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { AlertTriangle, CreditCard } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deleteMode: 'single' | 'all') => void
  transaction: Transaction | null
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}) => {
  const [deleteMode, setDeleteMode] = useState<'single' | 'all'>('single')

  useEffect(() => {
    setDeleteMode('single')
  }, [transaction, isOpen])

  if (!transaction) return null

  const isInstallment = Boolean(
    transaction.installmentTotal && transaction.installmentTotal > 1
  )

  const handleConfirm = () => {
    onConfirm(deleteMode)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isInstallment ? 'Excluir Parcela de Cartão' : 'Excluir Transação'}
      subtitle={
        isInstallment
          ? 'Esta transação faz parte de uma compra parcelada.'
          : 'Confirme se realmente deseja remover este lançamento financeiro.'
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-lg flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-text-primary leading-relaxed">
            Esta ação removerá o registro contábil e atualizará automaticamente o saldo e o limite disponível.
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
          {isInstallment && (
            <div className="flex items-center justify-between">
              <span className="text-text-secondary flex items-center gap-1">
                <CreditCard size={12} className="text-primary" />
                Parcela:
              </span>
              <span className="font-semibold text-primary">
                {transaction.installmentNumber} de {transaction.installmentTotal}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Data do lançamento:</span>
            <span className="text-text-primary font-medium">{formatDateBR(transaction.date)}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-line/70">
            <span className="text-text-secondary font-medium">Valor desta parcela:</span>
            <span
              className={`font-display font-bold num-financial text-sm ${
                transaction.type === 'expense' ? 'text-danger' : 'text-primary'
              }`}
            >
              {transaction.type === 'expense' ? '- ' : '+ '}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          {isInstallment && transaction.totalAmount && (
            <div className="flex items-center justify-between text-[11px] text-text-secondary">
              <span>Valor total da compra:</span>
              <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
            </div>
          )}
        </div>

        {/* Escolha do escopo de exclusão para compras parceladas */}
        {isInstallment && (
          <div className="p-3.5 bg-surface border border-border-line rounded-lg space-y-2">
            <span className="block text-xs font-semibold text-text-primary">
              O que você deseja excluir?
            </span>
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delete-mode"
                  checked={deleteMode === 'single'}
                  onChange={() => setDeleteMode('single')}
                  className="mt-0.5 text-primary focus:ring-accent"
                />
                <span className="text-text-primary">
                  <strong>Apenas esta parcela</strong> ({transaction.installmentNumber}/{transaction.installmentTotal})
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delete-mode"
                  checked={deleteMode === 'all'}
                  onChange={() => setDeleteMode('all')}
                  className="mt-0.5 text-danger focus:ring-danger"
                />
                <span className="text-text-primary">
                  <strong>Todas as parcelas da compra</strong> (exclui todas as {transaction.installmentTotal} parcelas)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" size="md" onClick={handleConfirm}>
            {isInstallment && deleteMode === 'all'
              ? 'Excluir Todas as Parcelas'
              : 'Confirmar Exclusão'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
