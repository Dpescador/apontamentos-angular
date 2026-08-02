--liquibase formatted sql

--changeset dpescador:005a-create-private-schema dbms:postgresql labels:security
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
--rollback REVOKE USAGE ON SCHEMA private FROM authenticated;

--changeset dpescador:005b-create-is-admin-function dbms:postgresql labels:security splitStatements:false
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'ADMIN'::public.user_role
    );
$$;
--rollback DROP FUNCTION IF EXISTS private.is_admin();

--changeset dpescador:005b2-secure-is-admin-function dbms:postgresql labels:security
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
--rollback REVOKE EXECUTE ON FUNCTION private.is_admin() FROM authenticated;

--changeset dpescador:005c-configure-profiles-rls dbms:postgresql labels:security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

CREATE POLICY profiles_select_self_or_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = (SELECT auth.uid())
    OR (SELECT private.is_admin())
);
--rollback DROP POLICY IF EXISTS profiles_select_self_or_admin ON public.profiles;
--rollback REVOKE SELECT ON TABLE public.profiles FROM authenticated;
--rollback ALTER TABLE public.profiles NO FORCE ROW LEVEL SECURITY;
--rollback ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

--changeset dpescador:005d-create-admin-list-users-function dbms:postgresql labels:security splitStatements:false
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
        users.id,
        users.email,
        profiles.role::text,
        users.created_at,
        users.last_sign_in_at,
        COUNT(apontamentos.id)::bigint,
        COALESCE(SUM(apontamentos.horas), 0)::numeric
    FROM auth.users AS users
    INNER JOIN public.profiles AS profiles
        ON profiles.id = users.id
    LEFT JOIN public.apontamentos AS apontamentos
        ON apontamentos.usuario_id = users.id
    GROUP BY
        users.id,
        users.email,
        profiles.role,
        users.created_at,
        users.last_sign_in_at
    ORDER BY
        users.email NULLS LAST,
        users.created_at;
END;
$$;
--rollback DROP FUNCTION IF EXISTS public.admin_list_users();

--changeset dpescador:005d2-secure-admin-list-users-function dbms:postgresql labels:security
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
--rollback REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM authenticated;
