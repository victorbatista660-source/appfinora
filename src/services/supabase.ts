import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Módulo de Conexão com Supabase
 *
 * Configuração do cliente oficial @supabase/supabase-js utilizando
 * as variáveis de ambiente públicas do Vite:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_PUBLISHABLE_KEY (ou VITE_SUPABASE_ANON_KEY)
 *
 * Nenhuma chave secreta (service_role) é exposta no cliente.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || null
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  null

export const isSupabaseConfigured: boolean = Boolean(supabaseUrl && supabaseKey)

/**
 * Cliente Supabase reutilizável para toda a aplicação.
 * Instanciado apenas se as variáveis estiverem devidamente definidas.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export interface SupabaseConfigStatus {
  isConfigured: boolean
  url: string | null
  hasPublishableKey: boolean
  message: string
}

export function getSupabaseStatus(): SupabaseConfigStatus {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl,
    hasPublishableKey: Boolean(supabaseKey),
    message: isSupabaseConfigured
      ? 'Supabase conectado via variáveis de ambiente oficiais.'
      : 'Supabase não conectado. As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY não foram encontradas.',
  }
}

export interface ConnectionTestResult {
  success: boolean
  latencyMs?: number
  message: string
  error?: string
}

/**
 * Realiza um teste de conexão real e não-destrutivo com a instância do Supabase.
 * Não cria, modifica nem exclui quaisquer registros de dados financeiros.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!supabase) {
    return {
      success: false,
      message: 'Cliente Supabase não inicializado. Verifique o arquivo .env.local.',
    }
  }

  const startTime = performance.now()

  try {
    // 1. Testa a conectividade com o serviço de autenticação do Supabase (ping read-only)
    const { error: authError } = await supabase.auth.getSession()

    const latencyMs = Math.round(performance.now() - startTime)

    if (authError) {
      return {
        success: false,
        latencyMs,
        message: 'Falha na resposta do servidor Supabase.',
        error: authError.message,
      }
    }

    return {
      success: true,
      latencyMs,
      message: `Conexão com o Supabase estabelecida com sucesso (${latencyMs}ms).`,
    }
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime)
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      latencyMs,
      message: 'Erro ao conectar ao endpoint do Supabase.',
      error: errorMsg,
    }
  }
}
