# Manual do Usuário — Dashboard de Apontamentos

Este manual ensina a instalar, abrir e utilizar o sistema **Dashboard de Apontamentos** para registrar atividades e acompanhar as horas trabalhadas por dia, semana e mês.

## Sumário

1. [Requisitos](#1-requisitos)
2. [Como iniciar o sistema](#2-como-iniciar-o-sistema)
3. [Visão geral da tela](#3-visão-geral-da-tela)
4. [Como lançar uma atividade](#4-como-lançar-uma-atividade)
5. [Como editar um apontamento](#5-como-editar-um-apontamento)
6. [Como excluir um apontamento](#6-como-excluir-um-apontamento)
7. [Como pesquisar no histórico](#7-como-pesquisar-no-histórico)
8. [Como navegar entre semanas e meses](#8-como-navegar-entre-semanas-e-meses)
9. [Como interpretar os gráficos](#9-como-interpretar-os-gráficos)
10. [Como trabalhar com o arquivo TXT](#10-como-trabalhar-com-o-arquivo-txt)
11. [Formato do arquivo TXT/JSON](#11-formato-do-arquivo-txtjson)
12. [Atalho na Área de Trabalho](#12-atalho-na-área-de-trabalho)
13. [Mensagens e modais](#13-mensagens-e-modais)
14. [Boas práticas e backup](#14-boas-práticas-e-backup)
15. [Solução de problemas](#15-solução-de-problemas)

---

## 1. Requisitos

Para executar o sistema, é necessário ter:

- Windows 10 ou Windows 11;
- Node.js instalado;
- conexão com a internet na primeira instalação das dependências;
- navegador Chrome ou Edge recomendado.

O Chrome e o Edge oferecem melhor suporte à vinculação direta do arquivo TXT.

---

## 2. Como iniciar o sistema

### Opção recomendada no Windows

1. Extraia completamente o arquivo ZIP do projeto.
2. Abra a pasta `apontamentos-angular`.
3. Execute:

```text
INICIAR_APLICACAO.bat
```

Na primeira execução, o sistema instalará as dependências necessárias. Depois, a aplicação será aberta no navegador em:

```text
http://localhost:4200
```

### Iniciar pelo terminal

Abra o terminal na pasta do projeto e execute:

```bash
npm install --include=dev
npm start
```

### Importante

Não abra o arquivo `src/index.html` diretamente. O projeto precisa ser iniciado pelo Angular para funcionar corretamente.

---

## 3. Visão geral da tela

A tela principal possui as seguintes áreas:

### Cabeçalho

Exibe o nome da aplicação e os comandos de arquivo:

- **Vincular TXT**;
- **Sincronizar**;
- **Importar TXT**;
- **Exportar TXT**.

Logo abaixo dos botões, uma mensagem informa a situação atual do armazenamento, por exemplo:

```text
Dados salvos no navegador. Vincule um TXT para gravação direta.
```

ou:

```text
TXT vinculado: apontamentos.txt
```

### Período analisado

Permite:

- voltar para a semana anterior;
- avançar para a próxima semana;
- selecionar uma data específica;
- exibir ou ocultar sábado e domingo nos gráficos.

### Indicadores semanais

Os cards apresentam informações como:

- total de horas da semana;
- saldo em relação à meta semanal;
- quantidade de dias com apontamento;
- média de horas por dia ativo.

### Gráfico semanal

Exibe as horas lançadas em cada dia da semana e a linha da meta diária de **8 horas**.

### Resumo mensal

Exibe:

- total acumulado no mês;
- total de horas úteis previstas até a data selecionada;
- barra de progresso do mês;
- botões para navegar entre os meses.

### Gráfico mensal

Mostra a distribuição das horas em cada dia do mês.

### Formulário de lançamento

Usado para adicionar ou editar atividades.

### Histórico

Exibe os apontamentos da data mais recente para a mais antiga, com pesquisa, edição, exclusão e paginação.

---

## 4. Como lançar uma atividade

Na seção **Nova atividade**, preencha os campos:

| Campo | Obrigatório | Descrição |
|---|---:|---|
| Data | Sim | Dia em que a atividade foi realizada. |
| Sprint | Não | Identificação da Sprint, por exemplo `Sprint 18`. |
| ID da tarefa | Sim | Identificador da tarefa, por exemplo `TASK 1412342`. |
| Tarefa | Sim | Categoria da atividade. |
| Horas | Sim | Quantidade de horas trabalhadas. |
| Itens trabalhados | Não | Detalhes do que foi realizado. |

As opções atuais do campo **Tarefa** são:

- Análise;
- Cerimônias e Reuniões.

O campo **Horas** aceita valores decimais. Exemplos:

```text
0,5 hora = 30 minutos
1,5 hora = 1 hora e 30 minutos
2,25 horas = 2 horas e 15 minutos
```

Dependendo da configuração do navegador, o campo numérico poderá exibir o separador decimal como ponto durante a digitação:

```text
0.5
1.5
2.25
```

Depois de preencher os dados, clique em:

```text
Adicionar apontamento
```

Uma mensagem de sucesso será exibida. O registro aparecerá no histórico, e os gráficos e indicadores serão atualizados automaticamente.

### Validações

O sistema não permite salvar quando:

- a data não foi informada;
- o ID da tarefa está vazio;
- nenhuma tarefa foi selecionada;
- as horas são menores que `0,1` ou maiores que `24`.

---

## 5. Como editar um apontamento

1. Localize o registro no histórico.
2. Clique no botão **Editar**.
3. O sistema levará o registro para o formulário.
4. Altere os campos necessários.
5. Clique em **Salvar alterações**.

Durante a edição, o título do formulário muda para:

```text
Editar apontamento
```

Para abandonar a edição sem salvar, clique em:

```text
Cancelar edição
```

Todos os campos são recuperados durante a edição, incluindo:

- Data;
- Sprint;
- ID da tarefa;
- Tarefa;
- Itens trabalhados;
- Horas.

---

## 6. Como excluir um apontamento

1. Localize o registro no histórico.
2. Clique em **Excluir**.
3. Confira a data e a quantidade de horas exibidas no modal.
4. Clique em **Excluir** para confirmar ou em **Cancelar** para manter o registro.

A exclusão é permanente para a base atual. Quando um TXT estiver vinculado, o arquivo também será atualizado.

---

## 7. Como pesquisar no histórico

Use o campo:

```text
Pesquisar por data, sprint, tarefa ou item...
```

A pesquisa considera:

- data;
- Sprint;
- ID da tarefa;
- Tarefa;
- Itens trabalhados;
- quantidade de horas.

### Formatos de data aceitos

O mesmo dia pode ser pesquisado de diferentes formas:

```text
17/07/2026
17-07-2026
17/07
17-07
17072026
2026-07-17
```

### Exemplos de pesquisa

```text
Sprint 18
TASK 1412342
Cerimônias
Daily
17/07/2026
1,5
```

A pesquisa ignora diferenças entre letras maiúsculas, minúsculas e acentos.

Quando uma pesquisa é realizada, a paginação retorna automaticamente para a primeira página.

---

## 8. Como navegar entre semanas e meses

### Semana

Na seção **Período analisado**:

- clique na seta para a esquerda para voltar uma semana;
- clique na seta para a direita para avançar uma semana;
- selecione uma data no calendário para abrir a semana correspondente.

### Finais de semana

Clique em:

```text
Exibir finais de semana
```

para adicionar sábado e domingo aos gráficos. Depois, o botão muda para:

```text
Ocultar finais de semana
```

### Mês

No card **Mês**:

- clique na seta para a esquerda para abrir o mês anterior;
- clique na seta para a direita para abrir o próximo mês.

---

## 9. Como interpretar os gráficos

### Linha laranja

A linha tracejada laranja representa a meta diária de:

```text
8 horas
```

### Barras cinzas

Representam visualmente a altura correspondente à meta de 8 horas.

### Barras azuis

Representam as horas efetivamente apontadas no dia.

### Tooltip

Passe o mouse sobre uma barra para visualizar:

```text
Apontadas: 2,5h
Faltam: 5,5h
```

Quando o dia tiver 8 horas ou mais, o valor faltante será zero:

```text
Apontadas: 8h
Faltam: 0h
```

### Consolidação

Quando existem vários registros no mesmo dia, o gráfico soma as horas e mostra um único total diário.

Exemplo:

```text
Daily: 0,5h
Desenvolvimento: 5,5h
Reunião: 2h
Total do dia no gráfico: 8h
```

---

## 10. Como trabalhar com o arquivo TXT

Embora o arquivo tenha extensão `.txt`, seu conteúdo é estruturado em JSON legível.

### Armazenamento automático no navegador

Mesmo sem vincular um TXT, a aplicação salva os apontamentos no navegador.

A mensagem exibida será semelhante a:

```text
Salvo no navegador. Vincule um TXT para gravação direta.
```

Esses dados pertencem ao navegador e ao endereço local da aplicação. Limpar os dados do navegador pode removê-los. Por isso, mantenha cópias de backup.

### Vincular TXT

O botão **Vincular TXT** permite escolher ou criar um arquivo para gravação direta.

1. Clique em **Vincular TXT**.
2. Escolha um arquivo existente ou informe um novo nome.
3. Confirme a permissão solicitada pelo navegador.
4. Aguarde a mensagem de sucesso.

Quando o arquivo escolhido já possui registros, o sistema combina os dados do arquivo com os dados atuais usando os identificadores dos apontamentos.

Depois da vinculação, inclusões, edições e exclusões tentam atualizar o TXT automaticamente.

### Sincronizar

Clique em **Sincronizar** quando:

- o navegador solicitar novamente a permissão do arquivo;
- o status informar que a alteração foi salva apenas no navegador;
- você quiser forçar a gravação da base atual no TXT vinculado.

A sincronização grava o estado atual da aplicação no arquivo vinculado.

### Importar TXT

O botão **Importar TXT** carrega um arquivo `.txt` ou `.json` válido.

> **Atenção:** a importação substitui a lista atual de apontamentos pela lista existente no arquivo importado.

Antes de importar:

1. clique em **Exportar TXT** para criar um backup;
2. confira se o arquivo escolhido pertence a esta aplicação;
3. realize a importação.

Caso o arquivo esteja inválido, o sistema exibirá uma mensagem de erro e não concluirá a operação.

### Exportar TXT

Clique em **Exportar TXT** para gerar uma cópia chamada:

```text
apontamentos.txt
```

O arquivo será salvo na pasta de downloads definida no navegador.

A exportação é recomendada:

- antes de importar outra base;
- antes de limpar os dados do navegador;
- antes de atualizar ou substituir a pasta do projeto;
- periodicamente como backup.

---

## 11. Formato do arquivo TXT/JSON

O arquivo possui a seguinte estrutura:

```json
{
  "version": 1,
  "exportedAt": "2026-07-17T12:00:00.000Z",
  "activities": [
    {
      "id": "identificador-unico",
      "date": "2026-07-17",
      "sprint": "Sprint 18",
      "taskId": "TASK 1412342",
      "task": "Cerimônias e Reuniões",
      "itemsWorked": "Daily e desenvolvimento",
      "hours": 8,
      "createdAt": "2026-07-17T12:00:00.000Z",
      "updatedAt": "2026-07-17T12:00:00.000Z"
    }
  ]
}
```

### Cuidados ao editar manualmente

- mantenha as aspas duplas;
- mantenha as vírgulas entre os campos;
- use a data no formato `AAAA-MM-DD`;
- informe horas como número, sem aspas;
- não repita o mesmo `id` em registros diferentes;
- preserve a propriedade `activities` como uma lista entre colchetes.

Um erro de sintaxe pode impedir a importação do arquivo.

---

## 12. Atalho na Área de Trabalho

Depois que o projeto estiver em uma pasta definitiva, execute:

```text
CRIAR_ATALHO_AREA_DE_TRABALHO.bat
```

Será criado um atalho chamado **Apontamentos** na Área de Trabalho.

Ao abrir o atalho:

- o servidor Angular será iniciado em segundo plano;
- o navegador será aberto automaticamente;
- nenhuma janela de terminal precisa permanecer aberta.

### Encerrar o servidor

Execute:

```text
ENCERRAR_APONTAMENTOS.bat
```

### Remover o atalho

Execute:

```text
REMOVER_ATALHO_AREA_DE_TRABALHO.bat
```

### Se a pasta do projeto for movida

O atalho antigo poderá deixar de funcionar. Execute novamente o criador de atalho na nova localização.

---

## 13. Mensagens e modais

As confirmações, avisos, erros e mensagens de sucesso são exibidos em uma janela centralizada, com o restante da tela escurecido.

Enquanto o modal estiver aberto, é necessário confirmar ou cancelar a operação.

Atalhos disponíveis:

- `Tab`: alterna entre os botões do modal;
- `Shift + Tab`: volta ao botão anterior;
- `Esc`: cancela quando houver a opção **Cancelar**; nos avisos simples, fecha a mensagem.

---

## 14. Boas práticas e backup

Para reduzir o risco de perda de dados:

1. vincule um arquivo TXT quando estiver usando Chrome ou Edge;
2. exporte uma cópia periodicamente;
3. mantenha backups com data no nome, por exemplo:

```text
apontamentos-backup-2026-07-31.txt
```

4. não edite o mesmo TXT simultaneamente em duas instâncias da aplicação;
5. não desligue o computador durante uma gravação;
6. antes de importar, sempre exporte a base atual;
7. evite limpar os dados do navegador sem possuir um backup.

---

## 15. Solução de problemas

### A aplicação abriu em branco

Confirme que o sistema foi iniciado por:

```text
INICIAR_APLICACAO.bat
```

Não abra o `index.html` diretamente.

Depois, tente:

```text
REPARAR_DEPENDENCIAS.bat
```

### O Angular informa que faltam pacotes

No terminal da pasta do projeto, execute:

```bash
npm install --include=dev
npm start
```

### Os ícones não aparecem

Confirme que as dependências foram instaladas:

```bash
npm install
```

O projeto utiliza:

```text
bootstrap-icons
```

Depois, atualize a página com `Ctrl + F5`.

### O TXT não foi atualizado

1. confira a mensagem de status abaixo dos botões;
2. clique em **Sincronizar**;
3. conceda a permissão solicitada pelo navegador;
4. caso não funcione, clique em **Exportar TXT** para gerar uma cópia manual.

### O botão Vincular TXT não funciona

Utilize Chrome ou Edge e abra a aplicação por `http://localhost:4200`.

Em navegadores sem suporte à vinculação direta, utilize **Importar TXT** e **Exportar TXT**.

### O arquivo não pode ser importado

Verifique se:

- o arquivo possui extensão `.txt` ou `.json`;
- existe uma propriedade `activities` contendo uma lista;
- cada registro possui data, ID da tarefa e horas válidas;
- o JSON não possui vírgulas ou aspas incorretas.

### Um registro não aparece na pesquisa

Limpe o campo de pesquisa e tente pesquisar por:

- data completa;
- ID da tarefa;
- Sprint;
- palavra contida em Tarefa ou Itens trabalhados.

### A porta 4200 já está sendo utilizada

Encerre a instância anterior com:

```text
ENCERRAR_APONTAMENTOS.bat
```

Depois, execute novamente:

```text
INICIAR_APLICACAO.bat
```

### Os dados sumiram após trocar de navegador

Os dados salvos localmente pertencem ao navegador utilizado. Importe o backup TXT no novo navegador ou vincule o arquivo usado anteriormente.

---

## Suporte técnico

Ao relatar um problema, envie:

- uma captura de tela do erro;
- a mensagem completa do terminal ou do navegador;
- o passo que estava sendo executado;
- o navegador utilizado;
- a versão do Node.js, obtida com:

```bash
node --version
```

- a versão do npm, obtida com:

```bash
npm --version
```
