import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  MessageSquare,
  PenLine,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface TransactionTableProps {
  transactions: Transaction[]
  onOpenNewTransaction: () => void
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onOpenNewTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [originFilter, setOriginFilter] = useState<'all' | 'whatsapp' | 'manual'>('all')

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === 'all' || tx.type === typeFilter
      const matchesOrigin = originFilter === 'all' || (tx.origin || 'manual') === originFilter

      return matchesSearch && matchesType && matchesOrigin
    })
  }, [transactions, searchTerm, typeFilter, originFilter])

  return (
    <div className="bg-surface border border-border-line rounded-xl shadow-card overflow-hidden">
      {/* Table controls header */}
      <div className="p-6 border-b border-border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Histórico de Movimentações
            </h2>
            <span className="text-xs text-text-secondary bg-muted-surface px-2 py-0.5 rounded-full border border-border-line">
              {filteredTransactions.length} registros
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Classificação contábil e auditoria de origem por transação.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-muted-surface/70 border border-border-line rounded-md text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[38px] transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-md border border-border-line p-0.5 bg-muted-surface/50">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'all'
                  ? 'bg-surface text-primary shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-surface text-danger shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                typeFilter === 'income'
                  ? 'bg-surface text-primary shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Receitas
            </button>
          </div>

          {/* Origin Filter */}
          <div className="inline-flex rounded-md border border-border-line p-0.5 bg-muted-surface/50">
            <button
              onClick={() => setOriginFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                originFilter === 'all'
                  ? 'bg-surface text-text-primary shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Todas Origens
            </button>
            <button
              onClick={() => setOriginFilter('whatsapp')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                originFilter === 'whatsapp'
                  ? 'bg-surface text-accent shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <MessageSquare size={12} strokeWidth={2} />
              WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Tabela de Transações">
          <thead>
            <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-6">Data</th>
              <th className="py-3 px-6">Descrição</th>
              <th className="py-3 px-6">Categoria</th>
              <th className="py-3 px-6">Origem</th>
              <th className="py-3 px-6 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-line/70 text-sm">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="font-display font-medium text-text-primary">
                      Nenhuma movimentação localizada
                    </p>
                    <p className="text-xs text-text-secondary">
                      Não encontramos transações com os filtros atuais.
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('')
                          setTypeFilter('all')
                          setOriginFilter('all')
                        }}
                      >
                        Limpar Filtros
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'expense'
                const isWhatsApp = tx.origin === 'whatsapp'

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted-surface/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-text-secondary font-medium">
                      {formatDate(tx.date)}
                    </td>

                    {/* Description & Note */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
                          {tx.description}
                        </span>
                        {tx.notes && (
                          <span className="text-[11px] text-text-secondary/80 mt-0.5 line-clamp-1 italic">
                            {tx.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line/70">
                        {tx.category}
                      </span>
                    </td>

                    {/* Origin Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {isWhatsApp ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-accent font-medium bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                          <MessageSquare size={12} strokeWidth={2} />
                          WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary font-medium bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                          <PenLine size={12} strokeWidth={1.8} />
                          Manual
                        </span>
                      )}
                    </td>

                    {/* Amount */}
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
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-4 bg-muted-surface/30 border-t border-border-line flex items-center justify-between text-xs text-text-secondary">
        <span>Transações registradas sob o protocolo de controle Finora.</span>
        <button
          onClick={onOpenNewTransaction}
          className="text-primary hover:underline font-medium"
        >
          + Adicionar novo lançamento
        </button>
      </div>
    </div>
  )
}
