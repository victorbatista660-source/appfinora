import React from 'react'
import {
  Server,
  ShieldCheck,
  KeyRound,
  FileCheck,
  Ban,
  Layers,
  Cpu,
} from 'lucide-react'

export const WhatsAppTechPrepCard: React.FC = () => {
  const techSpecs = [
    {
      icon: <Cpu size={18} className="text-primary" strokeWidth={1.8} />,
      title: 'WhatsApp Business Platform (API Oficial da Meta)',
      description:
        'Conexão direta pela Cloud API da Meta ou BSP certificado, garantindo alta disponibilidade, criptografia de ponta a ponta e entrega instantânea de eventos.',
    },
    {
      icon: <KeyRound size={18} className="text-primary" strokeWidth={1.8} />,
      title: 'Webhook Autenticado com Assinatura Criptográfica',
      description:
        'Todos os pacotes recebidos são validados via hash HMAC SHA-256 (cabeçalho X-Hub-Signature-256) antes do processamento, repelindo requisições não autorizadas.',
    },
    {
      icon: <FileCheck size={18} className="text-primary" strokeWidth={1.8} />,
      title: 'Idempotência e Prevenção de Mensagens Duplicadas',
      description:
        'Controle transacional de message_id para impedir que instabilidades ou retransmissões de rede do celular resultem em lançamentos duplicados.',
    },
    {
      icon: <ShieldCheck size={18} className="text-primary" strokeWidth={1.8} />,
      title: 'Validação de Identidade & Tratamento de Ambiguidade',
      description:
        'Apenas números cadastrados têm permissão de gravação. Sempre que uma mensagem contiver informações incompletas, a IA solicita confirmação explícita antes de gravar.',
    },
    {
      icon: <Ban size={18} className="text-danger" strokeWidth={2} />,
      title: 'Privacidade Consciente: Sem Acesso a Contas Bancárias',
      description:
        'O Finora não solicita senhas de banco, extratos bancários nem Open Finance invasivo. O usuário mantém controle deliberado de cada dado que escolhe compartilhar.',
    },
  ]

  return (
    <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-7 shadow-subtle space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-line gap-2">
        <div>
          <h2 className="text-lg font-display font-semibold text-text-primary">
            Arquitetura Técnica e Segurança do Canal
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">
            Especificações de engenharia para o futuro serviço de backend.
          </p>
        </div>
        <span className="text-xs text-text-secondary bg-muted-surface px-2.5 py-1 rounded-md border border-border-line self-start sm:self-auto">
          Pronto para Integração
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techSpecs.map((spec, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
              idx === techSpecs.length - 1
                ? 'md:col-span-2 bg-primary/5 border-primary/20'
                : 'bg-muted-surface/40 border-border-line'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-surface border border-border-line flex items-center justify-center shrink-0">
              {spec.icon}
            </div>
            <div>
              <span className="font-semibold text-xs text-text-primary block">
                {spec.title}
              </span>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {spec.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
