# Dashboard de Apontamentos — Angular

Aplicação web para registrar atividades e acompanhar horas por dia, semana e mês. O projeto utiliza Angular standalone, Bootstrap, Bootstrap Icons, Signals e armazenamento local com sincronização opcional em TXT/JSON.

## Funcionalidades

- Gráficos semanal e mensal com meta diária de 8 horas.
- Resumo semanal e progresso mensal.
- Inclusão, edição e exclusão de apontamentos.
- Campo Sprint e seleção de Tarefa.
- Pesquisa por data, Sprint, ID da tarefa, tarefa, item trabalhado ou horas.
- Paginação de 20 registros.
- Importação, exportação, vinculação e sincronização de TXT/JSON.
- Modais globais para avisos, confirmações e erros.
- Atalho opcional para a Área de Trabalho no Windows.

## Executar

No Windows, execute:

```text
INICIAR_APLICACAO.bat
```

Ou pelo terminal:

```bash
npm install --include=dev
npm start
```

A aplicação será aberta normalmente em `http://localhost:4200`.

## Arquitetura

O código foi organizado por responsabilidade e funcionalidade:

```text
src/app/
├── core/
│   ├── models/
│   │   └── modal.model.ts
│   └── services/
│       ├── file-system.service.ts
│       ├── modal.service.ts
│       └── storage.service.ts
│
├── shared/
│   ├── components/
│   │   ├── app-modal/
│   │   └── bar-chart/
│   └── utils/
│       ├── date.utils.ts
│       └── id.utils.ts
│
├── features/
│   └── activities/
│       ├── components/
│       │   ├── activity-form/
│       │   ├── activity-grid/
│       │   ├── month-summary/
│       │   ├── period-controls/
│       │   └── summary-cards/
│       ├── constants/
│       │   └── task-options.constant.ts
│       ├── data/
│       │   └── initial-activities.ts
│       ├── models/
│       │   ├── activity-form.model.ts
│       │   ├── activity.model.ts
│       │   └── chart-day.model.ts
│       ├── services/
│       │   ├── activity-dashboard.facade.ts
│       │   ├── activity-file.service.ts
│       │   └── activity-repository.service.ts
│       └── pages/
│           └── activity-dashboard/
│
├── layout/
│   └── app-header/
│
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

### Responsabilidades

- **core**: recursos globais e infraestrutura do navegador.
- **shared**: componentes e utilitários reutilizáveis, sem regras específicas da funcionalidade.
- **features/activities**: toda a regra de negócio de apontamentos.
- **layout**: elementos estruturais da aplicação, como o cabeçalho.
- **activity-dashboard.facade**: estado da tela, filtros, paginação, formulário e indicadores.
- **activity-repository**: operações de consulta, inclusão, edição e exclusão.
- **activity-file**: serialização, validação, normalização e importação/exportação.
- **storage**: localStorage e persistência do identificador do arquivo no IndexedDB.
- **file-system**: leitura, gravação, permissões e download de arquivos.

## Formato do arquivo TXT/JSON

```json
{
  "version": 1,
  "exportedAt": "2026-07-17T12:00:00.000Z",
  "activities": [
    {
      "id": "identificador-unico",
      "date": "2026-07-01",
      "sprint": "Sprint 18",
      "taskId": "TASK 1412342",
      "task": "Cerimônias e Reuniões",
      "itemsWorked": "Planning",
      "hours": 1,
      "createdAt": "2026-07-01T12:00:00.000Z",
      "updatedAt": "2026-07-01T12:00:00.000Z"
    }
  ]
}
```

## Estilos

O Bootstrap e o Bootstrap Icons são importados globalmente em `src/styles.css`:

```css
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';
```

O CSS específico de cada componente permanece junto do próprio componente.

## Observação sobre rotas

A aplicação possui apenas uma página. O arquivo `app.routes.ts` mantém os caminhos centralizados e está preparado para a inclusão futura do Angular Router sem misturar essa responsabilidade com os componentes.
