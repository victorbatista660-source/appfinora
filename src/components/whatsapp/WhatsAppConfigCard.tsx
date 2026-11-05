import React, { useState } from 'react'
import {
  Smartphone,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { WhatsAppSetupModal } from './WhatsAppSetupModal'

export const WhatsAppConfigCard: React.FC = () => {
  const [authorizedPhone, setAuthorizedPhone] = useState('+55 (11) 98765-4321')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const requirements = [
    'Número de celular com WhatsApp ativo e verificado.',
    'Acesso para confirmação de titularidade via código de uso único (OTP).',
    'Concordância com o protocolo de privacidade do Finora (sem leitura de contas bancárias).',
  ]

  return (
    <>
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-subtle space-y-6">
        {/* Cabeçalho do Card de Configuração */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border-line gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-display font-semibold text-text-primary">
                Configuração do Canal
              </h2>
              {/* Estado da Integração: Não configurada */}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/60" />
                Não configurada
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-sans">
              Gerencie a vinculação de número móvel autorizado a enviar comandos contábeis.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Sliders size={15} strokeWidth={2} />}
            onClick={() => setIsModalOpen(true)}
          >
            Configurar integração
          </Button>
        </div>

        {/* Grade de 2 Colunas: Número Autorizado & Processo de Configuração */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Coluna 1: Campo Visual para Número Autorizado e Resumo do Processo */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="auth-phone-input"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Número Autorizado (Exemplo)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Smartphone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    id="auth-phone-input"
                    type="text"
                    readOnly
                    value={authorizedPhone}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted-surface/70 border border-border-line rounded-lg text-sm font-sans text-text-primary focus:outline-none min-h-[44px] cursor-default"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                >
                  Alterar
                </Button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">
                Apenas mensagens recebidas a partir deste número serão interpretadas pelo seu Finora.
              </p>
            </div>

            {/* Explicação Resumida do Processo */}
            <div className="p-4 bg-muted-surface/50 border border-border-line rounded-lg text-xs space-y-2">
              <span className="font-semibold text-text-primary block">
                Processo de ativação em 3 etapas:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-text-secondary text-[12px] leading-relaxed">
                <li>Registro do seu número de celular individual com DDD.</li>
                <li>Confirmação da chave criptográfica temporária via WhatsApp.</li>
                <li>Início imediato do registro de despesas e receitas por mensagens.</li>
              </ol>
            </div>
          </div>

          {/* Coluna 2: Lista de Requisitos para Ativação & Garantia de Privacidade */}
          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Requisitos para Ativação
              </span>
              <ul className="space-y-2.5">
                {requirements.map((req, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-text-primary p-3 bg-surface border border-border-line rounded-lg"
                  >
                    <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aviso de Segurança e Segredos */}
            <div className="p-3.5 bg-muted-surface/70 border border-border-line rounded-lg flex items-center gap-2.5 text-xs text-text-secondary">
              <Lock size={15} className="text-primary shrink-0" />
              <span className="text-[11px] leading-relaxed">
                <strong>Sem solicitação de credenciais:</strong> Tokens de API e webhooks são configurados estritamente no servidor seguro, sem expor dados no navegador.
              </span>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPhone={authorizedPhone}
        onSavePhone={(newPhone) => setAuthorizedPhone(newPhone)}
      />
    </>
  )
}
