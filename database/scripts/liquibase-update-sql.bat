@echo off
setlocal
cd /d "%~dp0\..\.."

if not exist "database\liquibase.properties" (
  echo ERRO: execute database\scripts\configurar-liquibase.bat primeiro.
  pause
  exit /b 1
)

where liquibase >nul 2>nul
if errorlevel 1 (
  echo ERRO: Liquibase CLI nao encontrado no PATH.
  pause
  exit /b 1
)

liquibase --defaults-file=database/liquibase.properties update-sql
pause
