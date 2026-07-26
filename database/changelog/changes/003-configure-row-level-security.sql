--liquibase formatted sql

--changeset dpescador:003-enable-rls dbms:postgresql labels:security
ALTER TABLE public.apontamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apontamentos FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.apontamentos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.apontamentos TO authenticated;

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

--rollback DROP POLICY IF EXISTS apontamentos_delete_proprio ON public.apontamentos;
--rollback DROP POLICY IF EXISTS apontamentos_update_proprio ON public.apontamentos;
--rollback DROP POLICY IF EXISTS apontamentos_insert_proprio ON public.apontamentos;
--rollback DROP POLICY IF EXISTS apontamentos_select_proprio ON public.apontamentos;
--rollback REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.apontamentos FROM authenticated;
--rollback ALTER TABLE public.apontamentos NO FORCE ROW LEVEL SECURITY;
--rollback ALTER TABLE public.apontamentos DISABLE ROW LEVEL SECURITY;
