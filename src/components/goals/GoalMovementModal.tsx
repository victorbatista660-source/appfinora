import React, { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Goal } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { PlusCircle, MinusCircle, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react'

interface GoalMovementModalProps {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  onMovement: (
    goalId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    notes?: string
  ) => void
}

export const GoalMovementModal: React.FC<GoalMovementModalProps> = ({
  isOpen,
  onClose,
  goal,
  onMovement,
}) => {
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [amountStr, setAmountStr] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setType('deposit')
      setAmountStr('')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setError('')
    }
  }, [isOpen])

  const parseNumber = (val: string): number => {
    if (!val) return NaN
    const clean = val.replace(/\s/g, '').replace(/[R$\u00A0]/g, '')
    if (clean.includes(',')) {
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'))
    }
    return parseFloat(clean)
  }

  const parsedAmount = parseNumber(amountStr)
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0

  // Cálculo prévio do saldo resultante
  const projectedBalance = useMemo(() => {
    if (!goal || !isValidAmount) return goal ? goal.currentAmount : 0
    if (type === 'deposit') {
      return goal.currentAmount + parsedAmount
    } else {
      return goal.currentAmount - parsedAmount
    }
  }, [goal, type, parsedAmount, isValidAmount])

  if (!goal) return null

  const isWithdrawalOver = type === 'withdrawal' && isValidAmount && parsedAmount > goal.currentAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amountStr.trim() || !isValidAmount) {
      setError('Informe um valor válido maior que zero.')
      return
    }

    if (type === 'withdrawal' && parsedAmount > goal.currentAmount) {
      setError(
        `O valor da retirada (${formatCurrency(parsedAmount)}) não pode ser superior ao saldo disponível (${formatCurrency(goal.currentAmount)}).`
      )
      return
    }

    if (!date) {
      setError('Informe a data da movimentação.')
      return
    }

    onMovement(goal.id, type, parsedAmount, date, notes.trim() || undefined)
    onClose()
  }

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Movimentar Meta: "${goal.title}"`}
      subtitle="Registre um novo aporte para acumular capital ou uma retirada justificada."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resumo do Status da Meta */}
        <div className="p-4 bg-muted-surface border border-border-line rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Valor Desejado:</span>
            <span className="font-semibold text-text-primary num-financial">
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Saldo Acumulado Atual:</span>
            <span className="font-display font-bold text-base text-primary num-financial">
              {formatCurrency(goal.currentAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border-line/70">
            <span className="text-text-secondary">Faltam para atingir:</span>
            <span className="font-display font-semibold text-text-primary num-financial">
              {remaining === 0 ? 'Meta já atingida!' : formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Seleção de Tipo: Aporte vs Retirada */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Tipo de Movimentação *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('deposit')
                setError('')
              }}
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                type === 'deposit'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface text-text-secondary border-border-line hover:border-primary/40'
              }`}
            >
              <ArrowDownRight size={16} />
              Aporte (+)
            </button>

            <button
              type="button"
              onClick={() => {
                setType('withdrawal')
                setError('')
              }}
              className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                type === 'withdrawal'
                  ? 'bg-danger text-white border-danger shadow-xs'
                  : 'bg-surface text-text-secondary border-border-line hover:border-danger/40'
              }`}
            >
              <ArrowUpRight size={16} />
              Retirada (-)
            </button>
          </div>
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="movement-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {type === 'deposit' ? 'Valor a Aportar (R$) *' : 'Valor a Retirar (R$) *'}
            </label>
            <input
              id="movement-amount"
              type="text"
              placeholder="0,00"
              autoFocus
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value)
                if (error) setError('')
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                error || isWithdrawalOver ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="movement-date"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Data da Operação *
            </label>
            <input
              id="movement-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
          </div>
        </div>

        {/* Feedback Dinâmico do Saldo Resultante */}
        {isValidAmount && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              isWithdrawalOver
                ? 'bg-danger/10 border-danger/30 text-danger'
                : 'bg-surface border-border-line text-text-primary'
            }`}
          >
            <span>Saldo resultante após operação:</span>
            <span className="font-display font-bold num-financial text-sm">
              {formatCurrency(projectedBalance)}
            </span>
          </div>
        )}

        {isWithdrawalOver && (
          <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-start gap-2 text-danger text-xs">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>
              Saldo insuficiente. O valor máximo que você pode retirar desta meta é{' '}
              <strong>{formatCurrency(goal.currentAmount)}</strong>.
            </span>
          </div>
        )}

        {error && !isWithdrawalOver && (
          <span className="text-[11px] text-danger block">{error}</span>
        )}

        {/* Observações */}
        <div>
          <label
            htmlFor="movement-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Observação / Motivo (Opcional)
          </label>
          <input
            id="movement-notes"
            type="text"
            placeholder={
              type === 'deposit'
                ? 'Ex: Economia mensal, rendimento de investimento...'
                : 'Ex: Resgate emergencial, pagamento de despesa imprevista...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
          />
        </div>

        {/* Ações */}
        <div className="pt-4 border-t border-border-line flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={type === 'deposit' ? 'primary' : 'danger'}
            disabled={isWithdrawalOver}
          >
            {type === 'deposit' ? 'Confirmar Aporte' : 'Confirmar Retirada'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
