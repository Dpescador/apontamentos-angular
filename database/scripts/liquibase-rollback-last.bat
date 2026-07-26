@echo off
setlocal
cd /d "%~dp0\..\.."

if not exist "database\liquibase.properties" (
  echo ERRO: execute database\scripts\configurar-liquibase.bat primeiro.
  pause
  exit /b 1
)

liquibase --defaults-file=database/liquibase.properties rollback-count 1
pause
