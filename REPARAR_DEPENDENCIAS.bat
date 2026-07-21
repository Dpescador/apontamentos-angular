@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "NPM_REGISTRY=https://registry.npmjs.org/"
set "npm_config_registry=%NPM_REGISTRY%"
set "npm_config_audit=false"
set "npm_config_fund=false"
set "npm_config_include=dev"
set "npm_config_production=false"
set "npm_config_omit="
set "NODE_ENV=development"

echo ==============================================
echo  Reparar dependencias do projeto
echo ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERRO: npm nao foi encontrado.
  pause
  exit /b 1
)

echo Node:
node --version
echo npm:
npm --version
echo Registro:
call npm config get registry
echo.

echo Removendo configuracoes que podem omitir devDependencies...
call npm config delete production --location=project >nul 2>nul
call npm config delete omit --location=project >nul 2>nul

echo Tentando remover node_modules...
if exist "node_modules" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference='SilentlyContinue';" ^
    "for($i=1;$i -le 4;$i++){" ^
    "  Remove-Item -LiteralPath 'node_modules' -Recurse -Force;" ^
    "  if(-not (Test-Path -LiteralPath 'node_modules')){exit 0};" ^
    "  Start-Sleep -Seconds 2" ^
    "}; exit 1"
)

if exist "node_modules" (
  set "BACKUP_DIR=node_modules_bloqueado_!RANDOM!"
  echo A pasta esta bloqueada. Tentando renomear para !BACKUP_DIR!...
  move "node_modules" "!BACKUP_DIR!" >nul 2>nul
)

if exist "node_modules" (
  echo.
  echo ERRO: node_modules esta bloqueado.
  echo Feche VS Code, terminais, ng serve e processos node.exe desta aplicacao.
  echo Se necessario, reinicie o Windows e execute novamente.
  pause
  exit /b 1
)

echo.
echo Instalando todas as dependencias, incluindo devDependencies...
if exist "package-lock.json" (
  call npm ci --include=dev --registry=%NPM_REGISTRY% --no-audit --no-fund --prefer-online
) else (
  call npm install --include=dev --registry=%NPM_REGISTRY% --no-audit --no-fund --prefer-online
)

if errorlevel 1 (
  echo.
  echo npm ci falhou. Tentando npm install --include=dev...
  call npm install --include=dev --registry=%NPM_REGISTRY% --no-audit --no-fund --prefer-online
)

if errorlevel 1 (
  echo.
  echo ERRO: Nao foi possivel instalar as dependencias.
  echo Confira internet, VPN, proxy e firewall.
  echo Registro atual:
  call npm config get registry
  pause
  exit /b 1
)

if not exist "node_modules\@angular\build\package.json" (
  echo.
  echo ERRO: @angular/build nao foi instalado.
  echo Verifique se NODE_ENV ou a configuracao npm omit estao removendo devDependencies.
  echo npm config get omit:
  call npm config get omit
  pause
  exit /b 1
)

if not exist "node_modules\bootstrap-icons\package.json" (
  echo.
  echo ERRO: bootstrap-icons nao foi instalado.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\ng.cmd" (
  echo.
  echo ERRO: Angular CLI local nao foi instalado.
  pause
  exit /b 1
)

echo.
echo Dependencias reparadas com sucesso.
echo Agora execute INICIAR_APLICACAO.bat.
echo.
pause
exit /b 0
