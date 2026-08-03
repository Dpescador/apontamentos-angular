--liquibase formatted sql

-- ============================================================================
-- APONTAMENTOS - ESQUEMA CONSOLIDADO SUPABASE
--
-- Este changelog é idempotente e pode ser executado tanto em um banco novo
-- quanto em um banco que recebeu parte da estrutura manualmente pelo SQL Editor.
-- ============================================================================

--changeset dpescador:010a-ensure-user-role dbms:postgresql labels:schema,admin splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type AS t
        INNER JOIN pg_namespace AS n
            ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typname = 'user_role'
    ) THEN
        CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');
    ELSE
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'USER';
        ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'ADMIN';
    END IF;
END;
$$;
--rollback SELECT 1;

--changeset dpescador:010b-create-or-complete-apontamentos dbms:postgresql labels:schema
CREATE TABLE IF NOT EXISTS public.apontamentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid NOT NULL DEFAULT auth.uid()
        REFERENCES auth.users(id) ON DELETE CASCADE,
    data date NOT NULL,
    sprint varchar(60),
    id_tarefa varchar(80) NOT NULL,
    tarefa varchar(120) NOT NULL,
    itens_trabalhados varchar(500),
    horas numeric(5,2) NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_apontamentos_horas
        CHECK (horas > 0 AND horas <= 24)
);

ALTER TABLE public.apontamentos
    ADD COLUMN IF NOT EXISTS usuario_id uuid DEFAULT auth.uid(),
    ADD COLUMN IF NOT EXISTS data date,
    ADD COLUMN IF NOT EXISTS sprint varchar(60),
    ADD COLUMN IF NOT EXISTS id_tarefa varchar(80),
    ADD COLUMN IF NOT EXISTS tarefa varchar(120),
    ADD COLUMN IF NOT EXISTS itens_trabalhados varchar(500),
    ADD COLUMN IF NOT EXISTS horas numeric(5,2),
    ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS atualizado_em timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_apontamentos_usuario_data
    ON public.apontamentos (usuario_id, data DESC, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_apontamentos_usuario_sprint
    ON public.apontamentos (usuario_id, sprint)
    WHERE sprint IS NOT NULL;

COMMENT ON TABLE public.apontamentos IS
    'Apontamentos de atividades separados por usuário do Supabase Auth.';
COMMENT ON COLUMN public.apontamentos.usuario_id IS
    'Usuário proprietário do registro, vinculado a auth.users.';
COMMENT ON COLUMN public.apontamentos.horas IS
    'Quantidade de horas apontadas, maior que zero e limitada a 24 horas.';
--rollback SELECT 1;

--changeset dpescador:010c-create-or-complete-profiles dbms:postgresql labels:schema,admin
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role public.user_role NOT NULL DEFAULT 'USER'::public.user_role,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email text,
    ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'USER'::public.user_role,
    ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS atualizado_em timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS uq_profiles_email
    ON public.profiles (lower(email))
    WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role
    ON public.profiles (role);

COMMENT ON TABLE public.profiles IS
    'Perfil público e função de acesso dos usuários autenticados.';
COMMENT ON COLUMN public.profiles.role IS
    'Função de autorização da aplicação: USER ou ADMIN.';
--rollback SELECT 1;

--changeset dpescador:010d-reconcile-profile-columns-and-role dbms:postgresql labels:schema,repair splitStatements:false
DO $$
DECLARE
    role_type_name text;
BEGIN
    -- Corrige nomes em inglês criados por versões manuais anteriores.
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'created_at'
    ) THEN
        EXECUTE 'UPDATE public.profiles
                    SET criado_em = COALESCE(created_at, criado_em)';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'updated_at'
    ) THEN
        EXECUTE 'UPDATE public.profiles
                    SET atualizado_em = COALESCE(updated_at, atualizado_em)';
    END IF;

    -- Converte uma coluna role textual para o enum esperado pela aplicação.
    SELECT c.udt_name
      INTO role_type_name
      FROM information_schema.columns AS c
     WHERE c.table_schema = 'public'
       AND c.table_name = 'profiles'
       AND c.column_name = 'role';

    IF role_type_name IS DISTINCT FROM 'user_role' THEN
        ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

        ALTER TABLE public.profiles
            ALTER COLUMN role TYPE public.user_role
            USING (
                CASE
                    WHEN upper(coalesce(role::text, 'USER')) = 'ADMIN'
                        THEN 'ADMIN'::public.user_role
                    ELSE 'USER'::public.user_role
                END
            );
    END IF;

    ALTER TABLE public.profiles
        ALTER COLUMN role SET DEFAULT 'USER'::public.user_role;

    UPDATE public.profiles
       SET role = 'USER'::public.user_role
     WHERE role IS NULL;

    ALTER TABLE public.profiles
        ALTER COLUMN role SET NOT NULL;
END;
$$;
--rollback SELECT 1;

--changeset dpescador:010e-backfill-profiles dbms:postgresql labels:data,admin
INSERT INTO public.profiles (
    id,
    email,
    role,
    criado_em,
    atualizado_em
)
SELECT
    u.id,
    u.email,
    'USER'::public.user_role,
    COALESCE(u.created_at, now()),
    now()
FROM auth.users AS u
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    atualizado_em = now();
--rollback SELECT 1;

--changeset dpescador:010f-create-apontamentos-updated-function dbms:postgresql labels:schema splitStatements:false runOnChange:true
CREATE OR REPLACE FUNCTION public.set_apontamentos_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$;
--rollback DROP FUNCTION IF EXISTS public.set_apontamentos_atualizado_em();

--changeset dpescador:010g-create-apontamentos-updated-trigger dbms:postgresql labels:schema
DROP TRIGGER IF EXISTS trg_apontamentos_atualizado_em
ON public.apontamentos;

CREATE TRIGGER trg_apontamentos_atualizado_em
BEFORE UPDATE ON public.apontamentos
FOR EACH ROW
EXECUTE FUNCTION public.set_apontamentos_atualizado_em();
--rollback DROP TRIGGER IF EXISTS trg_apontamentos_atualizado_em ON public.apontamentos;

--changeset dpescador:010h-create-profile-updated-function dbms:postgresql labels:schema,admin splitStatements:false runOnChange:true
CREATE OR REPLACE FUNCTION public.set_profile_atualizado_em()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$;
--rollback DROP FUNCTION IF EXISTS public.set_profile_atualizado_em();

--changeset dpescador:010i-create-profile-updated-trigger dbms:postgresql labels:schema,admin
DROP TRIGGER IF EXISTS trg_profiles_atualizado_em
ON public.profiles;

CREATE TRIGGER trg_profiles_atualizado_em
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_atualizado_em();
--rollback DROP TRIGGER IF EXISTS trg_profiles_atualizado_em ON public.profiles;

--changeset dpescador:010j-create-profile-sync-function dbms:postgresql labels:schema,admin splitStatements:false runOnChange:true
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        role,
        criado_em,
        atualizado_em
    )
    VALUES (
        NEW.id,
        NEW.email,
        'USER'::public.user_role,
        COALESCE(NEW.created_at, now()),
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        atualizado_em = now();

    RETURN NEW;
END;
$$;
--rollback DROP FUNCTION IF EXISTS public.sync_profile_from_auth_user();

--changeset dpescador:010k-secure-profile-sync-function dbms:postgresql labels:security,admin
REVOKE ALL ON FUNCTION public.sync_profile_from_auth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_profile_from_auth_user() FROM anon;
REVOKE ALL ON FUNCTION public.sync_profile_from_auth_user() FROM authenticated;
--rollback GRANT EXECUTE ON FUNCTION public.sync_profile_from_auth_user() TO PUBLIC;

--changeset dpescador:010l-create-profile-sync-trigger dbms:postgresql labels:schema,admin
DROP TRIGGER IF EXISTS trg_auth_user_profile_sync
ON auth.users;

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER trg_auth_user_profile_sync
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth_user();
--rollback DROP TRIGGER IF EXISTS trg_auth_user_profile_sync ON auth.users;

--changeset dpescador:010m-create-private-schema dbms:postgresql labels:security,admin
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;
--rollback SELECT 1;

--changeset dpescador:010n-create-is-admin-function dbms:postgresql labels:security,admin splitStatements:false runOnChange:true
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles AS p
        WHERE p.id = (SELECT auth.uid())
          AND upper(p.role::text) = 'ADMIN'
    );
$$;
--rollback DROP FUNCTION IF EXISTS private.is_admin();

--changeset dpescador:010o-secure-is-admin-function dbms:postgresql labels:security,admin
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM anon;
REVOKE ALL ON FUNCTION private.is_admin() FROM authenticated;
--rollback SELECT 1;

--changeset dpescador:010p-configure-apontamentos-rls dbms:postgresql labels:security
ALTER TABLE public.apontamentos ENABLE ROW LEVEL SECURITY;

-- Não use FORCE RLS: a função administrativa SECURITY DEFINER precisa consolidar
-- os apontamentos de todos os usuários. Os papéis da API continuam sujeitos ao RLS.
ALTER TABLE public.apontamentos NO FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.apontamentos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.apontamentos TO authenticated;

DROP POLICY IF EXISTS apontamentos_select_proprio ON public.apontamentos;
DROP POLICY IF EXISTS apontamentos_insert_proprio ON public.apontamentos;
DROP POLICY IF EXISTS apontamentos_update_proprio ON public.apontamentos;
DROP POLICY IF EXISTS apontamentos_delete_proprio ON public.apontamentos;

CREATE POLICY apontamentos_select_proprio
ON public.apontamentos
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = usuario_id);

CREATE POLICY apontamentos_insert_proprio
ON public.apontamentos
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = usuario_id);

CREATE POLICY apontamentos_update_proprio
ON public.apontamentos
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = usuario_id)
WITH CHECK ((SELECT auth.uid()) = usuario_id);

CREATE POLICY apontamentos_delete_proprio
ON public.apontamentos
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = usuario_id);
--rollback SELECT 1;

--changeset dpescador:010q-configure-profiles-rls dbms:postgresql labels:security,admin
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Não use FORCE RLS: a RPC administrativa SECURITY DEFINER precisa consultar
-- todos os perfis. Os papéis anon/authenticated continuam sujeitos às policies.
ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS profiles_select_self ON public.profiles;
DROP POLICY IF EXISTS profiles_select_self_or_admin ON public.profiles;
DROP POLICY IF EXISTS "Usuário consulta próprio perfil" ON public.profiles;

-- A API pública permite somente a leitura do próprio perfil. A listagem global
-- é feita exclusivamente pela RPC public.admin_list_users().
CREATE POLICY profiles_select_self
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));
--rollback SELECT 1;

--changeset dpescador:010r-create-admin-list-users-function dbms:postgresql labels:security,admin splitStatements:false runOnChange:true
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    criado_em timestamptz,
    ultimo_acesso timestamptz,
    quantidade_apontamentos bigint,
    total_horas numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT private.is_admin() THEN
        RAISE EXCEPTION 'Acesso permitido somente para administradores.'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.email::text,
        COALESCE(p.role::text, 'USER') AS role,
        u.created_at,
        u.last_sign_in_at,
        COUNT(a.id)::bigint,
        COALESCE(SUM(a.horas), 0::numeric)::numeric
    FROM auth.users AS u
    LEFT JOIN public.profiles AS p
        ON p.id = u.id
    LEFT JOIN public.apontamentos AS a
        ON a.usuario_id = u.id
    GROUP BY
        u.id,
        u.email,
        p.role,
        u.created_at,
        u.last_sign_in_at
    ORDER BY
        u.email NULLS LAST,
        u.created_at;
END;
$$;
--rollback DROP FUNCTION IF EXISTS public.admin_list_users();

--changeset dpescador:010s-secure-admin-list-users-function dbms:postgresql labels:security,admin
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
--rollback REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM authenticated;

--changeset dpescador:010t-refresh-postgrest-schema dbms:postgresql labels:api
NOTIFY pgrst, 'reload schema';
--rollback SELECT 1;
