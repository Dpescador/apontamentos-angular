# Arquitetura do projeto

## Fluxo principal

```text
ActivityDashboardComponent
        ↓
ActivityDashboardFacade
        ↓
ActivityRepositoryService
        ↓
StorageService + FileSystemService + ActivityFileService
```

## Regras adotadas

1. Componentes visuais não acessam diretamente o armazenamento.
2. A página compõe os componentes e delega regras à facade.
3. A facade mantém estado de interface, formulário, filtros e indicadores.
4. O repositório mantém a coleção de atividades e coordena a persistência.
5. Serviços de infraestrutura não conhecem componentes.
6. Componentes compartilhados não dependem da página do dashboard.
7. Modelos e constantes da funcionalidade permanecem dentro de `features/activities`.

## Onde incluir novas funcionalidades

- Novo campo de apontamento: `features/activities/models`, formulário, grid, facade e normalização do arquivo.
- Novo gráfico reutilizável: `shared/components`.
- Nova regra específica de atividades: `features/activities/services`.
- Novo acesso ao navegador: `core/services`.
- Nova página: `features/<funcionalidade>/pages`.
