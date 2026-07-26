$ErrorActionPreference = 'Stop'

if (-not (Test-Path '.git')) {
    Write-Host 'ERRO: execute este script na raiz de um repositório Git.' -ForegroundColor Red
    exit 1
}

Write-Host 'Removendo configurações locais do controle de versão...' -ForegroundColor Cyan
& git rm --cached --ignore-unmatch database/liquibase.properties database/liquibase.properties.example | Out-Host

$adminKeyPattern = 'sb_' + 'secret_' + '[A-Za-z0-9_-]{20,}'
$matches = Get-ChildItem -Recurse -File |
    Where-Object {
        $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\dist\\|\\.angular\\'
    } |
    Select-String -Pattern $adminKeyPattern

if ($matches) {
    Write-Host 'ERRO: foi encontrada uma credencial administrativa no projeto:' -ForegroundColor Red
    $matches | Select-Object Path, LineNumber | Format-Table -AutoSize
    Write-Host 'Remova a credencial antes de criar o commit.' -ForegroundColor Yellow
    exit 1
}

& git add .gitignore | Out-Null

Write-Host ''
Write-Host 'Verificação concluída. Nenhuma credencial administrativa foi encontrada.' -ForegroundColor Green
Write-Host 'Revise as alterações com: git status'
Write-Host 'Depois crie o commit com: git add -A; git commit -m "Configura Supabase para GitHub Pages"'
