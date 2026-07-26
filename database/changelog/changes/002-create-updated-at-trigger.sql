--liquibase formatted sql

--changeset dpescador:002a-create-updated-at-function dbms:postgresql labels:schema splitStatements:false
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

--changeset dpescador:002b-create-updated-at-trigger dbms:postgresql labels:schema
CREATE TRIGGER trg_apontamentos_atualizado_em
BEFORE UPDATE ON public.apontamentos
FOR EACH ROW
EXECUTE FUNCTION public.set_apontamentos_atualizado_em();
--rollback DROP TRIGGER IF EXISTS trg_apontamentos_atualizado_em ON public.apontamentos;
