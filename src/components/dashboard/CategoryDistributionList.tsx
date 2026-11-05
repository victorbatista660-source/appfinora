import React from 'react'
import { CategoryDistribution } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { PieChart, ArrowUpRight } from 'lucide-react'

interface CategoryDistributionListProps {
  categories: CategoryDistribution[]
  totalExpenses: number
}

export const CategoryDistributionList: React.FC<CategoryDistributionListProps> = ({
  categories,
  totalExpenses,
}) => {
  return (
    <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border-line">
          <div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Distribuição por categoria
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-sans">
              Detalhamento de gastos por centro de custo no mês.
            </p>
          </div>
          <span className="text-xs font-semibold font-display num-financial text-text-primary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
            {categories.length} categorias
          </span>
        </div>

        {/* Lista de Categorias com barras proporcionais limpas */}
        <div className="mt-5 space-y-4">
          {categories.map((cat) => {
            return (
              <div key={cat.name} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-text-primary num-financial">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-[11px] text-text-secondary w-10 text-right tabular-nums">
                      {cat.percentage.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}%
                    </span>
                  </div>
                </div>

                {/* Barra de Proporção Sutil */}
                <div className="h-1.5 w-full bg-muted-surface rounded-full overflow-hidden">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className="h-full bg-primary rounded-full transition-all duration-fast group-hover:bg-accent"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé Consolidado */}
      <div className="mt-6 pt-4 border-t border-border-line flex items-center justify-between text-xs text-text-secondary">
        <span>Total das categorias</span>
        <span className="font-display font-bold text-text-primary num-financial text-sm">
          {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  )
}
