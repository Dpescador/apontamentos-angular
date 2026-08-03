-- ============================================================================
-- PROMOVER USUÁRIO PARA ADMINISTRADOR
--
-- 1. Crie primeiro a conta pela aplicação ou por Authentication > Users.
-- 2. Troque o e-mail abaixo.
-- 3. Execute este arquivo no SQL Editor do Supabase.
-- ============================================================================

DO $$
DECLARE
    v_email text := 'SEU_EMAIL@EXEMPLO.COM';
    v_user_id uuid;
BEGIN
    SELECT u.id
      INTO v_user_id
      FROM auth.users AS u
     WHERE lower(u.email) = lower(v_email)
     LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION
            'O e-mail % não existe em auth.users. Crie a conta antes de promover.',
            v_email;
    END IF;

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
        'ADMIN'::public.user_role,
        COALESCE(u.created_at, now()),
        now()
    FROM auth.users AS u
    WHERE u.id = v_user_id
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = 'ADMIN'::public.user_role,
        atualizado_em = now();
END;
$$;

-- Confirma o resultado.
SELECT
    u.id,
    u.email,
    p.role,
    p.criado_em,
    p.atualizado_em
FROM auth.users AS u
INNER JOIN public.profiles AS p
    ON p.id = u.id
WHERE p.role = 'ADMIN'::public.user_role
ORDER BY u.email;
