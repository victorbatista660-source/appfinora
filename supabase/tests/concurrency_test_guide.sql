-- ==============================================================================
-- FINORA - PROTOCOLO DE TESTE DE CONCORRÊNCIA EM SESSÕES INDEPENDENTES
-- Arquivo: supabase/tests/concurrency_test_guide.sql
-- Descrição:
--   Procedimento para comprovação de concorrência com 2 sessões reais independentes.
--   Demostra que:
--   1. Duas retiradas simultâneas que excedem o saldo conjunto são serializadas.
--   2. O saldo NUNCA fica negativo.
--   3. NÃO ocorrem atualizações perdidas (Lost Updates).
-- ==============================================================================

-- ==============================================================================
-- ETAPA 0: PREPARAÇÃO (Executar em qualquer sessão antes de iniciar)
-- ==============================================================================

-- 0.1 Obter o ID do seu usuário autenticado
-- select auth.uid() as meu_user_id;

-- 0.2 Criar uma meta com saldo inicial de R$ 500,00 para o teste
/*
insert into public.goals (user_id, title, target_amount, initial_amount)
values (auth.uid(), 'Meta Teste Concorrência', 5000.00, 500.00)
returning id, current_amount;
-- Anote o id retornado (ex: '00000000-0000-0000-0000-000000000001')
*/

-- ==============================================================================
-- CENÁRIO DE CONCORRÊNCIA:
-- Saldo disponível na meta: R$ 500,00.
-- Sessão 1 tenta retirar R$ 400,00.
-- Sessão 2 tenta retirar R$ 300,00 SIMULTANEAMENTE.
-- Total solicitado: R$ 700,00 > R$ 500,00 disponíveis.
-- Sem bloqueio (FOR UPDATE), ambas poderiam ler R$ 500,00 e deixar o saldo em -R$ 200,00.
-- Com o bloqueio (FOR UPDATE), a Sessão 1 reserva o saldo e a Sessão 2 é bloqueada.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- CRONOGRAMA DE EXECUÇÃO INTERLEAVED (Passo a Passo)
-- ------------------------------------------------------------------------------

-- [PASSO 1 - SESSÃO 1]: Abrir aba 1 no SQL Editor do Supabase e iniciar transação
begin;

insert into public.goal_movements (user_id, goal_id, type, amount, notes)
values (auth.uid(), '<COLE_O_ID_DA_META_AQUI>', 'withdrawal', 400.00, 'Retirada Sessão 1');

-- NOTA: O gatilho sync_goal_balance executou "SELECT ... FOR UPDATE" na linha da meta!
-- A Sessão 1 agora detém o LOCK EXCLUSIVO da meta.
-- NÃO execute COMMIT ainda na Sessão 1! Mantenha a transação aberta.


-- [PASSO 2 - SESSÃO 2]: Abrir aba 2 no SQL Editor do Supabase e tentar a 2ª retirada
begin;

insert into public.goal_movements (user_id, goal_id, type, amount, notes)
values (auth.uid(), '<COLE_O_ID_DA_META_AQUI>', 'withdrawal', 300.00, 'Retirada Sessão 2');

-- O QUE ACONTECE NO PASSO 2:
-- A Sessão 2 tenta executar o SELECT ... FOR UPDATE na mesma meta.
-- Como a Sessão 1 detém o lock, a Sessão 2 FICA EM ESPERA (HANGING / WAITING).
-- Ela NÃO avança e NÃO lê um saldo incorreto.


-- [PASSO 3 - SESSÃO 1]: Na aba 1, confirmar a primeira retirada
commit;

-- O QUE ACONTECE APÓS O PASSO 3:
-- A Sessão 1 confirma o débito de R$ 400,00. Saldo da meta passa a ser R$ 100,00.
-- O lock da linha é liberado.
-- A Sessão 2 imediatamente acorda e adquire o lock.
-- A Sessão 2 recalcula o saldo real disponível: R$ 500 (inicial) - R$ 400 (Sessão 1) - R$ 300 = -R$ 200.
-- Como -200 < 0, a Sessão 2 DISPARA A EXCEÇÃO:
-- "ERROR: Saldo insuficiente na meta: a operação resultaria em saldo negativo (R$ -200.00). Valor disponível para retirada: R$ 100.00"


-- [PASSO 4 - SESSÃO 2]: A transação da Sessão 2 foi abortada com segurança
rollback;


-- [PASSO 5 - VERIFICAÇÃO FINAL]: Conferir integridade matemática da meta
select id, title, initial_amount, current_amount, updated_at
from public.goals
where id = '<COLE_O_ID_DA_META_AQUI>';

-- RESULTADO AUDITADO:
-- initial_amount: 500.00
-- current_amount: 100.00  (500 - 400)
-- Saldo negativo evitado com sucesso! Zero atualizações perdidas!

