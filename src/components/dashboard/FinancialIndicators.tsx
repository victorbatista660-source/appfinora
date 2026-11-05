import React from 'react'
import { PeriodSummary } from '../../types'
import { formatCurrency } from '../../lib/utils'
import { ArrowDownLeft, ArrowUpRight, Wallet, Percent, ShieldCheck } from 'lucide-react'

interface FinancialIndicatorsProps {
  summary: PeriodSummary
}

export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({ summary }) => {
  return (
    <section aria-label="Indicadores Financeiros Principais" className="space-y-3">
      {/* Aviso de Dados de Exemplo */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5 font-medium text-primary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
          <ShieldCheck size={13} strokeWidth={2} />
          Dados demonstrativos do período selecionado ({summary.periodLabel})
        </span>
        <span className="text-[11px] text-text-secondary hidden sm:inline">
          Base de cálculo: Receitas vs Despesas computadas
        </span>
      </div>

      {/* Composição Editorial Assimétrica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bloco 1: Destaque Principal — Total de Despesas e Comprometimento (7 colunas) */}
        <div className="lg:col-span-7 bg-surface border border-border-line rounded-xl p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Despesas do Período
              </span>
              <span className="text-xs font-medium text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                Saídas registradas
              </span>
            </div>

            <div className="mt-3">
              <span className="text-4xl lg:text-5xl font-display font-bold text-text-primary num-financial block tracking-tight">
                {formatCurrency(summary.expenses)}
              </span>
              <p className="text-xs text-text-secondary mt-1.5">
                Total consolidado em compras, contas fixas, lazer e transporte.
              </p>
            </div>
          </div>

          {/* Renda Comprometida e Relação com Receitas */}
          <div className="mt-6 pt-5 border-t border-border-line">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-text-primary flex items-center gap-1.5">
                <Percent size={13} className="text-primary" />
                Percentual da renda comprometida
              </span>
              <span className="font-display font-bold text-text-primary num-financial text-sm">
                {summary.incomeCommittedRate.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </span>
            </div>

            {/* Barra de comprometimento com indicador do teto */}
            <div className="h-2.5 w-full bg-muted-surface rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(summary.incomeCommittedRate, 100)}%` }}
                className="bg-primary h-full transition-all duration-fast rounded-full"
                title={`${summary.incomeCommittedRate}% da renda gasta`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2">
              <span>R$ 0,00</span>
              <span className="font-medium text-text-secondary">
                Renda total: {formatCurrency(summary.income)}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Destaque Secundário — Saldo Calculado e Receitas (5 colunas) */}
        <div className="lg:col-span-5 bg-surface border border-border-line rounded-xl p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Saldo Calculado
              </span>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Disponível
              </span>
            </div>

            <div className="mt-3">
              <span className="text-3xl lg:text-4xl font-display font-bold text-primary num-financial block tracking-tight">
                {formatCurrency(summary.balance)}
              </span>
              <p className="text-xs text-text-secondary mt-1.5">
                Margem positiva remanescente após todas as deduções do mês.
              </p>
            </div>
          </div>

          {/* Receitas do período embutidas com refinamento */}
          <div className="mt-6 pt-5 border-t border-border-line">
            <div className="flex items-center justify-between p-3.5 bg-muted-surface/70 rounded-lg border border-border-line">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center shrink-0">
                  <ArrowDownLeft size={16} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider block">
                    Receitas do Período
                  </span>
                  <span className="text-base font-display font-semibold text-text-primary num-financial block">
                    {formatCurrency(summary.income)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-text-secondary font-medium">
                100% liquidado
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
