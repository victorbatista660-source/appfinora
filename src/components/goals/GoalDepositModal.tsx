import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Goal } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { PlusCircle, ArrowUpRight } from 'lucide-react'

interface GoalDepositModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  onDeposit: (goalId: string, amountToAdd: number) => void
}

export const GoalDepositModal: React.FC<GoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onDeposit,
}) => {
  const [depositAmountStr, setDepositAmountStr] = useState('')
  const [error, setError] = useState('')

  if (!goal) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanAmount = parseFloat(depositAmountStr.replace(/\./g, '').replace(',', '.'))

    if (!depositAmountStr || isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Informe um valor de aporte válido maior que zero.')
      return
    }

    onDeposit(goal.id, cleanAmount)
    setDepositAmountStr('')
    setError('')
    onClose()
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Aportar em "${goal.title}"`}
      subtitle="Adicione recursos ao saldo acumulado desta meta."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-muted-surface border border-border-line rounded-lg text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Valor desejado:</span>
            <span className="font-semibold text-text-primary num-financial">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Acumulado atual:</span>
            <span className="font-semibold text-primary num-financial">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-line/70">
            <span className="text-text-secondary">Faltam para atingir:</span>
            <span className="font-display font-semibold text-text-primary num-financial">
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="deposit-amount"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Valor a Aportar (R$) *
          </label>
          <input
            id="deposit-amount"
            type="text"
            placeholder="0,00"
            autoFocus
            value={depositAmountStr}
            onChange={(e) => {
              setDepositAmountStr(e.target.value)
              if (error) setError('')
            }}
            className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
              error ? 'border-danger focus:ring-danger' : 'border-border-line'
            }`}
          />
          {error && <span className="text-[11px] text-danger mt-1 block">{error}</span>}
        </div>

        <div className="pt-3 border-t border-border-line flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDepositAmountStr('')
              setError('')
              onClose()
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Confirmar Aporte
          </Button>
        </div>
      </form>
    </Modal>
  )
}
