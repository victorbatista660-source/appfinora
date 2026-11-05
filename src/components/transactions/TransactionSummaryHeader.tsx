import React from 'react'
import { formatCurrency } from '../../lib/utils'
import { ArrowDownLeft, ArrowUpRight, Wallet, ShieldCheck } from 'lucide-react'

interface TransactionSummaryHeaderProps {
  income: number
  expenses: number
  balance: number
  periodLabel: string
}

export const TransactionSummaryHeader: React.FC<TransactionSummaryHeaderProps> = ({
  income,
  expenses,
  balance,
  periodLabel,
}) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl p-5 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-line/70 gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-primary" />
          Resumo consolidado • {periodLabel}
        </span>
        <span className="text-[11px] text-text-secondary font-medium">
          Lançamentos filtrados do período
        </span>
      </div>

      {/* Grid compacto de 3 métricas sem cartões gigantes inflados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 divide-y md:divide-y-0 md:divide-x divide-border-line/70">
        {/* Receitas */}
        <div className="flex items-center gap-3 pt-2 md:pt-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <ArrowDownLeft size={16} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-medium text-text-secondary block">
              Total de Receitas
            </span>
            <span className="text-lg lg:text-xl font-display font-bold text-primary num-financial block">
              + {formatCurrency(income)}
            </span>
          </div>
        </div>

        {/* Despesas */}
        <div className="flex items-center gap-3 pt-4 md:pt-0 md:pl-6">
          <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0 border border-danger/20">
            <ArrowUpRight size={16} strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-medium text-text-secondary block">
              Total de Despesas
            </span>
            <span className="text-lg lg:text-xl font-display font-bold text-danger num-financial block">
              - {formatCurrency(expenses)}
            </span>
          </div>
        </div>

        {/* Saldo Calculado */}
        <div className="flex items-center gap-3 pt-4 md:pt-0 md:pl-6">
          <div className="w-8 h-8 rounded-lg bg-muted-surface text-text-primary flex items-center justify-center shrink-0 border border-border-line">
            <Wallet size={16} strokeWidth={2} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-medium text-text-secondary block">
              Saldo Calculado
            </span>
            <span
              className={`text-lg lg:text-xl font-display font-bold num-financial block ${
                balance >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {balance >= 0 ? '+ ' : ''}
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
