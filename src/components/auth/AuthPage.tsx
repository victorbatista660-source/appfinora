import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleMode = () => {
    setIsRegister(!isRegister)
    setErrorMessage(null)
    setSuccessMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validações locais amigáveis
    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Informe seu nome completo para continuar.')
        return
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve conter pelo menos 6 caracteres.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas digitadas não conferem. Verifique e tente novamente.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (isRegister) {
        const res = await signUp(name, email, password)
        if (res.error) {
          setErrorMessage(res.error)
        } else if (res.requiresEmailConfirmation) {
          setSuccessMessage(
            'Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada.'
          )
        }
      } else {
        const res = await signIn(email, password)
        if (res.error) {
          setErrorMessage(res.error)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/20">
      <div className="w-full max-w-md">
        {/* Header editorial da marca Finora */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white mb-4 shadow-subtle">
            <span className="font-display font-bold text-2xl tracking-tighter">F</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary tracking-tight">
            Finora
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            Gestão patrimonial refinada para você e sua família
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-surface border border-border-line rounded-xl shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-display font-semibold text-text-primary">
              {isRegister ? 'Criar nova conta' : 'Entrar na sua conta'}
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              {isRegister
                ? 'Preencha os dados abaixo para iniciar sua gestão compartilhada.'
                : 'Acesse suas finanças familiares com segurança e privacidade.'}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-start gap-2.5 animate-fade-in"
            >
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Nome Completo (Apenas no cadastro) */}
            {isRegister && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-text-primary mb-1.5"
                >
                  Nome completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <UserIcon size={16} />
                  </div>
                  <input
                    id="auth-name"
                    type="text"
                    required={isRegister}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Yan Carvalho"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border-line rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {/* Campo: E-mail */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-text-primary mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <Mail size={16} />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border-line rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[44px]"
                />
              </div>
            </div>

            {/* Campo: Senha */}
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-text-primary mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                  <Lock size={16} />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Mínimo de 6 caracteres' : 'Sua senha segura'}
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border-line rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Campo: Confirmar Senha (Apenas no cadastro) */}
            {isRegister && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-medium text-text-primary mb-1.5"
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                    <Lock size={16} />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required={isRegister}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-background border border-border-line rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors min-h-[44px]"
                  />
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover active:bg-[#0c2a20] text-white text-sm font-medium rounded-lg transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : (
                  <>
                    <span>{isRegister ? 'Criar conta no Finora' : 'Acessar Finora'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link para alternar modo */}
          <div className="mt-6 pt-5 border-t border-border-line text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-text-secondary hover:text-primary transition-colors font-medium focus:outline-none focus:underline"
            >
              {isRegister ? (
                <span>
                  Já possui uma conta? <strong className="text-primary font-semibold">Entrar</strong>
                </span>
              ) : (
                <span>
                  Ainda não tem conta?{' '}
                  <strong className="text-primary font-semibold">Criar cadastro</strong>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Rodapé de Segurança e Privacidade */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-text-secondary">
          <ShieldCheck size={14} className="text-accent" />
          <span>Autenticação e dados blindados via Supabase com Row Level Security (RLS)</span>
        </div>
      </div>
    </div>
  )
}

