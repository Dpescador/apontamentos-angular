# Responsividade da aplicação

A interface utiliza o grid e os breakpoints oficiais do Bootstrap 5.

| Faixa | Infix | Largura | Comportamento principal |
|---|---:|---:|---|
| Extra small | sem infix | `< 576px` | Conteúdo em uma coluna, botões maiores, formulário empilhado, tabela convertida em cards e modal com ações em largura total. |
| Small | `sm` | `≥ 576px` | Formulário em duas colunas quando possível, cards do resumo em duas colunas e ações do cabeçalho lado a lado. |
| Medium | `md` | `≥ 768px` | Mais campos do formulário lado a lado, paginação horizontal e melhor aproveitamento dos gráficos. |
| Large | `lg` | `≥ 992px` | Gráfico semanal e resumo mensal lado a lado; grid volta ao formato de tabela. |
| Extra large | `xl` | `≥ 1200px` | Formulário distribuído em uma única linha principal e textos dos botões de ação exibidos. |
| Extra extra large | `xxl` | `≥ 1400px` | Área útil ampliada, gráficos mais altos e espaçamentos maiores. |

## Componentes adaptados

- Cabeçalho e botões de arquivo TXT.
- Controle de período e seletor de data.
- Cards de indicadores semanais.
- Gráficos semanal e mensal.
- Resumo do mês.
- Formulário de apontamentos.
- Histórico, pesquisa e paginação.
- Modal global.

## Grid em celulares e tablets

Abaixo de `992px`, cada linha da tabela é apresentada como um card, com o nome de cada coluna ao lado do valor. Dessa forma, a aplicação não depende de rolagem horizontal para consultar ou editar os registros.

## Teste dos breakpoints

No Chrome ou Edge:

1. Abra a aplicação.
2. Pressione `F12`.
3. Ative **Toggle device toolbar** com `Ctrl + Shift + M`.
4. Teste larguras próximas a `375`, `576`, `768`, `992`, `1200` e `1400` pixels.
