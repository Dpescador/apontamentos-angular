# Arquitetura da aplicação

A aplicação adota organização por funcionalidades, componentes standalone, Signals e serviços com responsabilidade única.

```text
src/app/
├── core/
│   ├── models/
│   │   ├── app-config.model.ts
│   │   ├── database.types.ts
│   │   └── modal.model.ts
│   └── services/
│       ├── auth.service.ts
│       ├── file-system.service.ts
│       ├── modal.service.ts
│       ├── storage.service.ts
│       └── supabase.service.ts
├── shared/
│   ├── components/
│   │   ├── app-modal/
│   │   └── bar-chart/
│   └── utils/
├── features/
│   ├── auth/
│   │   └── pages/login/
│   └── activities/
│       ├── components/
│       ├── constants/
│       ├── data/
│       ├── models/
│       ├── pages/activity-dashboard/
│       └── services/
│           ├── activity-api.service.ts
│           ├── activity-dashboard.facade.ts
│           ├── activity-file.service.ts
│           └── activity-repository.service.ts
└── layout/app-header/
```

## Responsabilidades

### `SupabaseService`

Cria uma única instância do cliente Supabase usando `public/app-config.js`. A configuração contém apenas a Project URL e a Publishable key.

### `AuthService`

Gerencia sessão, usuário, cadastro, login, logout e renovação automática do token.

### `ActivityApiService`

É a camada de acesso remoto. Traduz o modelo TypeScript em colunas PostgreSQL e executa `select`, `insert`, `update`, `delete` e importação em lote.

### `ActivityRepositoryService`

Mantém o estado local da tela, chama a API e só altera os Signals depois que o banco confirma a operação.

### `ActivityDashboardFacade`

Concentra regras da página: formulário, pesquisa, paginação, períodos, indicadores, gráficos e mensagens de erro.

### `ActivityFileService`

Valida, normaliza, importa e exporta backups TXT/JSON. O arquivo não é mais a fonte principal dos dados.

## Fluxo de dados

```text
Componente
   ↓ evento
Facade
   ↓ comando
Repository
   ↓
ActivityApiService
   ↓
Supabase Data API
   ↓
PostgreSQL + RLS
```

Depois da confirmação do banco, o Repository atualiza os Signals e a interface é recalculada automaticamente.

## Segurança

A aplicação usa autenticação do Supabase. A tabela possui `usuario_id` e políticas RLS para `SELECT`, `INSERT`, `UPDATE` e `DELETE`. A Publishable key identifica o projeto, mas não substitui as políticas do banco.

## Migrações

As alterações de esquema são versionadas com Liquibase em `database/changelog`. Cada changeset possui rollback e é registrado nas tabelas `databasechangelog` e `databasechangeloglock` do PostgreSQL.
