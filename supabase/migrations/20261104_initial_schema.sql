-- ==============================================================================
-- FINORA - ESTRUTURA DO BANCO DE DADOS NO SUPABASE (REVISÃO DE SEGURANÇA DEFINITIVA)
-- Arquivo: supabase/migrations/20261104_initial_schema.sql
-- Descrição:
--   1. Categorias (sistema vs usuário, unicidade case-insensitive, isolamento multi-tenant).
--   2. Transações e Orçamentos (validação estrita de mês YYYY-MM [01-12]).
--   3. Metas e Movimentações:
--      - Proteção definitiva de current_amount:
--        * Revogação de permissões de escrita na coluna (REVOKE INSERT/UPDATE na coluna).
--        * Recálculo incondicional via gatilho (initial_amount + aportes - retiradas),
--          sem depender de pg_trigger_depth().
--        * Row-level lock (FOR UPDATE) eliminando race conditions concorrentes.
--        * Impossibilidade física e lógica de saldo negativo.
--        * View auditável goals_with_balance para conferência em tempo real.
--   4. Governança de Funções e Permissões:
--      - SET search_path = '' estrito com nomes de tabelas totalmente qualificados (public.*).
--      - Palavras-chave e construtos de sintaxe ANSI padrão (coalesce, sum, now).
--      - Atribuição explícita de proprietário (postgres).
--      - Revogação cirúrgica de EXECUTE das funções de gatilho de PUBLIC, anon e authenticated,
--        eliminando exposição indevida como endpoints RPC no PostgREST.
--   5. RLS completo e estrito em todas as tabelas.
-- ==============================================================================

-- 0. Habilitação de extensão para geração de UUIDs v4 criptográficos
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. TABELA: categories
-- Categorias de receitas e despesas
-- ==============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'expense' check (type in ('income', 'expense', 'both')),
  color text,
  icon text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),

  -- Categorias personalizadas SEMPRE devem pertencer a um usuário.
  -- Categorias do sistema NÃO possuem user_id e são compartilhadas (somente leitura).
  constraint check_category_ownership_model check (
    (is_system = true and user_id is null) or
    (is_system = false and user_id is not null)
  ),

  -- Não permitir nomes vazios ou puramente em branco
  constraint check_category_name_not_empty check (trim(name) <> '')
);

comment on table public.categories is 'Categorias de classificação financeira (sistema e personalizadas por usuário)';

-- Índices de unicidade insensíveis a maiúsculas/minúsculas
create unique index if not exists idx_unique_system_category_name
  on public.categories (lower(trim(name)))
  where is_system = true;

create unique index if not exists idx_unique_user_category_name
  on public.categories (user_id, lower(trim(name)))
  where is_system = false;

-- ==============================================================================
-- 2. TABELA: transactions
-- Lançamentos financeiros de receitas e despesas
-- ==============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null check (trim(description) <> ''),
  establishment text,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null,
  category_id uuid references public.categories(id) on delete set null,
  date date not null,
  payment_method text not null check (
    payment_method in (
      'Cartão de Crédito',
      'Pix',
      'Cartão de Débito',
      'Transferência',
      'Boleto',
      'Dinheiro',
      'Outros'
    )
  ),
  origin text not null default 'manual' check (origin in ('manual', 'whatsapp', 'import')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.transactions is 'Registro de transações contábeis de receitas e despesas';

-- ==============================================================================
-- 3. TABELA: budgets
-- Tetos orçamentários mensais definidos por categoria
-- ==============================================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  category_id uuid references public.categories(id) on delete set null,
  allocated numeric(12,2) not null check (allocated > 0),
  month text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Validação estrita do mês: formato YYYY-MM e mês entre 01 e 12
  constraint check_valid_budget_month check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),

  -- Impede orçamentos duplicados para a mesma categoria no mesmo mês pelo mesmo usuário
  constraint unique_user_category_month unique (user_id, category, month)
);

comment on table public.budgets is 'Tetos orçamentários mensais por categoria de gasto';

-- ==============================================================================
-- 4. TABELA: goals
-- Metas financeiras e planejamento patrimonial
-- ==============================================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null check (trim(title) <> ''),
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0.00 check (current_amount >= 0),
  initial_amount numeric(12,2) not null default 0.00 check (initial_amount >= 0),
  deadline date,
  category text,
  category_id uuid references public.categories(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.goals is 'Metas financeiras com saldo inicial, saldo acumulado e data-alvo';

-- ==============================================================================
-- 5. TABELA: goal_movements
-- Histórico auditável de movimentações (aportes e retiradas) das metas
-- ==============================================================================
create table if not exists public.goal_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdrawal')),
  amount numeric(12,2) not null check (amount > 0),
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.goal_movements is 'Histórico auditável de aportes e resgates vinculado à meta';

-- ==============================================================================
-- 6. VIEW AUDITÁVEL: goals_with_balance
-- Espelho em tempo real que calcula matematicamente o saldo a partir do histórico
-- ==============================================================================
create or replace view public.goals_with_balance as
select
  g.id,
  g.user_id,
  g.title,
  g.target_amount,
  g.initial_amount,
  g.deadline,
  g.category,
  g.category_id,
  g.notes,
  g.created_at,
  g.updated_at,
  (
    g.initial_amount + coalesce(
      (
        select sum(case when m.type = 'deposit' then m.amount else -m.amount end)
        from public.goal_movements m
        where m.goal_id = g.id and m.user_id = g.user_id
      ),
      0.00
    )
  ) as computed_current_amount,
  g.current_amount as stored_current_amount
from public.goals g;

comment on view public.goals_with_balance is 'Visão de auditoria com saldo calculado dinamicamente';

-- ==============================================================================
-- 7. ÍNDICES DE PERFORMANCE
-- ==============================================================================
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_user_category on public.transactions(user_id, category);
create index if not exists idx_transactions_category_id on public.transactions(category_id);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month);
create index if not exists idx_goals_user on public.goals(user_id);
create index if not exists idx_goal_movements_goal_id on public.goal_movements(goal_id);
create index if not exists idx_goal_movements_user_id on public.goal_movements(user_id);

-- ==============================================================================
-- 8. FUNÇÕES E GATILHOS DE INTEGRIDADE, SEGURANÇA E CONCORRÊNCIA
--    Todas as funções com SET search_path = '' e referências explícitas a public.*
-- ==============================================================================

-- 8.1 Atualização de timestamp seguro (timestamptz nativo com now())
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_transactions_updated_at on public.transactions;
create trigger trigger_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_budgets_updated_at on public.budgets;
create trigger trigger_budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

drop trigger if exists trigger_goals_updated_at on public.goals;
create trigger trigger_goals_updated_at
  before update on public.goals
  for each row execute function public.handle_updated_at();

-- 8.2 Validação estrita de propriedade da categoria
-- Impede que um usuário vincule transações, orçamentos ou metas a categorias de outro usuário
create or replace function public.validate_category_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category_id is not null then
    if not exists (
      select 1 from public.categories c
      where c.id = new.category_id
        and (c.user_id = new.user_id or c.is_system = true)
    ) then
      raise exception 'Violação de integridade: a categoria especificada (%) não pertence ao usuário nem é uma categoria do sistema.', new.category_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_validate_transaction_category on public.transactions;
create trigger trigger_validate_transaction_category
  before insert or update of category_id, user_id on public.transactions
  for each row execute function public.validate_category_ownership();

drop trigger if exists trigger_validate_budget_category on public.budgets;
create trigger trigger_validate_budget_category
  before insert or update of category_id, user_id on public.budgets
  for each row execute function public.validate_category_ownership();

drop trigger if exists trigger_validate_goal_category on public.goals;
create trigger trigger_validate_goal_category
  before insert or update of category_id, user_id on public.goals
  for each row execute function public.validate_category_ownership();

-- 8.3 Proteção Definitiva do Campo current_amount
-- REQUISITO 1:
-- - Na criação (INSERT), current_amount inicia estritamente com initial_amount.
-- - Em qualquer atualização (UPDATE), o gatilho recalcula incondicionalmente:
--   current_amount = initial_amount + aportes - retiradas.
-- - Qualquer valor enviado externamente para current_amount é descartado pelo cálculo do banco.
-- - Sem dependência frágil de pg_trigger_depth().
-- - Impede que uma redução no initial_amount deixe o saldo acumulado negativo.
create or replace function public.protect_goal_current_amount()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_movements_net numeric(12,2);
  v_expected_current numeric(12,2);
begin
  -- 1. Na inserção de uma nova meta
  if tg_op = 'INSERT' then
    new.current_amount := coalesce(new.initial_amount, 0.00);
    return new;
  end if;

  -- 2. Na atualização da meta
  if tg_op = 'UPDATE' then
    -- Calcula o saldo exato a partir das movimentações reais auditadas
    select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0.00)
    into v_movements_net
    from public.goal_movements
    where goal_id = new.id and user_id = new.user_id;

    v_expected_current := new.initial_amount + v_movements_net;

    -- Validação: alteração no valor inicial não pode deixar saldo negativo
    if v_expected_current < 0 then
      raise exception 'Alteração rejeitada: alterar o valor inicial para R$ % deixaria o saldo acumulado da meta negativo (R$ %). O valor inicial mínimo permitido com base nas retiradas existentes é de R$ %.',
        new.initial_amount,
        v_expected_current,
        (-v_movements_net);
    end if;

    -- Força incondicionalmente o saldo acumulado a corresponder à verdade contábil
    new.current_amount := v_expected_current;
  end if;

  return new;
end;
$$;

drop trigger if exists trigger_protect_goal_current_amount on public.goals;
create trigger trigger_protect_goal_current_amount
  before insert or update on public.goals
  for each row execute function public.protect_goal_current_amount();

-- 8.4 Sincronização Atômica de Saldo de Metas com Bloqueio Concorrente (FOR UPDATE)
-- REQUISITOS 1, 3 e 4:
-- - Bloqueia a linha da meta com FOR UPDATE garantindo serialização de movimentações concorrentes.
-- - Garante a fórmula: current_amount = initial_amount + aportes - retiradas.
-- - Impede qualquer retirada superior ao saldo disponível (evita saldo negativo).
-- - Recalcula confiavelmente em INSERT, UPDATE e DELETE de movimentações.
create or replace function public.sync_goal_balance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_goal_id uuid;
  target_user_id uuid;
  v_initial_amount numeric(12,2);
  v_movements_net numeric(12,2);
  v_new_current numeric(12,2);
begin
  -- Identifica a meta e usuário afetados
  if tg_op = 'DELETE' then
    target_goal_id := old.goal_id;
    target_user_id := old.user_id;
  else
    target_goal_id := new.goal_id;
    target_user_id := new.user_id;
    -- Impede a transferência de uma movimentação para outra meta existente
    if tg_op = 'UPDATE' and old.goal_id <> new.goal_id then
      raise exception 'Operação não permitida: não é possível transferir uma movimentação entre metas distintas.';
    end if;
  end if;

  -- 1. Bloqueia a linha da meta correspondente para operações concorrentes (Row-Level Lock)
  --    Filtra estritamente por id E user_id para garantir que a função nunca acesse registros de outros usuários.
  select initial_amount
  into v_initial_amount
  from public.goals
  where id = target_goal_id and user_id = target_user_id
  for update;

  -- Se a meta não existir (ex: exclusão em cascata da própria meta pai), encerra sem erro
  if not found then
    if tg_op = 'DELETE' then
      return old;
    else
      raise exception 'Operação rejeitada: a meta referenciada não existe ou não pertence ao usuário autenticado.';
    end if;
  end if;

  -- 2. Recalcula o saldo líquido acumulado de todas as movimentações confirmadas
  select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0.00)
  into v_movements_net
  from public.goal_movements
  where goal_id = target_goal_id and user_id = target_user_id;

  v_new_current := v_initial_amount + v_movements_net;

  -- 3. Validação de integridade financeira: impede saldo negativo
  if v_new_current < 0 then
    raise exception 'Saldo insuficiente na meta: a operação resultaria em saldo negativo (R$ %). Valor disponível para retirada: R$ %',
      v_new_current,
      (v_new_current + (case when tg_op = 'DELETE' then -old.amount else new.amount end));
  end if;

  -- 4. Atualiza o saldo acumulado da meta de forma atômica
  update public.goals
  set current_amount = v_new_current,
      updated_at = now()
  where id = target_goal_id and user_id = target_user_id;

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists trigger_sync_goal_balance on public.goal_movements;
create trigger trigger_sync_goal_balance
  after insert or update or delete on public.goal_movements
  for each row execute function public.sync_goal_balance();

-- ==============================================================================
-- 9. PROPRIETÁRIO DAS FUNÇÕES (POSTGRES)
-- ==============================================================================
alter function public.handle_updated_at() owner to postgres;
alter function public.validate_category_ownership() owner to postgres;
alter function public.protect_goal_current_amount() owner to postgres;
alter function public.sync_goal_balance() owner to postgres;

-- ==============================================================================
-- 10. REVISÃO COMPLETA DE PERMISSÕES E BLINDAGEM DE COLUNA
-- ==============================================================================

-- 10.1 Concessões normais para usuários autenticados nas tabelas
grant select, insert, update, delete on table public.categories to authenticated;
grant select, insert, update, delete on table public.transactions to authenticated;
grant select, insert, update, delete on table public.budgets to authenticated;
grant select, insert, update, delete on table public.goals to authenticated;
grant select, insert, update, delete on table public.goal_movements to authenticated;
grant select on table public.goals_with_balance to authenticated;

-- 10.2 Leitura pública/anônima permitida apenas para categorias do sistema
grant select on table public.categories to anon;

-- 10.3 BLINDAGEM DE COLUNA: Revoga permissão de escrita em current_amount
-- Nenhum usuário comum (authenticated ou anon) possui permissão para especificar
-- o campo current_amount em instruções INSERT ou UPDATE na tabela goals.
revoke insert (current_amount), update (current_amount) on table public.goals from public, anon, authenticated;

-- 10.4 BLINDAGEM DE RPC: Revoga EXECUTE direto nas funções de gatilho
-- Previne exposição acidental no PostgREST (/rpc/sync_goal_balance).
-- Os gatilhos continuam funcionando normalmente na camada de dados via engine do PostgreSQL.
revoke execute on function public.handle_updated_at() from public, anon, authenticated;
revoke execute on function public.validate_category_ownership() from public, anon, authenticated;
revoke execute on function public.protect_goal_current_amount() from public, anon, authenticated;
revoke execute on function public.sync_goal_balance() from public, anon, authenticated;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) - ATIVAÇÃO COMPULSÓRIA
-- ==============================================================================
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.goal_movements enable row level security;

-- ==============================================================================
-- 12. POLÍTICAS RLS ESTREITAS (SELECT, INSERT, UPDATE, DELETE)
-- ==============================================================================

-- 12.1 Políticas para categories
drop policy if exists "categories_select_policy" on public.categories;
create policy "categories_select_policy" on public.categories
  for select using (auth.uid() = user_id or is_system = true);

drop policy if exists "categories_insert_policy" on public.categories;
create policy "categories_insert_policy" on public.categories
  for insert with check (
    auth.uid() = user_id and
    is_system = false
  );

drop policy if exists "categories_update_policy" on public.categories;
create policy "categories_update_policy" on public.categories
  for update using (
    auth.uid() = user_id and
    is_system = false
  )
  with check (
    auth.uid() = user_id and
    is_system = false
  );

drop policy if exists "categories_delete_policy" on public.categories;
create policy "categories_delete_policy" on public.categories
  for delete using (
    auth.uid() = user_id and
    is_system = false
  );

-- 12.2 Políticas para transactions
drop policy if exists "transactions_select_policy" on public.transactions;
create policy "transactions_select_policy" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_insert_policy" on public.transactions;
create policy "transactions_insert_policy" on public.transactions
  for insert with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "transactions_update_policy" on public.transactions;
create policy "transactions_update_policy" on public.transactions
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "transactions_delete_policy" on public.transactions;
create policy "transactions_delete_policy" on public.transactions
  for delete using (auth.uid() = user_id);

-- 12.3 Políticas para budgets
drop policy if exists "budgets_select_policy" on public.budgets;
create policy "budgets_select_policy" on public.budgets
  for select using (auth.uid() = user_id);

drop policy if exists "budgets_insert_policy" on public.budgets;
create policy "budgets_insert_policy" on public.budgets
  for insert with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "budgets_update_policy" on public.budgets;
create policy "budgets_update_policy" on public.budgets
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "budgets_delete_policy" on public.budgets;
create policy "budgets_delete_policy" on public.budgets
  for delete using (auth.uid() = user_id);

-- 12.4 Políticas para goals
drop policy if exists "goals_select_policy" on public.goals;
create policy "goals_select_policy" on public.goals
  for select using (auth.uid() = user_id);

drop policy if exists "goals_insert_policy" on public.goals;
create policy "goals_insert_policy" on public.goals
  for insert with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "goals_update_policy" on public.goals;
create policy "goals_update_policy" on public.goals
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    (
      category_id is null or
      exists (
        select 1 from public.categories c
        where c.id = category_id and (c.user_id = auth.uid() or c.is_system = true)
      )
    )
  );

drop policy if exists "goals_delete_policy" on public.goals;
create policy "goals_delete_policy" on public.goals
  for delete using (auth.uid() = user_id);

-- 12.5 Políticas para goal_movements
-- Valida que a movimentação e a meta referenciada pertençam ao mesmo usuário autenticado
drop policy if exists "goal_movements_select_policy" on public.goal_movements;
create policy "goal_movements_select_policy" on public.goal_movements
  for select using (auth.uid() = user_id);

drop policy if exists "goal_movements_insert_policy" on public.goal_movements;
create policy "goal_movements_insert_policy" on public.goal_movements
  for insert with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "goal_movements_update_policy" on public.goal_movements;
create policy "goal_movements_update_policy" on public.goal_movements
  for update using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.goals g
      where g.id = goal_id and g.user_id = auth.uid()
    )
  );

drop policy if exists "goal_movements_delete_policy" on public.goal_movements;
create policy "goal_movements_delete_policy" on public.goal_movements
  for delete using (auth.uid() = user_id);

-- ==============================================================================
-- 13. CARGA INICIAL DE CATEGORIAS DO SISTEMA (TAXONOMIA PADRÃO)
-- Inseridas com is_system = true e user_id = null (idempotente)
-- ==============================================================================
insert into public.categories (name, type, color, icon, is_system)
values
  ('Alimentação', 'expense', '#174D3A', 'utensils', true),
  ('Transporte', 'expense', '#2F795B', 'car', true),
  ('Moradia', 'expense', '#103B2C', 'home', true),
  ('Contas e serviços', 'expense', '#526158', 'zap', true),
  ('Saúde', 'expense', '#A52F35', 'activity', true),
  ('Educação', 'expense', '#174D3A', 'book-open', true),
  ('Lazer', 'expense', '#2F795B', 'coffee', true),
  ('Compras pessoais', 'expense', '#103B2C', 'shopping-bag', true),
  ('Assinaturas', 'expense', '#526158', 'credit-card', true),
  ('Investimentos e reservas', 'both', '#174D3A', 'trending-up', true),
  ('Outros', 'both', '#526158', 'more-horizontal', true)
on conflict do nothing;
