-- Execute este comando no SQL Editor do Supabase depois de criar sua conta.
-- Troque o e-mail abaixo pelo e-mail que será administrador.

UPDATE public.profiles
SET role = 'ADMIN'::public.user_role
WHERE lower(email) = lower('SEU_EMAIL@EXEMPLO.COM');

-- Confirme o resultado:
SELECT id, email, role, criado_em, atualizado_em
FROM public.profiles
ORDER BY email;
