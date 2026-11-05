import React from 'react'
import { EstablishmentComparison } from '../../lib/comparativeUtils'
import { formatCurrency } from '../../lib/utils'
import { ArrowUpRight, ArrowDownRight, Store, AlertCircle, Minus } from 'lucide-react'

interface EstablishmentComparisonCardProps {
  establishments: EstablishmentComparison[]
  currentPeriodLabel: string
  previousPeriodLabel: string
}

export const EstablishmentComparisonCard: React.FC<EstablishmentComparisonCardProps> = ({
  establishments,
  currentPeriodLabel,
  previousPeriodLabel,
}) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl shadow-subtle overflow-hidden">
      <div className="p-6 border-b border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Análise por estabelecimento
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Comportamento de consumo nos locais de maior relevância orçamentária.
          </p>
        </div>
        <span className="text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line self-start sm:self-auto">
          Top {establishments.length} estabelecimentos
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-label="Comparativo por Estabelecimento">
          <thead>
            <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-6">Estabelecimento</th>
              <th className="py-3 px-6">Categoria</th>
              <th className="py-3 px-6 text-right">{currentPeriodLabel}</th>
              <th className="py-3 px-6 text-right">{previousPeriodLabel}</th>
              <th className="py-3 px-6 text-right">Diferença (R$)</th>
              <th className="py-3 px-6 text-center">Variação (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-line/70 text-sm">
            {establishments.map((est) => {
              const isIncrease = est.absoluteDiff > 0
              const isDecrease = est.absoluteDiff < 0
              const isStable = est.absoluteDiff === 0

              return (
                <tr key={est.establishment} className="hover:bg-muted-surface/30 transition-colors">
                  {/* Estabelecimento */}
                  <td className="py-4 px-6 font-medium text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-text-secondary" />
                      <span>{est.establishment}</span>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-xs text-text-secondary bg-muted-surface px-2 py-0.5 rounded border border-border-line">
                      {est.category}
                    </span>
                  </td>

                  {/* Valor Atual */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-display font-semibold num-financial text-text-primary">
                    {formatCurrency(est.currentAmount)}
                  </td>

                  {/* Valor Anterior */}
                  <td className="py-4 px-6 text-right whitespace-nowrap font-display num-financial text-text-secondary">
                    {formatCurrency(est.previousAmount)}
                  </td>

                  {/* Diferença */}
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
                      {formatCurrency(Math.abs(est.absoluteDiff))}
                    </span>
                  </td>

                  {/* Variação */}
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    {est.hasBase && est.percentDiff !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          isIncrease
                            ? 'bg-danger/10 text-danger border-danger/20'
                            : isDecrease
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-muted-surface text-text-secondary border-border-line'
                        }`}
                      >
                        {isIncrease ? (
                          <ArrowUpRight size={11} strokeWidth={2.2} />
                        ) : isDecrease ? (
                          <ArrowDownRight size={11} strokeWidth={2.2} />
                        ) : (
                          <Minus size={11} strokeWidth={2.2} />
                        )}
                        {est.percentDiff > 0 ? '+' : ''}
                        {est.percentDiff.toLocaleString('pt-BR', {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-text-secondary bg-muted-surface px-2 py-0.5 rounded-full border border-border-line">
                        Sem registro anterior
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
