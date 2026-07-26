# Banco de dados — Supabase + Liquibase

Os scripts desta pasta criam a tabela `public.apontamentos`, os índices, o gatilho de atualização e as políticas de segurança RLS.

## Estrutura

```text
database/
├── changelog/
│   ├── db.changelog-master.yaml
│   └── changes/
│       ├── 001-create-apontamentos.sql
│       ├── 002-create-updated-at-trigger.sql
│       └── 003-configure-row-level-security.sql
├── scripts/
│   ├── configurar-liquibase.bat
│   ├── liquibase-update.bat
│   ├── liquibase-status.bat
│   └── liquibase-rollback-last.bat
└── liquibase.properties.template
```

## Configuração

1. No painel do Supabase, abra **Connect**.
2. Use a conexão direta quando sua rede suportar IPv6 ou o **Session pooler** na porta `5432`.
3. Execute:

```text
database/scripts/configurar-liquibase.bat
```

4. Edite o arquivo local criado:

```text
database/liquibase.properties
```

5. Preencha URL JDBC, usuário PostgreSQL e senha do banco.
6. Execute:

```text
database/scripts/liquibase-update.bat
```

Exemplo de propriedades:

```properties
url=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
username=postgres.REFERENCIA_DO_PROJETO
password=SUA_SENHA_DO_POSTGRES
```

A senha do PostgreSQL não é uma chave da API do Supabase.

## Arquivos ignorados pelo Git

Os seguintes arquivos estão no `.gitignore`:

```text
database/liquibase.properties
database/liquibase.properties.example
```

O projeto utiliza `liquibase.properties.template` como modelo seguro. O arquivo real com senha fica somente no computador do desenvolvedor.

## Comandos úteis

```bash
liquibase --defaults-file=database/liquibase.properties status --verbose
liquibase --defaults-file=database/liquibase.properties update
liquibase --defaults-file=database/liquibase.properties rollback-count 1
```

## Segurança

A aplicação usa somente a Project URL e a Publishable key no navegador. As políticas RLS permitem que usuários autenticados consultem e alterem apenas os próprios registros.

Credenciais administrativas e a senha do PostgreSQL nunca devem ser colocadas no Angular ou no GitHub Pages.
