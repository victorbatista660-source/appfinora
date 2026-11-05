import React from 'react'
import { TrendingUp, ArrowUpRight, ArrowDownRight, ShieldCheck, Wallet } from 'lucide-react'
import { FinancialSummary } from '../../types'
import { formatCurrency, formatPercentage } from '../../lib/utils'

interface OverviewHeroProps {
  summary: FinancialSummary
}

export const OverviewHero: React.FC<OverviewHeroProps> = ({ summary }) => {
  const netSavings = summary.monthlyIncome - summary.monthlyExpenses
  const totalAssets = summary.cashBalance + summary.investmentsBalance + summary.emergencyFundBalance

  const cashPct = Math.round((summary.cashBalance / totalAssets) * 100)
  const investPct = Math.round((summary.investmentsBalance / totalAssets) * 100)
  const emergencyPct = 100 - cashPct - investPct

  return (
    <div className="space-y-6">
      {/* Asymmetric Master Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Net Worth & Pillars (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-border-line rounded-xl p-7 lg:p-9 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Patrimônio Líquido Consolidado
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                <TrendingUp size={13} strokeWidth={2.2} />
                {formatPercentage(summary.netWorthChangeMonth)} no mês
              </span>
            </div>

            {/* Main Financial Hero Number */}
            <div className="mt-3">
              <span className="text-4xl lg:text-5xl font-display font-bold text-text-primary num-financial block tracking-tight">
                {formatCurrency(summary.netWorth)}
              </span>
              <p className="text-xs text-text-secondary mt-1.5">
                Atualizado em tempo real com base nos ativos e fluxo de caixa computados.
              </p>
            </div>
          </div>

          {/* Allocation Breakdown Bar */}
          <div className="mt-8 pt-6 border-t border-border-line/70">
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2.5">
              <span className="font-medium text-text-primary">Distribuição dos Ativos</span>
              <span className="tabular-nums font-mono text-[11px]">100% Alocado</span>
            </div>

            {/* Segmented bar */}
            <div className="h-2.5 w-full bg-muted-surface rounded-full overflow-hidden flex gap-0.5">
              <div
                style={{ width: `${investPct}%` }}
                className="bg-primary h-full transition-all duration-fast"
                title={`Investimentos: ${investPct}%`}
              />
              <div
                style={{ width: `${emergencyPct}%` }}
                className="bg-accent h-full transition-all duration-fast"
                title={`Reserva de Emergência: ${emergencyPct}%`}
              />
              <div
                style={{ width: `${cashPct}%` }}
                className="bg-[#526158] h-full transition-all duration-fast"
                title={`Liquidez Imediata: ${cashPct}%`}
              />
            </div>

            {/* Pillars Legend */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-[11px] text-text-secondary font-medium">Investimentos</span>
                </div>
                <span className="text-sm font-display font-semibold text-text-primary num-financial block mt-0.5">
                  {formatCurrency(summary.investmentsBalance, true)}
                </span>
                <span className="text-[10px] text-text-secondary">{investPct}%</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span className="text-[11px] text-text-secondary font-medium">Reserva</span>
                </div>
                <span className="text-sm font-display font-semibold text-text-primary num-financial block mt-0.5">
                  {formatCurrency(summary.emergencyFundBalance, true)}
                </span>
                <span className="text-[10px] text-text-secondary">{emergencyPct}%</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#526158] shrink-0" />
                  <span className="text-[11px] text-text-secondary font-medium">Conta Corrente</span>
                </div>
                <span className="text-sm font-display font-semibold text-text-primary num-financial block mt-0.5">
                  {formatCurrency(summary.cashBalance, true)}
                </span>
                <span className="text-[10px] text-text-secondary">{cashPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Cash Flow & Margin (5 cols) */}
        <div className="lg:col-span-5 bg-surface border border-border-line rounded-xl p-7 lg:p-9 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Fluxo Mensal (Outubro)
              </span>
              <span className="text-xs font-medium text-text-secondary">
                Poupança: <strong className="text-primary font-display">{summary.savingsRate}%</strong>
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {/* Income Line */}
              <div className="p-3.5 bg-muted-surface/60 border border-border-line/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowDownRight size={17} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Receitas Computadas</span>
                    <span className="text-sm font-semibold text-text-primary font-display num-financial">
                      {formatCurrency(summary.monthlyIncome)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Esperado
                </span>
              </div>

              {/* Expense Line */}
              <div className="p-3.5 bg-muted-surface/60 border border-border-line/60 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-danger/10 text-danger flex items-center justify-center">
                    <ArrowUpRight size={17} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary block">Despesas Realizadas</span>
                    <span className="text-sm font-semibold text-text-primary font-display num-financial">
                      {formatCurrency(summary.monthlyExpenses)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-text-secondary">
                  48% da renda
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Net Margin */}
          <div className="mt-6 pt-5 border-t border-border-line flex items-center justify-between">
            <div>
              <span className="text-xs text-text-secondary block">Superávit Mensal Livre</span>
              <span className="text-2xl font-display font-bold text-primary num-financial mt-0.5 block">
                {formatCurrency(netSavings)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                <ShieldCheck size={14} className="text-primary" />
                Meta atingida
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">
                Capacidade de reinvestimento alta
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
