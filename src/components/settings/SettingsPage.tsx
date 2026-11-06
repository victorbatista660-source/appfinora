import React, { useState, useEffect } from 'react'
import { getSupabaseStatus, testSupabaseConnection, ConnectionTestResult } from '../../services/supabase'
import { dbService } from '../../services/dbService'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Globe,
  KeyRound,
  ArrowLeft,
  UploadCloud,
  HardDrive,
  ShieldCheck,
  CreditCard,
  Wallet,
  Utensils,
  Save,
} from 'lucide-react'

interface SettingsPageProps {
  onBackToOverview: () => void
  onDataRefresh?: () => Promise<void> | void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBackToOverview, onDataRefresh }) => {
  const { user } = useAuth()
  const status = getSupabaseStatus()
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)

  // Estados da migração
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Estados de Gestão de Contas e Limites
  const [creditLimit, setCreditLimit] = useState<string>('0')
  const [initialDebit, setInitialDebit] = useState<string>('0')
  const [initialMeal, setInitialMeal] = useState<string>('0')
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [savingAccounts, setSavingAccounts] = useState(false)
  const [accountSaveStatus, setAccountSaveStatus] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Carrega configurações de conta do Supabase
  useEffect(() => {
    if (!user) return
    setLoadingAccounts(true)
    dbService
      .getAccountSettings(user.id)
      .then((cfg) => {
        setCreditLimit(String(cfg.creditCardLimit ?? 0))
        setInitialDebit(String(cfg.initialBalanceDebit ?? 0))
        setInitialMeal(String(cfg.initialBalanceMeal ?? 0))
      })
      .catch((err) => {
        console.error('Erro ao carregar configurações de conta:', err)
      })
      .finally(() => {
        setLoadingAccounts(false)
      })
  }, [user])

  const handleSaveAccounts = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSavingAccounts(true)
    setAccountSaveStatus(null)

    const parsedCreditLimit = parseFloat(creditLimit.replace(',', '.')) || 0
    const parsedInitialDebit = parseFloat(initialDebit.replace(',', '.')) || 0
    const parsedInitialMeal = parseFloat(initialMeal.replace(',', '.')) || 0

    if (parsedCreditLimit < 0) {
      setAccountSaveStatus({
        success: false,
        message: 'O limite do cartão de crédito não pode ser negativo.',
      })
      setSavingAccounts(false)
      return
    }

    try {
      await dbService.saveAccountSettings(
        {
          creditCardLimit: parsedCreditLimit,
          initialBalanceDebit: parsedInitialDebit,
          initialBalanceMeal: parsedInitialMeal,
        },
        user.id
      )

      setAccountSaveStatus({
        success: true,
        message: 'Configurações de contas e limites salvas com sucesso!',
      })

      if (onDataRefresh) {
        await onDataRefresh()
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar contas:', err)
      setAccountSaveStatus({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : 'Falha ao salvar configurações de conta no Supabase.',
      })
    } finally {
      setSavingAccounts(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testSupabaseConnection()
      setTestResult(res)
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: 'Erro inesperado ao executar teste de conexão.',
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setTesting(false)
    }
  }

  const handleMigrateData = async () => {
    if (!user) {
      setMigrationResult({
        success: false,
        message: 'Você precisa estar logado para importar os dados.',
      })
      return
    }

    setMigrating(true)
    setMigrationResult(null)

    try {
      const res = await dbService.migrateLocalStorageToSupabase(user.id)
      setMigrationResult({
        success: res.success,
        message: res.message,
      })
      if (onDataRefresh) {
        await onDataRefresh()
      }
    } catch (err: unknown) {
      setMigrationResult({
        success: false,
        message: err instanceof Error ? err.message : 'Falha na importação de dados.',
      })
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-line gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-text-primary tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-sans">
            Gerencie conexões de infraestrutura, status dos serviços externos e integridade dos dados.
          </p>
        </div>
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:underline self-start sm:self-center"
        >
          <ArrowLeft size={14} />
          Voltar à Visão Geral
        </button>
      </div>

      {/* 1. Gestão de Contas e Limites */}
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-8 shadow-card space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Wallet size={22} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-text-primary">
                Gestão de Contas e Limites
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Configure os limites de crédito e saldos iniciais de cada uma das 3 contas separadas.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Configuração */}
        <form onSubmit={handleSaveAccounts} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Limite do Cartão de Crédito */}
            <div className="p-4 bg-muted-surface/60 border border-border-line rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <CreditCard size={15} className="text-primary" />
                <span>Limite Total do Cartão</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Limite cadastrado da sua fatura. Usado para calcular o limite disponível subtraindo as despesas de crédito em aberto.
              </p>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-text-secondary font-mono pointer-events-none">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={loadingAccounts || savingAccounts}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-2 bg-surface border border-border-line rounded-lg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
                />
              </div>
            </div>

            {/* 2. Saldo Inicial de Débito */}
            <div className="p-4 bg-muted-surface/60 border border-border-line rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <Wallet size={15} className="text-primary" />
                <span>Saldo Inicial Débito</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Saldo de partida da sua conta bancária/dinheiro antes dos lançamentos no app (Pix, boleto, débito).
              </p>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-text-secondary font-mono pointer-events-none">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  disabled={loadingAccounts || savingAccounts}
                  value={initialDebit}
                  onChange={(e) => setInitialDebit(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-2 bg-surface border border-border-line rounded-lg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
                />
              </div>
            </div>

            {/* 3. Saldo Inicial de Vale */}
            <div className="p-4 bg-muted-surface/60 border border-border-line rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <Utensils size={15} className="text-primary" />
                <span>Saldo Inicial Vale</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Saldo inicial do seu cartão de Vale Alimentação/Refeição. Entradas e saídas de vale afetam somente esta conta.
              </p>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-text-secondary font-mono pointer-events-none">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  disabled={loadingAccounts || savingAccounts}
                  value={initialMeal}
                  onChange={(e) => setInitialMeal(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-3 py-2 bg-surface border border-border-line rounded-lg text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loadingAccounts || savingAccounts || !user}
              icon={<Save size={14} className={savingAccounts ? 'animate-spin' : ''} />}
            >
              {savingAccounts ? 'Salvando...' : 'Salvar Contas e Limites'}
            </Button>
          </div>

          {accountSaveStatus && (
            <div
              className={`p-4 rounded-xl border text-xs animate-fade-in ${
                accountSaveStatus.success
                  ? 'bg-primary/10 border-primary/30 text-text-primary'
                  : 'bg-danger/10 border-danger/30 text-text-primary'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {accountSaveStatus.success ? (
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
                )}
                <span className="font-semibold block">{accountSaveStatus.message}</span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Cartão de Conexão Supabase */}
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-8 shadow-subtle space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Database size={22} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-text-primary">
                  Conexão Supabase
                </h2>
                {status.isConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    <CheckCircle2 size={12} />
                    Configurado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-danger bg-danger/10 px-2.5 py-0.5 rounded-full border border-danger/20">
                    <AlertCircle size={12} />
                    Não configurado
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Backend oficial Postgres & Auth integrado via @supabase/supabase-js.
              </p>
            </div>
          </div>
        </div>

        {/* Detalhes da Configuração */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-muted-surface border border-border-line rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              <Globe size={13} className="text-text-secondary" />
              <span>URL do Projeto</span>
            </div>
            <p className="font-mono text-xs text-text-primary break-all select-all">
              {status.url || 'Não definida (.env.local ausente)'}
            </p>
          </div>

          <div className="p-4 bg-muted-surface border border-border-line rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              <KeyRound size={13} className="text-text-secondary" />
              <span>Chave Pública (Publishable)</span>
            </div>
            <p className="text-xs text-text-primary flex items-center gap-1.5 font-medium">
              {status.hasPublishableKey ? (
                <>
                  <CheckCircle2 size={14} className="text-primary" />
                  Carregada com segurança via VITE_SUPABASE_PUBLISHABLE_KEY
                </>
              ) : (
                'Ausente'
              )}
            </p>
          </div>
        </div>

        {/* Conformidade e Segurança */}
        <div className="p-4 bg-primary/5 border border-primary/15 rounded-xl flex items-start gap-3 text-xs text-text-secondary">
          <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-text-primary">
              Políticas de Segurança e Proteção de Segredos
            </p>
            <p className="leading-relaxed">
              O frontend do Finora utiliza exclusivamente a chave pública publishable para comunicação autenticada com o Supabase. Nenhuma chave secreta (service_role) é armazenada ou exposta no código.
            </p>
          </div>
        </div>

        {/* Área de Teste de Conexão */}
        <div className="pt-4 border-t border-border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-text-primary block">
              Diagnóstico de Conectividade
            </span>
            <span className="text-[11px] text-text-secondary block mt-0.5">
              Executa uma verificação não-destrutiva de resposta da API do Supabase sem criar dados.
            </span>
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={!status.isConfigured || testing}
            onClick={handleTestConnection}
            icon={<RefreshCw size={14} className={testing ? 'animate-spin' : ''} />}
          >
            {testing ? 'Testando conexão...' : 'Testar Conexão'}
          </Button>
        </div>

        {/* Resultado do Teste */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs animate-fade-in ${
              testResult.success
                ? 'bg-primary/10 border-primary/30 text-text-primary'
                : 'bg-danger/10 border-danger/30 text-text-primary'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-semibold block">
                  {testResult.message}
                </span>
                {testResult.latencyMs !== undefined && (
                  <span className="text-[11px] text-text-secondary block font-mono">
                    Latência de resposta: {testResult.latencyMs}ms
                  </span>
                )}
                {testResult.error && (
                  <p className="text-[11px] text-danger font-mono mt-1">
                    Detalhe técnico: {testResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cartão de Migração de Dados Locais */}
      <div className="bg-surface border border-border-line rounded-xl p-6 lg:p-8 shadow-subtle space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
              <UploadCloud size={22} strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-text-primary">
                  Importar dados antigos
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-muted-surface px-2.5 py-0.5 rounded-full border border-border-line">
                  <HardDrive size={11} />
                  LocalStorage → Supabase
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Transfira transações, orçamentos e metas previamente salvos no navegador para sua conta na nuvem.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted-surface/70 border border-border-line rounded-xl text-xs text-text-secondary space-y-2 leading-relaxed">
          <p>
            • A importação é <strong>inteligente e não duplicará registros</strong> se você clicar mais de uma vez.
          </p>
          <p>
            • Todos os registros serão gravados exclusivamente com o seu identificador de usuário (<code className="text-text-primary font-mono">{user?.email || 'usuário atual'}</code>).
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            disabled={migrating || !user}
            onClick={handleMigrateData}
            icon={<UploadCloud size={14} className={migrating ? 'animate-spin' : ''} />}
          >
            {migrating ? 'Importando dados...' : 'Importar dados antigos'}
          </Button>
        </div>

        {/* Resultado da Migração */}
        {migrationResult && (
          <div
            className={`p-4 rounded-xl border text-xs animate-fade-in ${
              migrationResult.success
                ? 'bg-primary/10 border-primary/30 text-text-primary'
                : 'bg-danger/10 border-danger/30 text-text-primary'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {migrationResult.success ? (
                <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-danger shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-semibold block">
                  {migrationResult.message}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

