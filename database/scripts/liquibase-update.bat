@echo off
setlocal
cd /d "%~dp0\..\.."

if not exist "database\liquibase.properties" (
  echo ERRO: execute database\scripts\configurar-liquibase.bat
  echo para criar database\liquibase.properties a partir do template seguro.
  pause
  exit /b 1
)

where liquibase >nul 2>nul
if errorlevel 1 (
  echo ERRO: Liquibase CLI nao encontrado no PATH.
  echo Instale o Liquibase e execute novamente.
  pause
  exit /b 1
)

liquibase --defaults-file=database/liquibase.properties update
if errorlevel 1 (
  echo.
  echo ERRO: a atualizacao do banco falhou.
  pause
  exit /b 1
)

echo.
echo Banco atualizado com sucesso.
pause
