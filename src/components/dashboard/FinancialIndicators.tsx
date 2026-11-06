import React from 'react'
import { formatCurrency } from '../../lib/utils'
import { FinancialCalculationResult } from '../../lib/accountUtils'
import {
  Wallet,
  CreditCard,
  Utensils,
  Percent,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

interface FinancialIndicatorsProps {
  metrics: FinancialCalculationResult
  periodLabel: string
}

export const FinancialIndicators: React.FC<FinancialIndicatorsProps> = ({
  metrics,
  periodLabel,
}) => {
  const isCreditOverLimit = metrics.creditAvailable < 0
  const isDebitPositive = metrics.debitBalance >= 0
  const isMealPositive = metrics.mealBalance >= 0

  return (
    <section aria-label="Indicadores Financeiros Principais" className="space-y-5">
      {/* Indicador de Período Ativo */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5 font-medium text-text-primary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line">
          <Calendar size={13} strokeWidth={2} className="text-primary" />
          Período ativo: <strong className="font-semibold text-text-primary">{periodLabel}</strong>
        </span>
        <span className="text-[11px] text-text-secondary hidden sm:inline">
          3 contas independentes sincronizadas com o Supabase
        </span>
      </div>

      {/* LINHA 1: Os 3 Cards de Contas Separadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Card 1: Saldo Débito */}
        <div className="bg-surface border border-border-line rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Wallet size={15} className="text-primary" />
                Saldo Débito
              </span>
              <span className="text-[11px] font-medium text-text-secondary bg-muted-surface px-2 py-0.5 rounded-full border border-border-line">
                Conta & Pix
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`text-2xl lg:text-3xl font-display font-bold num-financial block tracking-tight ${
                  isDebitPositive ? 'text-primary' : 'text-danger'
                }`}
              >
                {formatCurrency(metrics.debitBalance)}
              </span>
              <p className="text-[11px] text-text-secondary mt-1">
                Saldo disponível (dinheiro, Pix, débito e boletos).
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line/70 flex items-center justify-between text-[11px] text-text-secondary">
            <span className="flex items-center gap-1 text-primary">
              <ArrowDownLeft size={12} />
              +{formatCurrency(metrics.debitIncomePeriod)}
            </span>
            <span className="flex items-center gap-1 text-danger">
              <ArrowUpRight size={12} />
              -{formatCurrency(metrics.debitExpensesPeriod)}
            </span>
          </div>
        </div>

        {/* Card 2: Cartão de Crédito com Barra de Limite */}
        <div className="bg-surface border border-border-line rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <CreditCard size={15} className="text-primary" />
                Cartão de Crédito
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isCreditOverLimit
                    ? 'bg-danger/10 text-danger border-danger/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {isCreditOverLimit ? 'Limite Excedido' : 'Disponível'}
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`text-2xl lg:text-3xl font-display font-bold num-financial block tracking-tight ${
                  isCreditOverLimit ? 'text-danger' : 'text-text-primary'
                }`}
              >
                {formatCurrency(metrics.creditAvailable)}
              </span>
              <p className="text-[11px] text-text-secondary mt-1">
                Limite restante para novas compras.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line/70 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-secondary font-medium">Uso do limite</span>
              <span className="font-mono font-semibold text-text-primary">
                {metrics.creditUsedPercentage.toFixed(1)}%
              </span>
            </div>
            {/* Barra de progresso de uso do limite */}
            <div className="h-2 w-full bg-muted-surface rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(metrics.creditUsedPercentage, 100)}%` }}
                className={`h-full transition-all duration-fast rounded-full ${
                  metrics.creditUsedPercentage >= 100
                    ? 'bg-danger'
                    : metrics.creditUsedPercentage >= 80
                    ? 'bg-amber-600'
                    : 'bg-primary'
                }`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-secondary">
              <span>Usado: {formatCurrency(metrics.creditUsedTotal)}</span>
              <span>Total: {formatCurrency(metrics.creditLimit)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Vale Alimentação / Refeição */}
        <div className="bg-surface border border-border-line rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Utensils size={15} className="text-primary" />
                Saldo Vale
              </span>
              <span className="text-[11px] font-medium text-text-secondary bg-muted-surface px-2 py-0.5 rounded-full border border-border-line">
                Alimentação & Refeição
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`text-2xl lg:text-3xl font-display font-bold num-financial block tracking-tight ${
                  isMealPositive ? 'text-primary' : 'text-danger'
                }`}
              >
                {formatCurrency(metrics.mealBalance)}
              </span>
              <p className="text-[11px] text-text-secondary mt-1">
                Saldo acumulado para gastos com alimentação.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-line/70 flex items-center justify-between text-[11px] text-text-secondary">
            <span className="flex items-center gap-1 text-primary">
              <ArrowDownLeft size={12} />
              +{formatCurrency(metrics.mealIncomePeriod)}
            </span>
            <span className="flex items-center gap-1 text-danger">
              <ArrowUpRight size={12} />
              -{formatCurrency(metrics.mealExpensesPeriod)}
            </span>
          </div>
        </div>
      </div>

      {/* LINHA 2: Despesas e Comprometimento da Renda no Período */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Bloco 1: Total de Despesas do Período (7 colunas) */}
        <div className="lg:col-span-7 bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Despesas do Período
              </span>
              <span className="text-xs font-medium text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                Todas as saídas
              </span>
            </div>

            <div className="mt-3">
              <span className="text-4xl lg:text-5xl font-display font-bold text-text-primary num-financial block tracking-tight">
                {formatCurrency(metrics.periodExpenses)}
              </span>
              <p className="text-xs text-text-secondary mt-1.5">
                Total de débitos, cartões e vales registrados neste mês.
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
                {metrics.incomeCommittedRate.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}%
              </span>
            </div>

            {/* Barra de comprometimento */}
            <div className="h-2.5 w-full bg-muted-surface rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min(metrics.incomeCommittedRate, 100)}%` }}
                className="bg-primary h-full transition-all duration-fast rounded-full"
                title={`${metrics.incomeCommittedRate}% da renda gasta`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary mt-2">
              <span>R$ 0,00</span>
              <span className="font-medium text-text-secondary">
                Renda total: {formatCurrency(metrics.periodIncome)}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Total de Receitas e Resultado Líquido do Mês (5 colunas) */}
        <div className="lg:col-span-5 bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Resultado do Mês
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  metrics.periodNetResult >= 0
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-danger/10 text-danger border-danger/20'
                }`}
              >
                {metrics.periodNetResult >= 0 ? 'Superávit' : 'Déficit'}
              </span>
            </div>

            <div className="mt-3">
              <span
                className={`text-3xl lg:text-4xl font-display font-bold num-financial block tracking-tight ${
                  metrics.periodNetResult >= 0 ? 'text-primary' : 'text-danger'
                }`}
              >
                {metrics.periodNetResult >= 0 ? '+ ' : ''}
                {formatCurrency(metrics.periodNetResult)}
              </span>
              <p className="text-xs text-text-secondary mt-1.5">
                Diferença entre receitas e despesas registradas neste mês.
              </p>
            </div>
          </div>

          {/* Receitas do período */}
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
                    {formatCurrency(metrics.periodIncome)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-text-secondary font-medium">
                {metrics.periodIncome > 0 ? 'Registrado' : 'Sem receitas'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

