import React from 'react'
import { ArrowUpRight, ArrowDownRight, Info, TrendingUp } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

interface ComparativeSummaryCardProps {
  currentExpenses: number
  previousExpenses: number
  rate: number
}

export const ComparativeSummaryCard: React.FC<ComparativeSummaryCardProps> = ({
  currentExpenses,
  previousExpenses,
  rate,
}) => {
  const nominalDiff = currentExpenses - previousExpenses
  const isHigher = nominalDiff > 0

  return (
    <div className="bg-surface border border-border-line rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isHigher
                ? 'bg-danger/10 text-danger border border-danger/20'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            {isHigher ? (
              <ArrowUpRight size={18} strokeWidth={2.2} />
            ) : (
              <ArrowDownRight size={18} strokeWidth={2.2} />
            )}
          </div>

          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-text-secondary block">
              Resumo comparativo (Demonstração)
            </span>
            <p className="text-sm lg:text-base font-display font-semibold text-text-primary mt-0.5">
              Seus gastos estão{' '}
              <span className={isHigher ? 'text-danger' : 'text-primary'}>
                {Math.abs(rate).toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%{' '}
                {isHigher ? 'acima' : 'abaixo'}
              </span>{' '}
              do mês anterior.
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Variação calculada: {formatCurrency(Math.abs(nominalDiff))} em relação aos{' '}
              {formatCurrency(previousExpenses)} registrados em setembro.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line shrink-0">
          <Info size={12} />
          Exemplo Fictício
        </span>
      </div>
    </div>
  )
}
