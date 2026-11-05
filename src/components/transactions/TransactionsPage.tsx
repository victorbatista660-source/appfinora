import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import { Transaction, PaymentMethod, TransactionType } from '../../types'
import { FINORA_CATEGORIES, FINORA_PAYMENT_METHODS } from '../../data/mockData'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { generateAvailablePeriods, getCurrentPeriodKey } from '../../lib/periodUtils'
import { Button } from '../ui/Button'
import { TransactionSummaryHeader } from './TransactionSummaryHeader'
import { TransactionFormModal } from './TransactionFormModal'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

interface TransactionsPageProps {
  transactions: Transaction[]
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void
  onUpdateTransaction: (id: string, updatedTx: Omit<Transaction, 'id'>) => void
  onDeleteTransaction: (id: string) => void
  showToast: (msg: string) => void
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  showToast,
}) => {
  // Estados de Filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>(() => getCurrentPeriodKey())

  // Lista dinâmica compartilhada de períodos
  const availablePeriods = useMemo(() => {
    return generateAvailablePeriods(transactions)
  }, [transactions])

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Estados de Modais
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  // Filtragem ativa de dados
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Busca por texto
      const term = searchTerm.toLowerCase()
      const matchSearch =
        !term ||
        tx.description.toLowerCase().includes(term) ||
        (tx.establishment && tx.establishment.toLowerCase().includes(term)) ||
        tx.category.toLowerCase().includes(term) ||
        (tx.notes && tx.notes.toLowerCase().includes(term))

      // 2. Filtro de Tipo
      const matchType = typeFilter === 'all' || tx.type === typeFilter

      // 3. Filtro de Categoria
      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter

      // 4. Filtro de Método de Pagamento
      const matchPayment = paymentFilter === 'all' || tx.paymentMethod === paymentFilter

      // 5. Filtro de Período (mês/ano)
      const matchPeriod = periodFilter === 'all' || tx.date.startsWith(periodFilter)

      return matchSearch && matchType && matchCategory && matchPayment && matchPeriod
    })
  }, [transactions, searchTerm, typeFilter, categoryFilter, paymentFilter, periodFilter])

  // Recálculo do Resumo Superior com base nos itens filtrados
  const summaryTotals = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)

    const expenses = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
    }
  }, [filteredTransactions])

  // Paginação dos dados filtrados
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, currentPage, pageSize])

  // Ajustar página se filtros reduzirem quantidade
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  // Handlers
  const handleOpenCreate = () => {
    setTransactionToEdit(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (tx: Transaction) => {
    setTransactionToEdit(tx)
    setIsFormOpen(true)
  }

  const handleSaveForm = (txData: Omit<Transaction, 'id'>, idToEdit?: string) => {
    if (idToEdit) {
      onUpdateTransaction(idToEdit, txData)
      showToast(`Transação "${txData.description}" atualizada com sucesso.`)
    } else {
      onAddTransaction(txData)
      showToast(`Transação "${txData.description}" cadastrada com sucesso.`)
    }
    setIsFormOpen(false)
  }

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDeleteTransaction(transactionToDelete.id)
      showToast(`Transação "${transactionToDelete.description}" excluída.`)
      setTransactionToDelete(null)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setPaymentFilter('all')
    setPeriodFilter('all')
    setCurrentPage(1)
  }

  const hasActiveFilters =
    Boolean(searchTerm) ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    periodFilter !== '2026-10'

  return (
    <div className="space-y-6">
      {/* 1. Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Transações
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Cada entrada e saída, organizada em um só lugar.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus size={16} strokeWidth={2.2} />}
          onClick={handleOpenCreate}
        >
          Nova transação
        </Button>
      </div>

      {/* 2. Resumo Superior Compacto */}
      <TransactionSummaryHeader
        income={summaryTotals.income}
        expenses={summaryTotals.expenses}
        balance={summaryTotals.balance}
        periodLabel={
          periodFilter === '2026-10'
            ? 'Outubro 2026'
            : periodFilter === '2026-09'
            ? 'Setembro 2026'
            : 'Todos os períodos'
        }
      />

      {/* 3. Barra de Filtros Completa */}
      <div className="bg-surface border border-border-line rounded-xl p-4 shadow-subtle space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              placeholder="Pesquisar por descrição, estabelecimento ou notas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted-surface border border-border-line rounded-lg text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[40px] transition-colors"
            />
          </div>

          {/* Filtros em linha */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro de Tipo */}
            <div className="inline-flex rounded-lg border border-border-line p-0.5 bg-muted-surface">
              <button
                onClick={() => {
                  setTypeFilter('all')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-surface text-text-primary shadow-subtle font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => {
                  setTypeFilter('expense')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === 'expense'
                    ? 'bg-surface text-danger shadow-subtle font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Despesas
              </button>
              <button
                onClick={() => {
                  setTypeFilter('income')
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  typeFilter === 'income'
                    ? 'bg-surface text-primary shadow-subtle font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Receitas
              </button>
            </div>

            {/* Filtro de Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filtrar por categoria"
              className="bg-muted-surface border border-border-line rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px]"
            >
              <option value="all">Todas as categorias</option>
              {FINORA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Filtro de Método de Pagamento */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filtrar por método de pagamento"
              className="bg-muted-surface border border-border-line rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px]"
            >
              <option value="all">Todos os métodos</option>
              {FINORA_PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Filtro de Período Dinâmico */}
            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value)
                setCurrentPage(1)
              }}
              aria-label="Filtrar por período"
              className="bg-muted-surface border border-border-line rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent min-h-[40px]"
            >
              <option value="all">Todos os períodos</option>
              {availablePeriods.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-muted-surface rounded-lg border border-border-line transition-colors min-h-[40px]"
                title="Redefinir todos os filtros"
              >
                <RotateCcw size={13} />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tabela de Transações */}
      <div className="bg-surface border border-border-line rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Livro de Transações">
            <thead>
              <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="py-3.5 px-6">Descrição / Estabelecimento</th>
                <th className="py-3.5 px-6">Categoria</th>
                <th className="py-3.5 px-6">Data</th>
                <th className="py-3.5 px-6">Método</th>
                <th className="py-3.5 px-6">Tipo</th>
                <th className="py-3.5 px-6 text-right">Valor</th>
                <th className="py-3.5 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-line/70 text-sm">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-muted-surface border border-border-line flex items-center justify-center mx-auto text-text-secondary">
                        <Layers size={22} strokeWidth={1.75} />
                      </div>
                      <p className="font-display font-semibold text-text-primary text-base">
                        Nenhuma transação encontrada
                      </p>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {hasActiveFilters
                          ? 'Nenhum lançamento corresponde aos filtros selecionados. Tente ajustar os termos.'
                          : 'Comece registrando sua primeira receita ou despesa no Finora.'}
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        {hasActiveFilters ? (
                          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                            Limpar Filtros
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                            Cadastrar Primeira Transação
                          </Button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isExpense = tx.type === 'expense'

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-muted-surface/30 transition-colors group"
                    >
                      {/* Descrição & Estabelecimento */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary group-hover:text-primary transition-colors block">
                            {tx.description}
                          </span>
                          {tx.establishment && (
                            <span className="text-[11px] text-text-secondary block mt-0.5">
                              {tx.establishment}
                            </span>
                          )}
                          {tx.notes && !tx.establishment && (
                            <span className="text-[11px] text-text-secondary/80 italic mt-0.5">
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
                          {tx.category}
                        </span>
                      </td>

                      {/* Data em Formato Brasileiro */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-text-secondary font-medium">
                        {formatDateBR(tx.date)}
                      </td>

                      {/* Método de Pagamento */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-text-secondary">
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard size={13} className="text-text-secondary/70" />
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Tipo: Despesa ou Receita com indicador visual acessível */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            isExpense
                              ? 'bg-danger/10 text-danger border-danger/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {isExpense ? (
                            <>
                              <ArrowUpRight size={12} strokeWidth={2.5} />
                              Despesa
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft size={12} strokeWidth={2.5} />
                              Receita
                            </>
                          )}
                        </span>
                      </td>

                      {/* Valor Alinhado à Direita com Space Grotesk Tabular Nums */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold font-display num-financial ${
                            isExpense ? 'text-danger' : 'text-primary'
                          }`}
                        >
                          {isExpense ? '- ' : '+ '}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Ações: Editar e Excluir */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            aria-label={`Editar transação ${tx.description}`}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-muted-surface rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Editar transação"
                          >
                            <Edit2 size={14} strokeWidth={1.8} />
                          </button>
                          <button
                            onClick={() => setTransactionToDelete(tx)}
                            aria-label={`Excluir transação ${tx.description}`}
                            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            title="Excluir transação"
                          >
                            <Trash2 size={14} strokeWidth={1.8} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Rodapé com Paginação Funcional */}
        <div className="p-4 bg-muted-surface/40 border-t border-border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <div>
            Mostrando{' '}
            <strong className="text-text-primary">
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredTransactions.length)}
            </strong>{' '}
            de <strong className="text-text-primary">{filteredTransactions.length}</strong> transações
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
                className="p-1.5 text-text-secondary hover:text-text-primary bg-surface border border-border-line rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 py-1 font-medium text-text-primary">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
                className="p-1.5 text-text-secondary hover:text-text-primary bg-surface border border-border-line rounded-md transition-colors disabled:opacity-40 disabled:pointer-events-none min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário (Criação e Edição) */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        transactionToEdit={transactionToEdit}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <DeleteConfirmDialog
        isOpen={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
      />
    </div>
  )
}
