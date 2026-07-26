# Dashboard de Apontamentos — Angular + Supabase

Aplicação web responsiva para registrar atividades e acompanhar horas por dia, semana e mês. O projeto utiliza Angular standalone, Bootstrap, Bootstrap Icons, Signals, Supabase Auth e PostgreSQL protegido por Row Level Security.

## Documentação

- [`HELP.md`](HELP.md): manual de uso da aplicação.
- [`SUPABASE.md`](SUPABASE.md): criação do projeto, autenticação, configuração do Angular e migração dos dados antigos.
- [`database/README.md`](database/README.md): execução dos changelogs Liquibase.
- [`ARQUITETURA.md`](ARQUITETURA.md): organização profissional do código.
- [`RESPONSIVIDADE.md`](RESPONSIVIDADE.md): breakpoints Bootstrap.

## Funcionalidades

- Autenticação por e-mail e senha.
- Dados separados por usuário com PostgreSQL RLS.
- Inclusão, edição e exclusão no Supabase.
- Gráficos semanal e mensal com meta diária de 8 horas.
- Cards de total, saldo semanal, dias apontados e média diária.
- Campo Sprint e combo de Tarefa.
- Pesquisa por data, Sprint, ID, tarefa, item trabalhado ou horas.
- Paginação de 20 registros.
- Importação do TXT/JSON antigo para o banco.
- Exportação TXT/JSON para backup.
- Interface responsiva nos breakpoints `xs`, `sm`, `md`, `lg`, `xl` e `xxl`.
- Modais globais e Bootstrap Icons.
- Publicação automática no GitHub Pages.

## Configuração inicial

1. Crie o projeto no Supabase.
2. Execute `database/scripts/configurar-liquibase.bat`.
3. Configure a conexão em `database/liquibase.properties` e execute:

```text
database/scripts/liquibase-update.bat
```

4. Configure a Project URL e a Publishable key em:

```text
public/app-config.js
```

5. Instale e inicie:

```bash
npm install --include=dev
npm start
```

A aplicação abrirá em `http://localhost:4200`.

## Arquitetura

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
│       ├── models/
│       ├── pages/activity-dashboard/
│       └── services/
│           ├── activity-api.service.ts
│           ├── activity-dashboard.facade.ts
│           ├── activity-file.service.ts
│           └── activity-repository.service.ts
├── layout/app-header/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

## Banco de dados

Os changelogs Liquibase ficam em:

```text
database/changelog/
├── db.changelog-master.yaml
└── changes/
    ├── 001-create-apontamentos.sql
    ├── 002-create-updated-at-trigger.sql
    └── 003-configure-row-level-security.sql
```

O banco é a fonte oficial dos dados. Os arquivos TXT/JSON são apenas cópias de segurança ou meios de migração.

## Segurança

Use somente a **Publishable key** no Angular. Credenciais administrativas e a senha do PostgreSQL não fazem parte do frontend. O acesso aos registros é controlado pelas políticas RLS que comparam `usuario_id` com `auth.uid()`.


## GitHub Pages

O workflow usa `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` configuradas em **Repository Variables**. Quando elas não estiverem cadastradas, o workflow usa a configuração pública de `public/app-config.js`.

O arquivo `database/liquibase.properties.example` é ignorado. O modelo seguro utilizado pelo projeto é `database/liquibase.properties.template`.
