# Banco de dados — Supabase + Liquibase

Esta pasta contém a estrutura completa do banco da aplicação, incluindo apontamentos, perfis, segurança RLS e administração de usuários.

## Changelog atual

O arquivo principal é:

```text
database/changelog/db.changelog-master.yaml
```

Ele executa o changelog consolidado:

```text
database/changelog/changes/010-consolidate-supabase-schema.sql
```

O script `010` é idempotente: pode ser usado em um banco novo e também em um banco que recebeu parte da estrutura manualmente pelo SQL Editor.

Os arquivos `001` a `005` foram mantidos como histórico, mas não são mais incluídos pelo changelog principal. O master antigo está em:

```text
database/changelog/legacy/db.changelog-legacy.yaml
```

## O que é criado

- `public.apontamentos`;
- `public.profiles`;
- enum `public.user_role` com `USER` e `ADMIN`;
- índices de data, Sprint, e-mail e função;
- trigger de atualização de `atualizado_em`;
- trigger que sincroniza `auth.users` com `public.profiles`;
- políticas RLS dos apontamentos;
- política para o usuário consultar o próprio perfil;
- schema interno `private`;
- função protegida `private.is_admin()`;
- RPC protegida `public.admin_list_users()`;
- recarga do schema do PostgREST.

## Configurar o Liquibase

Execute:

```text
database\scripts\configurar-liquibase.bat
```

Depois edite:

```text
database/liquibase.properties
```

Exemplo:

```properties
changeLogFile=database/changelog/db.changelog-master.yaml
url=jdbc:postgresql://SEU_HOST:5432/postgres?sslmode=require
username=postgres.SEU_PROJECT_REF
password=SUA_SENHA_DO_POSTGRES
```

A senha é a senha PostgreSQL do projeto. Não use uma chave administrativa do Supabase nesse arquivo.

## Visualizar o SQL antes da execução

```text
database\scripts\liquibase-update-sql.bat
```

## Verificar alterações pendentes

```text
database\scripts\liquibase-status.bat
```

## Aplicar a atualização

```text
database\scripts\liquibase-update.bat
```

Depois confira no Supabase:

```text
Table Editor → public → apontamentos
Table Editor → public → profiles
```

## Criar o primeiro administrador

1. Crie a conta na aplicação ou em **Authentication → Users**.
2. Abra `database/scripts/PROMOVER_ADMIN.sql`.
3. Troque apenas o valor de `v_email`.
4. Execute no SQL Editor do Supabase.
5. Saia e entre novamente na aplicação.

Não existe senha administrativa fixa no código. O administrador é um usuário normal do Supabase com `role = ADMIN` em `public.profiles`.

## Validar a instalação

Execute no SQL Editor:

```text
database/scripts/VALIDAR_ADMINISTRACAO.sql
```

O resultado deve mostrar:

- as tabelas `public.apontamentos` e `public.profiles`;
- as funções `private.is_admin()` e `public.admin_list_users()`;
- os valores `USER` e `ADMIN`;
- usuários sincronizados com seus perfis;
- policies e triggers ativos.

## Atualizar o cache da API

O changelog já executa:

```sql
NOTIFY pgrst, 'reload schema';
```

Caso uma função nova ainda não seja reconhecida, execute:

```text
database/scripts/RECARREGAR_POSTGREST.sql
```

## Segurança

- O Angular usa somente a Project URL e a Publishable Key.
- A senha PostgreSQL fica apenas em `database/liquibase.properties`.
- O arquivo real de propriedades é ignorado pelo Git.
- Usuários comuns acessam somente os próprios apontamentos.
- A aplicação consulta apenas o perfil do usuário autenticado.
- A lista global de usuários é retornada exclusivamente pela RPC administrativa.
- A RPC verifica o papel `ADMIN` dentro do PostgreSQL.
- As tabelas usam RLS, mas não usam `FORCE RLS`, pois as funções `SECURITY DEFINER` precisam consolidar dados administrativos.

## Rollback

O changelog consolidado prioriza reconciliação segura de bancos já existentes. As etapas estruturais e de reparo são tratadas como migrações forward-only para evitar exclusão acidental de usuários e apontamentos. Faça backup antes de alterações estruturais importantes.
