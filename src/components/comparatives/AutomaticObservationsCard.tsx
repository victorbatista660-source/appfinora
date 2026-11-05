import React from 'react'
import { AutomaticObservation } from '../../lib/comparativeUtils'
import { Sparkles, TrendingDown, TrendingUp, Info } from 'lucide-react'

interface AutomaticObservationsCardProps {
  observations: AutomaticObservation[]
}

export const AutomaticObservationsCard: React.FC<AutomaticObservationsCardProps> = ({
  observations,
}) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle">
      <div className="flex items-center justify-between pb-4 border-b border-border-line">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles size={15} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-display font-semibold text-text-primary">
              Observações automáticas calculadas
            </h2>
            <p className="text-xs text-text-secondary">
              Sínteses estatísticas deduzidas estritamente dos lançamentos registrados no período.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
          Base factual
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {observations.map((obs) => {
          const isPositive = obs.type === 'positive'
          const isAttention = obs.type === 'attention'

          return (
            <div
              key={obs.id}
              className={`p-4 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                isPositive
                  ? 'bg-primary/5 border-primary/20'
                  : isAttention
                  ? 'bg-danger/5 border-danger/20'
                  : 'bg-muted-surface/60 border-border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-text-secondary">
                  {obs.title}
                </span>
                {isPositive ? (
                  <TrendingDown size={14} className="text-primary shrink-0" />
                ) : isAttention ? (
                  <TrendingUp size={14} className="text-danger shrink-0" />
                ) : (
                  <Info size={14} className="text-text-secondary shrink-0" />
                )}
              </div>

              <p className="text-sm font-sans text-text-primary leading-relaxed font-medium">
                "{obs.description}"
              </p>

              <span className="text-[10px] text-text-secondary/80 block pt-1">
                Calculado a partir das transações comparadas
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
