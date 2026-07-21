@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "APP_URL=http://localhost:4200"
set "NPM_REGISTRY=https://registry.npmjs.org/"
set "npm_config_registry=%NPM_REGISTRY%"
set "npm_config_audit=false"
set "npm_config_fund=false"
set "npm_config_include=dev"
set "npm_config_production=false"
set "NODE_ENV=development"

rem Impede uma configuracao global omit=dev de remover o compilador Angular.
set "npm_config_omit="

echo ==============================================
echo  Dashboard de Apontamentos - Angular
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado.
  echo Instale uma versao LTS atual do Node.js e tente novamente.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm nao foi encontrado.
  echo Reinstale o Node.js incluindo o npm.
  pause
  exit /b 1
)

echo Node:
node --version
echo npm:
npm --version
echo Registro npm:
call npm config get registry
echo.

rem Confere os pacotes locais realmente necessarios para o ng serve.
set "INSTALL_REQUIRED=0"
if not exist "node_modules\@angular\build\package.json" set "INSTALL_REQUIRED=1"
if not exist "node_modules\@angular\cli\bin\ng.js" set "INSTALL_REQUIRED=1"
if not exist "node_modules\@angular\compiler-cli\package.json" set "INSTALL_REQUIRED=1"
if not exist "node_modules\bootstrap\package.json" set "INSTALL_REQUIRED=1"
if not exist "node_modules\bootstrap-icons\package.json" set "INSTALL_REQUIRED=1"

if "%INSTALL_REQUIRED%"=="1" (
  echo Dependencias ausentes ou instalacao anterior incompleta.
  echo Instalando tambem as dependencias de desenvolvimento...
  echo.

  rem npm install consegue completar uma arvore parcial sem exigir a exclusao.
  call npm install --include=dev --registry=%NPM_REGISTRY% --no-audit --no-fund --prefer-online

  if errorlevel 1 (
    echo.
    echo ERRO: A instalacao nao foi concluida.
    echo Execute REPARAR_DEPENDENCIAS.bat como administrador depois de fechar
    echo VS Code, terminais com ng serve e outros programas que usem esta pasta.
    pause
    exit /b 1
  )
)

if not exist "node_modules\@angular\build\package.json" (
  echo.
  echo ERRO: O pacote local @angular/build continua ausente.
  echo Execute: npm install --include=dev
  pause
  exit /b 1
)

if not exist "node_modules\.bin\ng.cmd" (
  echo.
  echo ERRO: O Angular CLI local nao foi instalado.
  echo Execute: npm install --include=dev
  pause
  exit /b 1
)

echo.
echo Iniciando em %APP_URL%
echo Para encerrar, pressione Ctrl+C nesta janela.
echo.

rem Usa obrigatoriamente o Angular CLI local, nao uma instalacao global.
call "node_modules\.bin\ng.cmd" serve --open

if errorlevel 1 (
  echo.
  echo A aplicacao foi encerrada com erro.
  pause
  exit /b 1
)
