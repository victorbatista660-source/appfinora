import React from 'react'
import { formatCurrency, formatPercentage } from '../../lib/utils'
import { calculateVariation } from '../../lib/comparativeUtils'
import { ArrowUpRight, ArrowDownRight, ArrowRight, ShieldCheck, Scale, Wallet } from 'lucide-react'

interface ComparativeMetricsBannerProps {
  currentPeriodLabel: string
  previousPeriodLabel: string
  currentIncome: number
  previousIncome: number
  currentExpenses: number
  previousExpenses: number
  currentBalance: number
  previousBalance: number
}

export const ComparativeMetricsBanner: React.FC<ComparativeMetricsBannerProps> = ({
  currentPeriodLabel,
  previousPeriodLabel,
  currentIncome,
  previousIncome,
  currentExpenses,
  previousExpenses,
  currentBalance,
  previousBalance,
}) => {
  const expenseVariation = calculateVariation(currentExpenses, previousExpenses)
  const balanceVariation = calculateVariation(currentBalance, previousBalance)
  const incomeVariation = calculateVariation(currentIncome, previousIncome)

  const currentCommittedRate = currentIncome > 0 ? (currentExpenses / currentIncome) * 100 : 0
  const previousCommittedRate = previousIncome > 0 ? (previousExpenses / previousIncome) * 100 : 0

  const isExpensesHigher = expenseVariation.absolute > 0

  return (
    <div className="space-y-4">
      {/* Aviso de Dados Demonstrativos */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5 font-medium text-primary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
          <ShieldCheck size={13} strokeWidth={2} />
          Demonstração comparativa: {currentPeriodLabel} vs {previousPeriodLabel}
        </span>
        <span className="text-[11px] text-text-secondary hidden sm:inline">
          Cálculos auditáveis em tempo real
        </span>
      </div>

      {/* Grid de 4 Blocos Comparativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {/* Bloco 1: Total de Despesas e Variação */}
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Despesas Totais
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  isExpensesHigher
                    ? 'bg-danger/10 text-danger border-danger/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {isExpensesHigher ? (
                  <ArrowUpRight size={12} strokeWidth={2.2} />
                ) : (
                  <ArrowDownRight size={12} strokeWidth={2.2} />
                )}
                {expenseVariation.label}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block">
                {formatCurrency(currentExpenses)}
              </span>
              <span className="text-xs text-text-secondary block mt-1">
                Anterior: <strong className="text-text-primary font-medium">{formatCurrency(previousExpenses)}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line text-xs text-text-secondary flex items-center justify-between">
            <span>Diferença absoluta:</span>
            <span
              className={`font-display font-semibold num-financial ${
                isExpensesHigher ? 'text-danger' : 'text-primary'
              }`}
            >
              {isExpensesHigher ? '+ ' : '- '}
              {formatCurrency(Math.abs(expenseVariation.absolute))}
            </span>
          </div>
        </div>

        {/* Bloco 2: Total de Receitas */}
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Receitas Totais
              </span>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {incomeVariation.label}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-display font-bold text-primary num-financial block">
                {formatCurrency(currentIncome)}
              </span>
              <span className="text-xs text-text-secondary block mt-1">
                Anterior: <strong className="text-text-primary font-medium">{formatCurrency(previousIncome)}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line text-xs text-text-secondary flex items-center justify-between">
            <span>Variação nominal:</span>
            <span className="font-display font-semibold num-financial text-text-primary">
              {incomeVariation.absolute >= 0 ? '+ ' : ''}
              {formatCurrency(incomeVariation.absolute)}
            </span>
          </div>
        </div>

        {/* Bloco 3: Evolução do Saldo Calculado */}
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Saldo Calculado
              </span>
              <span className="text-xs text-text-secondary bg-muted-surface px-2 py-0.5 rounded-md border border-border-line">
                Líquido
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`text-2xl lg:text-3xl font-display font-bold num-financial block ${
                  currentBalance >= 0 ? 'text-primary' : 'text-danger'
                }`}
              >
                {currentBalance >= 0 ? '+ ' : ''}
                {formatCurrency(currentBalance)}
              </span>
              <span className="text-xs text-text-secondary block mt-1">
                Anterior: <strong className="text-text-primary font-medium">{formatCurrency(previousBalance)}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line text-xs text-text-secondary flex items-center justify-between">
            <span>Variação do saldo:</span>
            <span
              className={`font-display font-semibold num-financial ${
                balanceVariation.absolute >= 0 ? 'text-primary' : 'text-danger'
              }`}
            >
              {balanceVariation.absolute >= 0 ? '+ ' : ''}
              {formatCurrency(balanceVariation.absolute)}
            </span>
          </div>
        </div>

        {/* Bloco 4: Renda Comprometida */}
        <div className="bg-surface border border-border-line rounded-xl p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                Renda Comprometida
              </span>
              <span className="text-xs text-text-secondary bg-muted-surface px-2 py-0.5 rounded-md border border-border-line">
                Taxa
              </span>
            </div>

            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-display font-bold text-text-primary num-financial block">
                {currentCommittedRate.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </span>
              <span className="text-xs text-text-secondary block mt-1">
                Anterior:{' '}
                <strong className="text-text-primary font-medium">
                  {previousCommittedRate.toLocaleString('pt-BR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}%
                </strong>
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line text-xs text-text-secondary flex items-center justify-between">
            <span>Variação da taxa:</span>
            <span
              className={`font-display font-semibold num-financial ${
                currentCommittedRate > previousCommittedRate ? 'text-danger' : 'text-primary'
              }`}
            >
              {currentCommittedRate >= previousCommittedRate ? '+' : ''}
              {(currentCommittedRate - previousCommittedRate).toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })} p.p.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
