import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { CATEGORIES_LIST, PAYMENT_METHODS_LIST } from '../../data/mockData'
import { Transaction, PaymentMethod } from '../../types'

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState(CATEGORIES_LIST[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS_LIST[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanAmount = parseFloat(amountStr.replace(',', '.'))
    if (!description || isNaN(cleanAmount) || cleanAmount <= 0) return

    onAddTransaction({
      description: description.trim(),
      amount: cleanAmount,
      type,
      category,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    })

    // Limpar formulário
    setDescription('')
    setAmountStr('')
    setNotes('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Transação"
      subtitle="Preencha os detalhes do lançamento financeiro."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de Tipo: Despesa ou Receita */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Tipo de Movimentação
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('expense')
                if (category === 'Receita') setCategory(CATEGORIES_LIST[0])
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-danger/10 border-danger text-danger font-semibold'
                  : 'bg-surface border-border-line text-text-secondary hover:bg-muted-surface'
              }`}
            >
              <span>Despesa (Saída)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income')
                setCategory('Receita')
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-primary/10 border-primary text-primary font-semibold'
                  : 'bg-surface border-border-line text-text-secondary hover:bg-muted-surface'
              }`}
            >
              <span>Receita (Entrada)</span>
            </button>
          </div>
        </div>

        {/* Descrição / Estabelecimento */}
        <div>
          <label
            htmlFor="tx-desc"
            className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
          >
            Estabelecimento ou Descrição *
          </label>
          <input
            id="tx-desc"
            type="text"
            required
            placeholder="Ex: Supermercado, Aluguel, Consultoria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
          />
        </div>

        {/* Valor e Data */}
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
              required
              placeholder="0,00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm font-display font-semibold num-financial text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
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
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
          </div>
        </div>

        {/* Categoria e Método de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-cat"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Categoria
            </label>
            <select
              id="tx-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            >
              {CATEGORIES_LIST.map((cat) => (
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
              Método de Pagamento
            </label>
            <select
              id="tx-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-muted-surface border border-border-line rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            >
              {PAYMENT_METHODS_LIST.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observações */}
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
            placeholder="Ex: Compra parcelada ou reembolso da empresa"
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
            Salvar Transação
          </Button>
        </div>
      </form>
    </Modal>
  )
}
