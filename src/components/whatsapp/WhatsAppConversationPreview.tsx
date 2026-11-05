import React, { useState } from 'react'
import {
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Receipt,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

type Scenario = 'expense' | 'income' | 'query'

interface MessageItem {
  id: string
  sender: 'user' | 'finora'
  text: string
  timestamp: string
  badge?: string
}

const SCENARIOS: Record<
  Scenario,
  {
    title: string
    description: string
    messages: MessageItem[]
  }
> = {
  expense: {
    title: 'Registro de Despesa',
    description: 'Identificação imediata de valores, estabelecimentos e categorias.',
    messages: [
      {
        id: '1',
        sender: 'user',
        text: 'Gastei 32,90 no mercado no Pix.',
        timestamp: '14:22',
      },
      {
        id: '2',
        sender: 'finora',
        text: 'Despesa identificada: R$ 32,90.\nCategoria sugerida: Alimentação.\nMétodo: Pix.\n\nDeseja confirmar o registro?',
        timestamp: '14:22',
        badge: 'Aguardando confirmação',
      },
      {
        id: '3',
        sender: 'user',
        text: 'Sim, confirmar.',
        timestamp: '14:23',
      },
      {
        id: '4',
        sender: 'finora',
        text: 'Lançamento confirmado com sucesso no seu Livro de Transações. Seu saldo disponível foi recalculado automaticamente.',
        timestamp: '14:23',
        badge: 'Registrado no Finora',
      },
    ],
  },
  income: {
    title: 'Registro de Receita',
    description: 'Computação de honorários, rendimentos e recebimentos avulsos.',
    messages: [
      {
        id: '1',
        sender: 'user',
        text: 'Recebi 1.200 de consultoria na conta.',
        timestamp: '10:05',
      },
      {
        id: '2',
        sender: 'finora',
        text: 'Receita identificada: R$ 1.200,00.\nCategoria sugerida: Receita Profissional.\n\nConfirmado e adicionado ao saldo do mês!',
        timestamp: '10:05',
        badge: 'Entrada computada',
      },
    ],
  },
  query: {
    title: 'Consulta de Gastos',
    description: 'Resumos rápidos do orçamento sem precisar abrir o aplicativo.',
    messages: [
      {
        id: '1',
        sender: 'user',
        text: 'Quanto gastei com alimentação neste mês?',
        timestamp: '18:40',
      },
      {
        id: '2',
        sender: 'finora',
        text: 'Total em Alimentação em Outubro: R$ 680,00 (36,9% das despesas totais).\nVocê está dentro do orçamento previsto.',
        timestamp: '18:40',
        badge: 'Relatório sintetizado',
      },
    ],
  },
}

export const WhatsAppConversationPreview: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>('expense')
  const current = SCENARIOS[activeScenario]

  return (
    <div className="bg-surface border border-border-line rounded-xl shadow-subtle overflow-hidden">
      {/* Cabeçalho do Card */}
      <div className="p-6 border-b border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              Prévia da experiência conversacional
            </h2>
            <span className="text-[11px] font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
              Modelo mental
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Veja como funcionará a interação via mensagens de texto ou áudio no dia a dia.
          </p>
        </div>

        {/* Alternador de Cenários */}
        <div className="inline-flex rounded-lg border border-border-line p-0.5 bg-muted-surface self-start sm:self-auto">
          <button
            onClick={() => setActiveScenario('expense')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeScenario === 'expense'
                ? 'bg-surface text-primary font-semibold shadow-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Despesa
          </button>
          <button
            onClick={() => setActiveScenario('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeScenario === 'income'
                ? 'bg-surface text-primary font-semibold shadow-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Receita
          </button>
          <button
            onClick={() => setActiveScenario('query')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeScenario === 'query'
                ? 'bg-surface text-primary font-semibold shadow-subtle'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Consulta
          </button>
        </div>
      </div>

      {/* Conteúdo da Conversa Editorial */}
      <div className="p-6 lg:p-8 bg-[#FAF9F5] border-b border-border-line">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="text-center">
            <span className="text-[11px] text-text-secondary bg-surface px-3 py-1 rounded-full border border-border-line">
              {current.title} — {current.description}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {current.messages.map((msg) => {
              const isFinora = msg.sender === 'finora'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isFinora ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed shadow-subtle ${
                      isFinora
                        ? 'bg-surface border border-border-line text-text-primary'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-75">
                      <span className="font-semibold tracking-wide uppercase">
                        {isFinora ? 'Finora Assistente' : 'Você'}
                      </span>
                      <span className="tabular-nums font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-line text-xs font-sans">
                      {msg.text}
                    </p>

                    {msg.badge && (
                      <div className="mt-2.5 pt-2 border-t border-border-line/60 flex items-center gap-1.5 text-[11px] text-accent font-medium">
                        <CheckCircle2 size={13} />
                        <span>{msg.badge}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-primary" />
          A IA do Finora compreende gírias, métodos de pagamento e linguagem natural.
        </span>
        <span className="text-[11px] text-text-secondary">
          Sem conexão direta a extratos bancários.
        </span>
      </div>
    </div>
  )
}
