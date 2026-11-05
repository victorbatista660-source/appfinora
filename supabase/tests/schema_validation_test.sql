-- ==============================================================================
-- FINORA - SUITE DE TESTES E VALIDAÇÃO DA MIGRAÇÃO (EXECUÇÃO SEGURA COM ROLLBACK)
-- Arquivo: supabase/tests/schema_validation_test.sql
-- Descrição:
--   Executa rigorosamente todos os 5 cenários de teste solicitados.
--   Utiliza um bloco de transação com ROLLBACK no final, garantindo que nenhum
--   dado fictício ou de teste seja gravado permanentemente no banco.
-- ==============================================================================

begin;

-- ==============================================================================
-- CENÁRIO DE PREPARAÇÃO: Criar 2 usuários simulados para teste
-- ==============================================================================
do $$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  cat_user_a uuid;
  cat_user_b uuid;
  cat_system uuid;
  v_goal_id uuid;
  v_mov1_id uuid;
  v_mov2_id uuid;
  v_current numeric(12,2);
  v_caught boolean;
begin
  raise notice '>>> INICIANDO BATERIA DE TESTES DO SCHEMA FINORA...';

  -- 0. Preparar Categorias para Teste
  insert into public.categories (user_id, name, type, is_system)
  values (user_a, 'Categoria Teste User A', 'expense', false)
  returning id into cat_user_a;

  insert into public.categories (user_id, name, type, is_system)
  values (user_b, 'Categoria Teste User B', 'expense', false)
  returning id into cat_user_b;

  select id into cat_system from public.categories where is_system = true limit 1;

  -- ============================================================================
  -- TESTE 1: Aporte, Retirada, Edição e Exclusão de Movimentações
  -- ============================================================================
  raise notice '--- Teste 1: Ciclo completo de movimentações de meta ---';

  -- 1.1 Criar Meta com saldo inicial de R$ 500,00
  insert into public.goals (user_id, title, target_amount, initial_amount)
  values (user_a, 'Meta Teste Reserva', 5000.00, 500.00)
  returning id, current_amount into v_goal_id, v_current;

  assert v_current = 500.00, format('Falha: Saldo inicial deveria ser 500.00, obtido %s', v_current);
  raise notice '✓ 1.1 Meta criada com current_amount = initial_amount (R$ 500,00)';

  -- 1.2 Inserir Aporte de R$ 300,00
  insert into public.goal_movements (user_id, goal_id, type, amount, notes)
  values (user_a, v_goal_id, 'deposit', 300.00, 'Aporte 1')
  returning id into v_mov1_id;

  select current_amount into v_current from public.goals where id = v_goal_id;
  assert v_current = 800.00, format('Falha após aporte: esperado 800.00, obtido %s', v_current);
  raise notice '✓ 1.2 Aporte de R$ 300,00 somado corretamente (Saldo: R$ 800,00)';

  -- 1.3 Inserir Retirada de R$ 200,00
  insert into public.goal_movements (user_id, goal_id, type, amount, notes)
  values (user_a, v_goal_id, 'withdrawal', 200.00, 'Retirada 1')
  returning id into v_mov2_id;

  select current_amount into v_current from public.goals where id = v_goal_id;
  assert v_current = 600.00, format('Falha após retirada: esperado 600.00, obtido %s', v_current);
  raise notice '✓ 1.3 Retirada de R$ 200,00 deduzida corretamente (Saldo: R$ 600,00)';

  -- 1.4 Testar Retirada Inválida (superior ao saldo disponível)
  v_caught := false;
  begin
    insert into public.goal_movements (user_id, goal_id, type, amount, notes)
    values (user_a, v_goal_id, 'withdrawal', 700.00, 'Retirada Excessiva');
  exception when others then
    v_caught := true;
    raise notice '✓ 1.4 Retirada superior ao saldo disponível (R$ 700,00 > R$ 600,00) bloqueada com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: Retirada excessiva deveria ter sido bloqueada';

  -- 1.5 Editar Movimentação (aumentar aporte de 300 para 400)
  update public.goal_movements
  set amount = 400.00
  where id = v_mov1_id;

  select current_amount into v_current from public.goals where id = v_goal_id;
  assert v_current = 700.00, format('Falha após editar aporte: esperado 700.00, obtido %s', v_current);
  raise notice '✓ 1.5 Edição de aporte de R$ 300 para R$ 400 recalculou saldo com sucesso (Saldo: R$ 700,00)';

  -- 1.6 Excluir Movimentação de Retirada (excluir R$ 200 de retirada)
  delete from public.goal_movements where id = v_mov2_id;

  select current_amount into v_current from public.goals where id = v_goal_id;
  assert v_current = 900.00, format('Falha após excluir retirada: esperado 900.00, obtido %s', v_current);
  raise notice '✓ 1.6 Exclusão de retirada de R$ 200 restaurou saldo com sucesso (Saldo: R$ 900,00)';

  -- ============================================================================
  -- TESTE 2: Alteração de Saldo Inicial (initial_amount)
  -- ============================================================================
  raise notice '--- Teste 2: Alteração segura de initial_amount ---';

  -- 2.1 Aumentar initial_amount de 500 para 1000
  update public.goals
  set initial_amount = 1000.00
  where id = v_goal_id;

  select current_amount into v_current from public.goals where id = v_goal_id;
  -- Saldo agora deve ser: 1000 (novo inicial) + 400 (aporte restante) = 1400.00
  assert v_current = 1400.00, format('Falha após alterar initial_amount: esperado 1400.00, obtido %s', v_current);
  raise notice '✓ 2.1 Alteração de initial_amount para R$ 1.000 recalculou current_amount para R$ 1.400,00';

  -- 2.2 Inserir retirada de R$ 1.200 (deixando saldo em R$ 200)
  insert into public.goal_movements (user_id, goal_id, type, amount)
  values (user_a, v_goal_id, 'withdrawal', 1200.00);

  -- 2.3 Tentar reduzir initial_amount para R$ 500 (o que deixaria saldo em 500 + 400 - 1200 = -300)
  v_caught := false;
  begin
    update public.goals
    set initial_amount = 500.00
    where id = v_goal_id;
  exception when others then
    v_caught := true;
    raise notice '✓ 2.3 Tentativa de reduzir initial_amount gerando saldo negativo foi barrada: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: Redução indevida de initial_amount deveria ser rejeitada';

  -- ============================================================================
  -- TESTE 3: Tentativa de Alterar current_amount Diretamente
  -- ============================================================================
  raise notice '--- Teste 3: Proteção contra alteração direta de current_amount ---';

  v_caught := false;
  begin
    update public.goals
    set current_amount = 99999.00
    where id = v_goal_id;
  exception when others then
    v_caught := true;
    raise notice '✓ 3.1 Tentativa externa de sobrescrever current_amount diretamente bloqueada: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: Alteração direta em current_amount deveria ter sido bloqueada';

  -- ============================================================================
  -- TESTE 4: Validação de Meses em Orçamentos (check_valid_budget_month)
  -- ============================================================================
  raise notice '--- Teste 4: Validação estrita de formato e intervalo de mês ---';

  -- 4.1 Mês válido (2026-10)
  insert into public.budgets (user_id, category, allocated, month)
  values (user_a, 'Alimentação', 1200.00, '2026-10');
  raise notice '✓ 4.1 Mês válido 2026-10 aceito com sucesso';

  -- 4.2 Mês com mês 00 (inválido)
  v_caught := false;
  begin
    insert into public.budgets (user_id, category, allocated, month)
    values (user_a, 'Lazer', 500.00, '2026-00');
  exception when others then
    v_caught := true;
    raise notice '✓ 4.2 Mês 2026-00 rejeitado com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: 2026-00 deveria ser rejeitado';

  -- 4.3 Mês com mês 13 (inválido)
  v_caught := false;
  begin
    insert into public.budgets (user_id, category, allocated, month)
    values (user_a, 'Lazer', 500.00, '2026-13');
  exception when others then
    v_caught := true;
    raise notice '✓ 4.3 Mês 2026-13 rejeitado com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: 2026-13 deveria ser rejeitado';

  -- 4.4 Formato malformado (2026-1 ou 2026/10)
  v_caught := false;
  begin
    insert into public.budgets (user_id, category, allocated, month)
    values (user_a, 'Lazer', 500.00, '2026-1');
  exception when others then
    v_caught := true;
    raise notice '✓ 4.4 Formato 2026-1 rejeitado com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: 2026-1 deveria ser rejeitado';

  -- ============================================================================
  -- TESTE 5: Tentativas de Associar Registros a Categorias de Outros Usuários
  -- ============================================================================
  raise notice '--- Teste 5: Isolamento de categorias entre usuários ---';

  -- 5.1 User A associando transação à categoria do sistema (DEVE PERMITIR)
  insert into public.transactions (user_id, description, amount, type, category, category_id, date, payment_method)
  values (user_a, 'Compra Mercado', 150.00, 'expense', 'Alimentação', cat_system, current_date, 'Pix');
  raise notice '✓ 5.1 User A associou transação à categoria do sistema com sucesso';

  -- 5.2 User A associando transação à própria categoria (DEVE PERMITIR)
  insert into public.transactions (user_id, description, amount, type, category, category_id, date, payment_method)
  values (user_a, 'Lanche', 45.00, 'expense', 'Categoria Teste User A', cat_user_a, current_date, 'Pix');
  raise notice '✓ 5.2 User A associou transação à sua própria categoria com sucesso';

  -- 5.3 User A tentando associar transação à categoria de User B (DEVE REJEITAR)
  v_caught := false;
  begin
    insert into public.transactions (user_id, description, amount, type, category, category_id, date, payment_method)
    values (user_a, 'Tentativa Fraude', 100.00, 'expense', 'Invasão', cat_user_b, current_date, 'Pix');
  exception when others then
    v_caught := true;
    raise notice '✓ 5.3 Tentativa de User A utilizar category_id de User B bloqueada com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: Associação a categoria de outro usuário deveria ter sido bloqueada';

  -- 5.4 User A tentando criar orçamento com categoria de User B (DEVE REJEITAR)
  v_caught := false;
  begin
    insert into public.budgets (user_id, category, category_id, allocated, month)
    values (user_a, 'Invasão', cat_user_b, 1000.00, '2026-11');
  exception when others then
    v_caught := true;
    raise notice '✓ 5.4 Tentativa de orçamento de User A com categoria de User B bloqueada com sucesso: %', sqlerrm;
  end;
  assert v_caught = true, 'Falha: Orçamento com categoria de terceiro deveria ter sido bloqueado';

  raise notice '>>> TODOS OS TESTES PASSARAM COM SUCESSO! REALIZANDO ROLLBACK LIMPO...';
end $$;

-- REVERSÃO TOTAL: Nenhum dado criado permanece gravado
rollback;

