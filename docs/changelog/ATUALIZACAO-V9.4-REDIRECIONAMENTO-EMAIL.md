# Atualização 9.4 — Confirmação de e-mail

## Alterações

- Redirecionamento de confirmação em produção para
  `https://dpescador.github.io/apontamentos-angular/`.
- Redirecionamento local para `http://localhost:4200/`.
- Configuração centralizada em `public/app-config.js`.
- Cadastro usando `emailRedirectTo` configurável.
- Reenvio de confirmação usando o mesmo endereço.
- Botão **Reenviar confirmação** na tela de login.
- Workflow do GitHub Pages gerando as URLs junto com a configuração pública.
- Documentação atualizada.

## Configuração necessária no Supabase

Em **Authentication → URL Configuration**:

- Site URL: `https://dpescador.github.io/apontamentos-angular/`
- Redirect URLs:
  - `http://localhost:4200/`
  - `http://localhost:4200/**`
  - `https://dpescador.github.io/apontamentos-angular/`
  - `https://dpescador.github.io/apontamentos-angular/**`
