# Configuração do Supabase

A versão 9.1 utiliza o **Supabase/PostgreSQL** como fonte oficial dos apontamentos. TXT e JSON permanecem somente para backup e migração.

## 1. Banco de dados com Liquibase

Os changelogs criam:

- tabela `public.apontamentos`;
- índices por usuário, data e Sprint;
- validação de horas;
- gatilho para `atualizado_em`;
- permissões e políticas Row Level Security.

Execute:

```text
database/scripts/configurar-liquibase.bat
```

Depois edite:

```text
database/liquibase.properties
```

Exemplo:

```properties
url=jdbc:postgresql://SEU_HOST:5432/postgres?sslmode=require
username=postgres.SEU_PROJECT_REF
password=SUA_SENHA_DO_POSTGRES
```

Aplique os scripts:

```text
database/scripts/liquibase-update.bat
```

`liquibase.properties` e `liquibase.properties.example` são ignorados pelo Git. O modelo seguro versionado é `liquibase.properties.template`.

## 2. Configuração local do Angular

A aplicação lê:

```text
public/app-config.js
```

Esse arquivo deve conter somente:

```js
window.__APP_CONFIG__ = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabasePublishableKey: 'sb_publishable_...'
};
```

A versão entregue já está configurada com a Project URL e a Publishable key informadas. Nenhuma credencial administrativa é utilizada pelo frontend.

## 3. Instalação

Execute uma vez:

```bash
npm install --include=dev
```

A versão 9.1 inclui `@types/node`, necessário para as declarações TypeScript usadas pelo cliente Supabase.

Depois execute:

```bash
npm start
```

## 4. Autenticação

No Supabase, mantenha o provedor de e-mail ativado:

```text
Authentication → Providers → Email
```

Em **Authentication → URL Configuration**, cadastre:

```text
http://localhost:4200/**
https://dpescador.github.io/apontamentos-angular/**
```

Ajuste a segunda URL caso o nome do repositório seja diferente.

## 5. GitHub Pages

Em:

```text
Settings → Secrets and variables → Actions → Variables
```

crie:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

Não crie uma variável de chave administrativa para o frontend.

O workflow `.github/workflows/deploy-pages.yml`:

1. verifica se o projeto contém credenciais administrativas;
2. instala as dependências;
3. usa as Repository Variables quando estiverem preenchidas;
4. usa `public/app-config.js` como fallback quando as variáveis não existirem;
5. compila o Angular com o `base-href` do repositório;
6. publica o conteúdo de `dist/apontamentos-dashboard/browser`.

No GitHub Pages selecione:

```text
Settings → Pages → Source → GitHub Actions
```

## 6. Migração do TXT/JSON

1. Entre no sistema.
2. Clique em **Importar backup**.
3. Selecione o arquivo antigo.
4. Confirme a operação.
5. Compare totais semanais e mensais.
6. Exporte um novo backup após a conferência.

## 7. Teste completo

1. Crie uma conta.
2. Confirme o e-mail quando solicitado.
3. Entre no sistema.
4. Cadastre um apontamento.
5. Atualize a página.
6. Confirme que o registro permaneceu.
7. Entre em outro navegador com a mesma conta.
8. Confirme que os mesmos dados foram carregados.

## 8. Solução de problemas

### Erros `NodeJS` ou `Buffer`

Execute:

```bash
npm install --include=dev
```

Confira se `tsconfig.app.json` contém:

```json
"types": ["node"]
```

### Supabase não configurado

Confira `public/app-config.js`. Use apenas uma Publishable key.

### Login funciona, mas os dados não carregam

Confira se:

- o Liquibase foi executado;
- a tabela `public.apontamentos` existe;
- as políticas RLS estão ativas;
- a URL e a Publishable key pertencem ao mesmo projeto.

### Liquibase não conecta

Use o **Session pooler** na porta `5432` quando a conexão direta IPv6 não estiver disponível.
