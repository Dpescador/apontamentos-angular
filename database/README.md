# Banco de dados — Supabase + Liquibase

Os scripts desta pasta criam os apontamentos, perfis de usuários, funções de acesso e políticas de segurança RLS.

## Estrutura

```text
database/
├── changelog/
│   ├── db.changelog-master.yaml
│   └── changes/
│       ├── 001-create-apontamentos.sql
│       ├── 002-create-updated-at-trigger.sql
│       ├── 003-configure-row-level-security.sql
│       ├── 004-create-user-profiles-and-admin-role.sql
│       └── 005-configure-admin-security-and-user-list.sql
├── scripts/
│   ├── configurar-liquibase.bat
│   ├── liquibase-update.bat
│   ├── liquibase-status.bat
│   ├── liquibase-rollback-last.bat
│   └── PROMOVER_ADMIN.sql
└── liquibase.properties.template
```

## Configuração

1. No painel do Supabase, abra **Connect**.
2. Use a conexão direta quando sua rede suportar IPv6 ou o **Session pooler** na porta `5432`.
3. Execute:

```text
database/scripts/configurar-liquibase.bat
```

4. Edite `database/liquibase.properties`.
5. Preencha URL JDBC, usuário PostgreSQL e senha do banco.
6. Execute:

```text
database/scripts/liquibase-update.bat
```

Exemplo:

```properties
url=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
username=postgres.REFERENCIA_DO_PROJETO
password=SUA_SENHA_DO_POSTGRES
```

## Criar o primeiro administrador

1. Crie a conta pela tela de cadastro da aplicação.
2. Abra `database/scripts/PROMOVER_ADMIN.sql`.
3. Substitua o e-mail de exemplo pelo e-mail cadastrado.
4. Execute o SQL no **SQL Editor** do Supabase.
5. Saia e entre novamente na aplicação.

O botão **Administração** ficará disponível somente para perfis com `role = 'ADMIN'`.

## Arquivos ignorados pelo Git

```text
database/liquibase.properties
database/liquibase.properties.example
```

O arquivo real com senha fica somente no computador do desenvolvedor.

## Segurança

- O Angular usa somente Project URL e Publishable key.
- O papel administrativo é armazenado em `public.profiles`.
- Usuários comuns só conseguem consultar o próprio perfil.
- A listagem administrativa é entregue por `public.admin_list_users()` e valida o administrador no PostgreSQL.
- A Secret Key e a senha PostgreSQL nunca são colocadas no Angular ou no GitHub Pages.
