import React from 'react'
import { FinancialSummary } from '../../types'
import { formatCurrency, formatPercentage } from '../../lib/utils'
import { Landmark, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react'

interface AssetsAllocationProps {
  summary: FinancialSummary
}

export const AssetsAllocation: React.FC<AssetsAllocationProps> = ({ summary }) => {
  const assetClasses = [
    {
      name: 'Renda Fixa & Títulos Públicos',
      instrument: 'Tesouro IPCA+ 2035 & CDB 110% CDI',
      institution: 'BTG Pactual & XP Investimentos',
      amount: 125000.0,
      share: 44.0,
      target: 45.0,
      badge: 'Conservador',
    },
    {
      name: 'Reserva de Emergência com Liquidez D+0',
      instrument: 'Tesouro Selic & Conta Remunerada',
      institution: 'Nubank Institucional & Itaú Personnalité',
      amount: 50000.0,
      share: 17.5,
      target: 15.0,
      badge: 'Liquidez Diária',
    },
    {
      name: 'Renda Variável & Fundos Imobiliários',
      instrument: 'ETFs Globais (VWRA, IVVB11) e FIIs Logísticos',
      institution: 'Avenue Securities & B3',
      amount: 67500.0,
      share: 23.7,
      target: 25.0,
      badge: 'Crescimento',
    },
    {
      name: 'Caixa Corrente Operacional',
      instrument: 'Disponibilidade imediata para despesas correntes',
      institution: 'Banco Principal',
      amount: 42150.0,
      share: 14.8,
      target: 15.0,
      badge: 'Operacional',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Consolidação Patrimonial
          </span>
          <h2 className="text-3xl font-display font-bold text-text-primary num-financial mt-1">
            {formatCurrency(summary.netWorth)}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Arquitetura de preservação de capital e maximização de rendimentos líquidos.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="p-3 bg-muted-surface border border-border-line rounded-lg">
            <span className="text-text-secondary block">Índice Sharpe Estimado</span>
            <span className="font-display font-semibold text-primary text-sm">1.84</span>
          </div>
          <div className="p-3 bg-muted-surface border border-border-line rounded-lg">
            <span className="text-text-secondary block">Rendimento Médio a.a.</span>
            <span className="font-display font-semibold text-primary text-sm">+12.4%</span>
          </div>
        </div>
      </div>

      {/* Asset Classes Table */}
      <div className="bg-surface border border-border-line rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border-line">
          <h3 className="text-base font-display font-semibold text-text-primary">
            Classes de Ativos e Alocação Estratégica
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Divisão do patrimônio entre proteção contra inflação, liquidez de curto prazo e valorização.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Tabela de Alocação Patrimonial">
            <thead>
              <tr className="border-b border-border-line bg-muted-surface/40 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                <th className="py-3 px-6">Classe do Ativo</th>
                <th className="py-3 px-6">Instrumentos & Custódia</th>
                <th className="py-3 px-6 text-center">Alocação Real</th>
                <th className="py-3 px-6 text-right">Saldo Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-line/70 text-sm">
              {assetClasses.map((ac, idx) => (
                <tr key={idx} className="hover:bg-muted-surface/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-text-primary block">
                      {ac.name}
                    </span>
                    <span className="text-xs text-accent font-medium mt-0.5 inline-block">
                      {ac.badge}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs text-text-primary block font-medium">
                      {ac.instrument}
                    </span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">
                      Custódia: {ac.institution}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-display font-semibold text-xs num-financial text-text-primary">
                        {ac.share}%
                      </span>
                      <span className="text-[10px] text-text-secondary">
                        Meta: {ac.target}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="font-display font-semibold text-text-primary num-financial">
                      {formatCurrency(ac.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
