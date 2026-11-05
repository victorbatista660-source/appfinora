import React, { useState } from 'react'
import {
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react'
import { Transaction } from '../../types'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../lib/utils'

interface WhatsAppSimulatorProps {
  onAddTransaction: (newTx: Omit<Transaction, 'id'>) => void
}

interface SimulatedMessage {
  id: string
  sender: 'user' | 'finora'
  text: string
  timestamp: string
  extractedData?: {
    description: string
    amount: number
    category: string
  }
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ onAddTransaction }) => {
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: 'm1',
      sender: 'finora',
      text: 'Olá, Yan! Sou o Finora. Você pode registrar qualquer despesa me enviando uma mensagem rápida, como: "Almoço bistrô 45,90 no cartão" ou "Combustível 120". Experimente abaixo!',
      timestamp: '10:00',
    },
  ])

  const suggestions = [
    'Almoço executivo 58,00 no cartão',
    'Farmácia remédios 112,40 no débito',
    'Uber até o escritório 34,90',
    'Café com cliente 24,00 no Pix',
  ]

  // Intelligent parser simulation
  const handleSend = (textToSend?: string) => {
    const raw = textToSend || inputText
    if (!raw.trim()) return

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`

    const userMsg: SimulatedMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: raw,
      timestamp: timeStr,
    }

    // Parse amount: look for currency numbers like "58,00", "58.00", "58"
    const numberMatch = raw.match(/(\d+([.,]\d{1,2})?)/)
    let parsedAmount = 45.0
    if (numberMatch) {
      parsedAmount = parseFloat(numberMatch[1].replace(',', '.'))
    }

    // Infer category
    const lower = raw.toLowerCase()
    let category = 'Outros'
    let description = raw.replace(/(\d+([.,]\d{1,2})?)/, '').replace(/(r\$|no cartão|no pix|no débito)/gi, '').trim()

    if (!description) {
      description = 'Despesa registrada via WhatsApp'
    } else {
      description = description.charAt(0).toUpperCase() + description.slice(1)
    }

    if (lower.includes('almoço') || lower.includes('jantar') || lower.includes('café') || lower.includes('bistrô') || lower.includes('mercado') || lower.includes('lanche')) {
      category = 'Alimentação & Gastronomia'
    } else if (lower.includes('uber') || lower.includes('combustível') || lower.includes('gasolina') || lower.includes('estacionamento')) {
      category = 'Transporte & Mobilidade'
    } else if (lower.includes('farmácia') || lower.includes('médico') || lower.includes('remédio')) {
      category = 'Saúde & Bem-estar'
    } else if (lower.includes('cinema') || lower.includes('livro') || lower.includes('show')) {
      category = 'Lazer & Cultura'
    }

    const finoraResponse: SimulatedMessage = {
      id: `f-${Date.now() + 1}`,
      sender: 'finora',
      text: `Entendido! Registrei "${description}" no valor de ${formatCurrency(parsedAmount)} na categoria ${category}.`,
      timestamp: timeStr,
      extractedData: {
        description,
        amount: parsedAmount,
        category,
      },
    }

    setMessages((prev) => [...prev, userMsg, finoraResponse])
    setInputText('')

    // Add to real application state
    onAddTransaction({
      description,
      amount: parsedAmount,
      type: 'expense',
      category,
      paymentMethod: 'Pix',
      date: new Date().toISOString().split('T')[0],
      origin: 'whatsapp',
      notes: `Registrado via simulador: "${raw}"`,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Editorial Explanatory Header */}
      <div className="bg-surface border border-border-line rounded-xl p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <MessageSquare size={22} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Simulador de Registro Conversacional
              </h2>
              <span className="text-[11px] font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                Protótipo de Validação de UX
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              No futuro, a integração oficial via <strong>WhatsApp Business Platform</strong> permitirá registrar
              qualquer movimentação sem abrir o aplicativo. Teste o comportamento e a compreensão da IA abaixo.
              Novos registros computam automaticamente na lista de transações demonstrativas.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Interface Container */}
      <div className="bg-surface border border-border-line rounded-xl shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left column: Quick Suggestions & Guide (4 cols) */}
        <div className="md:col-span-4 p-6 bg-muted-surface/40 border-b md:border-b-0 md:border-r border-border-line flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block mb-3">
              Exemplos Rápidos
            </span>
            <p className="text-xs text-text-secondary mb-3">
              Clique em qualquer exemplo para testar o processamento:
            </p>
            <div className="space-y-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item)}
                  className="w-full text-left p-2.5 bg-surface border border-border-line rounded-lg text-xs text-text-primary hover:border-accent hover:text-accent transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">"{item}"</span>
                  <ArrowRight
                    size={13}
                    className="shrink-0 text-text-secondary group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-line/70">
            <span className="text-[11px] text-text-secondary flex items-center gap-1">
              <HelpCircle size={13} />
              Sem acesso a extratos bancários. Você no controle.
            </span>
          </div>
        </div>

        {/* Right column: Interactive Chat Feed (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-[460px]">
          {/* Chat feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FBFBFA]">
            {messages.map((m) => {
              const isFinora = m.sender === 'finora'
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isFinora ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-subtle ${
                      isFinora
                        ? 'bg-surface border border-border-line text-text-primary'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[11px] opacity-80">
                        {isFinora ? 'Finora Assistente' : 'Você'}
                      </span>
                      <span className="text-[10px] opacity-60 tabular-nums">{m.timestamp}</span>
                    </div>
                    <p>{m.text}</p>

                    {m.extractedData && (
                      <div className="mt-2.5 pt-2 border-t border-border-line/60 flex items-center gap-2 text-[11px] text-accent">
                        <CheckCircle2 size={13} />
                        <span>Adicionado ao Livro de Transações</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 bg-surface border-t border-border-line flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Digite um gasto (ex: Almoço 38,50 no cartão)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-muted-surface border border-border-line rounded-lg px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Send size={15} />}
              aria-label="Enviar mensagem simulada"
            >
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
