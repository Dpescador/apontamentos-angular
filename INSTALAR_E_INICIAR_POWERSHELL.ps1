$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$env:NODE_ENV = 'development'
$env:npm_config_registry = 'https://registry.npmjs.org/'
$env:npm_config_include = 'dev'
$env:npm_config_production = 'false'
$env:npm_config_omit = ''

Write-Host 'Instalando dependencias de producao e desenvolvimento...' -ForegroundColor Cyan
npm install --include=dev --registry=https://registry.npmjs.org/ --no-audit --no-fund --prefer-online

if (-not (Test-Path 'node_modules/@angular/build/package.json')) {
    throw 'O pacote @angular/build nao foi instalado.'
}

if (-not (Test-Path 'node_modules/bootstrap-icons/package.json')) {
    throw 'O pacote bootstrap-icons nao foi instalado.'
}

Write-Host 'Iniciando Angular pelo CLI local...' -ForegroundColor Green
& "$PSScriptRoot/node_modules/.bin/ng.cmd" serve --open
