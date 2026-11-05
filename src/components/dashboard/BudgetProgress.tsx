import React from 'react'
import { Budget } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface BudgetProgressProps {
  budgets: Budget[]
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets }) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between pb-4 border-b border-border-line">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Acompanhamento Orçamentário
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Limites mensais estabelecidos por categoria de consumo.
          </p>
        </div>
        <span className="text-xs text-text-secondary font-medium bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
          Ciclo Mensal
        </span>
      </div>

      <div className="mt-5 space-y-5">
        {budgets.map((b) => {
          const spent = b.spent ?? 0
          const percentage = b.allocated > 0 ? Math.min(Math.round((spent / b.allocated) * 100), 100) : 0
          const isWarning = percentage >= 85
          const remaining = Math.max(b.allocated - spent, 0)

          return (
            <div key={b.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text-primary flex items-center gap-1.5">
                  {b.category}
                  {isWarning && (
                    <span className="text-[10px] text-danger bg-danger/10 px-1.5 py-0.2 rounded font-semibold inline-flex items-center gap-1">
                      <AlertCircle size={10} />
                      Atenção ao teto
                    </span>
                  )}
                </span>
                <span className="text-text-secondary font-mono text-[11px] tabular-nums">
                  {formatCurrency(spent)} / {formatCurrency(b.allocated)}
                </span>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full bg-muted-surface rounded-full overflow-hidden">
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full rounded-full transition-all duration-fast ${
                    isWarning ? 'bg-danger' : 'bg-primary'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-secondary">
                <span>{percentage}% utilizado</span>
                <span>Restante: {formatCurrency(remaining)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
