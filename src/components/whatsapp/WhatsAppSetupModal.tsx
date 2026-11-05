import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import {
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface WhatsAppSetupModalProps {
  isOpen: boolean
  onClose: () => void
  currentPhone: string
  onSavePhone: (phone: string) => void
}

export const WhatsAppSetupModal: React.FC<WhatsAppSetupModalProps> = ({
  isOpen,
  onClose,
  currentPhone,
  onSavePhone,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone)
  const [step, setStep] = useState<'info' | 'number' | 'confirmation'>('info')

  const handleNext = () => {
    if (step === 'info') {
      setStep('number')
    } else if (step === 'number') {
      if (phoneNumber.trim()) {
        onSavePhone(phoneNumber.trim())
      }
      setStep('confirmation')
    } else {
      onClose()
      setStep('info')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setStep('info')
      }}
      title="Configuração do WhatsApp Business"
      subtitle="Entenda o protocolo de ativação segura do canal conversacional."
      maxWidth="md"
    >
      <div className="space-y-5 text-text-primary text-xs">
        {/* Aviso de Não Ativação */}
        <div className="p-4 bg-muted-surface border border-border-line rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-text-primary block font-medium">
              Fase de demonstração e arquitetura de produto
            </strong>
            <p className="text-text-secondary mt-0.5">
              Esta tela apresenta o fluxo que será disponibilizado aos usuários. Nenhuma conexão real está ativa no momento e nenhum dado confidencial é exigido nesta interface.
            </p>
          </div>
        </div>

        {step === 'info' && (
          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold text-text-primary">
              Como funcionará a ativação no backend:
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-surface border border-border-line rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-xs shrink-0">
                  1
                </div>
                <div>
                  <span className="font-semibold text-text-primary block">
                    Vinculação do Número de Celular
                  </span>
                  <p className="text-text-secondary mt-0.5">
                    Você informa o número de telefone com DDD que utilizará para enviar as mensagens. Apenas mensagens vindas deste número serão autorizadas.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-surface border border-border-line rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-xs shrink-0">
                  2
                </div>
                <div>
                  <span className="font-semibold text-text-primary block">
                    Verificação em Duas Etapas (OTP)
                  </span>
                  <p className="text-text-secondary mt-0.5">
                    Um código temporário de verificação é enviado ao seu WhatsApp oficial para confirmar que você é o titular da linha.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-surface border border-border-line rounded-lg flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-xs shrink-0">
                  3
                </div>
                <div>
                  <span className="font-semibold text-text-primary block">
                    Canal Criptografado Pronto para Uso
                  </span>
                  <p className="text-text-secondary mt-0.5">
                    A partir deste momento, qualquer mensagem enviada para o contato verificado do Finora será interpretada e refletida no seu painel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'number' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="modal-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Número de Celular Autorizado
              </label>
              <div className="relative">
                <Smartphone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  id="modal-phone"
                  type="text"
                  placeholder="+55 (11) 98765-4321"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted-surface border border-border-line rounded-lg text-sm font-sans text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface min-h-[44px]"
                />
              </div>
              <p className="text-[11px] text-text-secondary mt-1.5">
                Utilize o formato com código de área (+55 DDD 9XXXX-XXXX).
              </p>
            </div>

            <div className="p-3 bg-muted-surface/70 border border-border-line rounded-lg flex items-center gap-2 text-text-secondary text-[11px]">
              <Lock size={14} className="text-primary shrink-0" />
              <span>
                Tokens e chaves de API nunca são solicitados na interface visual. Toda a segurança de conexão é tratada pelo servidor.
              </span>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="py-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} strokeWidth={2} />
            </div>
            <h3 className="text-base font-display font-semibold text-text-primary">
              Configuração demonstrativa salva
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              O número <strong>{phoneNumber || '+55 (11) 98765-4321'}</strong> foi registrado na demonstração local. Quando o backend com o webhook oficial for publicado, este número receberá a mensagem de ativação.
            </p>
          </div>
        )}

        {/* Rodapé de Ações */}
        <div className="pt-4 border-t border-border-line flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose()
              setStep('info')
            }}
          >
            {step === 'confirmation' ? 'Fechar' : 'Cancelar'}
          </Button>

          <Button type="button" variant="primary" onClick={handleNext}>
            {step === 'info' && (
              <>
                <span>Avançar para simulação</span>
                <ArrowRight size={14} className="ml-1" />
              </>
            )}
            {step === 'number' && 'Salvar número de exemplo'}
            {step === 'confirmation' && 'Concluir'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
