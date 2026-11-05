import React, { useState, useMemo } from 'react'
import { Transaction } from '../../types'
import { FINORA_CATEGORIES } from '../../data/mockData'
import {
  calculateVariation,
  CategoryComparison,
  EstablishmentComparison,
  generateObservations,
} from '../../lib/comparativeUtils'
import { formatCurrency } from '../../lib/utils'
import { ComparativeMetricsBanner } from './ComparativeMetricsBanner'
import { ComparativeCategoryTable } from './ComparativeCategoryTable'
import { EstablishmentComparisonCard } from './EstablishmentComparisonCard'
import { AutomaticObservationsCard } from './AutomaticObservationsCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Calendar, GitCompare, Filter, Info } from 'lucide-react'

interface ComparativesPageProps {
  transactions: Transaction[]
}

type ComparisonPreset = 'oct_vs_sep' | 'sep_vs_aug' | 'custom'

export const ComparativesPage: React.FC<ComparativesPageProps> = ({ transactions }) => {
  const [selectedPreset, setSelectedPreset] = useState<ComparisonPreset>('oct_vs_sep')

  // Definição dos períodos
  const { currentPeriodKey, previousPeriodKey, currentLabel, previousLabel } = useMemo(() => {
    if (selectedPreset === 'sep_vs_aug') {
      return {
        currentPeriodKey: '2026-09',
        previousPeriodKey: '2026-08',
        currentLabel: 'Setembro 2026',
        previousLabel: 'Agosto 2026',
      }
    }
    return {
      currentPeriodKey: '2026-10',
      previousPeriodKey: '2026-09',
      currentLabel: 'Outubro 2026',
      previousLabel: 'Setembro 2026',
    }
  }, [selectedPreset])

  // Transações de cada período
  const currentTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentPeriodKey))
  }, [transactions, currentPeriodKey])

  const previousTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(previousPeriodKey))
  }, [transactions, previousPeriodKey])

  // Métricas Consolidadas do Período Atual
  const currentExpenses = useMemo(() => {
    return currentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentTransactions])

  const currentIncome = useMemo(() => {
    return currentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [currentTransactions])

  const currentBalance = currentIncome - currentExpenses

  // Métricas Consolidadas do Período Anterior
  const previousExpenses = useMemo(() => {
    return previousTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [previousTransactions])

  const previousIncome = useMemo(() => {
    return previousTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [previousTransactions])

  const previousBalance = previousIncome - previousExpenses

  // Análise Comparativa por Categoria
  const categoryComparisons: CategoryComparison[] = useMemo(() => {
    return FINORA_CATEGORIES.map((cat) => {
      const curAmt = currentTransactions
        .filter((t) => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0)

      const prevAmt = previousTransactions
        .filter((t) => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0)

      const variation = calculateVariation(curAmt, prevAmt)
      const pctOfTotal = currentExpenses > 0 ? (curAmt / currentExpenses) * 100 : 0

      return {
        category: cat,
        currentAmount: curAmt,
        previousAmount: prevAmt,
        absoluteDiff: variation.absolute,
        percentDiff: variation.percentage,
        hasBase: variation.hasBase,
        percentageOfCurrentTotal: pctOfTotal,
      }
    }).filter((c) => c.currentAmount > 0 || c.previousAmount > 0)
  }, [currentTransactions, previousTransactions, currentExpenses])

  // Análise por Estabelecimento (Top 5 mais relevantes)
  const establishmentComparisons: EstablishmentComparison[] = useMemo(() => {
    // Agrupar gastos atuais por estabelecimento
    const curEstMap: Record<string, { amount: number; category: string }> = {}
    currentTransactions
      .filter((t) => t.type === 'expense' && t.establishment)
      .forEach((t) => {
        const key = t.establishment!
        curEstMap[key] = {
          amount: (curEstMap[key]?.amount || 0) + t.amount,
          category: t.category,
        }
      })

    // Agrupar gastos anteriores por estabelecimento
    const prevEstMap: Record<string, number> = {}
    previousTransactions
      .filter((t) => t.type === 'expense' && t.establishment)
      .forEach((t) => {
        const key = t.establishment!
        prevEstMap[key] = (prevEstMap[key] || 0) + t.amount
      })

    const allKeys = Array.from(new Set([...Object.keys(curEstMap)]))

    return allKeys
      .map((estName) => {
        const curAmt = curEstMap[estName]?.amount || 0
        const prevAmt = prevEstMap[estName] || 0
        const cat = curEstMap[estName]?.category || 'Geral'
        const variation = calculateVariation(curAmt, prevAmt)

        return {
          establishment: estName,
          category: cat,
          currentAmount: curAmt,
          previousAmount: prevAmt,
          absoluteDiff: variation.absolute,
          percentDiff: variation.percentage,
          hasBase: variation.hasBase,
        }
      })
      .sort((a, b) => b.currentAmount - a.currentAmount)
      .slice(0, 6)
  }, [currentTransactions, previousTransactions])

  // Observações Automáticas
  const observations = useMemo(() => {
    return generateObservations(
      currentExpenses,
      previousExpenses,
      currentIncome,
      categoryComparisons
    )
  }, [currentExpenses, previousExpenses, currentIncome, categoryComparisons])

  // Dados para o Gráfico de Barras Comparativo
  const barChartData = [
    {
      metric: 'Receitas',
      [currentLabel]: currentIncome,
      [previousLabel]: previousIncome,
    },
    {
      metric: 'Despesas',
      [currentLabel]: currentExpenses,
      [previousLabel]: previousExpenses,
    },
    {
      metric: 'Saldo',
      [currentLabel]: currentBalance,
      [previousLabel]: previousBalance,
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-line gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Entenda sua evolução.
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Compare períodos e descubra como seus hábitos financeiros estão mudando.
          </p>
        </div>

        {/* Seletor de Períodos Comparativos */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="inline-flex rounded-lg border border-border-line p-0.5 bg-muted-surface">
            <button
              onClick={() => setSelectedPreset('oct_vs_sep')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPreset === 'oct_vs_sep'
                  ? 'bg-surface text-primary font-semibold shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Outubro vs Setembro
            </button>
            <button
              onClick={() => setSelectedPreset('sep_vs_aug')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedPreset === 'sep_vs_aug'
                  ? 'bg-surface text-primary font-semibold shadow-subtle'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Setembro vs Agosto
            </button>
          </div>
        </div>
      </div>

      {/* 2. Banner de Métricas Comparativas Consolidadas */}
      <ComparativeMetricsBanner
        currentPeriodLabel={currentLabel}
        previousPeriodLabel={previousLabel}
        currentIncome={currentIncome}
        previousIncome={previousIncome}
        currentExpenses={currentExpenses}
        previousExpenses={previousExpenses}
        currentBalance={currentBalance}
        previousBalance={previousBalance}
      />

      {/* 3. Observações Automáticas Baseadas em Evidências */}
      <AutomaticObservationsCard observations={observations} />

      {/* 4. Gráfico Comparativo de Barras */}
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border-line gap-2">
          <div>
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Comparativo de fluxo ({currentLabel} vs {previousLabel})
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-sans">
              Proporção lado a lado entre entradas, saídas e resultado líquido.
            </p>
          </div>
        </div>

        <div className="mt-6 w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 12, right: 16, left: 0, bottom: 6 }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#D9E0DA" vertical={false} />
              <XAxis
                dataKey="metric"
                stroke="#526158"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#D9E0DA' }}
                dy={6}
                fontFamily="Plus Jakarta Sans"
              />
              <YAxis
                stroke="#526158"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(1)}k`}
                dx={-8}
                fontFamily="Plus Jakarta Sans"
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D9E0DA',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(23, 35, 29, 0.08)',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar dataKey={currentLabel} fill="#174D3A" radius={[4, 4, 0, 0]} name={currentLabel} />
              <Bar dataKey={previousLabel} fill="#526158" radius={[4, 4, 0, 0]} name={previousLabel} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Tabela Comparativa por Categoria */}
      <ComparativeCategoryTable
        categories={categoryComparisons}
        currentPeriodLabel={currentLabel}
        previousPeriodLabel={previousLabel}
      />

      {/* 6. Análise por Estabelecimento */}
      <EstablishmentComparisonCard
        establishments={establishmentComparisons}
        currentPeriodLabel={currentLabel}
        previousPeriodLabel={previousLabel}
      />
    </div>
  )
}
