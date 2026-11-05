import React from 'react'
import {
  LayoutDashboard,
  Receipt,
  Tags,
  GitCompare,
  PieChart,
  Target,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  ShieldCheck,
  LogOut,
} from 'lucide-react'
import { NavPage } from '../../types'
import { cn } from '../../lib/utils'
import { isSupabaseConfigured } from '../../services/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  currentPage: NavPage
  onSelectPage: (page: NavPage) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { profileName, profileEmail, userInitials, signOut } = useAuth()

  const menuItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Visão geral',
      icon: <LayoutDashboard size={17} strokeWidth={1.75} />,
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: <Receipt size={17} strokeWidth={1.75} />,
    },
    {
      id: 'categories',
      label: 'Categorias',
      icon: <Tags size={17} strokeWidth={1.75} />,
    },
    {
      id: 'comparatives',
      label: 'Comparativos',
      icon: <GitCompare size={17} strokeWidth={1.75} />,
    },
    {
      id: 'budgets',
      label: 'Orçamentos',
      icon: <PieChart size={17} strokeWidth={1.75} />,
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: <Target size={17} strokeWidth={1.75} />,
    },
    {
      id: 'whatsapp',
      label: 'Integração WhatsApp',
      icon: <MessageSquare size={17} strokeWidth={1.75} />,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: <Settings size={17} strokeWidth={1.75} />,
    },
  ]

  const sidebarContent = (
    <aside className="w-64 bg-surface border-r border-border-line flex flex-col h-full select-none">
      {/* Marca textual Finora */}
      <div className="px-6 py-7 border-b border-border-line flex items-center justify-between">
        <div>
          <span className="font-display text-2xl font-bold tracking-tight text-text-primary block leading-none">
            Finora
          </span>
          <span className="text-[11px] font-sans text-text-secondary tracking-wider uppercase mt-1.5 block">
            Gestão Financeira
          </span>
        </div>
      </div>

      {/* Menu Principal */}
      <nav className="p-3 flex-1 space-y-1" aria-label="Navegação Lateral">
        <div className="px-3 pt-2 pb-1.5 text-[10px] font-semibold tracking-wider text-text-secondary uppercase">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectPage(item.id)
                if (onCloseMobile) onCloseMobile()
              }}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-fast min-h-[42px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive
                  ? 'bg-muted-surface text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted-surface/50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(isActive ? 'text-primary' : 'text-text-secondary')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Status da Conexão */}
      <div className="px-4 py-3 mx-3 mb-3 bg-muted-surface/60 border border-border-line rounded-lg text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5 font-medium text-text-primary text-xs mb-0.5">
          <ShieldCheck
            size={14}
            className={isSupabaseConfigured ? 'text-primary' : 'text-text-secondary'}
          />
          <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'Armazenamento Local'}</span>
        </div>
        {isSupabaseConfigured
          ? 'Cliente @supabase/supabase-js ativo via .env.local.'
          : 'Dados preservados localmente no navegador.'}
      </div>

      {/* Perfil do Usuário e Preferências */}
      <div className="p-3.5 border-t border-border-line flex items-center justify-between bg-surface gap-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-muted-surface border border-border-line flex items-center justify-center font-display font-semibold text-text-primary text-xs shrink-0">
            {userInitials}
          </div>
          <div className="text-left overflow-hidden min-w-0 flex-1">
            <span
              className="text-xs font-semibold text-text-primary block truncate leading-tight"
              title={profileName}
            >
              {profileName}
            </span>
            <span
              className="text-[11px] text-text-secondary block truncate mt-0.5"
              title={profileEmail}
            >
              {profileEmail}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onSelectPage('settings')}
            aria-label="Preferências do usuário"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-muted-surface rounded-md transition-colors"
            title="Preferências"
          >
            <SlidersHorizontal size={15} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => signOut()}
            aria-label="Sair da conta"
            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
            title="Sair da conta"
          >
            <LogOut size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-text-primary/30 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 h-full shadow-dropdown">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
