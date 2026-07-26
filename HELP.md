# Manual do Usuário — Dashboard de Apontamentos

Este manual ensina a configurar e utilizar o sistema de apontamentos com armazenamento no PostgreSQL do Supabase.

## 1. Requisitos

- Node.js LTS atual;
- npm;
- navegador Chrome, Edge ou Firefox atualizado;
- projeto Supabase configurado;
- conexão com a internet para acessar o banco.

A configuração técnica inicial está detalhada em [`SUPABASE.md`](SUPABASE.md).

## 2. Como iniciar

No Windows, execute:

```text
INICIAR_APLICACAO.bat
```

Ou pelo terminal:

```bash
npm install --include=dev
npm start
```

Abra `http://localhost:4200`. Não abra `src/index.html` diretamente.

## 3. Primeiro acesso

Ao abrir o sistema, será exibida a tela de autenticação.

### Criar uma conta

1. Clique em **Criar conta**.
2. Informe um e-mail válido.
3. Informe uma senha com pelo menos seis caracteres.
4. Clique em **Criar conta**.
5. Confirme o e-mail, caso o Supabase esteja configurado para exigir confirmação.

### Entrar

1. Informe o e-mail e a senha.
2. Clique em **Entrar**.

Cada usuário visualiza somente seus próprios apontamentos.

## 4. Visão geral

A tela principal possui:

- cabeçalho com situação do banco e usuário conectado;
- navegação entre semanas;
- botão para exibir finais de semana;
- cards com total, saldo, dias apontados e média;
- gráfico semanal;
- resumo e gráfico mensal;
- formulário de atividade;
- histórico com pesquisa e paginação.

## 5. Lançar uma atividade

Preencha:

| Campo | Obrigatório | Exemplo |
|---|---:|---|
| Data | Sim | `17/07/2026` |
| Sprint | Não | `Sprint 18` |
| ID da tarefa | Sim | `TASK 1412342` |
| Tarefa | Sim | `Análise` |
| Horas | Sim | `1,5` |
| Itens trabalhados | Não | `Validação da regra` |

Clique em **Adicionar apontamento**. O sistema somente atualiza a tela depois de o Supabase confirmar a gravação.

## 6. Editar

1. Localize o registro.
2. Clique em **Editar**.
3. Altere os campos no formulário.
4. Clique em **Salvar alterações**.

Todos os campos são recuperados, inclusive **Itens trabalhados**.

## 7. Excluir

1. Clique em **Excluir**.
2. Confirme no modal.

A exclusão é permanente no banco. Exporte backups periodicamente.

## 8. Pesquisa

O histórico pode ser filtrado por:

- data;
- Sprint;
- ID da tarefa;
- Tarefa;
- Itens trabalhados;
- horas.

Formatos de data aceitos:

```text
17/07/2026
17-07-2026
17/07
17-07
17072026
2026-07-17
```

A paginação exibe 20 registros por página.

## 9. Gráficos

### Gráfico semanal

- barra azul: horas apontadas;
- barra cinza: meta de 8 horas;
- linha laranja: meta diária;
- tooltip: horas apontadas e diferença que falta para 8 horas.

### Gráfico mensal

Exibe todos os dias visíveis do mês distribuídos pela largura do card.

### Finais de semana

Use **Exibir finais de semana** para incluir ou ocultar sábado e domingo nos dois gráficos.

## 10. Ações do cabeçalho

### Atualizar

Consulta novamente o Supabase. Use quando os dados tiverem sido alterados em outro dispositivo.

### Importar backup

Envia um TXT/JSON antigo para o banco. Registros com o mesmo ID são atualizados.

Antes de importar, confirme que entrou com o usuário correto, pois os registros serão associados à conta conectada.

### Exportar backup

Baixa uma cópia local no formato JSON legível, com extensão `.txt`.

### Sair

Encerra a sessão no dispositivo.

## 11. Migrar o arquivo antigo

1. Entre no sistema.
2. Clique em **Importar backup**.
3. Selecione `apontamentos.txt` ou um arquivo `.json`.
4. Confirme a operação.
5. Aguarde a mensagem com o número de registros importados.
6. Confira os totais nos gráficos e no histórico.
7. Exporte um novo backup depois da conferência.

## 12. Mensagens e modais

Avisos, confirmações, sucessos e erros aparecem no centro da tela, com fundo escurecido. Enquanto o modal estiver aberto, conclua ou cancele a operação antes de continuar.

## 13. Responsividade

- `xs`: histórico em cards e formulário empilhado;
- `sm` e `md`: campos e indicadores distribuídos em mais colunas;
- `lg`: histórico em tabela e gráficos lado a lado;
- `xl` e `xxl`: maior aproveitamento da largura da tela.

## 14. Boas práticas

- Não compartilhe sua senha.
- Use somente a Project URL e a Publishable key no Angular.
- Exporte um backup periodicamente.
- Não altere manualmente IDs no arquivo antes de importar.
- Use **Atualizar** depois de trabalhar em outro dispositivo.
- Verifique se o indicador do banco está verde antes de lançar dados.

## 15. Solução de problemas

### Supabase não configurado

Preencha `public/app-config.js` e reinicie a aplicação.

### Não consigo entrar

- verifique e-mail e senha;
- confirme o e-mail recebido;
- confira o usuário no painel `Authentication → Users`.

### Erro ao carregar ou salvar

- verifique a internet;
- clique em **Atualizar**;
- confirme se os changelogs Liquibase foram executados;
- confira as políticas RLS;
- abra o Console do navegador com `F12`.

### A aplicação abre, mas não há dados

O usuário atual pode não possuir registros. Importe o backup antigo depois de entrar com a conta correta.

### Erro do Liquibase

Consulte [`database/README.md`](database/README.md). Em redes sem IPv6, utilize o **Session pooler** do Supabase na porta `5432`.
