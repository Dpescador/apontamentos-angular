--liquibase formatted sql

--changeset dpescador:001-create-apontamentos dbms:postgresql labels:schema
CREATE TABLE public.apontamentos (
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

CREATE INDEX idx_apontamentos_usuario_data
    ON public.apontamentos (usuario_id, data DESC, criado_em DESC);

CREATE INDEX idx_apontamentos_usuario_sprint
    ON public.apontamentos (usuario_id, sprint)
    WHERE sprint IS NOT NULL;

COMMENT ON TABLE public.apontamentos IS
    'Apontamentos de atividades separados por usuário do Supabase Auth.';
COMMENT ON COLUMN public.apontamentos.usuario_id IS
    'Usuário proprietário do registro, vinculado a auth.users.';
COMMENT ON COLUMN public.apontamentos.horas IS
    'Quantidade de horas apontadas, maior que zero e limitada a 24 horas.';

--rollback DROP TABLE IF EXISTS public.apontamentos CASCADE;
