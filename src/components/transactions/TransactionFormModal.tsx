import React, { useState, useEffect, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { FINORA_CATEGORIES, FINORA_PAYMENT_METHODS } from '../../data/mockData'
import { Transaction, PaymentMethod, TransactionType } from '../../types'
import { splitInstallments } from '../../lib/accountUtils'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { CreditCard } from 'lucide-react'

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    tx: Omit<Transaction, 'id'>,
    idToEdit?: string,
    options?: {
      installmentsCount?: number
      applyToGroup?: boolean
    }
  ) => void
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

  // Parcelamento
  const [installments, setInstallments] = useState<number>(1)
  const [applyToGroup, setApplyToGroup] = useState<boolean>(false)

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
      setInstallments(transactionToEdit.installmentTotal || 1)
      setApplyToGroup(false)
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
      setInstallments(1)
      setApplyToGroup(false)
      setErrors({})
    }
  }, [transactionToEdit, isOpen])

  const isCreditExpense = type === 'expense' && paymentMethod === 'Cartão de Crédito'

  // Prévia em tempo real das parcelas
  const parsedAmount = useMemo(() => {
    return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'))
  }, [amountStr])

  const installmentPreview = useMemo(() => {
    if (
      !isCreditExpense ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !installments ||
      installments < 1
    ) {
      return null
    }

    const safeCount = Math.min(Math.max(1, Math.floor(installments)), 24)
    const splits = splitInstallments(
      parsedAmount,
      safeCount,
      date || new Date().toISOString().split('T')[0]
    )

    return {
      count: safeCount,
      firstAmount: splits[0]?.amount || 0,
      lastAmount: splits[splits.length - 1]?.amount || 0,
      startDate: splits[0]?.date,
      endDate: splits[splits.length - 1]?.date,
      hasRemainder: splits[0]?.amount !== splits[splits.length - 1]?.amount,
    }
  }, [isCreditExpense, parsedAmount, installments, date])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!description.trim()) {
      newErrors.description = 'Informe a descrição do lançamento.'
    }

    if (!amountStr || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero (ex: 45,90).'
    }

    if (!date) {
      newErrors.date = 'Selecione uma data válida.'
    }

    if (isCreditExpense && !isEditing) {
      if (!installments || isNaN(installments) || installments < 1 || installments > 24) {
        newErrors.installments = 'Informe o número de parcelas entre 1 e 24.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSave(
      {
        description: description.trim(),
        establishment: establishment.trim() || undefined,
        amount: parsedAmount,
        type,
        category,
        paymentMethod,
        date,
        notes: notes.trim() || undefined,
        installmentGroupId: transactionToEdit?.installmentGroupId,
        installmentNumber: transactionToEdit?.installmentNumber,
        installmentTotal: transactionToEdit?.installmentTotal,
        totalAmount: transactionToEdit?.totalAmount,
      },
      transactionToEdit?.id,
      {
        installmentsCount: isCreditExpense && !isEditing ? installments : undefined,
        applyToGroup:
          isEditing && Boolean(transactionToEdit?.installmentGroupId) ? applyToGroup : false,
      }
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
        {/* Banner Informativo quando editando uma parcela de grupo */}
        {isEditing && Boolean(transactionToEdit?.installmentTotal && transactionToEdit.installmentTotal > 1) && (
          <div className="bg-muted-surface border border-border-line rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary flex items-center gap-1.5">
                <CreditCard size={14} className="text-primary" />
                Compra Parcelada no Cartão
              </span>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Parcela {transactionToEdit?.installmentNumber} de {transactionToEdit?.installmentTotal}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Valor total original da compra:{' '}
              <strong className="text-text-primary font-display num-financial">
                {formatCurrency(transactionToEdit?.totalAmount || transactionToEdit?.amount || 0)}
              </strong>
              .
            </p>

            {Boolean(transactionToEdit?.installmentGroupId) && (
              <div className="pt-2 border-t border-border-line/70">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyToGroup}
                    onChange={(e) => setApplyToGroup(e.target.checked)}
                    className="mt-0.5 rounded border-border-line text-primary focus:ring-accent"
                  />
                  <span className="text-xs text-text-primary leading-snug">
                    Aplicar a nova <strong>descrição</strong> e/ou <strong>valor</strong> a todas as parcelas deste grupo ({transactionToEdit?.installmentTotal} parcelas).
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* 1. Tipo: Despesa ou Receita */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Tipo de Movimentação *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('expense')}
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
              onClick={() => setType('income')}
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

        {/* 3. Valor Total e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              {isCreditExpense && !isEditing ? 'Valor Total da Compra (R$) *' : 'Valor (R$) *'}
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
              {isCreditExpense && !isEditing ? 'Data da 1ª Parcela *' : 'Data *'}
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

        {/* Campo obrigatório de Parcelas do Cartão de Crédito */}
        {isCreditExpense && !isEditing && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tx-installments"
                className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                Número de Parcelas *
              </label>
              <span className="text-[11px] text-text-secondary font-medium">
                De 1 a 24 parcelas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <select
                  id="tx-installments"
                  value={installments}
                  onChange={(e) => {
                    setInstallments(parseInt(e.target.value, 10))
                    if (errors.installments) setErrors((prev) => ({ ...prev, installments: '' }))
                  }}
                  className="w-full bg-surface border border-border-line rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px] font-medium"
                >
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num === 1 ? '1x (À vista)' : `${num}x`}
                    </option>
                  ))}
                </select>
                {errors.installments && (
                  <span className="text-[11px] text-danger mt-1 block">{errors.installments}</span>
                )}
              </div>

              {/* Prévia dinâmica das parcelas */}
              {installmentPreview && (
                <div className="text-xs text-text-primary bg-surface/90 border border-border-line/70 rounded-lg p-2.5 space-y-1">
                  <div className="font-semibold text-primary font-display num-financial">
                    {installmentPreview.count === 1 ? (
                      <span>1x de {formatCurrency(installmentPreview.firstAmount)} (à vista)</span>
                    ) : (
                      <span>
                        {installmentPreview.count}x de {formatCurrency(installmentPreview.firstAmount)}
                        {installmentPreview.hasRemainder && (
                          <span className="text-[11px] font-normal text-text-secondary ml-1 block">
                            (última de {formatCurrency(installmentPreview.lastAmount)})
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {installmentPreview.count > 1 &&
                    installmentPreview.startDate &&
                    installmentPreview.endDate && (
                      <p className="text-[10px] text-text-secondary">
                        De {formatDateBR(installmentPreview.startDate)} até{' '}
                        {formatDateBR(installmentPreview.endDate)}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        )}

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
            placeholder="Ex: Compra de passagem aérea, notebook..."
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
