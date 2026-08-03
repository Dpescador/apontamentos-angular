-- Execute no SQL Editor do Supabase para validar a estrutura administrativa.

-- 1. Objetos principais.
SELECT
    to_regclass('public.apontamentos') AS tabela_apontamentos,
    to_regclass('public.profiles') AS tabela_profiles,
    to_regprocedure('private.is_admin()') AS funcao_is_admin,
    to_regprocedure('public.admin_list_users()') AS funcao_listagem;

-- 2. Valores permitidos no enum.
SELECT
    n.nspname AS schema_name,
    t.typname AS type_name,
    e.enumlabel AS value
FROM pg_type AS t
INNER JOIN pg_enum AS e
    ON e.enumtypid = t.oid
INNER JOIN pg_namespace AS n
    ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- 3. Usuários e perfis sincronizados.
SELECT
    u.id AS auth_user_id,
    u.email AS auth_email,
    p.id AS profile_id,
    p.email AS profile_email,
    p.role,
    u.created_at,
    u.last_sign_in_at
FROM auth.users AS u
LEFT JOIN public.profiles AS p
    ON p.id = u.id
ORDER BY u.email NULLS LAST;

-- 4. Policies ativas.
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('apontamentos', 'profiles')
ORDER BY tablename, policyname;

-- 5. Triggers.
SELECT
    event_object_schema,
    event_object_table,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN (
    'trg_apontamentos_atualizado_em',
    'trg_profiles_atualizado_em',
    'trg_auth_user_profile_sync'
)
ORDER BY trigger_name;
