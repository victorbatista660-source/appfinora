import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../services/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  profileName: string
  profileEmail: string
  userInitials: string
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error: string | null; requiresEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapAuthError(error: AuthError | Error | null): string {
  if (!error) return 'Ocorreu um erro inesperado.'
  const msg = error.message.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant')) {
    return 'E-mail ou senha incorretos. Verifique suas credenciais.'
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'Este e-mail já está cadastrado. Tente entrar ou recuperar seu acesso.'
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'A senha deve conter no mínimo 6 caracteres.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Este e-mail ainda não foi confirmado. Verifique o link enviado para sua caixa de entrada.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns minutos antes de tentar novamente.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Erro de conexão com o Supabase. Verifique sua internet ou tente novamente em instantes.'
  }
  return error.message || 'Falha na autenticação. Tente novamente.'
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'FN'
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // 1. Recupera sessão existente salva
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
      })
      .catch((err) => {
        console.error('Erro ao verificar sessão Supabase:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    // 2. Ouve alterações de autenticação em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'O cliente Supabase não está configurado no .env.local.' }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        return { error: mapAuthError(error) }
      }

      setSession(data.session)
      setUser(data.user)
      return { error: null }
    } catch (err: unknown) {
      return { error: mapAuthError(err as Error) }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    if (!supabase) {
      return { error: 'O cliente Supabase não está configurado no .env.local.' }
    }
    try {
      const trimmedName = name.trim()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      })

      if (error) {
        return { error: mapAuthError(error) }
      }

      // Se o Supabase exigir confirmação por email, data.session virá nulo
      const requiresEmailConfirmation = Boolean(data.user && !data.session)

      if (data.session) {
        setSession(data.session)
        setUser(data.user)
      }

      return { error: null, requiresEmailConfirmation }
    } catch (err: unknown) {
      return { error: mapAuthError(err as Error) }
    }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => null)
    }
    setSession(null)
    setUser(null)
  }

  const profileName = useMemo(() => {
    if (!user) return 'Yan Carvalho'
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Usuário'
    )
  }, [user])

  const profileEmail = useMemo(() => {
    return user?.email || ''
  }, [user])

  const userInitials = useMemo(() => {
    return getInitials(profileName)
  }, [profileName])

  const value = {
    user,
    session,
    loading,
    profileName,
    profileEmail,
    userInitials,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.')
  }
  return context
}

