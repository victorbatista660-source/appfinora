import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FINORA_CATEGORIES, FINORA_PAYMENT_METHODS } from '../../data/mockData'
import { Transaction, PaymentMethod, TransactionType } from '../../types'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tx: Omit<Transaction, 'id'>, idToEdit?: string) => void
  transactionToEdit?: Transaction | null
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
}) => {
  const isEditing = Boolean(transactionToEdit)

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [establishment, setEstablishment] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [category, setCategory] = useState<string>(FINORA_CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(FINORA_PAYMENT_METHODS[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  // Erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar dados quando estiver em modo de edição
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type)
      setDescription(transactionToEdit.description)
      setEstablishment(transactionToEdit.establishment || '')
      setAmountStr(
        transactionToEdit.amount.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
      setCategory(transactionToEdit.category)
      setPaymentMethod(transactionToEdit.paymentMethod)
      setDate(transactionToEdit.date)
      setNotes(transactionToEdit.notes || '')
      setErrors({})
    } else {
      setType('expense')
      setDescription('')
      setEstablishment('')
      setAmountStr('')
      setCategory(FINORA_CATEGORIES[0])
      setPaymentMethod(FINORA_PAYMENT_METHODS[0])
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setErrors({})
    }
  }, [transactionToEdit, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = 'Informe a descrição do lançamento.'
    }

    const cleanAmount = parseFloat(
      amountStr.replace(/\./g, '').replace(',', '.')
    )

    if (!amountStr || isNaN(cleanAmount) || cleanAmount <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero (ex: 45,90).'
    }

    if (!date) {
      newErrors.date = 'Selecione uma data válida.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const cleanAmount = parseFloat(
      amountStr.replace(/\./g, '').replace(',', '.')
    )

    onSave(
      {
        description: description.trim(),
        establishment: establishment.trim() || undefined,
        amount: cleanAmount,
        type,
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
      },
      transactionToEdit?.id
    )

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
      subtitle={
        isEditing
          ? 'Atualize os dados e a classificação contábil deste lançamento.'
          : 'Cadastre manualmente uma nova receita ou despesa no Finora.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Tipo: Despesa ou Receita */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Tipo de Movimentação *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('expense')
                if (category === 'Receita') setCategory(FINORA_CATEGORIES[0])
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-danger/10 border-danger text-danger font-semibold shadow-subtle'
                  : 'bg-surface border-border-line text-text-secondary hover:bg-muted-surface'
              }`}
            >
              <span>Despesa (Saída)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income')
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-primary/10 border-primary text-primary font-semibold shadow-subtle'
                  : 'bg-surface border-border-line text-text-secondary hover:bg-muted-surface'
              }`}
            >
              <span>Receita (Entrada)</span>
            </button>
          </div>
        </div>

        {/* 2. Descrição e Estabelecimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-desc"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Descrição *
            </label>
            <input
              id="tx-desc"
              type="text"
              placeholder="Ex: Almoço executivo, Supermercado..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] transition-colors ${
                errors.description ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.description && (
              <span className="text-[11px] text-danger mt-1 block">{errors.description}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="tx-establishment"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Estabelecimento ou Origem
            </label>
            <input
              id="tx-establishment"
              type="text"
              placeholder="Ex: Pão de Açúcar, Uber, Empresa X..."
              value={establishment}
              onChange={(e) => setEstablishment(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
          </div>
        </div>

        {/* 3. Valor e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Valor (R$) *
            </label>
            <input
              id="tx-amount"
              type="text"
              placeholder="0,00"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value)
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.amount ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.amount && (
              <span className="text-[11px] text-danger mt-1 block">{errors.amount}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Data *
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                if (errors.date) setErrors((prev) => ({ ...prev, date: '' }))
              }}
              className={`w-full bg-muted-surface border rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px] ${
                errors.date ? 'border-danger focus:ring-danger' : 'border-border-line'
              }`}
            />
            {errors.date && (
              <span className="text-[11px] text-danger mt-1 block">{errors.date}</span>
            )}
          </div>
        </div>

        {/* 4. Categoria e Método de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-category"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Categoria *
            </label>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            >
              {FINORA_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="tx-payment"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Método de Pagamento *
            </label>
            <select
              id="tx-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            >
              {FINORA_PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Observações Opcionais */}
        <div>
          <label
            htmlFor="tx-notes"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Observações (Opcional)
          </label>
          <input
            id="tx-notes"
            type="text"
            placeholder="Ex: Pagamento parcelado em 3x ou reembolso corporativo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
          />
        </div>

        {/* Ações do Formulário */}
        <div className="pt-4 border-t border-border-line flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Transação'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
