import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { Transaction } from '../../types'
import { formatCurrency, formatDateBR } from '../../lib/utils'
import { Button } from '../ui/Button'

interface RecentTransactionsTableProps {
  transactions: Transaction[]
  onOpenNewTransaction: () => void
  onViewAll?: () => void
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  onOpenNewTransaction,
  onViewAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all')

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())

      const matchType = typeFilter === 'all' || tx.type === typeFilter

      return matchSearch && matchType
    })
  }, [transactions, searchTerm, typeFilter])

  return (
    <div className="bg-surface border border-border-line rounded-xl shadow-card overflow-hidden">
      {/* Cabeçalho da Tabela */}
      <div className="p-6 border-b border-border-line flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Transações recentes
            </h2>
            <span className="text-xs text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
              {filtered.length} lançamentos
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Registros detalhados de despesas e receitas do período com método de pagamento.
          </p>
        </div>

        {/* Controles de Busca e Filtro */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Caixa de Busca */}
          <div className="relative min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              placeholder="Buscar estabelecimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-muted-surface border border-border-line rounded-lg text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[38px] transition-colors"
            />
          </div>

          {/* Filtro de Tipo */}
          <div className="inline-flex rounded-lg border border-border-line p-0.5 bg-muted-surface">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'all'
                  ? 'bg-surface text-text-primary shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-surface text-danger shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'income'
                  ? 'bg-surface text-primary shadow-subtle font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Receitas
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Tabela de Transações Recentes">
          <thead>
            <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-6">Estabelecimento / Descrição</th>
              <th className="py-3 px-6">Categoria</th>
              <th className="py-3 px-6">Data</th>
              <th className="py-3 px-6">Método de Pagamento</th>
              <th className="py-3 px-6 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-line/70 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-display font-medium text-text-primary text-sm">
                      Nenhuma transação encontrada
                    </p>
                    <p className="text-xs text-text-secondary">
                      Tente ajustar os filtros ou o termo de busca.
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('')
                          setTypeFilter('all')
                        }}
                      >
                        Limpar busca
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isExpense = tx.type === 'expense'

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted-surface/30 transition-colors group"
                  >
                    {/* Descrição com Ícone Indicador de Entrada/Saída (Não depende só de cor) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                            isExpense
                              ? 'bg-danger/10 text-danger border-danger/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                          aria-label={isExpense ? 'Despesa (Saída)' : 'Receita (Entrada)'}
                        >
                          {isExpense ? (
                            <ArrowUpRight size={14} strokeWidth={2.2} />
                          ) : (
                            <ArrowDownLeft size={14} strokeWidth={2.2} />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-text-primary group-hover:text-primary transition-colors block leading-snug">
                            {tx.description}
                          </span>
                          {tx.notes && (
                            <span className="text-[11px] text-text-secondary block mt-0.5">
                              {tx.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
                        {tx.category}
                      </span>
                    </td>

                    {/* Data no Formato Brasileiro */}
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

                    {/* Valor com Sinal Matemático Explícito e Tabular Nums */}
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

      {/* Rodapé com Link para Todas as Transações */}
      <div className="p-4 bg-muted-surface/40 border-t border-border-line flex items-center justify-between text-xs text-text-secondary">
        <span>Mostrando lançamentos consolidados de {filtered.length} transações.</span>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium transition-colors"
        >
          <span>Visualizar todas as transações</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
