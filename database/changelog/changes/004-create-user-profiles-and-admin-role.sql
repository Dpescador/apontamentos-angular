--liquibase formatted sql

--changeset dpescador:004a-create-user-role-enum dbms:postgresql labels:schema splitStatements:false
DO $$
BEGIN
    CREATE TYPE public.user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;
--rollback DROP TYPE IF EXISTS public.user_role;

--changeset dpescador:004b-create-profiles dbms:postgresql labels:schema
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY
        REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role public.user_role NOT NULL DEFAULT 'USER',
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_profiles_email
    ON public.profiles (lower(email))
    WHERE email IS NOT NULL;

CREATE INDEX idx_profiles_role
    ON public.profiles (role);

COMMENT ON TABLE public.profiles IS
    'Perfil público e função de acesso dos usuários autenticados.';
COMMENT ON COLUMN public.profiles.role IS
    'Função de autorização da aplicação: USER ou ADMIN.';
--rollback DROP TABLE IF EXISTS public.profiles CASCADE;

--changeset dpescador:004c-create-profile-sync-function dbms:postgresql labels:schema splitStatements:false
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

--changeset dpescador:004c2-secure-profile-sync-function dbms:postgresql labels:security
REVOKE ALL ON FUNCTION public.sync_profile_from_auth_user() FROM PUBLIC;
--rollback GRANT EXECUTE ON FUNCTION public.sync_profile_from_auth_user() TO PUBLIC;

--changeset dpescador:004d-create-profile-sync-trigger dbms:postgresql labels:schema
CREATE TRIGGER trg_auth_user_profile_sync
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth_user();
--rollback DROP TRIGGER IF EXISTS trg_auth_user_profile_sync ON auth.users;

--changeset dpescador:004e-backfill-existing-profiles dbms:postgresql labels:data
INSERT INTO public.profiles (
    id,
    email,
    role,
    criado_em,
    atualizado_em
)
SELECT
    users.id,
    users.email,
    'USER'::public.user_role,
    COALESCE(users.created_at, now()),
    now()
FROM auth.users AS users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    atualizado_em = now();
--rollback DELETE FROM public.profiles;

--changeset dpescador:004f-create-profile-updated-at-function dbms:postgresql labels:schema splitStatements:false
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

--changeset dpescador:004g-create-profile-updated-at-trigger dbms:postgresql labels:schema
CREATE TRIGGER trg_profiles_atualizado_em
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_atualizado_em();
--rollback DROP TRIGGER IF EXISTS trg_profiles_atualizado_em ON public.profiles;
