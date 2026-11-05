import React from 'react'
import { WhatsAppConversationPreview } from './WhatsAppConversationPreview'
import { WhatsAppConfigCard } from './WhatsAppConfigCard'
import { WhatsAppTechPrepCard } from './WhatsAppTechPrepCard'
import { MessageSquare, ShieldCheck, Info } from 'lucide-react'

export const WhatsAppPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Cabeçalho Editorial */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border-line gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              <MessageSquare size={13} strokeWidth={2} />
              Canal Conversacional Oficial
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Seu financeiro, direto no WhatsApp.
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Registre seus gastos em uma conversa e acompanhe tudo no Finora.
          </p>
        </div>

        {/* Badge do Status Atual */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-muted-surface border border-border-line px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-text-secondary/50" />
            Status: <strong>Não configurada</strong>
          </span>
        </div>
      </div>

      {/* 2. Prévia Visual de Conversa (Despesas, Receitas e Consultas) */}
      <WhatsAppConversationPreview />

      {/* 3. Área de Configuração e Requisitos */}
      <WhatsAppConfigCard />

      {/* 4. Preparação Técnica e Privacidade */}
      <WhatsAppTechPrepCard />
    </div>
  )
}
