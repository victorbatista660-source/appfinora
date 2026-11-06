import { supabase } from './supabase'
import { Transaction, Budget, Goal, GoalMovement, Category, AccountSettings } from '../types'

function ensureUuid(id?: string): string {
  const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  if (isUuid) return id
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
}

export const dbService = {
  // ==========================================
  // 1. CATEGORIAS
  // ==========================================
  async getCategories(): Promise<Category[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, color')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar categorias do Supabase:', error)
      throw error
    }

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color || undefined,
    }))
  },

  // ==========================================
  // 2. TRANSAÇÕES
  // ==========================================
  async getTransactions(): Promise<Transaction[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar transações do Supabase:', error)
      throw error
    }

    return (data || []).map((row) => ({
      id: row.id,
      description: row.description,
      establishment: row.establishment || undefined,
      amount: Number(row.amount),
      type: row.type,
      category: row.category,
      date: row.date,
      paymentMethod: row.payment_method,
      origin: row.origin || 'manual',
      notes: row.notes || undefined,
    }))
  },

  async createTransaction(
    tx: Omit<Transaction, 'id'> & { id?: string },
    userId: string
  ): Promise<Transaction> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const id = ensureUuid(tx.id)
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        id,
        user_id: userId,
        description: tx.description,
        establishment: tx.establishment || null,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        payment_method: tx.paymentMethod,
        origin: tx.origin || 'manual',
        notes: tx.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir transação no Supabase:', error)
      throw error
    }

    return {
      id: data.id,
      description: data.description,
      establishment: data.establishment || undefined,
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      paymentMethod: data.payment_method,
      origin: data.origin,
      notes: data.notes || undefined,
    }
  },

  async updateTransaction(
    id: string,
    tx: Omit<Transaction, 'id'>,
    userId: string
  ): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('transactions')
      .update({
        description: tx.description,
        establishment: tx.establishment || null,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        date: tx.date,
        payment_method: tx.paymentMethod,
        origin: tx.origin || 'manual',
        notes: tx.notes || null,
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao atualizar transação no Supabase:', error)
      throw error
    }
  },

  async deleteTransaction(id: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao excluir transação no Supabase:', error)
      throw error
    }
  },

  // ==========================================
  // 3. ORÇAMENTOS
  // ==========================================
  async getBudgets(): Promise<Budget[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('month', { ascending: false })

    if (error) {
      console.error('Erro ao buscar orçamentos do Supabase:', error)
      throw error
    }

    return (data || []).map((row) => ({
      id: row.id,
      category: row.category,
      allocated: Number(row.allocated),
      month: row.month,
      notes: row.notes || undefined,
      createdAt: row.created_at,
    }))
  },

  async createBudget(
    budget: Omit<Budget, 'id'> & { id?: string },
    userId: string
  ): Promise<Budget> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const id = ensureUuid(budget.id)
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        id,
        user_id: userId,
        category: budget.category,
        allocated: budget.allocated,
        month: budget.month,
        notes: budget.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir orçamento no Supabase:', error)
      throw error
    }

    return {
      id: data.id,
      category: data.category,
      allocated: Number(data.allocated),
      month: data.month,
      notes: data.notes || undefined,
      createdAt: data.created_at,
    }
  },

  async updateBudget(
    id: string,
    budget: Omit<Budget, 'id'>,
    userId: string
  ): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('budgets')
      .update({
        category: budget.category,
        allocated: budget.allocated,
        month: budget.month,
        notes: budget.notes || null,
      })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao atualizar orçamento no Supabase:', error)
      throw error
    }
  },

  async deleteBudget(id: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao excluir orçamento no Supabase:', error)
      throw error
    }
  },

  // ==========================================
  // 4. METAS E MOVIMENTAÇÕES
  // ==========================================
  async getGoals(): Promise<Goal[]> {
    if (!supabase) return []
    const { data, error } = await supabase
      .from('goals')
      .select(`
        id,
        title,
        target_amount,
        initial_amount,
        current_amount,
        deadline,
        category,
        notes,
        created_at,
        goal_movements (
          id,
          goal_id,
          type,
          amount,
          date,
          notes
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar metas do Supabase:', error)
      throw error
    }

    return (data || []).map((row: any) => {
      const rawMovements = Array.isArray(row.goal_movements)
        ? row.goal_movements
        : []

      const movements: GoalMovement[] = rawMovements
        .map((m: any) => ({
          id: m.id,
          goalId: m.goal_id,
          type: m.type as 'deposit' | 'withdrawal',
          amount: Number(m.amount),
          date: m.date,
          notes: m.notes || undefined,
        }))
        .sort((a: GoalMovement, b: GoalMovement) => b.date.localeCompare(a.date))

      return {
        id: row.id,
        title: row.title,
        targetAmount: Number(row.target_amount),
        initialAmount: Number(row.initial_amount || 0),
        currentAmount: Number(row.current_amount || 0),
        deadline: row.deadline || undefined,
        category: row.category || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        movements,
      }
    })
  },

  async createGoal(
    goalData: Omit<Goal, 'id' | 'createdAt' | 'movements'> & {
      id?: string
      initialMovements?: Omit<GoalMovement, 'id' | 'goalId'>[]
    },
    userId: string
  ): Promise<Goal> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const id = ensureUuid(goalData.id)
    const initialAmount = goalData.initialAmount ?? goalData.currentAmount ?? 0

    // current_amount não deve ser passado no insert porque é protegido
    const { data, error } = await supabase
      .from('goals')
      .insert({
        id,
        user_id: userId,
        title: goalData.title,
        target_amount: goalData.targetAmount,
        initial_amount: initialAmount,
        deadline: goalData.deadline || null,
        category: goalData.category || null,
        notes: goalData.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar meta no Supabase:', error)
      throw error
    }

    const createdMovements: GoalMovement[] = []

    // Se houver movimentações adicionais além do initial_amount
    if (goalData.initialMovements && goalData.initialMovements.length > 0) {
      for (const mov of goalData.initialMovements) {
        const movId = ensureUuid()
        const { data: movData, error: movErr } = await supabase
          .from('goal_movements')
          .insert({
            id: movId,
            goal_id: id,
            user_id: userId,
            type: mov.type,
            amount: mov.amount,
            date: mov.date,
            notes: mov.notes || null,
          })
          .select()
          .single()

        if (!movErr && movData) {
          createdMovements.push({
            id: movData.id,
            goalId: movData.goal_id,
            type: movData.type,
            amount: Number(movData.amount),
            date: movData.date,
            notes: movData.notes || undefined,
          })
        }
      }
    }

    // Busca meta com saldo recalculado pelo gatilho
    const { data: refreshedGoal } = await supabase
      .from('goals')
      .select('current_amount')
      .eq('id', id)
      .single()

    return {
      id: data.id,
      title: data.title,
      targetAmount: Number(data.target_amount),
      initialAmount: Number(data.initial_amount || 0),
      currentAmount: Number(refreshedGoal?.current_amount ?? data.initial_amount ?? 0),
      deadline: data.deadline || undefined,
      category: data.category || undefined,
      notes: data.notes || undefined,
      createdAt: data.created_at,
      movements: createdMovements,
    }
  },

  async updateGoal(
    id: string,
    goalData: Omit<Goal, 'id' | 'createdAt' | 'movements'>,
    userId: string
  ): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const updatePayload: Record<string, any> = {
      title: goalData.title,
      target_amount: goalData.targetAmount,
      deadline: goalData.deadline || null,
      category: goalData.category || null,
      notes: goalData.notes || null,
    }

    if (goalData.initialAmount !== undefined) {
      updatePayload.initial_amount = goalData.initialAmount
    }

    const { error } = await supabase
      .from('goals')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao atualizar meta no Supabase:', error)
      throw error
    }
  },

  async deleteGoal(id: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao excluir meta no Supabase:', error)
      throw error
    }
  },

  async addGoalMovement(
    goalId: string,
    type: 'deposit' | 'withdrawal',
    amount: number,
    date: string,
    userId: string,
    notes?: string
  ): Promise<GoalMovement> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const id = ensureUuid()
    const { data, error } = await supabase
      .from('goal_movements')
      .insert({
        id,
        goal_id: goalId,
        user_id: userId,
        type,
        amount,
        date,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar movimentação no Supabase:', error)
      throw error
    }

    return {
      id: data.id,
      goalId: data.goal_id,
      type: data.type,
      amount: Number(data.amount),
      date: data.date,
      notes: data.notes || undefined,
    }
  },

  async deleteGoalMovement(movementId: string, userId: string): Promise<void> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { error } = await supabase
      .from('goal_movements')
      .delete()
      .eq('id', movementId)
      .eq('user_id', userId)

    if (error) {
      console.error('Erro ao excluir movimentação no Supabase:', error)
      throw error
    }
  },

  // ==========================================
  // 5. CONFIGURAÇÕES DE CONTAS E LIMITES
  // ==========================================
  async getAccountSettings(userId: string): Promise<AccountSettings> {
    const defaultSettings: AccountSettings = {
      creditCardLimit: 0,
      initialBalanceDebit: 0,
      initialBalanceMeal: 0,
    }

    if (!supabase) return defaultSettings

    const { data, error } = await supabase
      .from('account_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Erro ao buscar configurações de conta do Supabase:', error)
      return defaultSettings
    }

    if (!data) {
      return defaultSettings
    }

    return {
      id: data.id,
      userId: data.user_id,
      creditCardLimit: Number(data.credit_card_limit || 0),
      initialBalanceDebit: Number(data.initial_balance_debit || 0),
      initialBalanceMeal: Number(data.initial_balance_meal || 0),
    }
  },

  async saveAccountSettings(
    settings: {
      creditCardLimit: number
      initialBalanceDebit: number
      initialBalanceMeal: number
    },
    userId: string
  ): Promise<AccountSettings> {
    if (!supabase) throw new Error('Cliente Supabase não configurado.')

    const { data, error } = await supabase
      .from('account_settings')
      .upsert(
        {
          user_id: userId,
          credit_card_limit: settings.creditCardLimit,
          initial_balance_debit: settings.initialBalanceDebit,
          initial_balance_meal: settings.initialBalanceMeal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar configurações de conta no Supabase:', error)
      throw error
    }

    return {
      id: data.id,
      userId: data.user_id,
      creditCardLimit: Number(data.credit_card_limit || 0),
      initialBalanceDebit: Number(data.initial_balance_debit || 0),
      initialBalanceMeal: Number(data.initial_balance_meal || 0),
    }
  },

  // ==========================================
  // 6. MIGRAÇÃO ÚNICA LOCALSTORAGE -> SUPABASE
  // ==========================================
  hasLocalStorageData(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false
      const rawTx = localStorage.getItem('finora_transactions_v2')
      const rawBg = localStorage.getItem('finora_budgets_v2')
      const rawGl = localStorage.getItem('finora_goals_v2')

      const txs = rawTx ? JSON.parse(rawTx) : []
      const bgs = rawBg ? JSON.parse(rawBg) : []
      const gls = rawGl ? JSON.parse(rawGl) : []

      return (
        (Array.isArray(txs) && txs.length > 0) ||
        (Array.isArray(bgs) && bgs.length > 0) ||
        (Array.isArray(gls) && gls.length > 0)
      )
    } catch {
      return false
    }
  },

  async migrateLocalStorageToSupabase(userId: string): Promise<{
    success: boolean
    message: string
    importedTransactions: number
    importedBudgets: number
    importedGoals: number
  }> {
    if (!supabase) {
      throw new Error('Supabase não conectado. Configure o .env.local.')
    }

    const migrationFlagKey = `finora_migrated_user_${userId}`
    const rawTx = localStorage.getItem('finora_transactions_v2')
    const rawBg = localStorage.getItem('finora_budgets_v2')
    const rawGl = localStorage.getItem('finora_goals_v2')

    const localTransactions: Transaction[] = rawTx ? JSON.parse(rawTx) : []
    const localBudgets: Budget[] = rawBg ? JSON.parse(rawBg) : []
    const localGoals: Goal[] = rawGl ? JSON.parse(rawGl) : []

    if (
      localTransactions.length === 0 &&
      localBudgets.length === 0 &&
      localGoals.length === 0
    ) {
      return {
        success: true,
        message: 'Nenhum dado local encontrado no navegador para importar.',
        importedTransactions: 0,
        importedBudgets: 0,
        importedGoals: 0,
      }
    }

    // Busca registros existentes no Supabase para evitar qualquer duplicação
    const [existingTxRes, existingBgRes, existingGlRes] = await Promise.all([
      supabase.from('transactions').select('description, amount, date').eq('user_id', userId),
      supabase.from('budgets').select('category, month').eq('user_id', userId),
      supabase.from('goals').select('id, title').eq('user_id', userId),
    ])

    const existingTx = existingTxRes.data || []
    const existingBg = existingBgRes.data || []
    const existingGl = existingGlRes.data || []

    let importedTransactions = 0
    let importedBudgets = 0
    let importedGoals = 0

    // 1. Migração de Transações
    for (const tx of localTransactions) {
      const exists = existingTx.some(
        (e) =>
          e.description === tx.description &&
          Number(e.amount) === Number(tx.amount) &&
          e.date === tx.date
      )
      if (!exists) {
        await supabase.from('transactions').insert({
          id: ensureUuid(tx.id),
          user_id: userId,
          description: tx.description,
          establishment: tx.establishment || null,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          date: tx.date,
          payment_method: tx.paymentMethod,
          origin: tx.origin || 'import',
          notes: tx.notes || null,
        })
        importedTransactions++
      }
    }

    // 2. Migração de Orçamentos
    for (const bg of localBudgets) {
      const exists = existingBg.some(
        (e) => e.category === bg.category && e.month === bg.month
      )
      if (!exists) {
        await supabase.from('budgets').insert({
          id: ensureUuid(bg.id),
          user_id: userId,
          category: bg.category,
          allocated: bg.allocated,
          month: bg.month,
          notes: bg.notes || null,
        })
        importedBudgets++
      }
    }

    // 3. Migração de Metas e Movimentações
    for (const gl of localGoals) {
      const exists = existingGl.some((e) => e.title.trim().toLowerCase() === gl.title.trim().toLowerCase())
      if (!exists) {
        const goalUuid = ensureUuid(gl.id)
        const initialAmount = gl.initialAmount ?? gl.currentAmount ?? 0

        await supabase.from('goals').insert({
          id: goalUuid,
          user_id: userId,
          title: gl.title,
          target_amount: gl.targetAmount,
          initial_amount: initialAmount,
          deadline: gl.deadline || null,
          category: gl.category || null,
          notes: gl.notes || null,
        })

        // Migra movimentações da meta
        if (gl.movements && gl.movements.length > 0) {
          for (const mov of gl.movements) {
            await supabase.from('goal_movements').insert({
              id: ensureUuid(mov.id),
              goal_id: goalUuid,
              user_id: userId,
              type: mov.type,
              amount: mov.amount,
              date: mov.date,
              notes: mov.notes || null,
            })
          }
        }
        importedGoals++
      }
    }

    // Marca como migrado no localStorage para este usuário
    try {
      localStorage.setItem(migrationFlagKey, new Date().toISOString())
    } catch {
      // Ignorar falha de escrita de flag
    }

    return {
      success: true,
      message: `Importação concluída com sucesso: ${importedTransactions} transações, ${importedBudgets} orçamentos e ${importedGoals} metas inseridos.`,
      importedTransactions,
      importedBudgets,
      importedGoals,
    }
  },
}

