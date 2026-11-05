import React, { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { MonthlyExpensePoint } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { TrendingDown, TrendingUp, HelpCircle } from 'lucide-react'

interface MonthlyEvolutionChartProps {
  data: MonthlyExpensePoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: MonthlyExpensePoint
  }>
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-surface border border-border-line rounded-lg p-3 shadow-dropdown text-xs">
        <span className="font-semibold text-text-primary block font-display">
          {item.fullLabel}
        </span>
        <div className="mt-1 flex items-center gap-1.5 text-text-secondary">
          <span>Despesas:</span>
          <span className="font-semibold text-primary font-display num-financial text-sm">
            {formatCurrency(item.expenses)}
          </span>
        </div>
      </div>
    )
  }
  return null
}

export const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ data }) => {
  const [showEmptyState, setShowEmptyState] = useState(false)

  const activeData = showEmptyState ? [] : data

  return (
    <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border-line gap-2">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Evolução dos gastos
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Acompanhe como suas despesas mudaram ao longo do tempo.
          </p>
        </div>

        {/* Alternância de Estado Vazio para Verificação do Design */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="text-[11px] text-text-secondary hover:text-text-primary px-2.5 py-1 bg-muted-surface border border-border-line rounded-md transition-colors"
            title="Alternar estado vazio para inspeção visual"
          >
            {showEmptyState ? 'Ver com dados' : 'Testar estado vazio'}
          </button>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="mt-6 w-full h-[280px]">
        {activeData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-muted-surface/40 border border-dashed border-border-line rounded-lg">
            <TrendingUp size={24} className="text-text-secondary/50 mb-2" />
            <span className="font-display font-medium text-sm text-text-primary">
              Nenhuma despesa registrada no período
            </span>
            <p className="text-xs text-text-secondary mt-1 max-w-xs">
              Quando novos lançamentos forem registrados, a curva de tendência mensal será traçada aqui.
            </p>
            <button
              onClick={() => setShowEmptyState(false)}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Restaurar dados demonstrativos
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activeData}
              margin={{ top: 12, right: 16, left: 0, bottom: 6 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#D9E0DA"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                stroke="#526158"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#D9E0DA' }}
                dy={8}
                fontFamily="Plus Jakarta Sans"
              />
              <YAxis
                stroke="#526158"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(1)}k`}
                dx={-8}
                domain={[1200, 2200]}
                fontFamily="Plus Jakarta Sans"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#174D3A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#FFFFFF', stroke: '#174D3A', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#174D3A', stroke: '#FFFFFF', strokeWidth: 2 }}
                name="Despesas"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda Discreta */}
      <div className="mt-4 pt-3 border-t border-border-line/60 flex items-center justify-between text-[11px] text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-primary rounded-full inline-block" />
          Despesas consolidadas mensais (R$)
        </span>
        <span className="tabular-nums font-mono">Últimos 6 meses</span>
      </div>
    </div>
  )
}
