import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Goal } from '../../types'
import { FINORA_CATEGORIES } from '../../data/mockData'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goalData: Omit<Goal, 'id' | 'createdAt'>, idToEdit?: string) => void
  goalToEdit?: Goal | null
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
}) => {
  const isEditing = Boolean(goalToEdit)

  const [title, setTitle] = useState('')
  const [targetAmountStr, setTargetAmountStr] = useState('')
  const [currentAmountStr, setCurrentAmountStr] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState<string>(FINORA_CATEGORIES[0])
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return

    if (goalToEdit) {
      setTitle(goalToEdit.title)
      setTargetAmountStr(
        goalToEdit.targetAmount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
      setCurrentAmountStr(
        goalToEdit.currentAmount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
      setDeadline(goalToEdit.deadline || '')
      setCategory(goalToEdit.category || FINORA_CATEGORIES[0])
      setNotes(goalToEdit.notes || '')
      setErrors({})
    } else {
      setTitle('')
      setTargetAmountStr('')
      setCurrentAmountStr('0,00')
      setDeadline('')
      setCategory(FINORA_CATEGORIES[0])
      setNotes('')
      setErrors({})
    }
  }, [goalToEdit, isOpen])

  const parseNumber = (val: string): number => {
    if (!val) return NaN
    const clean = val.replace(/\s/g, '').replace(/[R$\u00A0]/g, '')
    if (clean.includes(',')) {
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'))
    }
    return parseFloat(clean)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Informe o nome da meta (ex: Reserva de Emergência).'
    }

    const cleanTarget = parseNumber(targetAmountStr)
    if (!targetAmountStr || isNaN(cleanTarget) || cleanTarget <= 0) {
      newErrors.targetAmount = 'Informe um valor desejado válido maior que zero.'
    }

    const cleanCurrent = parseNumber(currentAmountStr)
    if (currentAmountStr && (isNaN(cleanCurrent) || cleanCurrent < 0)) {
      newErrors.currentAmount = 'O saldo inicial não pode ser negativo.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const cleanTarget = parseNumber(targetAmountStr)
    const cleanCurrent = parseNumber(currentAmountStr) || 0

    onSave(
      {
        title: title.trim(),
        targetAmount: cleanTarget,
        currentAmount: cleanCurrent,
        initialAmount: isEditing ? goalToEdit?.initialAmount : cleanCurrent,
        deadline: deadline || undefined,
        category: category || undefined,
        notes: notes.trim() || undefined,
        movements: goalToEdit?.movements,
      },
      goalToEdit?.id
    )

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
      subtitle={
        isEditing
          ? 'Atualize o nome, valor desejado, prazo ou detalhes desta meta.'
          : 'Defina um objetivo financeiro com valor desejado, saldo inicial e prazo.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label
            htmlFor="goal-title"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Nome da Meta *
          </label>
          <input
            id="goal-title"
            type="text"
            placeholder="Ex: Reserva de Emergência, Viagem Europa, Troca de Veículo..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }))
            }}
            className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] transition-colors ${
              errors.title ? 'border-danger focus:ring-danger' : 'border-border-line'
            }`}
          />
          {errors.title && (
            <span className="text-[11px] text-danger mt-1 block">{errors.title}</span>
          )}
        </div>

        {/* Valor Desejado e Saldo Inicial / Acumulado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="goal-target"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Valor Desejado (R$) *
            </label>
            <input
              id="goal-target"
              type="text"
              placeholder="0,00"
              value={targetAmountStr}
              onChange={(e) => {
                setTargetAmountStr(e.target.value)
                if (errors.targetAmount) setErrors((prev) => ({ ...prev, targetAmount: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.targetAmount ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.targetAmount && (
              <span className="text-[11px] text-danger mt-1 block">{errors.targetAmount}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="goal-current"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {isEditing ? 'Saldo Acumulado (R$)' : 'Saldo Inicial (R$)'}
            </label>
            <input
              id="goal-current"
              type="text"
              placeholder="0,00"
              value={currentAmountStr}
              onChange={(e) => {
                setCurrentAmountStr(e.target.value)
                if (errors.currentAmount) setErrors((prev) => ({ ...prev, currentAmount: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.currentAmount ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            <span className="text-[10px] text-text-secondary mt-1 block">
              {isEditing
                ? 'Saldo atual computado com movimentações.'
                : 'Valor já disponível para iniciar esta meta (opcional).'}
            </span>
            {errors.currentAmount && (
              <span className="text-[11px] text-danger mt-1 block">{errors.currentAmount}</span>
            )}
          </div>
        </div>

        {/* Prazo e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="goal-deadline"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Data-Alvo / Prazo (Opcional)
            </label>
            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
          </div>

          <div>
            <label
              htmlFor="goal-category"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Categoria Relacionada (Opcional)
            </label>
            <select
              id="goal-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            >
              {FINORA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label
            htmlFor="goal-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Observações (Opcional)
          </label>
          <input
            id="goal-notes"
            type="text"
            placeholder="Ex: Destinar 10% da receita mensal para esta meta"
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
          <Button type="submit" variant="primary">
            {isEditing ? 'Salvar Alterações' : 'Criar Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
