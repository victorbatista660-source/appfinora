import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Budget } from '../../types'
import { FINORA_CATEGORIES } from '../../data/mockData'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (budgetData: Omit<Budget, 'id'>, idToEdit?: string) => void
  budgetToEdit?: Budget | null
  defaultMonth: string
  existingBudgets?: Budget[]
  existingCategoriesInMonth?: string[]
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  budgetToEdit,
  defaultMonth,
  existingBudgets = [],
}) => {
  const isEditing = Boolean(budgetToEdit)

  const [category, setCategory] = useState<string>(FINORA_CATEGORIES[0])
  const [allocatedStr, setAllocatedStr] = useState('')
  const [month, setMonth] = useState(defaultMonth)
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return

    if (budgetToEdit) {
      setCategory(budgetToEdit.category)
      setAllocatedStr(
        budgetToEdit.allocated.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
      setMonth(budgetToEdit.month)
      setNotes(budgetToEdit.notes || '')
      setErrors({})
    } else {
      // Para nova inclusão, selecionar categoria que ainda não tem orçamento no mês padrão
      const usedCategories = existingBudgets
        .filter((b) => b.month === defaultMonth)
        .map((b) => b.category)
      const available = FINORA_CATEGORIES.find((c) => !usedCategories.includes(c))

      setCategory(available || FINORA_CATEGORIES[0])
      setAllocatedStr('')
      setMonth(defaultMonth)
      setNotes('')
      setErrors({})
    }
  }, [budgetToEdit, isOpen, defaultMonth, existingBudgets])

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

    const cleanAllocated = parseNumber(allocatedStr)
    if (!allocatedStr || isNaN(cleanAllocated) || cleanAllocated <= 0) {
      newErrors.allocated = 'Informe um teto mensal válido maior que zero (ex: 800,00).'
    }

    if (!month) {
      newErrors.month = 'Selecione o mês de referência.'
    }

    // Validação de duplicidade: não pode haver 2 orçamentos para a mesma categoria no mesmo mês
    const isDuplicate = existingBudgets.some(
      (b) =>
        b.category.trim().toLowerCase() === category.trim().toLowerCase() &&
        b.month === month &&
        b.id !== budgetToEdit?.id
    )

    if (isDuplicate) {
      newErrors.category = `Já existe um orçamento definido para "${category}" no mês de ${month}.`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const cleanAllocated = parseNumber(allocatedStr)

    onSave(
      {
        category,
        allocated: cleanAllocated,
        month,
        notes: notes.trim() || undefined,
      },
      budgetToEdit?.id
    )

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Teto Orçamentário' : 'Novo Orçamento por Categoria'}
      subtitle={
        isEditing
          ? 'Atualize a categoria, o limite mensal ou o mês de referência estipulado.'
          : 'Defina um teto máximo de despesa para monitorar seus gastos reais.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Categoria */}
        <div>
          <label
            htmlFor="budget-category"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Categoria de Despesa *
          </label>
          <select
            id="budget-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
            }}
            className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
              errors.category ? 'border-danger focus:ring-danger' : 'border-border-line'
            }`}
          >
            {FINORA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="text-[11px] text-danger mt-1 block">{errors.category}</span>
          )}
        </div>

        {/* Limite Alocado e Mês de Referência */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="budget-allocated"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Limite Máximo Mensal (R$) *
            </label>
            <input
              id="budget-allocated"
              type="text"
              placeholder="0,00"
              value={allocatedStr}
              onChange={(e) => {
                setAllocatedStr(e.target.value)
                if (errors.allocated) setErrors((prev) => ({ ...prev, allocated: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.allocated ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.allocated && (
              <span className="text-[11px] text-danger mt-1 block">{errors.allocated}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="budget-month"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Mês de Referência *
            </label>
            <input
              id="budget-month"
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value)
                if (errors.month || errors.category) {
                  setErrors((prev) => ({ ...prev, month: '', category: '' }))
                }
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.month ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.month && (
              <span className="text-[11px] text-danger mt-1 block">{errors.month}</span>
            )}
          </div>
        </div>

        {/* Observações */}
        <div>
          <label
            htmlFor="budget-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Observações (Opcional)
          </label>
          <input
            id="budget-notes"
            type="text"
            placeholder="Ex: Teto estabelecido para conter gastos de lazer"
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
            {isEditing ? 'Salvar Limite' : 'Definir Orçamento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
