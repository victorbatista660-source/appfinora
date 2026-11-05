import React, { useState, useRef, useEffect } from 'react'
import {
  Menu,
  Plus,
  Calendar,
  MoreVertical,
  Download,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react'
import { Button } from '../ui/Button'

interface HeaderProps {
  onOpenMobileMenu: () => void
  onOpenNewTransaction: () => void
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  onResetData: () => void
  onExportCSV: () => void
}

const AVAILABLE_PERIODS = [
  'Outubro de 2026',
  'Setembro de 2026',
  'Agosto de 2026',
  'Julho de 2026',
]

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewTransaction,
  selectedPeriod,
  onSelectPeriod,
  onResetData,
  onExportCSV,
}) => {
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false)
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)

  const periodRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setIsPeriodMenuOpen(false)
      }
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setIsActionsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-surface border-b border-border-line sticky top-0 z-30 px-6 py-5 lg:px-10 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Lado Esquerdo: Identificação e Título */}
        <div className="flex items-start gap-4">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Abrir menu de navegação"
            className="lg:hidden p-2.5 -ml-2 text-text-secondary hover:text-text-primary hover:bg-muted-surface rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Menu size={20} strokeWidth={2} />
          </button>

          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
              Seu dinheiro, em perspectiva.
            </h1>
            <p className="text-sm text-text-secondary mt-1 font-sans">
              Uma visão clara de como você está usando seu dinheiro.
            </p>
          </div>
        </div>

        {/* Lado Direito: Seletor de Período, Adicionar Transação e Ações Secundárias */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* Seletor de Mês e Ano */}
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isPeriodMenuOpen}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium text-text-primary bg-muted-surface hover:bg-border-line/60 border border-border-line transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Calendar size={14} className="text-primary" strokeWidth={2} />
              <span>{selectedPeriod}</span>
            </button>

            {isPeriodMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border-line rounded-lg shadow-dropdown py-1.5 z-40 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
                  Selecionar Período
                </div>
                {AVAILABLE_PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      onSelectPeriod(p)
                      setIsPeriodMenuOpen(false)
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-muted-surface flex items-center justify-between transition-colors min-h-[38px]"
                  >
                    <span>{p}</span>
                    {selectedPeriod === p && (
                      <Check size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botão Adicionar Transação */}
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={16} strokeWidth={2.2} />}
            onClick={onOpenNewTransaction}
          >
            Adicionar transação
          </Button>

          {/* Menu de Ações Secundárias */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              aria-label="Ações secundárias do painel"
              aria-haspopup="true"
              aria-expanded={isActionsMenuOpen}
              className="p-2.5 text-text-secondary hover:text-text-primary hover:bg-muted-surface border border-border-line rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>

            {isActionsMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface border border-border-line rounded-lg shadow-dropdown py-1.5 z-40 animate-fade-in">
                <button
                  onClick={() => {
                    onExportCSV()
                    setIsActionsMenuOpen(false)
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-muted-surface flex items-center gap-2.5 transition-colors min-h-[38px]"
                >
                  <Download size={14} className="text-text-secondary" />
                  <span>Exportar relatório (CSV)</span>
                </button>
                <button
                  onClick={() => {
                    onResetData()
                    setIsActionsMenuOpen(false)
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-text-primary hover:bg-muted-surface flex items-center gap-2.5 transition-colors min-h-[38px]"
                >
                  <RotateCcw size={14} className="text-text-secondary" />
                  <span>Restaurar dados de exemplo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
