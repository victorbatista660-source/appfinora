import React from 'react'
import { CategoryComparison } from '../../lib/comparativeUtils'
import { formatCurrency } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react'

interface ComparativeCategoryTableProps {
  categories: CategoryComparison[]
  currentPeriodLabel: string
  previousPeriodLabel: string
}

export const ComparativeCategoryTable: React.FC<ComparativeCategoryTableProps> = ({
  categories,
  currentPeriodLabel,
  previousPeriodLabel,
}) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl shadow-subtle overflow-hidden">
      <div className="p-6 border-b border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Análise comparativa por categoria
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Oscilações de gastos entre {currentPeriodLabel} e {previousPeriodLabel}.
          </p>
        </div>
        <span className="text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line self-start sm:self-auto">
          {categories.length} categorias analisadas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Tabela Comparativa por Categoria">
          <thead>
            <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-6">Categoria</th>
              <th className="py-3 px-6 text-right">{currentPeriodLabel}</th>
              <th className="py-3 px-6 text-right">{previousPeriodLabel}</th>
              <th className="py-3 px-6 text-right">Diferença (R$)</th>
              <th className="py-3 px-6 text-center">Variação (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-line/70 text-sm">
            {categories.map((cat) => {
              const isIncrease = cat.absoluteDiff > 0
              const isDecrease = cat.absoluteDiff < 0
              const isStable = cat.absoluteDiff === 0

              return (
                <tr key={cat.category} className="hover:bg-muted-surface/30 transition-colors">
                  {/* Categoria */}
                  <td className="py-4 px-6 font-medium text-text-primary whitespace-nowrap">
                    {cat.category}
                  </td>

                  {/* Gastos Período Atual */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-display font-semibold num-financial text-text-primary">
                    {formatCurrency(cat.currentAmount)}
                  </td>

                  {/* Gastos Período Anterior */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-display num-financial text-text-secondary">
                    {formatCurrency(cat.previousAmount)}
                  </td>

                  {/* Diferença em Reais */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <span
                      className={`font-display font-semibold num-financial ${
                        isIncrease
                          ? 'text-danger'
                          : isDecrease
                          ? 'text-primary'
                          : 'text-text-secondary'
                      }`}
                    >
                      {isIncrease ? '+ ' : isDecrease ? '- ' : ''}
                      {formatCurrency(Math.abs(cat.absoluteDiff))}
                    </span>
                  </td>

                  {/* Variação Percentual com Indicador Acessível */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    {cat.hasBase && cat.percentDiff !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          isIncrease
                            ? 'bg-danger/10 text-danger border-danger/20'
                            : isDecrease
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted-surface text-text-secondary border-border-line'
                        }`}
                      >
                        {isIncrease ? (
                          <ArrowUpRight size={12} strokeWidth={2.2} />
                        ) : isDecrease ? (
                          <ArrowDownRight size={12} strokeWidth={2.2} />
                        ) : (
                          <Minus size={12} strokeWidth={2.2} />
                        )}
                        {cat.percentDiff > 0 ? '+' : ''}
                        {cat.percentDiff.toLocaleString('pt-BR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                        <AlertCircle size={11} className="text-text-secondary" />
                        Sem base anterior
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-muted-surface/30 border-t border-border-line text-xs text-text-secondary">
        Variações percentuais calculadas com base no período anterior. Categorias sem gastos no período anterior são identificadas para evitar distorções estatísticas.
      </div>
    </div>
  )
}
